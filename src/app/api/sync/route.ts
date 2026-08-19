import { z } from "zod";

import { prisma } from "@/lib/db";
import { logAudit } from "@/lib/auth";
import { apiAccessibleTeamIds, apiCanAccessTeam, getApiUser } from "@/lib/api/session";
import { fail, handler, ok } from "@/lib/api/respond";
import { PLAYER_STATUSES, POSITIONS } from "@/lib/constants";
import { applyResults } from "@/lib/tests/apply-results";
import { validateEntries } from "@/lib/tests/validate-entries";
import { getTest } from "@/lib/sports-science/catalog";

export const dynamic = "force-dynamic";

/**
 * Synchronisation de l'application mobile.
 *
 * ---------------------------------------------------------------------------
 * Le modele, en une phrase
 * ---------------------------------------------------------------------------
 *
 * Le telephone possede sa propre base et ne demande jamais un ecran au serveur.
 * Il descend les changements (GET) et remonte ce qu'il a saisi (POST). Entre
 * deux synchronisations, l'application fonctionne entierement sur sa base
 * locale : c'est ce qui la rend utilisable dans un stade sans reseau.
 *
 * ---------------------------------------------------------------------------
 * Descente : GET /api/sync?since=<ISO 8601>
 * ---------------------------------------------------------------------------
 *
 * Sans `since`, tout est renvoye. Avec, seulement ce qui a change depuis.
 *
 * Deux details qui comptent :
 *
 * . Les suppressions ne laissent aucune trace en base, un delta ne peut donc pas
 *   les transmettre. La reponse joint la liste complete des identifiants encore
 *   vivants ; le telephone efface localement tout ce qui n'y figure pas. Une
 *   liste d'identifiants coute quelques kilo octets, la un journal de
 *   suppressions couterait une table et une migration.
 * . La reponse est plafonnee. Au dela, `hasMore` vaut vrai et le client rappelle
 *   avec le curseur renvoye. Sans ce plafond, la premiere synchronisation d'un
 *   club de trois cents joueurs tenterait de tenir en une seule reponse.
 *
 * ---------------------------------------------------------------------------
 * Remontee : POST /api/sync
 * ---------------------------------------------------------------------------
 *
 * Le corps porte une file d'operations, dans l'ordre ou elles ont ete faites.
 * Chacune porte un identifiant genere par le telephone.
 *
 * L'idempotence ne repose sur aucun registre d'operations : les identifiants des
 * passations sont generes par le telephone, et l'ecriture est un `upsert`. Un
 * envoi rejoue apres une coupure produit donc exactement le meme etat, sans
 * doublon. C'est la raison pour laquelle le client genere ses identifiants.
 *
 * Chaque operation recoit son verdict. Une operation refusee n'arrete pas les
 * suivantes : sur le terrain, une passation supprimee entre temps ne doit pas
 * bloquer la remontee des six autres.
 *
 * ---------------------------------------------------------------------------
 * Conflits
 * ---------------------------------------------------------------------------
 *
 * Derniere ecriture gagnante, par ligne de resultat. Le cas ou deux personnes
 * saisissent le meme test du meme joueur dans la meme passation existe, mais il
 * est rare et sans enjeu : la valeur juste est celle du dernier qui a mesure.
 * Un verrouillage aurait coute plus cher a l'usage qu'il n'aurait rapporte.
 */

// ---------------------------------------------------------------------------
// Descente
// ---------------------------------------------------------------------------

/** Plafond par table et par appel. */
const PAGE = 800;
const METRIC_PAGE = 3200;

/** Profondeur d'historique embarquee sur le telephone. */
const HISTORY_MONTHS = 18;

