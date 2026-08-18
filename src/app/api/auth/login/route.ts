import { z } from "zod";

import { prisma } from "@/lib/db";
import { logAudit, requestIp, signSession, verifyPassword } from "@/lib/auth";
import { SESSION_MAX_AGE_SECONDS, type Role } from "@/lib/constants";
import { fail, handler, ok } from "@/lib/api/respond";

export const dynamic = "force-dynamic";

/**
 * Connexion de l'application mobile.
 *
 * Renvoie le meme jeton signe que le site, mais dans le corps de la reponse au
 * lieu d'un cookie : un telephone le range dans le magasin securise du systeme,
 * ou il est chiffre par le materiel.
 *
 * Trois precautions valent d'etre expliquees.
 *
 * 1. Le message d'erreur est identique que l'adresse soit inconnue ou que le mot
 *    de passe soit faux. Distinguer les deux revient a offrir un outil pour
 *    savoir qui possede un compte.
 * 2. Le hachage est verifie meme quand l'adresse est inconnue, contre un hachage
 *    factice. Sans cela, une adresse inconnue repond en une milliseconde et une
 *    adresse connue en cent : le temps de reponse trahit l'existence du compte.
 * 3. Les tentatives sont limitees par adresse IP. La limite vit en memoire du
 *    processus, ce qui suffit ici puisqu'un seul serveur repond ; elle est
 *    remise a zero a chaque redemarrage, et c'est accepte.
 */

const schema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
  /** Nom de l'appareil, affiche plus tard dans la liste des sessions. */
  device: z.string().trim().max(80).optional(),
});

/** Hachage jetable, utilise uniquement pour egaliser le temps de reponse. */
const DUMMY_HASH = "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 10;
const attempts = new Map<string, { count: number; resetAt: number }>();

const rateLimited = (key: string): boolean => {
  const now = Date.now();
  const entry = attempts.get(key);

  if (!entry || entry.resetAt < now) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_ATTEMPTS;
};

const clearAttempts = (key: string) => attempts.delete(key);

export const POST = handler(async (request: Request) => {
  const ip = (await requestIp()) ?? "inconnu";

  if (rateLimited(ip)) {
    return fail("RATE_LIMITED", "Trop de tentatives. Reessayez dans quinze minutes.");
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return fail("INVALID_INPUT", "Adresse ou mot de passe manquant.");
  }

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({
    where: { email },
    include: { organization: { select: { name: true, isActive: true } } },
  });

  const valid = await verifyPassword(password, user?.passwordHash ?? DUMMY_HASH);

  if (!user || !valid || !user.isActive || (user.organization && !user.organization.isActive)) {
    return fail("UNAUTHENTICATED", "Adresse ou mot de passe incorrect.");
  }

  clearAttempts(ip);

  const token = await signSession({
    sub: user.id,
    role: user.role as Role,
    organizationId: user.organizationId,
    tokenVersion: user.tokenVersion,
  });

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

  await logAudit({
    userId: user.id,
    actorEmail: user.email,
    organizationId: user.organizationId,
    action: "LOGIN",
    entity: "User",
    entityId: user.id,
    meta: { canal: "mobile", appareil: parsed.data.device ?? null },
  });

  return ok({
    token,
    expiresInSeconds: SESSION_MAX_AGE_SECONDS,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      locale: user.locale,
      mustChangePassword: user.mustChangePw,
      organizationId: user.organizationId,
      organizationName: user.organization?.name ?? null,
    },
  });
});
