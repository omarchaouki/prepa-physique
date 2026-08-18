import { prisma } from "@/lib/db";
import { getTest } from "@/lib/sports-science/catalog";
import type { PlayerContext } from "@/lib/sports-science/types";
import { ageExact } from "@/lib/utils";

/**
 * Enregistrement des resultats d'un test, partage par le site et par l'API.
 *
 * Cette fonction existe pour une seule raison : la saisie arrive desormais par
 * deux chemins, le formulaire du site et la synchronisation du telephone. Si le
 * calcul vivait en double, une correction de formule appliquee d'un cote
 * produirait deux verites dans la meme base, et personne ne s'en apercevrait
 * avant de comparer deux graphiques.
 *
 * Elle ne verifie aucun droit et ne journalise rien : c'est le role de l'appelant,
 * qui seul sait s'il repond a une session de navigateur ou a un jeton porteur.
 * Elle suppose donc que l'acces a la passation a deja ete accorde.
 *
 * Les valeurs brutes sont conservees telles quelles, les metriques derivees sont
 * regenerees integralement a chaque enregistrement, ce qui garantit qu'elles
 * correspondent toujours a la version courante des formules.
 */

export interface ResultEntry {
  playerId: string;
  values: Record<string, string | number>;
}

export interface ApplyResultsOutcome {
  saved: number;
  skipped: number;
  flags: Array<{ playerName: string; messages: string[] }>;
}

export interface ApplySessionContext {
  id: string;
  teamId: string;
  date: Date;
  temperatureC: number | null;
}

export const applyResults = async (params: {
  session: ApplySessionContext;
  testKey: string;
  entries: ResultEntry[];
  /** Auteur de la saisie, conserve sur chaque ligne. */
  authorId: string;
}): Promise<ApplyResultsOutcome> => {
  const { session, testKey, entries, authorId } = params;

  const definition = getTest(testKey);
  if (!definition) return { saved: 0, skipped: entries.length, flags: [] };

  const players = await prisma.player.findMany({
    where: { id: { in: entries.map((entry) => entry.playerId) }, teamId: session.teamId },
  });
  const playerMap = new Map(players.map((player) => [player.id, player]));

  let saved = 0;
  let skipped = 0;
  const flags: ApplyResultsOutcome["flags"] = [];

  for (const entry of entries) {
    const player = playerMap.get(entry.playerId);
    // Un joueur absent de l'equipe est ignore en silence : sur un telephone, la
    // ligne peut viser un joueur transfere depuis la derniere synchronisation.
    if (!player) {
      skipped += 1;
      continue;
    }

    // Une ligne entierement vide signifie que le joueur n'a pas passe le test.
    const filled = Object.entries(entry.values).filter(
      ([, value]) => String(value ?? "").trim() !== "",
    );
    if (filled.length === 0) {
      skipped += 1;
      continue;
    }

    const raw: Record<string, number | string> = {};
    for (const [key, value] of filled) {
      const field = definition.fields.find((candidate) => candidate.key === key);
      if (!field) continue;
      raw[key] = field.type === "number" ? Number(value) : String(value);
    }

    // Les conditions declarees au niveau de la passation completent les lignes
    // laissees vides, pour eviter de retaper la meme information a chaque joueur.
    if (
      session.temperatureC != null &&
      raw.temperature === undefined &&
      definition.fields.some((field) => field.key === "temperature")
    ) {
      raw.temperature = session.temperatureC;
    }

    const context: PlayerContext = {
      bodyMassKg: player.weightKg ?? 75,
      heightCm: player.heightCm ?? 178,
      ageYears: ageExact(player.birthDate, session.date),
      sex: (player.sex === "F" ? "F" : "M") as "M" | "F",
      position: player.position,
    };

    let computed;
    try {
      computed = definition.compute(raw, context);
    } catch {
      skipped += 1;
      continue;
    }

    if (computed.metrics.length === 0) {
      skipped += 1;
      continue;
    }

    // Une seule ligne de resultat par joueur, par test et par passation.
    const existing = await prisma.testResult.findFirst({
      where: { sessionId: session.id, playerId: player.id, testKey },
    });

    const data = {
      sessionId: session.id,
      playerId: player.id,
      teamId: session.teamId,
      testKey,
      date: session.date,
      rawJson: JSON.stringify(raw),
      computedJson: JSON.stringify({
        summary: computed.summary,
        flags: computed.flags,
        details: computed.details,
      }),
      createdById: authorId,
    };

    const result = existing
      ? await prisma.testResult.update({ where: { id: existing.id }, data })
      : await prisma.testResult.create({ data });

    // Les metriques derivees sont regenerees integralement.
    await prisma.metric.deleteMany({ where: { testResultId: result.id } });
    await prisma.metric.createMany({
      data: computed.metrics.map((metric) => ({
        playerId: player.id,
        teamId: session.teamId,
        testResultId: result.id,
        key: metric.key,
        value: metric.value,
        unit: metric.unit,
        date: session.date,
        side: metric.side ?? null,
        source: "TEST",
      })),
    });

    // La taille et la masse mesurees mettent a jour la fiche du joueur, car
    // elles servent de contexte a tous les autres calculs.
    if (testKey === "anthropometry") {
      await prisma.player.update({
        where: { id: player.id },
        data: {
          heightCm: typeof raw.height === "number" ? raw.height : player.heightCm,
          weightKg: typeof raw.weight === "number" ? raw.weight : player.weightKg,
        },
      });
      await prisma.anthropometry.create({
        data: {
          playerId: player.id,
          date: session.date,
          heightCm: Number(raw.height ?? player.heightCm ?? 0),
          weightKg: Number(raw.weight ?? player.weightKg ?? 0),
          sittingHeightCm: raw.sittingHeight != null ? Number(raw.sittingHeight) : null,
          bodyFatPct: computed.metrics.find((m) => m.key === "body_fat")?.value ?? null,
          maturityOffset: computed.metrics.find((m) => m.key === "maturity_offset")?.value ?? null,
          aphvYears: computed.metrics.find((m) => m.key === "aphv")?.value ?? null,
          pctAdultHeight: computed.metrics.find((m) => m.key === "pct_adult_height")?.value ?? null,
          motherHeightCm: raw.motherHeight != null ? Number(raw.motherHeight) : null,
          fatherHeightCm: raw.fatherHeight != null ? Number(raw.fatherHeight) : null,
        },
      });
    }

    if (computed.flags.length > 0) {
      flags.push({
        playerName: `${player.firstName} ${player.lastName}`,
        messages: computed.flags,
      });
    }

    saved += 1;
  }

  return { saved, skipped, flags };
};