/**
 * Position atteinte dans une table : une date, puis un identifiant.
 *
 * L'identifiant n'est pas un detail. PostgreSQL evalue `now()` une seule fois
 * par instruction : les trois mille metriques ecrites par un meme `createMany`
 * portent donc toutes la meme date a la milliseconde. Un curseur reduit a une
 * date, avance avec un `>` strict, sauterait tout le reste du lot des qu'une
 * page se remplit au milieu de celui ci, et ces lignes ne reviendraient jamais.
 * Une synchronisation qui perd des lignes en silence est pire qu'une
 * synchronisation qui echoue bruyamment.
 *
 * La paire (date, identifiant) est unique et totalement ordonnee, ce qui rend
 * la reprise exacte quelle que soit la repartition des dates.
 */
interface Position {
  t: string;
  id: string;
}

type Cursor = Partial<Record<"teams" | "players" | "sessions" | "results" | "metrics", Position>>;

const decodeCursor = (raw: string | null): Cursor => {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(Buffer.from(raw, "base64url").toString("utf8"));
    return typeof parsed === "object" && parsed !== null ? (parsed as Cursor) : {};
  } catch {
    // Un curseur illisible repart de zero : c'est lent mais correct, alors
    // qu'une erreur bloquerait l'application sur un etat dont elle ne peut pas
    // sortir seule.
    return {};
  }
};

const encodeCursor = (cursor: Cursor): string =>
  Buffer.from(JSON.stringify(cursor), "utf8").toString("base64url");

/** Filtre de reprise sur (date, identifiant), pour une table donnee. */
const after = (field: "updatedAt" | "createdAt", position: Position | undefined) => {
  if (!position) return {};
  const date = new Date(position.t);
  if (Number.isNaN(date.getTime())) return {};
  return {
    OR: [
      { [field]: { gt: date } },
      { AND: [{ [field]: date }, { id: { gt: position.id } }] },
    ],
  };
};

const nextPosition = <T extends { id: string }>(
  rows: T[],
  limit: number,
  date: (row: T) => Date,
): Position | undefined => {
  // Tant que la page n'est pas pleine, la table est a jour : plus rien a
  // reprendre, et le client peut avancer sur l'horloge du serveur.
  if (rows.length < limit) return undefined;
  const last = rows[rows.length - 1];
  return { t: date(last).toISOString(), id: last.id };
};

