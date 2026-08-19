import * as Crypto from "expo-crypto";

import { ApiError, request } from "../api/client";
import { getMeta, openDb, setMeta } from "../db";

/**
 * Moteur de synchronisation.
 *
 * Deux mouvements, toujours dans cet ordre :
 *
 *   1. La remontee, d'abord. Ce que le preparateur a saisi hors reseau part
 *      avant tout le reste. Descendre en premier ecraserait localement une
 *      valeur qu'il vient de mesurer par une version anterieure du serveur.
 *   2. La descente ensuite, page par page, jusqu'a epuisement du curseur.
 *
 * Le moteur est volontairement sans etat en memoire : tout ce qu'il doit
 * retenir vit dans la table `meta`. Un telephone tue par le systeme au milieu
 * d'une synchronisation reprend exactement ou il en etait au lancement suivant.
 */

const CURSOR = "cursor";
const LAST_SYNC = "lastSyncAt";
const CATALOG = "catalog";
const CATALOG_ETAG = "catalogEtag";

export type SyncState = "idle" | "syncing" | "offline" | "error";

export interface SyncReport {
  pushed: number;
  rejected: number;
  pulled: number;
  rounds: number;
  /** Fiches joueurs recuperees, celles qui portent percentiles et conseils. */
  profiles: number;
}

// ---------------------------------------------------------------------------
// File d'attente
// ---------------------------------------------------------------------------

export type OperationType = "session.upsert" | "results.save" | "player.upsert";

/**
 * Identifiant genere par le telephone.
 *
 * C'est lui qui rend la remontee idempotente : le serveur ecrit par `upsert`
 * sur cet identifiant, donc un envoi rejoue apres une coupure produit le meme
 * etat au lieu d'un doublon. Sans cette generation locale, il faudrait un
 * registre d'operations cote serveur.
 */
export const newId = (): string => Crypto.randomUUID();

export const enqueue = async (type: OperationType, payload: unknown): Promise<string> => {
  const db = await openDb();
  const id = newId();
  await db.runAsync(
    "INSERT INTO outbox (id, type, payload, createdAt) VALUES (?, ?, ?, ?)",
    id,
    type,
    JSON.stringify(payload),
    new Date().toISOString(),
  );
  return id;
};

export const pendingCount = async (): Promise<number> => {
  const db = await openDb();
  const row = await db.getFirstAsync<{ n: number }>("SELECT COUNT(*) AS n FROM outbox");
  return row?.n ?? 0;
};

// ---------------------------------------------------------------------------
// Remontee
// ---------------------------------------------------------------------------

interface Verdict {
  id: string;
  status: "applied" | "rejected";
  error?: { code: string; message: string };
}

/** Nombre d'envois rates au dela duquel on cesse de reessayer sans le dire. */
const MAX_ATTEMPTS = 5;

const push = async (token: string): Promise<{ pushed: number; rejected: number }> => {
  const db = await openDb();
  let pushed = 0;
  let rejected = 0;

  for (;;) {
    const batch = await db.getAllAsync<{
      id: string;
      type: OperationType;
      payload: string;
      attempts: number;
    }>("SELECT id, type, payload, attempts FROM outbox ORDER BY createdAt ASC LIMIT 25");

    if (batch.length === 0) break;

    const operations = batch.map((row) => ({
      id: row.id,
      type: row.type,
      payload: JSON.parse(row.payload),
    }));

    const { data } = await request<{ verdicts: Verdict[] }>("/api/sync", {
      method: "POST",
      token,
      body: { operations },
    });

    for (const verdict of data.verdicts) {
      if (verdict.status === "applied") {
        await db.runAsync("DELETE FROM outbox WHERE id = ?", verdict.id);
        pushed += 1;
        continue;
      }

      // Un refus definitif ne doit pas rester en file a tourner indefiniment :
      // le serveur repondra la meme chose au centieme essai. Une passation
      // verrouillee ou un droit retire sont des refus definitifs.
      const definitif =
        verdict.error?.code === "FORBIDDEN" ||
        verdict.error?.code === "NOT_FOUND" ||
        verdict.error?.code === "INVALID_INPUT" ||
        verdict.error?.code === "CONFLICT";

      const row = batch.find((candidate) => candidate.id === verdict.id);
      const attempts = (row?.attempts ?? 0) + 1;

      if (definitif || attempts >= MAX_ATTEMPTS) {
        await db.runAsync("DELETE FROM outbox WHERE id = ?", verdict.id);
        rejected += 1;
      } else {
        await db.runAsync(
          "UPDATE outbox SET attempts = ?, lastError = ? WHERE id = ?",
          attempts,
          verdict.error?.message ?? null,
          verdict.id,
        );
      }
    }

    // Si aucune operation du lot n'a quitte la file, insister ferait une boucle.
    const reste = await db.getFirstAsync<{ n: number }>("SELECT COUNT(*) AS n FROM outbox");
    if ((reste?.n ?? 0) >= batch.length) break;
  }

  return { pushed, rejected };
};

