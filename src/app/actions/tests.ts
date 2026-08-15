"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { canAccessTeam, logAudit, requireUser } from "@/lib/auth";
import { getTest } from "@/lib/sports-science/catalog";
import type { PlayerContext } from "@/lib/sports-science/types";
import { ageExact } from "@/lib/utils";
import type { ActionState } from "./auth";

const createSessionSchema = z.object({
  teamId: z.string().min(1, "Equipe requise"),
  name: z.string().min(2, "Le nom de la passation est requis"),
  date: z.string().min(1, "Date requise"),
  testKeys: z.array(z.string()).min(1, "Selectionner au moins un test"),
  surface: z.string().optional(),
  temperatureC: z.string().optional(),
  notes: z.string().optional(),
});

export async function createSessionAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();

  const parsed = createSessionSchema.safeParse({
    teamId: String(formData.get("teamId") ?? ""),
    name: String(formData.get("name") ?? "").trim(),
    date: String(formData.get("date") ?? ""),
    testKeys: formData.getAll("testKeys").map(String),
    surface: String(formData.get("surface") ?? ""),
    temperatureC: String(formData.get("temperatureC") ?? ""),
    notes: String(formData.get("notes") ?? ""),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Donnees invalides" };
  }

  const access = await canAccessTeam(user, parsed.data.teamId);
  if (!access.canEdit) {
    return { error: "Vous n'avez pas le droit de creer une passation pour cette equipe." };
  }

  const unknown = parsed.data.testKeys.filter((key) => !getTest(key));
  if (unknown.length > 0) {
    return { error: `Test inconnu : ${unknown.join(", ")}` };
  }

  const session = await prisma.testSession.create({
    data: {
      teamId: parsed.data.teamId,
      name: parsed.data.name,
      date: new Date(parsed.data.date),
      testKeys: parsed.data.testKeys.join(","),
      surface: parsed.data.surface || null,
      temperatureC: parsed.data.temperatureC ? Number(parsed.data.temperatureC) : null,
      notes: parsed.data.notes || null,
      createdById: user.id,
    },
  });

  await logAudit({
    userId: user.id,
    actorEmail: user.email,
    organizationId: user.organizationId,
    action: "CREATE",
    entity: "TestSession",
    entityId: session.id,
    meta: { name: session.name, tests: parsed.data.testKeys },
  });

  redirect(`/app/sessions/${session.id}`);
}

export interface SaveResultsPayload {
  sessionId: string;
  testKey: string;
  /** Une entree par joueur, avec les valeurs brutes du formulaire. */
  entries: Array<{ playerId: string; values: Record<string, string> }>;
}

export interface SaveResultsResponse {
  ok: boolean;
  message: string;
  saved: number;
  skipped: number;
  flags: Array<{ playerName: string; messages: string[] }>;
}

/**
 * Enregistre les resultats d'un test pour toute une equipe en une fois.
 * Les valeurs brutes sont conservees telles quelles, les metriques derivees sont
 * recalculees a chaque enregistrement pour rester coherentes avec la version
 * courante des formules.
 */
