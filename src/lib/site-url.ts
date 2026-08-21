import { cache } from "react";
import { headers } from "next/headers";

/**
 * Adresse publique du site, pour tout ce qui doit etre absolu.
 *
 * ---------------------------------------------------------------------------
 * Le defaut que ce fichier repare
 * ---------------------------------------------------------------------------
 *
 * `metadataBase` valait `process.env.APP_URL ?? "http://localhost:3000"`. La
 * variable n'etait pas renseignee sur le serveur, et elle etait meme commentee
 * dans .env.example : personne n'avait de raison de la poser. Toutes les
 * adresses absolues du site pointaient donc vers localhost.
 *
 * La consequence ne se voit nulle part depuis le site lui meme. Elle se voit
 * ailleurs : un lien lamsaa.ma partage sur WhatsApp ou Facebook annonce une
 * image hebergee sur `http://localhost:3000`, que le robot du reseau ne peut
 * evidemment pas atteindre. L'apercu sort sans image, et un lien sans image se
 * partage trois a cinq fois moins.
 *
 * ---------------------------------------------------------------------------
 * Pourquoi l'entete plutot qu'une seule variable
 * ---------------------------------------------------------------------------
 *
 * Une variable d'environnement oubliee ne doit pas pouvoir produire un site
 * entier qui se declare sur localhost. L'adresse est donc deduite, dans cet
 * ordre :
 *
 *   1. `APP_URL`, si elle est posee et analysable. Elle reste la source de
 *      verite : c'est la seule qui reste juste derriere un mandataire mal
 *      configure, et c'est deja elle qui est gravee dans la coque Android.
 *   2. Les entetes de la requete en cours. `x-forwarded-host` et
 *      `x-forwarded-proto` sont poses par Caddy devant le conteneur ; a defaut
 *      `host`. Un visiteur arrive toujours par le vrai nom de domaine, donc
 *      cette deduction est juste meme sans aucune configuration.
 *   3. `http://localhost:3000`, et uniquement en developpement.
 *
 * ---------------------------------------------------------------------------
 * Ce qui n'est pas fait ici, volontairement
 * ---------------------------------------------------------------------------
 *
 * L'entete `host` est fourni par le client et peut mentir. On ne s'en sert donc
 * que pour construire des adresses d'affichage, jamais pour une redirection ni
 * pour une verification d'origine : un attaquant qui forge un `host` obtiendrait
 * au pire une carte de partage pointant vers son propre domaine, dans sa propre
 * reponse, ce qui ne lui apprend rien et n'atteint personne d'autre.
 */

const LOCAL = "http://localhost:3000";

const clean = (value: string): string => value.trim().replace(/\/+$/, "");

/** Analyse une adresse et rend son origine, ou `null` si elle est inutilisable. */
const parseOrigin = (value: string | null | undefined): string | null => {
  if (!value) return null;
  const candidate = clean(value);
  if (!candidate) return null;
  try {
    // Une valeur sans schema est acceptee et complete en https : c'est la
    // faute de saisie la plus frequente dans un fichier .env.
    const url = new URL(/^https?:\/\//iu.test(candidate) ? candidate : `https://${candidate}`);
    return url.origin;
  } catch {
    return null;
  }
};

/**
 * Origine du site pour la requete en cours, sans barre oblique finale.
 *
 * `cache()` garantit une seule lecture d'entetes par rendu, meme si la mise en
 * page et plusieurs pages la demandent chacune de leur cote.
 */
export const getSiteUrl = cache(async (): Promise<string> => {
  const configured = parseOrigin(process.env.APP_URL);
  if (configured) return configured;

  try {
    const requestHeaders = await headers();
    const host =
      requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? null;

    if (host) {
      const proto =
        requestHeaders.get("x-forwarded-proto")?.split(",")[0]?.trim() ||
        // Un hote local reste en clair, tout le reste est servi en https.
        (host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https");
      const derived = parseOrigin(`${proto}://${host}`);
      if (derived) return derived;
    }
  } catch {
    // Hors contexte de requete, par exemple pendant la compilation.
  }

  return LOCAL;
});

/** Version objet, pour `metadataBase` qui attend une URL. */
export const getSiteUrlObject = async (): Promise<URL> => new URL(await getSiteUrl());