// ---------------------------------------------------------------------------
// Descente
// ---------------------------------------------------------------------------

interface PullPage {
  serverTime: string;
  cursor: string | null;
  hasMore: boolean;
  teams: Record<string, unknown>[];
  players: Record<string, unknown>[];
  sessions: Record<string, unknown>[];
  results: Record<string, unknown>[];
  metrics: Record<string, unknown>[];
  alive: { teams: string[]; players: string[]; sessions: string[] } | null;
}

/** Colonnes ecrites par la descente, dans l'ordre attendu par la requete. */
const COLUMNS = {
  teams: ["id", "organizationId", "name", "category", "level", "sex", "season", "colorHex", "isActive", "updatedAt"],
  players: ["id", "teamId", "firstName", "lastName", "birthDate", "sex", "position", "secondaryPosition", "dominantFoot", "jerseyNumber", "heightCm", "weightKg", "status", "email", "externalId", "notes", "updatedAt"],
  sessions: ["id", "teamId", "date", "name", "testKeys", "surface", "weather", "temperatureC", "notes", "isLocked", "updatedAt"],
  results: ["id", "sessionId", "playerId", "teamId", "testKey", "date", "rawJson", "computedJson", "quality", "updatedAt"],
  metrics: ["id", "playerId", "teamId", "testResultId", "key", "value", "unit", "date", "side", "createdAt"],
} as const;

type Table = keyof typeof COLUMNS;

const upsertRows = async (
  db: Awaited<ReturnType<typeof openDb>>,
  table: Table,
  rows: Record<string, unknown>[],
) => {
  if (rows.length === 0) return;

  const columns = COLUMNS[table];
  const placeholders = columns.map(() => "?").join(", ");
  const statement = await db.prepareAsync(
    `INSERT OR REPLACE INTO ${table} (${columns.join(", ")}) VALUES (${placeholders})`,
  );

  try {
    for (const row of rows) {
      const values = columns.map((column) => {
        const value = row[column];
        if (value === undefined || value === null) return null;
        // SQLite ne connait pas le booleen : il stocke zero ou un.
        if (typeof value === "boolean") return value ? 1 : 0;
        return value as string | number;
      });
      await statement.executeAsync(values);
    }
  } finally {
    await statement.finalizeAsync();
  }
};

/**
 * Efface localement ce que le serveur ne connait plus.
 *
 * Une suppression ne laisse aucune trace en base cote serveur, un delta ne peut
 * donc pas la transmettre : la reponse joint la liste des identifiants encore
 * vivants, et tout ce qui n'y figure pas disparait ici.
 *
 * Les lignes encore en attente d'envoi sont epargnees : elles n'existent pas
 * encore cote serveur, il est donc normal qu'elles soient absentes de la liste.
 */
