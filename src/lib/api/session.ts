import { jwtVerify } from "jose";

import { prisma } from "@/lib/db";
import type { CurrentUser, SessionPayload } from "@/lib/auth";
import type { Role } from "@/lib/constants";

/**
 * Authentification de l'API mobile, par jeton porteur.
 *
 * Le site web transporte sa session dans un cookie `httpOnly`, ce qui est le bon
 * choix pour un navigateur : le script de la page ne peut pas lire le jeton,
 * donc une faille d'injection ne peut pas le voler. Une application mobile n'a
 * pas de navigateur ni de politique de meme origine, et un cookie y serait
 * partage entre toutes les requetes de la coque. Elle utilise donc l'entete
 * `Authorization`, avec le meme jeton signe et la meme duree.
 *
 * Point important : la version du jeton est verifiee en base a chaque appel,
 * exactement comme sur le site. C'est ce qui permet de revoquer immediatement
 * toutes les sessions d'un compte depuis le panneau proprietaire, y compris
 * celles des telephones. Un jeton signe mais dont la version a change est
 * refuse, meme s'il n'a pas expire.
 */

const secret = () => {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 24) {
    throw new Error("AUTH_SECRET manquant ou trop court.");
  }
  return new TextEncoder().encode(value);
};

export const readBearer = (request: Request): string | null => {
  const header = request.headers.get("authorization");
  if (!header) return null;
  const [scheme, token] = header.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) return null;
  return token.trim() || null;
};

/**
 * Charge l'utilisateur porteur du jeton, ou `null`.
 *
 * Volontairement sans `cache()` de React : une route d'API traite une requete
 * puis rend la main, il n'y a pas plusieurs frontieres qui redemandent le meme
 * utilisateur comme dans une page rendue par morceaux.
 */
export const getApiUser = async (request: Request): Promise<CurrentUser | null> => {
  const token = readBearer(request);
  if (!token) return null;

  let session: SessionPayload;
  try {
    const { payload } = await jwtVerify(token, secret());
    session = payload as unknown as SessionPayload;
  } catch {
    return null;
  }

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
};

/**
 * Droits sur une equipe, repris a l'identique du site.
 *
 * Cette fonction existe en double de `canAccessTeam` de `lib/auth.ts`
 * uniquement parce que celle ci est enveloppee dans `cache()` de React, qui
 * suppose un contexte de rendu. La regle, elle, est la meme et doit le rester :
 * si l'une des deux change, l'autre doit changer le meme jour.
 */
export const apiCanAccessTeam = async (
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
};

/** Identifiants des equipes visibles par le porteur du jeton. */
export const apiAccessibleTeamIds = async (user: CurrentUser): Promise<string[] | "ALL"> => {
  if (user.role === "OWNER") return "ALL";
  if (user.role === "CLUB_ADMIN" && user.organizationId) {
    const teams = await prisma.team.findMany({
      where: { organizationId: user.organizationId },
      select: { id: true },
    });
    return teams.map((team) => team.id);
  }
  const memberships = await prisma.teamMember.findMany({
    where: { userId: user.id },
    select: { teamId: true },
  });
  return memberships.map((membership) => membership.teamId);
};

/** Filtre Prisma correspondant aux equipes visibles, prêt a etre compose. */
export const teamScope = (ids: string[] | "ALL") =>
  ids === "ALL" ? {} : { teamId: { in: ids } };
