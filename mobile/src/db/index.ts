import * as SQLite from "expo-sqlite";

/**
 * Base locale du telephone.
 *
 * C'est elle que lisent tous les ecrans. L'application ne demande jamais un
 * ecran au serveur : elle affiche ce qu'elle a, et la synchronisation met a
 * jour cette base en arriere plan. C'est ce qui rend l'application utilisable
 * dans un stade sans reseau, et ce qui la rend instantanee ailleurs.
 *
 * Le schema reproduit celui du serveur, sans les colonnes dont le telephone
 * n'a pas l'usage. Les valeurs serialisees restent du texte : elles ne sont
 * jamais interrogees, seulement affichees.
 *
 * SQLite est utilise en mode journal WAL. Sans cela, une lecture d'ecran et une
 * ecriture de synchronisation qui se croisent se bloquent mutuellement, et la
 * liste se fige pendant une seconde au moment ou l'utilisateur fait defiler.
 */

const DATABASE = "lamsaa.db";

/**
 * Version du schema local.
 *
 * A incrementer des qu'une table change. La migration la plus simple est la
 * bonne ici : on efface et on resynchronise. Aucune donnee n'est perdue, le
 * serveur reste la source de verite, sauf pour la file d'attente qui est donc
 * la seule table preservee.
 */
const SCHEMA_VERSION = 1;

let instance: SQLite.SQLiteDatabase | null = null;

const SCHEMA = `
CREATE TABLE IF NOT EXISTS teams (
  id TEXT PRIMARY KEY NOT NULL,
  organizationId TEXT,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  level TEXT,
  sex TEXT NOT NULL,
  season TEXT,
  colorHex TEXT,
  isActive INTEGER NOT NULL DEFAULT 1,
  updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS players (
  id TEXT PRIMARY KEY NOT NULL,
  teamId TEXT NOT NULL,
  firstName TEXT NOT NULL,
  lastName TEXT NOT NULL,
  birthDate TEXT NOT NULL,
  sex TEXT NOT NULL,
  position TEXT NOT NULL,
  secondaryPosition TEXT,
  dominantFoot TEXT,
  jerseyNumber INTEGER,
  heightCm REAL,
  weightKg REAL,
  status TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_players_team ON players (teamId, lastName);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY NOT NULL,
  teamId TEXT NOT NULL,
  date TEXT NOT NULL,
  name TEXT NOT NULL,
  testKeys TEXT NOT NULL,
  surface TEXT,
  weather TEXT,
  temperatureC REAL,
  notes TEXT,
  isLocked INTEGER NOT NULL DEFAULT 0,
  updatedAt TEXT NOT NULL,
  /* Vrai tant que la passation n'a pas ete confirmee par le serveur. */
  pending INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_sessions_team ON sessions (teamId, date DESC);

CREATE TABLE IF NOT EXISTS results (
  id TEXT PRIMARY KEY NOT NULL,
  sessionId TEXT,
  playerId TEXT NOT NULL,
  teamId TEXT NOT NULL,
  testKey TEXT NOT NULL,
  date TEXT NOT NULL,
  rawJson TEXT NOT NULL DEFAULT '{}',
  computedJson TEXT NOT NULL DEFAULT '{}',
  quality TEXT,
  updatedAt TEXT NOT NULL,
  pending INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_results_player ON results (playerId, date DESC);
CREATE INDEX IF NOT EXISTS idx_results_session ON results (sessionId, testKey);

CREATE TABLE IF NOT EXISTS metrics (
  id TEXT PRIMARY KEY NOT NULL,
  playerId TEXT NOT NULL,
  teamId TEXT NOT NULL,
  testResultId TEXT,
  key TEXT NOT NULL,
  value REAL NOT NULL,
  unit TEXT,
  date TEXT NOT NULL,
  side TEXT,
  createdAt TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_metrics_player ON metrics (playerId, key, date DESC);

/*
 * File d'attente des saisies faites hors reseau.
 *
 * C'est la seule table que le telephone possede vraiment : tout le reste est
 * une copie du serveur, effacable sans consequence. Elle n'est donc jamais
 * videe par une migration, et une operation n'en sort qu'une fois le verdict du
 * serveur recu.
 */
CREATE TABLE IF NOT EXISTS outbox (
  id TEXT PRIMARY KEY NOT NULL,
  type TEXT NOT NULL,
  payload TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  lastError TEXT
);
CREATE INDEX IF NOT EXISTS idx_outbox_order ON outbox (createdAt);

CREATE TABLE IF NOT EXISTS meta (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT
);
`;

export const openDb = async (): Promise<SQLite.SQLiteDatabase> => {
  if (instance) return instance;

  const db = await SQLite.openDatabaseAsync(DATABASE);

  // WAL : lectures et ecritures concurrentes sans blocage mutuel.
  // Les cles etrangeres restent desactivees volontairement : la
  // synchronisation ecrit les tables dans un ordre quelconque, et un resultat
  // peut arriver avant sa passation dans une meme page.
  await db.execAsync("PRAGMA journal_mode = WAL;");
  await db.execAsync(SCHEMA);

  const stored = await db.getFirstAsync<{ value: string }>(
    "SELECT value FROM meta WHERE key = 'schemaVersion'",
  );
  const version = stored ? Number(stored.value) : 0;

  if (version !== SCHEMA_VERSION) {
    // Migration par remise a zero du miroir. La file d'attente survit : elle
    // contient le seul travail qui n'existe nulle part ailleurs.
    await db.execAsync(`
      DELETE FROM teams; DELETE FROM players; DELETE FROM sessions;
      DELETE FROM results; DELETE FROM metrics;
      DELETE FROM meta WHERE key IN ('cursor', 'lastSyncAt', 'catalogEtag', 'catalog');
    `);
    await db.runAsync(
      "INSERT OR REPLACE INTO meta (key, value) VALUES ('schemaVersion', ?)",
      String(SCHEMA_VERSION),
    );
  }

  instance = db;
  return db;
};

// ---------------------------------------------------------------------------
// Cles de reglage
// ---------------------------------------------------------------------------

export const getMeta = async (key: string): Promise<string | null> => {
  const db = await openDb();
  const row = await db.getFirstAsync<{ value: string | null }>(
    "SELECT value FROM meta WHERE key = ?",
    key,
  );
  return row?.value ?? null;
};

export const setMeta = async (key: string, value: string | null): Promise<void> => {
  const db = await openDb();
  await db.runAsync("INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)", key, value);
};

/**
 * Efface tout, y compris la file d'attente.
 *
 * Appele a la deconnexion uniquement. Les donnees des joueurs sont des donnees
 * de sante : elles n'ont rien a faire sur un telephone dont personne n'est plus
 * responsable.
 */
export const wipe = async (): Promise<void> => {
  const db = await openDb();
  await db.execAsync(`
    DELETE FROM teams; DELETE FROM players; DELETE FROM sessions;
    DELETE FROM results; DELETE FROM metrics; DELETE FROM outbox; DELETE FROM meta;
  `);
  await db.runAsync(
    "INSERT OR REPLACE INTO meta (key, value) VALUES ('schemaVersion', ?)",
    String(SCHEMA_VERSION),
  );
};