const prune = async (
  db: Awaited<ReturnType<typeof openDb>>,
  alive: { teams: string[]; players: string[]; sessions: string[] },
) => {
  const chunk = (ids: string[]) => {
    // SQLite plafonne le nombre de parametres d'une requete. On decoupe.
    const size = 400;
    const out: string[][] = [];
    for (let i = 0; i < ids.length; i += size) out.push(ids.slice(i, i + size));
    return out.length > 0 ? out : [[]];
  };

  const keepOnly = async (table: "teams" | "players" | "sessions", ids: string[]) => {
    const survivants = new Set(ids);
    const locaux = await db.getAllAsync<{ id: string }>(
      // Un joueur ou une passation cree hors reseau n'existe pas encore cote
      // serveur : son absence de la liste des vivants est normale, l'effacer
      // ferait disparaitre une saisie que personne n'a encore vue.
      table === "sessions" || table === "players"
        ? `SELECT id FROM ${table} WHERE pending = 0`
        : `SELECT id FROM ${table}`,
    );
    const aSupprimer = locaux.map((row) => row.id).filter((id) => !survivants.has(id));

    for (const lot of chunk(aSupprimer)) {
      if (lot.length === 0) continue;
      const marks = lot.map(() => "?").join(", ");
      await db.runAsync(`DELETE FROM ${table} WHERE id IN (${marks})`, ...lot);
    }
    return aSupprimer.length;
  };

  await keepOnly("teams", alive.teams);
  await keepOnly("players", alive.players);
  await keepOnly("sessions", alive.sessions);

  // Les lignes filles d'une passation disparue partent avec elle.
  await db.execAsync(`
    DELETE FROM results WHERE sessionId IS NOT NULL
      AND sessionId NOT IN (SELECT id FROM sessions) AND pending = 0;
    DELETE FROM metrics WHERE testResultId IS NOT NULL
      AND testResultId NOT IN (SELECT id FROM results);
  `);
};

const pull = async (token: string): Promise<{ pulled: number; rounds: number }> => {
  const db = await openDb();
  let cursor = await getMeta(CURSOR);
  const lastSync = await getMeta(LAST_SYNC);

  let pulled = 0;
  let rounds = 0;

  for (;;) {
    rounds += 1;
    if (rounds > 50) break; // garde fou, jamais atteint en pratique

    const query = cursor
      ? `?cursor=${encodeURIComponent(cursor)}`
      : lastSync
        ? `?since=${encodeURIComponent(lastSync)}`
        : "";

    const { data } = await request<PullPage>(`/api/sync${query}`, { token });

    await db.withTransactionAsync(async () => {
      for (const table of Object.keys(COLUMNS) as Table[]) {
        const rows = data[table];
        pulled += rows.length;
        await upsertRows(db, table, rows);
      }
      // Une ligne renvoyee par la descente a ete acceptee par le serveur : elle
      // n'est plus une saisie locale en attente.
      for (const row of data.sessions) {
        await db.runAsync("UPDATE sessions SET pending = 0 WHERE id = ?", row.id as string);
      }
      for (const row of data.players) {
        await db.runAsync("UPDATE players SET pending = 0 WHERE id = ?", row.id as string);
      }
    });

    if (data.hasMore && data.cursor) {
      cursor = data.cursor;
      await setMeta(CURSOR, cursor);
      continue;
    }

    if (data.alive) await prune(db, data.alive);

    // Le point de reprise n'avance qu'une fois la descente complete. Avancer
    // plus tot ferait perdre ce qui n'a pas encore ete recu.
    await setMeta(CURSOR, null);
    await setMeta(LAST_SYNC, data.serverTime);
    break;
  }

  return { pulled, rounds };
};

// ---------------------------------------------------------------------------
// Catalogue des tests
// ---------------------------------------------------------------------------

export interface TestSpec {
  key: string;
  name: { fr: string; en: string };
  shortName: { fr: string; en: string };
  category: string;
  description: { fr: string; en: string };
  protocol: { fr: string; en: string };
  equipment: { fr: string; en: string };
  durationMin: number;
  reference: string;
  fields: TestField[];
  needsContext?: Array<"bodyMassKg" | "heightCm" | "ageYears" | "sex">;
}

