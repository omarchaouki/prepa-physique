/*
 * Service worker : rend consultable sans reseau ce qui a deja ete ouvert.
 *
 * L'application est rendue cote serveur, il n'y a donc rien a embarquer a
 * l'avance : une page n'existe hors ligne que si elle a ete visitee. C'est
 * suffisant pour l'usage reel, ou l'on ouvre la passation avant de descendre sur
 * le terrain, puis on la garde ouverte pendant les tests.
 *
 * Trois regles, volontairement peu nombreuses :
 *
 * 1. Les fichiers de /_next/static et les images de la page d'accueil portent une
 *    empreinte dans leur nom : ils ne changent jamais a nom constant, donc cache
 *    d'abord.
 * 2. Les navigations vers la zone connectee passent par le reseau d'abord, et
 *    sont conservees sous leur seul chemin, sans la chaine de requete. Le repli
 *    hors ligne doit servir la derniere version connue de la page, pas une
 *    variante liee a un parametre de prefetch.
 * 3. Tout le reste passe au travers. En particulier les requetes qui ne sont pas
 *    des GET : les actions serveur ne doivent jamais etre servies depuis un
 *    cache, et leur mise en file d'attente est geree cote application, dans
 *    src/lib/offline.
 *
 * La saisie de tests, elle, ne depend pas de ce fichier : elle est conservee en
 * base locale du navigateur et renvoyee a la reconnexion.
 */

const VERSION = "v1";
const STATIC_CACHE = `lamsaa-static-${VERSION}`;
const PAGES_CACHE = `lamsaa-pages-${VERSION}`;
const OFFLINE_URL = "/offline.html";

const CACHE_FIRST_PREFIXES = ["/_next/static/", "/marketing/"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll([OFFLINE_URL]))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== STATIC_CACHE && key !== PAGES_CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

/** Cle de cache d'une page : le chemin seul, sans parametres. */
const pageKey = (url) => `${url.origin}${url.pathname}`;

const cacheFirst = async (request) => {
  const cached = await caches.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(STATIC_CACHE);
    cache.put(request, response.clone());
  }
  return response;
};

const networkFirstPage = async (request, url) => {
  const key = pageKey(url);
  try {
    const response = await fetch(request);
    // Une redirection vers /login ne doit pas remplacer la page en cache :
    // c'est ce que renvoie le serveur quand la session a expire.
    if (response.ok && response.type !== "opaqueredirect") {
      const cache = await caches.open(PAGES_CACHE);
      cache.put(key, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(key);
    if (cached) return cached;
    const fallback = await caches.match(OFFLINE_URL);
    if (fallback) return fallback;
    throw error;
  }
};

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (CACHE_FIRST_PREFIXES.some((prefix) => url.pathname.startsWith(prefix))) {
    event.respondWith(cacheFirst(request));
    return;
  }

  if (request.mode === "navigate" && (url.pathname === "/" || url.pathname.startsWith("/app"))) {
    event.respondWith(networkFirstPage(request, url));
  }
});

/** Vidage demande par l'application, a la deconnexion. */
self.addEventListener("message", (event) => {
  if (event.data === "lamsaa:clear-caches") {
    event.waitUntil(caches.keys().then((keys) => Promise.all(keys.map((key) => caches.delete(key)))));
  }
});