export const GET = handler(async (request: Request) => {
  const user = await getApiUser(request);
  if (!user) return fail("UNAUTHENTICATED", "Session expiree.");

  const url = new URL(request.url);
  const cursor = decodeCursor(url.searchParams.get("cursor"));
  const first = Object.keys(cursor).length === 0 && !url.searchParams.get("since");

  // `since` reste accepte pour une reprise simple : le client qui n'a rien a
  // rattraper envoie seulement la date de sa derniere synchronisation complete.
  const sinceRaw = url.searchParams.get("since");
  const since = sinceRaw ? new Date(sinceRaw) : null;
  if (sinceRaw && Number.isNaN(since?.getTime())) {
    return fail("INVALID_INPUT", "Parametre `since` invalide, format ISO 8601 attendu.");
  }
  const sinceFilter = (field: "updatedAt" | "createdAt") =>
    since && Object.keys(cursor).length === 0 ? { [field]: { gt: since } } : {};

  const ids = await apiAccessibleTeamIds(user);
  if (ids !== "ALL" && ids.length === 0) {
    return ok({
      serverTime: new Date().toISOString(),
      cursor: null,
      hasMore: false,
      teams: [],
      players: [],
      sessions: [],
      results: [],
      metrics: [],
      alive: { teams: [], players: [], sessions: [] },
    });
  }

  const teamFilter = ids === "ALL" ? {} : { teamId: { in: ids } };
  const teamWhere = ids === "ALL" ? {} : { id: { in: ids } };

  const historyFrom = new Date();
  historyFrom.setMonth(historyFrom.getMonth() - HISTORY_MONTHS);

  const serverTime = new Date();

  const [teams, players, sessions, results, metrics] = await Promise.all([
    prisma.team.findMany({
      where: { ...teamWhere, ...sinceFilter("updatedAt"), ...after("updatedAt", cursor.teams) },
      select: {
        id: true,
        organizationId: true,
        name: true,
        category: true,
        level: true,
        sex: true,
        season: true,
        colorHex: true,
        isActive: true,
        updatedAt: true,
      },
      take: PAGE,
      orderBy: [{ updatedAt: "asc" }, { id: "asc" }],
    }),

    prisma.player.findMany({
      where: { ...teamFilter, ...sinceFilter("updatedAt"), ...after("updatedAt", cursor.players) },
      select: {
        id: true,
        teamId: true,
        firstName: true,
        lastName: true,
        birthDate: true,
        sex: true,
        position: true,
        secondaryPosition: true,
        dominantFoot: true,
        jerseyNumber: true,
        heightCm: true,
        weightKg: true,
        status: true,
        email: true,
        externalId: true,
        notes: true,
        updatedAt: true,
      },
      take: PAGE,
      orderBy: [{ updatedAt: "asc" }, { id: "asc" }],
    }),

    prisma.testSession.findMany({
      where: {
        ...teamFilter,
        date: { gte: historyFrom },
        ...sinceFilter("updatedAt"),
        ...after("updatedAt", cursor.sessions),
      },
      select: {
        id: true,
        teamId: true,
        date: true,
        name: true,
        testKeys: true,
        surface: true,
        weather: true,
        temperatureC: true,
        notes: true,
        isLocked: true,
        updatedAt: true,
      },
      take: PAGE,
      orderBy: [{ updatedAt: "asc" }, { id: "asc" }],
    }),

    prisma.testResult.findMany({
      where: {
        ...teamFilter,
        date: { gte: historyFrom },
        ...sinceFilter("updatedAt"),
        ...after("updatedAt", cursor.results),
      },
      select: {
        id: true,
        sessionId: true,
        playerId: true,
        teamId: true,
        testKey: true,
        date: true,
        rawJson: true,
        computedJson: true,
        quality: true,
        updatedAt: true,
      },
      take: PAGE,
      orderBy: [{ updatedAt: "asc" }, { id: "asc" }],
    }),

    // Metric ne porte pas de date de modification : ses lignes ne sont jamais
    // modifiees, elles sont supprimees puis recreees a chaque enregistrement.
    // `createdAt` est donc le bon axe de reprise.
    prisma.metric.findMany({
      where: {
        ...teamFilter,
        date: { gte: historyFrom },
        ...sinceFilter("createdAt"),
        ...after("createdAt", cursor.metrics),
      },
      select: {
        id: true,
        playerId: true,
        teamId: true,
        testResultId: true,
        key: true,
        value: true,
        unit: true,
        date: true,
        side: true,
        createdAt: true,
      },
      take: METRIC_PAGE,
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    }),
  ]);

  const nextCursor: Cursor = {};
  const place = <T extends { id: string }>(
    key: keyof Cursor,
    rows: T[],
    limit: number,
    date: (row: T) => Date,
  ) => {
    const position = nextPosition(rows, limit, date);
    if (position) nextCursor[key] = position;
  };

  place("teams", teams, PAGE, (row) => row.updatedAt);
  place("players", players, PAGE, (row) => row.updatedAt);
  place("sessions", sessions, PAGE, (row) => row.updatedAt);
  place("results", results, PAGE, (row) => row.updatedAt);
  place("metrics", metrics, METRIC_PAGE, (row) => row.createdAt);

  const hasMore = Object.keys(nextCursor).length > 0;

  // La liste des identifiants vivants sert au telephone a effacer ce qui a ete
  // supprime cote serveur : une suppression ne laisse aucune trace en base, un
  // delta ne peut donc pas la transmettre. Elle n'est envoyee qu'au dernier
  // tour, ou elle est complete et coherente.
  const alive = hasMore
    ? null
    : await (async () => {
        const [aliveTeams, alivePlayers, aliveSessions] = await Promise.all([
          prisma.team.findMany({ where: teamWhere, select: { id: true } }),
          prisma.player.findMany({ where: teamFilter, select: { id: true } }),
          prisma.testSession.findMany({
            where: { ...teamFilter, date: { gte: historyFrom } },
            select: { id: true },
          }),
        ]);
        return {
          teams: aliveTeams.map((row) => row.id),
          players: alivePlayers.map((row) => row.id),
          sessions: aliveSessions.map((row) => row.id),
        };
      })();

  return ok({
    // Le client ne retient cette date comme point de reprise que lorsque la
    // descente est terminee. Tant qu'il reste des pages, il rappelle avec le
    // curseur et ignore l'horloge.
    serverTime: serverTime.toISOString(),
    cursor: hasMore ? encodeCursor(nextCursor) : null,
    hasMore,
    first,
    teams,
    players,
    sessions,
    results,
    metrics,
    alive,
  });
});