/**
 * Un champ de saisie, tel que le catalogue du serveur le decrit.
 *
 * Cette forme doit rester fidele a `TestField` de
 * `src/lib/sports-science/types.ts` cote serveur. Elle porte tout ce qu'il faut
 * pour dessiner le champ sans rien coder en dur : le libelle dans les deux
 * langues, l'unite, les bornes, le pas, le caractere facultatif, les choix d'une
 * liste et le regroupement visuel.
 *
 * C'est la piece qui garantit qu'un test est saisi en entier. Une grille ecrite
 * a la main finit toujours par ne montrer que les premiers champs ; une grille
 * engendree depuis cette description montre les quatorze champs de
 * l'anthropometrie parce qu'ils sont la.
 */
export interface TestField {
  key: string;
  label: { fr: string; en: string };
  unit?: string;
  type: "number" | "select" | "text" | string;
  step?: number;
  min?: number;
  max?: number;
  optional?: boolean;
  options?: Array<{ value: string; label: { fr: string; en: string } }>;
  help?: { fr: string; en: string };
  group?: { fr: string; en: string };
}

export interface Catalog {
  version: number;
  categories: Record<string, { fr: string; en: string }>;
  tests: TestSpec[];
  batteries: Array<{
    key: string;
    name: { fr: string; en: string };
    testKeys: string[];
  }>;
}

/**
 * Recupere le catalogue, ou garde celui deja stocke.
 *
 * Il ne change qu'une fois par an. L'empreinte evite de retelecharger cent
 * kilo octets a chaque synchronisation, ce qui compte sur un forfait de
 * terrain.
 */
export const syncCatalog = async (token: string): Promise<Catalog | null> => {
  const etag = await getMeta(CATALOG_ETAG);
  try {
    const response = await request<Catalog>("/api/catalog", { token, etag });
    if (response.notModified) return readCatalog();
    await setMeta(CATALOG, JSON.stringify(response.data));
    await setMeta(CATALOG_ETAG, response.etag ?? null);
    return response.data;
  } catch (error) {
    if (error instanceof ApiError && error.isTransient) return readCatalog();
    throw error;
  }
};

export const readCatalog = async (): Promise<Catalog | null> => {
  const raw = await getMeta(CATALOG);
  return raw ? (JSON.parse(raw) as Catalog) : null;
};

// ---------------------------------------------------------------------------
// Fiches joueurs
// ---------------------------------------------------------------------------

/**
 * Une fiche joueur, telle que le serveur la calcule.
 *
 * La forme suit celle de `getPlayerProfile` cote site, moins `results` et
 * `metrics` que le telephone possede deja par la descente. Les types restent
 * volontairement larges : cette structure est riche, et la redecrire ici en
 * entier creerait une seconde definition a maintenir en parallele de celle du
 * serveur, qui divergerait au premier changement.
 */
export interface PlayerProfile {
  player: Record<string, unknown> & { id: string; firstName: string; lastName: string };
  ageYears: number;
  population: string;
  comparisons: Array<{
    key: string;
    label: string;
    value: number;
    unit: string | null;
    date: string;
    side: string | null;
    percentile: number | null;
    band: string | null;
    normMean: number | null;
    higherIsBetter: boolean;
    vsSquadPct: number | null;
    thresholdStatus: string | null;
    thresholdLabel: string | null;
  }>;
  radar: Array<{ key: string; label: string; percentile: number | null; value: number | null }>;
  recommendations: Array<{
    area: string;
    severity: string;
    title: string;
    detail: string;
    action?: string;
    reference?: string;
  }>;
  recommendationSummary: Record<string, unknown>;
  latest: Record<string, unknown>;
}

const PROFILES_AT = "profilesAt";

/** Nombre de fiches demandees par requete. */
const PROFILE_BATCH = 12;

/**
 * Telecharge les fiches et les range en base locale.
 *
 * Par lots, pour deux raisons mesurees : une demande de quarante et un joueurs
 * prend vingt huit secondes cote serveur, ce qui depasse le delai du client, et
 * une reponse unique de plusieurs mega octets se perd entierement a la moindre
 * coupure. Par lots de douze, chaque requete tient sous quinze secondes et une
 * coupure ne coute que le dernier lot.
 */
