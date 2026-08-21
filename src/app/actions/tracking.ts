"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { logAudit, requireOwner } from "@/lib/auth";
import { CLARITY_PATTERN, PIXEL_PATTERN, TRACKING_KEYS } from "@/lib/tracking";
import { CAPI_TOKEN_KEY } from "@/lib/capi";
import type { ActionState } from "./auth";

/**
 * Enregistrement des identifiants de mesure d'audience.
 *
 * Reserve au proprietaire : ces balises voient toutes les pages de toutes les
 * organisations, y compris celles de la marque blanche. Un administrateur de
 * club ne doit pas pouvoir poser son propre pixel sur le trafic des autres.
 *
 * Le champ vide efface le reglage, c'est le seul moyen d'arreter une mesure
 * sans redeployer. Un formulaire qui n'aurait pas d'etat « rien » obligerait a
 * ouvrir la base pour couper un pixel, ce qui n'arrive jamais assez vite.
 */
const schema = z.object({
  facebookPixelId: z
    .string()
    .trim()
    .refine((value) => value === "" || PIXEL_PATTERN.test(value), {
      message: "tracking.pixelInvalid",
    }),
  clarityProjectId: z
    .string()
    .trim()
    .toLowerCase()
    .refine((value) => value === "" || CLARITY_PATTERN.test(value), {
      message: "tracking.clarityInvalid",
    }),
  /**
   * Jeton de l'API Conversions.
   *
   * Il ne suit pas la regle des deux autres champs, ou le vide efface. Un
   * secret ne se reaffiche pas dans un formulaire : le champ arrive donc
   * toujours vide, et un envoi vide veut dire "ne change rien". Sans cette
   * exception, ouvrir la page des reglages et enregistrer une correction de
   * pixel effacerait le jeton sans que personne ne s'en apercoive, et la
   * mesure serveur s'arreterait en silence.
   *
   * L'effacement volontaire passe par la case dediee.
   */
  capiAccessToken: z
    .string()
    .trim()
    .refine((value) => value === "" || /^[A-Za-z0-9_-]{40,300}$/u.test(value), {
      message: "tracking.capiInvalid",
    }),
  capiClear: z.boolean(),
});

/** Ecrit une valeur, ou efface la ligne si elle est vide. */
const write = async (key: string, value: string): Promise<void> => {
  if (value) {
    await prisma.setting.upsert({ where: { key }, create: { key, value }, update: { value } });
    return;
  }
  await prisma.setting.deleteMany({ where: { key } });
};

export async function saveTrackingAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const owner = await requireOwner();

  const parsed = schema.safeParse({
    facebookPixelId: String(formData.get("facebookPixelId") ?? ""),
    clarityProjectId: String(formData.get("clarityProjectId") ?? ""),
    capiAccessToken: String(formData.get("capiAccessToken") ?? ""),
    capiClear: formData.get("capiClear") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "tracking.invalid" };
  }

  await write(TRACKING_KEYS.facebookPixelId, parsed.data.facebookPixelId);
  await write(TRACKING_KEYS.clarityProjectId, parsed.data.clarityProjectId);

  if (parsed.data.capiClear) {
    await write(CAPI_TOKEN_KEY, "");
  } else if (parsed.data.capiAccessToken) {
    await write(CAPI_TOKEN_KEY, parsed.data.capiAccessToken);
  }

  await logAudit({
    userId: owner.id,
    actorEmail: owner.email,
    organizationId: owner.organizationId,
    action: "UPDATE",
    entity: "Setting",
    entityId: "tracking",
    // Les identifiants eux memes sont journalises : ce ne sont pas des secrets,
    // ils sont lisibles dans le code source de chaque page, et savoir lequel
    // etait actif tel jour est la seule facon d'expliquer un trou de mesure.
    meta: {
      facebookPixelId: parsed.data.facebookPixelId || "(efface)",
      clarityProjectId: parsed.data.clarityProjectId || "(efface)",
      // Le jeton n'est jamais journalise, meme partiellement : contrairement
      // aux identifiants ci dessus, il ouvre l'ecriture sur le compte
      // publicitaire. Seul le fait qu'il ait change est trace.
      jetonConversions: parsed.data.capiClear
        ? "(efface)"
        : parsed.data.capiAccessToken
          ? "(remplace)"
          : "(inchange)",
    },
  });

  // La mise en page racine porte les balises : c'est elle qu'il faut invalider,
  // pas la seule page du panneau, sinon le nouveau pixel n'apparaitrait que sur
  // les pages rendues apres expiration du cache.
  revalidatePath("/", "layout");

  return { success: "tracking.saved" };
}