// ---------------------------------------------------------------------------
// Remontee
// ---------------------------------------------------------------------------

const sessionUpsert = z.object({
  id: z.string().min(8).max(64),
  teamId: z.string().min(1),
  name: z.string().trim().min(2).max(120),
  date: z.string().datetime({ offset: true }),
  testKeys: z.array(z.string().min(1)).min(1).max(30),
  surface: z.string().max(30).nullish(),
  weather: z.string().max(60).nullish(),
  temperatureC: z.number().min(-30).max(60).nullish(),
  notes: z.string().max(2000).nullish(),
});

const resultsSave = z.object({
  sessionId: z.string().min(1),
  testKey: z.string().min(1),
  entries: z
    .array(
      z.object({
        playerId: z.string().min(1),
        values: z.record(z.union([z.string(), z.number()])),
      }),
    )
    .min(1)
    .max(200),
});

/**
 * Joueur cree ou modifie depuis le telephone.
 *
 * L'identifiant vient du telephone, comme pour les passations : c'est ce qui
 * rend l'operation rejouable apres une coupure sans creer un second joueur.
 *
 * Le sexe n'est pas dans ce schema, et c'est volontaire. Il est impose par
 * l'equipe d'accueil, cote serveur, exactement comme dans le formulaire du
 * site : c'est lui qui choisit la population de reference des percentiles, et
 * le laisser au client permettrait de comparer une joueuse a des normes
 * masculines par une simple faute de frappe.
 */
const playerUpsert = z.object({
  id: z.string().min(8).max(64),
  teamId: z.string().min(1),
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  /** Date seule, `AAAA-MM-JJ` : une date de naissance n'a pas d'heure. */
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  position: z.enum(POSITIONS),
  secondaryPosition: z.enum(POSITIONS).nullish(),
  dominantFoot: z.enum(["R", "L", "B"]),
  jerseyNumber: z.number().int().min(0).max(99).nullish(),
  heightCm: z.number().min(120).max(220).nullish(),
  weightKg: z.number().min(25).max(150).nullish(),
  status: z.enum(PLAYER_STATUSES),
  email: z.string().trim().email().max(120).nullish().or(z.literal("")),
  externalId: z.string().trim().max(60).nullish(),
  notes: z.string().max(2000).nullish(),
});

const operation = z.discriminatedUnion("type", [
  z.object({ id: z.string().min(8), type: z.literal("session.upsert"), payload: sessionUpsert }),
  z.object({ id: z.string().min(8), type: z.literal("results.save"), payload: resultsSave }),
  z.object({ id: z.string().min(8), type: z.literal("player.upsert"), payload: playerUpsert }),
]);

const pushSchema = z.object({ operations: z.array(operation).min(1).max(50) });

type Verdict = {
  id: string;
  status: "applied" | "rejected";
  error?: { code: string; message: string };
  result?: unknown;
};

