import { openDb } from ".";

/**
 * Lectures de la base locale.
 *
 * Toutes les listes de l'application passent par ici. Aucun ecran n'appelle le
 * reseau pour s'afficher : il lit ce que la derniere synchronisation a depose,
 * ce qui rend l'affichage instantane et identique avec ou sans reseau.
 */

export interface TeamRow {
  id: string;
  name: string;
  category: string;
  level: string | null;
  sex: string;
  season: string | null;
  colorHex: string | null;
  playerCount: number;
}

export interface PlayerRow {
  id: string;
  teamId: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  position: string;
  jerseyNumber: number | null;
  heightCm: number | null;
  weightKg: number | null;
  dominantFoot: string | null;
  status: string;
}

export interface SessionRow {
  id: string;
  teamId: string;
  teamName: string;
  date: string;
  name: string;
  testKeys: string;
  isLocked: number;
  pending: number;
  resultCount: number;
}

export const listTeams = async (): Promise<TeamRow[]> => {
  const db = await openDb();
  return db.getAllAsync<TeamRow>(`
    SELECT t.id, t.name, t.category, t.level, t.sex, t.season, t.colorHex,
           (SELECT COUNT(*) FROM players p WHERE p.teamId = t.id AND p.status != 'LEFT') AS playerCount
    FROM teams t
    WHERE t.isActive = 1
    ORDER BY t.name COLLATE NOCASE
  `);
};

export const getTeam = async (teamId: string): Promise<TeamRow | null> => {
  const db = await openDb();
  const row = await db.getFirstAsync<TeamRow>(
    `SELECT t.id, t.name, t.category, t.level, t.sex, t.season, t.colorHex,
            (SELECT COUNT(*) FROM players p WHERE p.teamId = t.id AND p.status != 'LEFT') AS playerCount
     FROM teams t WHERE t.id = ?`,
    teamId,
  );
  return row ?? null;
};

export const listPlayers = async (teamId: string): Promise<PlayerRow[]> => {
  const db = await openDb();
  return db.getAllAsync<PlayerRow>(
    `SELECT id, teamId, firstName, lastName, birthDate, position, jerseyNumber,
            heightCm, weightKg, dominantFoot, status
     FROM players
     WHERE teamId = ? AND status != 'LEFT'
     ORDER BY lastName COLLATE NOCASE, firstName COLLATE NOCASE`,
    teamId,
  );
};

export const getPlayer = async (playerId: string): Promise<PlayerRow | null> => {
  const db = await openDb();
  const row = await db.getFirstAsync<PlayerRow>(
    `SELECT id, teamId, firstName, lastName, birthDate, position, jerseyNumber,
            heightCm, weightKg, dominantFoot, status
     FROM players WHERE id = ?`,
    playerId,
  );
  return row ?? null;
};

export const listSessions = async (limit = 20, teamId?: string): Promise<SessionRow[]> => {
  const db = await openDb();
  const clause = teamId ? "WHERE s.teamId = ?" : "";
  const params = teamId ? [teamId, limit] : [limit];
  return db.getAllAsync<SessionRow>(
    `SELECT s.id, s.teamId, COALESCE(t.name, '') AS teamName, s.date, s.name,
            s.testKeys, s.isLocked, s.pending,
            (SELECT COUNT(*) FROM results r WHERE r.sessionId = s.id) AS resultCount
     FROM sessions s
     LEFT JOIN teams t ON t.id = s.teamId
     ${clause}
     ORDER BY s.date DESC
     LIMIT ?`,
    ...params,
  );
};

export const getSession = async (sessionId: string): Promise<SessionRow | null> => {
  const db = await openDb();
  const row = await db.getFirstAsync<SessionRow>(
    `SELECT s.id, s.teamId, COALESCE(t.name, '') AS teamName, s.date, s.name,
            s.testKeys, s.isLocked, s.pending,
            (SELECT COUNT(*) FROM results r WHERE r.sessionId = s.id) AS resultCount
     FROM sessions s LEFT JOIN teams t ON t.id = s.teamId
     WHERE s.id = ?`,
    sessionId,
  );
  return row ?? null;
};

/** Valeurs deja saisies pour un test d'une passation, par joueur. */
export const getSessionEntries = async (
  sessionId: string,
  testKey: string,
): Promise<Record<string, Record<string, string>>> => {
  const db = await openDb();
  const rows = await db.getAllAsync<{ playerId: string; rawJson: string }>(
    "SELECT playerId, rawJson FROM results WHERE sessionId = ? AND testKey = ?",
    sessionId,
    testKey,
  );
  const out: Record<string, Record<string, string>> = {};
  for (const row of rows) {
    try {
      const raw = JSON.parse(row.rawJson) as Record<string, unknown>;
      out[row.playerId] = Object.fromEntries(
        Object.entries(raw).map(([key, value]) => [key, String(value)]),
      );
    } catch {
      out[row.playerId] = {};
    }
  }
  return out;
};

export interface MetricRow {
  key: string;
  value: number;
  unit: string | null;
  date: string;
  side: string | null;
}

/** Derniere valeur connue de chaque metrique d'un joueur. */
export const latestMetrics = async (playerId: string): Promise<MetricRow[]> => {
  const db = await openDb();
  return db.getAllAsync<MetricRow>(
    `SELECT m.key, m.value, m.unit, m.date, m.side
     FROM metrics m
     INNER JOIN (
       SELECT key, COALESCE(side, '') AS s, MAX(date) AS maxDate
       FROM metrics WHERE playerId = ? GROUP BY key, COALESCE(side, '')
     ) last ON last.key = m.key AND last.s = COALESCE(m.side, '') AND last.maxDate = m.date
     WHERE m.playerId = ?
     ORDER BY m.key`,
    playerId,
    playerId,
  );
};

export interface Counts {
  teams: number;
  players: number;
  sessions: number;
  unavailable: number;
}

export const counts = async (): Promise<Counts> => {
  const db = await openDb();
  const row = await db.getFirstAsync<Counts>(`
    SELECT
      (SELECT COUNT(*) FROM teams WHERE isActive = 1) AS teams,
      (SELECT COUNT(*) FROM players WHERE status != 'LEFT') AS players,
      (SELECT COUNT(*) FROM sessions) AS sessions,
      (SELECT COUNT(*) FROM players WHERE status IN ('INJURED', 'REHAB')) AS unavailable
  `);
  return row ?? { teams: 0, players: 0, sessions: 0, unavailable: 0 };
};

/** Joueurs indisponibles, la seule alerte calculable sans le moteur du serveur. */
export const unavailablePlayers = async (): Promise<Array<PlayerRow & { teamName: string }>> => {
  const db = await openDb();
  return db.getAllAsync<PlayerRow & { teamName: string }>(
    `SELECT p.id, p.teamId, p.firstName, p.lastName, p.birthDate, p.position,
            p.jerseyNumber, p.heightCm, p.weightKg, p.dominantFoot, p.status,
            COALESCE(t.name, '') AS teamName
     FROM players p LEFT JOIN teams t ON t.id = p.teamId
     WHERE p.status IN ('INJURED', 'REHAB')
     ORDER BY p.lastName COLLATE NOCASE`,
  );
};

/** Age exact, en annees, a partir de la date de naissance stockee. */
export const ageOf = (birthDate: string): number => {
  const birth = new Date(birthDate);
  if (Number.isNaN(birth.getTime())) return 0;
  return (Date.now() - birth.getTime()) / (365.2425 * 24 * 3600 * 1000);
};
