/**
 * Verifie que la synchronisation mobile ne perd aucune ligne.
 *
 * Pourquoi ce script existe : une synchronisation qui echoue se voit, une
 * synchronisation qui saute des lignes ne se voit pas. Le preparateur constate
 * six mois plus tard qu'un graphique a des trous, et plus personne ne sait
 * quand ni pourquoi. Ce controle rejoue une descente complete, exactement comme
 * le ferait un telephone neuf, puis compare identifiant par identifiant avec ce
 * que contient la base.
 *
 * Le piege precis qu'il surveille : PostgreSQL evalue `now()` une seule fois par
 * instruction, donc toutes les lignes d'un meme `createMany` portent la meme
 * date. Un curseur de pagination reduit a une date sauterait le reste du lot des
 * qu'une page se remplit au milieu de celui ci. Le curseur porte donc aussi
 * l'identifiant, et c'est ce que ce script verifie reellement.
 *
 * Usage :
 *   npm run dev            (dans un autre terminal)
 *   npm run verify:sync    avec API_EMAIL et API_PASSWORD dans .env
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const BASE = process.env.API_BASE?.trim() || "http://localhost:3000";
const EMAIL = process.env.API_EMAIL?.trim();
const PASSWORD = process.env.API_PASSWORD?.trim();

/** Profondeur d'historique embarquee, doit suivre celle de la route. */
const HISTORY_MONTHS = 18;

const TABLES = ["teams", "players", "sessions", "results", "metrics"] as const;
type Table = (typeof TABLES)[number];

async function main() {
  if (!EMAIL || !PASSWORD) {
    console.error(
      "API_EMAIL et API_PASSWORD sont requis.\n" +
        "Ajouter dans .env, avec un compte proprietaire qui voit toutes les equipes.",
    );
    process.exit(1);
  }

  // 1. Connexion
  const login = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD, device: "verify:sync" }),
  });

  if (!login.ok) {
    console.error(`Connexion refusee (${login.status}). Le serveur tourne t il sur ${BASE} ?`);
    process.exit(1);
  }
  const { token } = (await login.json()) as { token: string };

  // 2. Descente complete, en bouclant sur le curseur comme le ferait le client
  const recus: Record<Table, Set<string>> = {
    teams: new Set(),
    players: new Set(),
    sessions: new Set(),
    results: new Set(),
    metrics: new Set(),
  };

  interface Vivants {
    teams: string[];
    players: string[];
    sessions: string[];
  }

  let cursor: string | null = null;
  let tours = 0;
  let vivants: Vivants | null = null;

  do {
    tours += 1;
    if (tours > 50) {
      console.error("Plus de cinquante tours : le curseur n'avance pas.");
      process.exit(1);
    }

    const url = `${BASE}/api/sync${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ""}`;
    const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!response.ok) {
      console.error(`Descente refusee (${response.status}).`);
      process.exit(1);
    }

    const page = (await response.json()) as Record<Table, Array<{ id: string }>> & {
      cursor: string | null;
      hasMore: boolean;
      alive: Vivants | null;
    };

    for (const table of TABLES) {
      for (const row of page[table]) recus[table].add(row.id);
    }

    const precedent: string | null = cursor;
    cursor = page.hasMore ? page.cursor : null;
    if (page.hasMore && cursor === precedent) {
      console.error("Le curseur est bloque sur la meme valeur.");
      process.exit(1);
    }
    if (!page.hasMore) vivants = page.alive;
  } while (cursor);

  // 3. Comparaison avec la base
  const from = new Date();
  from.setMonth(from.getMonth() - HISTORY_MONTHS);

  const [teams, players, sessions, results, metrics] = await Promise.all([
    prisma.team.findMany({ select: { id: true } }),
    prisma.player.findMany({ select: { id: true } }),
    prisma.testSession.findMany({ where: { date: { gte: from } }, select: { id: true } }),
    prisma.testResult.findMany({ where: { date: { gte: from } }, select: { id: true } }),
    prisma.metric.findMany({ where: { date: { gte: from } }, select: { id: true } }),
  ]);

  const enBase: Record<Table, Set<string>> = {
    teams: new Set(teams.map((r) => r.id)),
    players: new Set(players.map((r) => r.id)),
    sessions: new Set(sessions.map((r) => r.id)),
    results: new Set(results.map((r) => r.id)),
    metrics: new Set(metrics.map((r) => r.id)),
  };

  console.log(`Descente complete en ${tours} tour${tours > 1 ? "s" : ""}.\n`);
  console.log("table       en base    recues   manquantes   en trop");
  console.log("-".repeat(56));

  let parfait = true;
  for (const table of TABLES) {
    const manquantes = [...enBase[table]].filter((id) => !recus[table].has(id));
    const enTrop = [...recus[table]].filter((id) => !enBase[table].has(id));
    if (manquantes.length > 0 || enTrop.length > 0) parfait = false;

    console.log(
      table.padEnd(10) +
        String(enBase[table].size).padStart(9) +
        String(recus[table].size).padStart(10) +
        String(manquantes.length).padStart(13) +
        String(enTrop.length).padStart(10) +
        (manquantes.length > 0 ? `   ex : ${manquantes.slice(0, 2).join(", ")}` : ""),
    );
  }

  // La liste des vivants sert au telephone a effacer ce qui a ete supprime.
  // Incomplete, elle effacerait des donnees encore valides.
  console.log();
  if (!vivants) {
    console.log("La liste des identifiants vivants est absente du dernier tour.");
    parfait = false;
  } else {
    const coherente =
      vivants.teams.length === enBase.teams.size &&
      vivants.players.length === enBase.players.size &&
      vivants.sessions.length === enBase.sessions.size;
    console.log(
      coherente
        ? "Liste des vivants coherente avec la base."
        : `Liste des vivants incoherente : equipes ${vivants.teams.length}/${enBase.teams.size},` +
            ` joueurs ${vivants.players.length}/${enBase.players.size},` +
            ` passations ${vivants.sessions.length}/${enBase.sessions.size}`,
    );
    if (!coherente) parfait = false;
  }

  console.log();
  console.log(parfait ? "AUCUNE LIGNE PERDUE." : "DES LIGNES MANQUENT, voir ci dessus.");

  await prisma.$disconnect();
  process.exit(parfait ? 0 : 1);
}

main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
