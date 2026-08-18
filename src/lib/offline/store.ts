/**
 * Base locale du navigateur : brouillons de saisie et file d'attente d'envois.
 *
 * Pourquoi IndexedDB et pas localStorage : une passation complete pour vingt
 * cinq joueurs sur quinze champs depasse largement le confort de localStorage,
 * qui est de surcroit synchrone et bloque le rendu a chaque frappe.
 *
 * Pourquoi aucune bibliotheque : le besoin tient en deux magasins et cinq
 * operations. Une dependance de plus serait a charger sur un telephone au bord
 * d'un terrain, ce que ce fichier cherche precisement a eviter.
 *
 * Deux magasins :
 *
 * - `drafts` conserve ce qui est affiche dans la grille, meme non envoye. C'est
 *   ce qui permet de fermer l'application au milieu d'une passation, de la
 *   rouvrir sans reseau, et de retrouver la grille telle qu'on l'a laissee.
 * - `queue` conserve les envois qui n'ont pas pu partir. Chaque entree porte son
 *   nombre de tentatives : une entree que le serveur refuse pour de bon ne doit
 *   pas bloquer la file derriere elle.
 */

const DB_NAME = "lamsaa-offline";
const DB_VERSION = 1;
const DRAFTS = "drafts";
const QUEUE = "queue";

/** Nombre de tentatives reseau avant abandon d'une entree de la file. */
export const MAX_TRIES = 5;

export interface EntryValues {
  playerId: string;
  values: Record<string, string>;
}

export interface QueuedSave {
  id?: number;
  sessionId: string;
  testKey: string;
  entries: EntryValues[];
  queuedAt: number;
  tries: number;
}

export interface Draft {
  key: string;
  sessionId: string;
  testKey: string;
  values: Record<string, Record<string, string>>;
  updatedAt: number;
}

export const draftKey = (sessionId: string, testKey: string): string => `${sessionId}::${testKey}`;

/** Le rendu serveur execute aussi ce module : aucun acces a indexedDB hors fonction. */
const available = (): boolean => typeof indexedDB !== "undefined";

let connection: Promise<IDBDatabase> | null = null;

const open = (): Promise<IDBDatabase> => {
  if (connection) return connection;

  connection = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(DRAFTS)) {
        db.createObjectStore(DRAFTS, { keyPath: "key" });
      }
      if (!db.objectStoreNames.contains(QUEUE)) {
        db.createObjectStore(QUEUE, { keyPath: "id", autoIncrement: true });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  return connection;
};

const run = <T>(
  store: string,
  mode: IDBTransactionMode,
  action: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> =>
  open().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const transaction = db.transaction(store, mode);
        const request = action(transaction.objectStore(store));
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      }),
  );

// ---------------------------------------------------------------------------
// Brouillons
// ---------------------------------------------------------------------------

export const saveDraft = async (
  sessionId: string,
  testKey: string,
  values: Record<string, Record<string, string>>,
): Promise<void> => {
  if (!available()) return;
  const draft: Draft = {
    key: draftKey(sessionId, testKey),
    sessionId,
    testKey,
    values,
    updatedAt: Date.now(),
  };
  await run(DRAFTS, "readwrite", (store) => store.put(draft));
};

export const readDraft = async (sessionId: string, testKey: string): Promise<Draft | null> => {
  if (!available()) return null;
  const draft = await run<Draft | undefined>(DRAFTS, "readonly", (store) =>
    store.get(draftKey(sessionId, testKey)),
  );
  return draft ?? null;
};

export const deleteDraft = async (sessionId: string, testKey: string): Promise<void> => {
  if (!available()) return;
  await run(DRAFTS, "readwrite", (store) => store.delete(draftKey(sessionId, testKey)));
};

// ---------------------------------------------------------------------------
// File d'attente
// ---------------------------------------------------------------------------

export const enqueue = async (
  save: Omit<QueuedSave, "id" | "queuedAt" | "tries">,
): Promise<void> => {
  if (!available()) return;
  await run(QUEUE, "readwrite", (store) =>
    store.add({ ...save, queuedAt: Date.now(), tries: 0 }),
  );
};

export const listQueue = async (): Promise<QueuedSave[]> => {
  if (!available()) return [];
  const all = await run<QueuedSave[]>(QUEUE, "readonly", (store) => store.getAll());
  return all.sort((a, b) => a.queuedAt - b.queuedAt);
};

export const countQueue = async (): Promise<number> => {
  if (!available()) return 0;
  return run<number>(QUEUE, "readonly", (store) => store.count());
};

export const dequeue = async (id: number): Promise<void> => {
  if (!available()) return;
  await run(QUEUE, "readwrite", (store) => store.delete(id));
};

export const markTried = async (entry: QueuedSave): Promise<void> => {
  if (!available() || entry.id === undefined) return;
  await run(QUEUE, "readwrite", (store) => store.put({ ...entry, tries: entry.tries + 1 }));
};

export const clearDrafts = async (): Promise<void> => {
  if (!available()) return;
  await run(DRAFTS, "readwrite", (store) => store.clear());
};

/** Pages mises en cache par le service worker : elles contiennent des mesures. */
export const clearCaches = async (): Promise<void> => {
  if (typeof caches === "undefined") return;
  const keys = await caches.keys();
  await Promise.all(keys.map((key) => caches.delete(key)));
};

/**
 * Nettoyage a la deconnexion.
 *
 * Arbitrage assume : les pages en cache et les brouillons partent, mais une file
 * d'attente non vide est conservee. Perdre une passation saisie sur le terrain
 * est bien plus grave que de laisser des mesures quelques heures sur l'appareil
 * de son propre preparateur, et le serveur revalide les droits a chaque envoi :
 * une entree en attente qui repartirait sous un autre compte serait refusee, pas
 * appliquee.
 *
 * Renvoie le nombre d'entrees conservees, pour pouvoir le dire a l'utilisateur.
 */
export const clearOnLogout = async (): Promise<number> => {
  const remaining = await countQueue();
  await Promise.all([clearCaches(), remaining === 0 ? clearDrafts() : Promise.resolve()]);
  return remaining;
};
