import { cache } from "react";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";

import { prisma } from "./db";
import { ROLE_RANK, SESSION_COOKIE, SESSION_MAX_AGE_SECONDS, type Role } from "./constants";

const secret = () => {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 24) {
    throw new Error(
      "AUTH_SECRET manquant ou trop court. Definir une valeur d'au moins 32 caracteres dans le fichier .env",
    );
  }
  return new TextEncoder().encode(value);
};

export interface SessionPayload {
  sub: string;
  role: Role;
  organizationId: string | null;
  tokenVersion: number;
  /** Renseigne quand le proprietaire consulte le compte d'un client. */
  impersonatedBy?: { id: string; email: string };
}

export const hashPassword = (plain: string): Promise<string> => bcrypt.hash(plain, 10);

export const verifyPassword = (plain: string, hash: string): Promise<boolean> =>
  bcrypt.compare(plain, hash);

export const signSession = async (payload: SessionPayload): Promise<string> =>
  new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(secret());

export const setSessionCookie = async (token: string) => {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
};

export const clearSessionCookie = async () => {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
};

export const readSessionToken = async (): Promise<SessionPayload | null> => {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
};

export interface CurrentUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  organizationId: string | null;
  organizationName: string | null;
  locale: string;
  mustChangePw: boolean;
  impersonatedBy?: { id: string; email: string };
}

/**
 * Charge l'utilisateur courant. La version du jeton est verifiee a chaque appel,
 * ce qui permet de revoquer instantanement toutes les sessions d'un compte depuis
 * le panel proprietaire.
 *
 * cache() garantit une seule requete par requete HTTP, meme si la mise en page,
 * la page et plusieurs frontieres Suspense le demandent chacune de leur cote.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const session = await readSessionToken();
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    include: { organization: { select: { name: true, isActive: true } } },
  });

  if (!user || !user.isActive) return null;
  if (user.tokenVersion !== session.tokenVersion) return null;
  if (user.organization && !user.organization.isActive) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as Role,
    organizationId: user.organizationId,
    organizationName: user.organization?.name ?? null,
    locale: user.locale,
    mustChangePw: user.mustChangePw,
    impersonatedBy: session.impersonatedBy,
  };
});

export const requireUser = async (): Promise<CurrentUser> => {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
};

export const requireRole = async (minimum: Role): Promise<CurrentUser> => {
  const user = await requireUser();
  if (ROLE_RANK[user.role] > ROLE_RANK[minimum]) redirect("/app");
  return user;
};

export const requireOwner = async (): Promise<CurrentUser> => {
  const user = await requireUser();
  if (user.role !== "OWNER") redirect("/app");
  return user;
};

export const hasAtLeast = (role: Role, minimum: Role): boolean =>
  ROLE_RANK[role] <= ROLE_RANK[minimum];

/** Adresse de l'appelant, utilisee pour le journal d'audit. */
export const requestIp = async (): Promise<string | null> => {
  const list = await headers();
  return (
    list.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    list.get("x-real-ip") ??
    null
  );
};

export const logAudit = async (params: {
  userId?: string | null;
  actorEmail: string;
  organizationId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  meta?: unknown;
}) => {
  await prisma.auditLog.create({
    data: {
      userId: params.userId ?? null,
      actorEmail: params.actorEmail,
      organizationId: params.organizationId ?? null,
      action: params.action,
      entity: params.entity,
      entityId: params.entityId ?? null,
      metaJson: params.meta ? JSON.stringify(params.meta) : null,
      ip: await requestIp(),
    },
  });
};

/**
 * Verifie que l'utilisateur a le droit d'acceder a une equipe donnee.
 * Le proprietaire accede a tout, l'administrateur de club a son organisation,
 * les autres uniquement aux equipes auxquelles ils sont rattaches.
 */
export const canAccessTeam = cache(async (
  user: CurrentUser,
  teamId: string,
): Promise<{ allowed: boolean; canEdit: boolean }> => {
  if (user.role === "OWNER") return { allowed: true, canEdit: true };

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    select: { organizationId: true, members: { where: { userId: user.id } } },
  });
  if (!team) return { allowed: false, canEdit: false };

  if (user.role === "CLUB_ADMIN" && team.organizationId === user.organizationId) {
    return { allowed: true, canEdit: true };
  }

  const membership = team.members[0];
  if (!membership) return { allowed: false, canEdit: false };

  return {
    allowed: true,
    canEdit: membership.accessLevel === "MANAGE" && user.role !== "VIEWER",
  };
});

/** Identifiants des equipes visibles par l'utilisateur courant. */
export const accessibleTeamIds = cache(async (user: CurrentUser): Promise<string[] | "ALL"> => {
  if (user.role === "OWNER") return "ALL";
  if (user.role === "CLUB_ADMIN" && user.organizationId) {
    const teams = await prisma.team.findMany({
      where: { organizationId: user.organizationId },
      select: { id: true },
    });
    return teams.map((t) => t.id);
  }
  const memberships = await prisma.teamMember.findMany({
    where: { userId: user.id },
    select: { teamId: true },
  });
  return memberships.map((m) => m.teamId);
});