export async function saveResultsAction(payload: SaveResultsPayload): Promise<SaveResultsResponse> {
  const user = await requireUser();

  const session = await prisma.testSession.findUnique({
    where: { id: payload.sessionId },
    include: { team: { select: { id: true, sex: true } } },
  });
  if (!session) return { ok: false, message: "Passation introuvable.", saved: 0, skipped: 0, flags: [] };

  const access = await canAccessTeam(user, session.teamId);
  if (!access.canEdit) {
    return { ok: false, message: "Droits insuffisants pour modifier cette passation.", saved: 0, skipped: 0, flags: [] };
  }
  if (session.isLocked) {
    return { ok: false, message: "Cette passation est verrouillee.", saved: 0, skipped: 0, flags: [] };
  }

  const definition = getTest(payload.testKey);
  if (!definition) {
    return { ok: false, message: "Test inconnu.", saved: 0, skipped: 0, flags: [] };
  }

  const playerIds = payload.entries.map((entry) => entry.playerId);
  const players = await prisma.player.findMany({
    where: { id: { in: playerIds }, teamId: session.teamId },
  });
  const playerMap = new Map(players.map((p) => [p.id, p]));

  let saved = 0;
  let skipped = 0;
  const flags: SaveResultsResponse["flags"] = [];

  for (const entry of payload.entries) {
    const player = playerMap.get(entry.playerId);
    if (!player) {
      skipped += 1;
      continue;
    }

    // Une ligne entierement vide signifie que le joueur n'a pas passe le test.
    const filled = Object.entries(entry.values).filter(([, value]) => String(value).trim() !== "");
    if (filled.length === 0) {
      skipped += 1;
      continue;
    }

    const raw: Record<string, number | string> = {};
    for (const [key, value] of filled) {
      const field = definition.fields.find((f) => f.key === key);
      if (!field) continue;
      raw[key] = field.type === "number" ? Number(value) : value;
    }

    // Les conditions declarees au niveau de la passation completent les lignes
    // laissees vides, pour eviter de retaper la meme information a chaque joueur.
    if (
      session.temperatureC != null &&
      raw.temperature === undefined &&
      definition.fields.some((f) => f.key === "temperature")
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
      where: { sessionId: session.id, playerId: player.id, testKey: payload.testKey },
    });

    const data = {
      sessionId: session.id,
      playerId: player.id,
      teamId: session.teamId,
      testKey: payload.testKey,
      date: session.date,
      rawJson: JSON.stringify(raw),
      computedJson: JSON.stringify({
        summary: computed.summary,
        flags: computed.flags,
        details: computed.details,
      }),
      createdById: user.id,
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
    if (payload.testKey === "anthropometry") {
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
          bodyFatPct:
            computed.metrics.find((m) => m.key === "body_fat")?.value ?? null,
          maturityOffset:
            computed.metrics.find((m) => m.key === "maturity_offset")?.value ?? null,
          aphvYears: computed.metrics.find((m) => m.key === "aphv")?.value ?? null,
          pctAdultHeight:
            computed.metrics.find((m) => m.key === "pct_adult_height")?.value ?? null,
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

  await logAudit({
    userId: user.id,
    actorEmail: user.email,
    organizationId: user.organizationId,
    action: "UPDATE",
    entity: "TestResult",
    entityId: session.id,
    meta: { testKey: payload.testKey, saved, skipped },
  });

  revalidatePath(`/app/sessions/${session.id}`);
  revalidatePath(`/app/teams/${session.teamId}`);

  return {
    ok: true,
    message:
      saved === 0
        ? "Aucune ligne enregistree. Verifier que les champs obligatoires sont remplis."
        : `${saved} resultat${saved > 1 ? "s" : ""} enregistre${saved > 1 ? "s" : ""}${skipped > 0 ? `, ${skipped} ligne${skipped > 1 ? "s" : ""} vide${skipped > 1 ? "s" : ""} ignoree${skipped > 1 ? "s" : ""}` : ""}.`,
    saved,
    skipped,
    flags,
  };
}

export async function deleteSessionAction(sessionId: string) {
  const user = await requireUser();
  const session = await prisma.testSession.findUnique({ where: { id: sessionId } });
  if (!session) redirect("/app/sessions");

  const access = await canAccessTeam(user, session.teamId);
  if (!access.canEdit) redirect(`/app/sessions/${sessionId}`);

  // Les resultats rattaches sont supprimes explicitement, sinon la relation les
  // detacherait de la passation en les laissant orphelins dans l'historique.
  await prisma.testResult.deleteMany({ where: { sessionId } });
  await prisma.testSession.delete({ where: { id: sessionId } });

  await logAudit({
    userId: user.id,
    actorEmail: user.email,
    organizationId: user.organizationId,
    action: "DELETE",
    entity: "TestSession",
    entityId: sessionId,
    meta: { name: session.name },
  });

  revalidatePath("/app/sessions");
  redirect("/app/sessions");
}
