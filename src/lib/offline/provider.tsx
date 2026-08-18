"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

import { saveResultsAction } from "@/app/actions/tests";
import {
  MAX_TRIES,
  countQueue,
  deleteDraft,
  dequeue,
  enqueue,
  listQueue,
  markTried,
  type EntryValues,
} from "./store";

/**
 * Etat reseau et file d'attente, partages par toute la zone connectee.
 *
 * Le principe : une saisie de terrain ne doit jamais dependre du reseau. La
 * grille de saisie enregistre en continu ; si l'envoi echoue, il part en file
 * locale et la file se vide des que la connexion revient.
 *
 * Distinction importante dans `flush` : une erreur *reseau* garde l'entree en
 * file, une *reponse* du serveur la retire, meme si elle est negative. Sans
 * cela, une passation verrouillee entre temps produirait une entree impossible a
 * envoyer, qui bloquerait indefiniment tout ce qui suit.
 */

interface OfflineValue {
  online: boolean;
  pending: number;
  syncing: boolean;
  /** Derniere reponse du serveur refusant une entree de la file. */
  lastRejection: string | null;
  queueSave: (save: { sessionId: string; testKey: string; entries: EntryValues[] }) => Promise<void>;
  flush: () => Promise<void>;
}

const OfflineContext = createContext<OfflineValue>({
  online: true,
  pending: 0,
  syncing: false,
  lastRejection: null,
  queueSave: async () => {},
  flush: async () => {},
});

export const useOffline = (): OfflineValue => useContext(OfflineContext);

/** Delai entre deux tentatives automatiques quand la file n'est pas vide. */
const RETRY_MS = 30_000;

export function OfflineProvider({ children }: { children: React.ReactNode }) {
  // Optimiste au premier rendu : le serveur ne connait pas l'etat du reseau du
  // client, et afficher "hors ligne" le temps d'une hydratation serait faux.
  const [online, setOnline] = useState(true);
  const [pending, setPending] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [lastRejection, setLastRejection] = useState<string | null>(null);
  const running = useRef(false);

  const refresh = useCallback(async () => {
    setPending(await countQueue());
  }, []);

  const flush = useCallback(async () => {
    // Un seul vidage a la fois : deux envois simultanes de la meme entree
    // creeraient deux resultats pour un joueur.
    if (running.current) return;
    running.current = true;
    setSyncing(true);

    try {
      const queue = await listQueue();
      for (const entry of queue) {
        if (entry.id === undefined) continue;
        try {
          const response = await saveResultsAction({
            sessionId: entry.sessionId,
            testKey: entry.testKey,
            entries: entry.entries,
          });
          // Le serveur a repondu : l'entree a fait son travail, quelle que soit
          // sa reponse.
          await dequeue(entry.id);
          // Le brouillon a rempli son role : le laisser reviendrait a reafficher
          // ces valeurs par dessus celles du serveur a la prochaine ouverture.
          await deleteDraft(entry.sessionId, entry.testKey);
          if (!response.ok) setLastRejection(response.message);
        } catch {
          // Echec reseau : on garde l'entree, on compte la tentative, et on
          // s'arrete la pour ne pas marteler une connexion absente.
          if (entry.tries + 1 >= MAX_TRIES) await dequeue(entry.id);
          else await markTried(entry);
          break;
        }
      }
    } finally {
      running.current = false;
      setSyncing(false);
      await refresh();
    }
  }, [refresh]);

  const queueSave = useCallback(
    async (save: { sessionId: string; testKey: string; entries: EntryValues[] }) => {
      await enqueue(save);
      await refresh();
    },
    [refresh],
  );

  useEffect(() => {
    setOnline(navigator.onLine);
    void refresh();

    const goOnline = () => {
      setOnline(true);
      void flush();
    };
    const goOffline = () => setOnline(false);

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);

    // Le repli periodique couvre le cas ou l'evenement "online" ne se declenche
    // pas : un portail captif, ou un reseau qui repond sans acheminer.
    const timer = window.setInterval(() => {
      if (navigator.onLine) void flush();
    }, RETRY_MS);

    // Enregistrement du service worker, qui rend les pages deja visitees
    // consultables sans reseau. Hors production il n'est pas installe : il
    // interfererait avec le rechargement a chaud du serveur de developpement.
    if (
      process.env.NODE_ENV === "production" &&
      "serviceWorker" in navigator &&
      window.isSecureContext
    ) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Un enregistrement refuse ne doit pas casser l'application : on perd le
        // hors ligne de navigation, pas la saisie.
      });
    }

    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
      window.clearInterval(timer);
    };
  }, [flush, refresh]);

  return (
    <OfflineContext.Provider
      value={{ online, pending, syncing, lastRejection, queueSave, flush }}
    >
      {children}
    </OfflineContext.Provider>
  );
}
