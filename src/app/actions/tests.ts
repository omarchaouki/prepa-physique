"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { canAccessTeam, logAudit, requireUser } from "@/lib/auth";
import { getTest } from "@/lib/sports-science/catalog";
import { applyResults } from "@/lib/tests/apply-results";
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
  /**
   * Enregistrement automatique : on saute la revalidation des chemins.
   *
   * Sans cela, chaque pause de frappe declencherait un nouveau rendu serveur de
   * la passation en cours, avec ses requetes d'effectif et de resultats. Toutes
   * les pages de l'application etant en rendu dynamique, elles se rechargent de
   * toute facon a la prochaine navigation : rien n'est perdu, seule la
   * revalidation immediate est reportee a l'enregistrement explicite.
   */
  silent?: boolean;
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

  // Le calcul et l'ecriture sont partages avec l'API mobile : voir
  // src/lib/tests/apply-results.ts. Une formule corrigee doit valoir pour les
  // deux chemins de saisie le meme jour, sinon la base contient deux verites.
  const { saved, skipped, flags } = await applyResults({
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

  await logAudit({
    userId: user.id,
    actorEmail: user.email,
    organizationId: user.organizationId,
    action: "UPDATE",
    entity: "TestResult",
    entityId: session.id,
    meta: { testKey: payload.testKey, saved, skipped },
  });

  if (!payload.silent) {
    revalidatePath(`/app/sessions/${session.id}`);
    revalidatePath(`/app/teams/${session.teamId}`);
  }

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