export const POST = handler(async (request: Request) => {
  const user = await getApiUser(request);
  if (!user) return fail("UNAUTHENTICATED", "Session expiree.");

  const body = await request.json().catch(() => null);
  const parsed = pushSchema.safeParse(body);
  if (!parsed.success) {
    return fail("INVALID_INPUT", "File d'operations invalide.", parsed.error.flatten());
  }

  const verdicts: Verdict[] = [];
  let appliedResults = 0;

  for (const op of parsed.data.operations) {
    // Une operation refusee n'arrete pas les suivantes : une passation
    // supprimee entre temps ne doit pas bloquer la remontee des autres.
    try {
      if (op.type === "session.upsert") {
        const { payload } = op;
        const access = await apiCanAccessTeam(user, payload.teamId);
        if (!access.canEdit) {
          verdicts.push({
            id: op.id,
            status: "rejected",
            error: { code: "FORBIDDEN", message: "Droits insuffisants sur cette equipe." },
          });
          continue;
        }

        const unknownKeys = payload.testKeys.filter((key) => !getTest(key));
        if (unknownKeys.length > 0) {
          verdicts.push({
            id: op.id,
            status: "rejected",
            error: { code: "INVALID_INPUT", message: `Tests inconnus : ${unknownKeys.join(", ")}` },
          });
          continue;
        }

        const data = {
          teamId: payload.teamId,
          name: payload.name,
          date: new Date(payload.date),
          testKeys: payload.testKeys.join(","),
          surface: payload.surface ?? null,
          weather: payload.weather ?? null,
          temperatureC: payload.temperatureC ?? null,
          notes: payload.notes ?? null,
        };

        // L'identifiant vient du telephone : rejouer l'operation reecrit la
        // meme ligne au lieu d'en creer une seconde.
        const session = await prisma.testSession.upsert({
          where: { id: payload.id },
          create: { id: payload.id, ...data, createdById: user.id },
          update: data,
        });

        verdicts.push({ id: op.id, status: "applied", result: { sessionId: session.id } });
        continue;
      }

      if (op.type === "player.upsert") {
        const { payload } = op;

        // Droits sur l'equipe d'accueil.
        const access = await apiCanAccessTeam(user, payload.teamId);
        if (!access.canEdit) {
          verdicts.push({
            id: op.id,
            status: "rejected",
            error: { code: "FORBIDDEN", message: "Droits insuffisants sur cette equipe." },
          });
          continue;
        }

        const existing = await prisma.player.findUnique({
          where: { id: payload.id },
          select: { id: true, teamId: true },
        });

        // Transfert : il faut aussi le droit sur l'equipe de depart, sinon un
        // preparateur pourrait s'approprier le joueur d'une equipe voisine en
        // le deplacant vers la sienne.
        if (existing && existing.teamId !== payload.teamId) {
          const source = await apiCanAccessTeam(user, existing.teamId);
          if (!source.canEdit) {
            verdicts.push({
              id: op.id,
              status: "rejected",
              error: { code: "FORBIDDEN", message: "Droits insuffisants sur l'equipe de depart." },
            });
            continue;
          }
        }

        // C'est l'equipe d'accueil qui fixe le sexe, y compris lors d'un
        // transfert : voir le commentaire du schema.
        const team = await prisma.team.findUnique({
          where: { id: payload.teamId },
          select: {
            sex: true,
            name: true,
            organizationId: true,
            organization: { select: { maxPlayers: true, plan: true } },
          },
        });
        if (!team) {
          verdicts.push({
            id: op.id,
            status: "rejected",
            error: { code: "NOT_FOUND", message: "Equipe introuvable." },
          });
          continue;
        }

        // Le plafond du forfait ne s'applique qu'a la creation. L'appliquer a
        // la modification empecherait de corriger une faute de frappe dans un
        // club deja au plafond, ce qui n'a aucun sens.
        if (!existing) {
          const count = await prisma.player.count({
            where: { team: { organizationId: team.organizationId }, status: { not: "LEFT" } },
          });
          if (count >= team.organization.maxPlayers) {
            verdicts.push({
              id: op.id,
              status: "rejected",
              error: {
                code: "CONFLICT",
                message: `Plafond du forfait ${team.organization.plan} atteint : ${team.organization.maxPlayers} joueurs.`,
              },
            });
            continue;
          }
        }

        const birthDate = new Date(`${payload.birthDate}T00:00:00.000Z`);
        if (Number.isNaN(birthDate.getTime())) {
          verdicts.push({
            id: op.id,
            status: "rejected",
            error: { code: "INVALID_INPUT", message: "Date de naissance invalide." },
          });
          continue;
        }

        const data = {
          teamId: payload.teamId,
          firstName: payload.firstName,
          lastName: payload.lastName,
          birthDate,
          sex: team.sex,
          position: payload.position,
          secondaryPosition: payload.secondaryPosition || null,
          dominantFoot: payload.dominantFoot,
          jerseyNumber: payload.jerseyNumber ?? null,
          heightCm: payload.heightCm ?? null,
          weightKg: payload.weightKg ?? null,
          status: payload.status,
          email: payload.email || null,
          externalId: payload.externalId || null,
          notes: payload.notes || null,
        };

        const player = await prisma.player.upsert({
          where: { id: payload.id },
          create: { id: payload.id, ...data },
          update: data,
        });

        await logAudit({
          userId: user.id,
          actorEmail: user.email,
          organizationId: team.organizationId,
          action: existing ? "UPDATE" : "CREATE",
          entity: "Player",
          entityId: player.id,
          meta: {
            canal: "mobile",
            name: `${player.firstName} ${player.lastName}`,
            teamId: payload.teamId,
            ...(existing && existing.teamId !== payload.teamId
              ? { transfertDepuis: existing.teamId }
              : {}),
          },
        });

        verdicts.push({ id: op.id, status: "applied", result: { playerId: player.id } });
        continue;
      }

      // op.type === "results.save"
      const { payload } = op;
      const session = await prisma.testSession.findUnique({
        where: { id: payload.sessionId },
        select: { id: true, teamId: true, date: true, temperatureC: true, isLocked: true },
      });

      if (!session) {
        verdicts.push({
          id: op.id,
          status: "rejected",
          error: { code: "NOT_FOUND", message: "Passation introuvable." },
        });
        continue;
      }

      const access = await apiCanAccessTeam(user, session.teamId);
      if (!access.canEdit) {
        verdicts.push({
          id: op.id,
          status: "rejected",
          error: { code: "FORBIDDEN", message: "Droits insuffisants sur cette passation." },
        });
        continue;
      }

      if (session.isLocked) {
        verdicts.push({
          id: op.id,
          status: "rejected",
          error: { code: "CONFLICT", message: "Cette passation a ete verrouillee." },
        });
        continue;
      }

      if (!getTest(payload.testKey)) {
        verdicts.push({
          id: op.id,
          status: "rejected",
          error: { code: "INVALID_INPUT", message: "Test inconnu." },
        });
        continue;
      }

      // Un nom de champ errone ne doit pas produire un enregistrement a zero.
      // Voir src/lib/tests/validate-entries.ts.
      const controle = validateEntries(payload.testKey, payload.entries);
      if (!controle.ok) {
        verdicts.push({
          id: op.id,
          status: "rejected",
          error: {
            code: "INVALID_INPUT",
            message: controle.problems[0].message,
          },
          result: { problems: controle.problems.slice(0, 20) },
        });
        continue;
      }

      const outcome = await applyResults({
        session: {
          id: session.id,
          teamId: session.teamId,
          date: session.date,
          temperatureC: session.temperatureC,
        },
        testKey: payload.testKey,
        entries: payload.entries,
        authorId: user.id,
      });

      appliedResults += outcome.saved;
      verdicts.push({ id: op.id, status: "applied", result: outcome });
    } catch (error) {
      console.error("[sync]", op.type, error);
      verdicts.push({
        id: op.id,
        status: "rejected",
        error: { code: "SERVER_ERROR", message: "Operation refusee par le serveur." },
      });
    }
  }

  if (appliedResults > 0) {
    await logAudit({
      userId: user.id,
      actorEmail: user.email,
      organizationId: user.organizationId,
      action: "UPDATE",
      entity: "TestResult",
      meta: { canal: "mobile", operations: verdicts.length, resultats: appliedResults },
    });
  }

  return ok({ serverTime: new Date().toISOString(), verdicts });
});
