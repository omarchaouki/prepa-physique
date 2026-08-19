"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { prisma } from "@/lib/db";
import {
  clearSessionCookie,
  getCurrentUser,
  hashPassword,
  logAudit,
  readSessionToken,
  setSessionCookie,
  signSession,
  verifyPassword,
} from "@/lib/auth";
import { CURRENCY_COOKIE, LOCALE_COOKIE, type Role } from "@/lib/constants";
import { getT } from "@/lib/i18n/server";
import { cookies } from "next/headers";

export interface ActionState {
  error?: string;
  success?: string;
}

const loginSchema = z.object({
  email: z.string().email("Adresse email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
  from: z.string().optional(),
});

/** N'accepte qu'un chemin interne, pour ne pas servir de tremplin vers un site tiers. */
const safeRedirect = (from: string | undefined, fallback: string): string => {
  if (!from || !from.startsWith("/") || from.startsWith("//")) return fallback;
  return from;
};

export async function loginAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    password: String(formData.get("password") ?? ""),
    from: String(formData.get("from") ?? ""),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Donnees invalides" };
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    include: { organization: { select: { isActive: true, name: true } } },
  });

  const t = await getT();

  // Message identique dans tous les cas d'echec, pour ne pas reveler
  // quels comptes existent.
  const genericError = t("login.errorGeneric");
  if (!user) return { error: genericError };

  const valid = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!valid) return { error: genericError };

  if (!user.isActive) return { error: t("login.errorDisabled") };
  if (user.organization && !user.organization.isActive) {
    return { error: t("login.errorSuspended") };
  }

  const token = await signSession({
    sub: user.id,
    role: user.role as Role,
    organizationId: user.organizationId,
    tokenVersion: user.tokenVersion,
  });
  await setSessionCookie(token);

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  // Langue de la session.
  //
  // Si le visiteur vient de choisir une langue sur l'ecran de connexion, ce choix
  // explicite l'emporte et devient sa preference enregistree. Sinon, on applique
  // la langue de son profil : il retrouve ainsi son interface sur un appareil
  // qu'il n'a jamais utilise.
  const store = await cookies();
  const chosen = store.get(LOCALE_COOKIE)?.value;

  if (chosen === "fr" || chosen === "en") {
    if (chosen !== user.locale) {
      await prisma.user.update({ where: { id: user.id }, data: { locale: chosen } });
    }
  } else {
    store.set(LOCALE_COOKIE, user.locale === "en" ? "en" : "fr", {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  await logAudit({
    userId: user.id,
    actorEmail: user.email,
    organizationId: user.organizationId,
    action: "LOGIN",
    entity: "User",
    entityId: user.id,
  });

  redirect(safeRedirect(parsed.data.from, user.role === "OWNER" ? "/admin" : "/app"));
}

export async function logoutAction() {
  const user = await getCurrentUser();
  if (user) {
    await logAudit({
      userId: user.id,
      actorEmail: user.email,
      organizationId: user.organizationId,
      action: "LOGOUT",
      entity: "User",
      entityId: user.id,
    });
  }
  await clearSessionCookie();
  redirect("/login");
}

export async function setLocaleAction(locale: "fr" | "en") {
  const store = await cookies();
  store.set(LOCALE_COOKIE, locale, { path: "/", maxAge: 60 * 60 * 24 * 365 });
  const user = await getCurrentUser();
  if (user) {
    await prisma.user.update({ where: { id: user.id }, data: { locale } });
  }
}

const passwordSchema = z
  .object({
    current: z.string().min(1, "Mot de passe actuel requis"),
    next: z.string().min(8, "Le nouveau mot de passe doit contenir au moins 8 caracteres"),
    confirm: z.string(),
  })
  .refine((data) => data.next === data.confirm, {
    message: "Les deux mots de passe ne correspondent pas",
    path: ["confirm"],
  });

export async function changePasswordAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Session expiree." };

  const parsed = passwordSchema.safeParse({
    current: String(formData.get("current") ?? ""),
    next: String(formData.get("next") ?? ""),
    confirm: String(formData.get("confirm") ?? ""),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Donnees invalides" };
  }

  const record = await prisma.user.findUnique({ where: { id: user.id } });
  if (!record) return { error: "Compte introuvable." };

  const valid = await verifyPassword(parsed.data.current, record.passwordHash);
  if (!valid) return { error: "Le mot de passe actuel est incorrect." };

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash: await hashPassword(parsed.data.next),
      mustChangePw: false,
      // Invalide toutes les autres sessions ouvertes avec l'ancien mot de passe.
      tokenVersion: { increment: 1 },
    },
  });

  const updated = await prisma.user.findUnique({ where: { id: user.id } });
  if (updated) {
    await setSessionCookie(
      await signSession({
        sub: updated.id,
        role: updated.role as Role,
        organizationId: updated.organizationId,
        tokenVersion: updated.tokenVersion,
      }),
    );
  }

  await logAudit({
    userId: user.id,
    actorEmail: user.email,
    organizationId: user.organizationId,
    action: "UPDATE",
    entity: "User.password",
    entityId: user.id,
  });

  return { success: "Mot de passe mis a jour." };
}

/**
 * Permet au proprietaire de consulter l'application avec le compte d'un client,
 * pour diagnostiquer un probleme. L'action est tracee et la session d'origine
 * est conservee dans le jeton pour pouvoir revenir en un clic.
 */
export async function impersonateAction(targetUserId: string) {
  const owner = await getCurrentUser();
  if (!owner || owner.role !== "OWNER") redirect("/app");
  if (owner.impersonatedBy) redirect("/admin");

  const target = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!target) redirect("/admin/users");

  await logAudit({
    userId: owner.id,
    actorEmail: owner.email,
    organizationId: target.organizationId,
    action: "IMPERSONATE",
    entity: "User",
    entityId: target.id,
    meta: { targetEmail: target.email },
  });

  await setSessionCookie(
    await signSession({
      sub: target.id,
      role: target.role as Role,
      organizationId: target.organizationId,
      tokenVersion: target.tokenVersion,
      impersonatedBy: { id: owner.id, email: owner.email },
    }),
  );

  redirect("/app");
}

export async function stopImpersonationAction() {
  const session = await readSessionToken();
  if (!session?.impersonatedBy) redirect("/app");

  const owner = await prisma.user.findUnique({ where: { id: session.impersonatedBy.id } });
  if (!owner) {
    await clearSessionCookie();
    redirect("/login");
  }

  await setSessionCookie(
    await signSession({
      sub: owner.id,
      role: owner.role as Role,
      organizationId: owner.organizationId,
      tokenVersion: owner.tokenVersion,
    }),
  );

  redirect("/admin");
}

/**
 * Enregistre la devise d'affichage choisie par le visiteur.
 *
 * Purement cosmetique : elle ne touche ni a la facturation ni au compte, elle
 * decide seulement du montant affiche sur la page des tarifs. Elle vit donc
 * dans un cookie et non en base, et reste valable un an.
 */
export async function setCurrencyAction(currency: "MAD" | "EUR") {
  const store = await cookies();
  store.set(CURRENCY_COOKIE, currency, { path: "/", maxAge: 60 * 60 * 24 * 365 });
}