export const syncProfiles = async (token: string, locale: string): Promise<number> => {
  const db = await openDb();
  const players = await db.getAllAsync<{ id: string }>(
    "SELECT id FROM players WHERE status != 'LEFT' ORDER BY lastName",
  );
  if (players.length === 0) return 0;

  let stored = 0;

  for (let index = 0; index < players.length; index += PROFILE_BATCH) {
    const slice = players.slice(index, index + PROFILE_BATCH).map((row) => row.id);

    const { data } = await request<{ profiles: PlayerProfile[]; builtAt: string }>(
      "/api/profiles",
      {
        method: "POST",
        token,
        body: { playerIds: slice, locale },
        // Le calcul cote serveur est plus long qu'une simple lecture : il
        // compare a des tables de normes et fait tourner le moteur de
        // recommandations pour chaque joueur du lot.
        timeoutMs: 45_000,
      },
    );

    await db.withTransactionAsync(async () => {
      for (const profile of data.profiles) {
        await db.runAsync(
          "INSERT OR REPLACE INTO profiles (playerId, locale, json, builtAt) VALUES (?, ?, ?, ?)",
          profile.player.id,
          locale,
          JSON.stringify(profile),
          data.builtAt,
        );
        stored += 1;
      }
    });
  }

  await setMeta(PROFILES_AT, new Date().toISOString());
  return stored;
};

/** Fiche d'un joueur, lue en base locale. */
export const readProfile = async (playerId: string): Promise<PlayerProfile | null> => {
  const db = await openDb();
  const row = await db.getFirstAsync<{ json: string }>(
    "SELECT json FROM profiles WHERE playerId = ?",
    playerId,
  );
  if (!row) return null;
  try {
    return JSON.parse(row.json) as PlayerProfile;
  } catch {
    return null;
  }
};

/** Langue des fiches actuellement stockees, pour savoir s'il faut les refaire. */
export const profilesLocale = async (): Promise<string | null> => {
  const db = await openDb();
  const row = await db.getFirstAsync<{ locale: string }>("SELECT locale FROM profiles LIMIT 1");
  return row?.locale ?? null;
};

// ---------------------------------------------------------------------------
// Cycle complet
// ---------------------------------------------------------------------------

/**
 * Une synchronisation complete.
 *
 * Renvoie un compte rendu, ou leve. L'appelant distingue les erreurs
 * transitoires, qui ne demandent qu'a attendre le reseau, de la session
 * invalide, qui impose un retour a l'ecran de connexion.
 */
export const runSync = async (token: string, locale = "fr"): Promise<SyncReport> => {
  // Le catalogue passe en premier, et non en dernier comme avant.
  //
  // C'est lui qui decrit les champs de chaque test : sans lui, la grille de
  // saisie est vide et l'application devient inutilisable, meme avec toutes les
  // equipes et tous les joueurs descendus. Le placer apres la descente le
  // rendait dependant de sa reussite : une descente interrompue laissait
  // l'utilisateur avec des donnees mais aucune possibilite d'en ajouter.
  //
  // Il pese quelques dizaines de kilo octets et ne change qu'une fois par an,
  // donc le charger d'abord ne coute rien.
  await syncCatalog(token);

  const { pushed, rejected } = await push(token);
  const { pulled, rounds } = await pull(token);

  // Les fiches viennent apres la descente : elles decrivent des joueurs qui
  // doivent d'abord exister en base locale. Une erreur ici ne fait pas echouer
  // la synchronisation : l'effectif et la saisie restent utilisables sans les
  // fiches, ce serait dommage de tout perdre pour une analyse.
  let profiles = 0;
  try {
    profiles = await syncProfiles(token, locale);
  } catch (error) {
    if (error instanceof ApiError && error.requiresSignOut) throw error;
  }

  return { pushed, rejected, pulled, rounds, profiles };
};

/** Vrai quand le telephone sait dessiner les grilles de saisie. */
export const hasCatalog = async (): Promise<boolean> => (await readCatalog()) !== null;

export const lastSyncAt = async (): Promise<Date | null> => {
  const value = await getMeta(LAST_SYNC);
  return value ? new Date(value) : null;
};
