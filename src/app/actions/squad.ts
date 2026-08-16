"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { canAccessTeam, logAudit, requireUser, type CurrentUser } from "@/lib/auth";
import { CATEGORIES, PLAYER_STATUSES, POSITIONS } from "@/lib/constants";
import { getT } from "@/lib/i18n/server";
import type { ActionState } from "./auth";

/**
 * Gestion de l'effectif et des equipes.
 *
 * Chaque action reverifie les droits cote serveur a partir de la session, jamais
 * a partir de ce que le formulaire a envoye : une requete forgee n'ouvre donc
 * aucun acces qu'un utilisateur n'aurait pas dans l'interface.
 */

// ---------------------------------------------------------------------------
// Droits
// ---------------------------------------------------------------------------

/** Verifie que l'utilisateur peut modifier cette equipe, sinon leve une erreur. */
const requireTeamEditor = async (teamId: string): Promise<CurrentUser> => {
  const user = await requireUser();
  const access = await canAccessTeam(user, teamId);
  if (!access.canEdit) throw new Error("FORBIDDEN");
  return user;
};

/** Verifie que l'utilisateur peut administrer ce club. */
const requireClubAdmin = async (organizationId: string): Promise<CurrentUser> => {
  const user = await requireUser();
  if (user.role === "OWNER") return user;
  if (user.role === "CLUB_ADMIN" && user.organizationId === organizationId) return user;
  throw new Error("FORBIDDEN");
};

const forbidden = async (): Promise<ActionState> => {
  const t = await getT();
  return { error: t("manage.forbidden") };
};

// ---------------------------------------------------------------------------
// Joueurs
// ---------------------------------------------------------------------------

const playerSchema = z.object({
  teamId: z.string().min(1),
  firstName: z.string().trim().min(1, "firstName"),
  lastName: z.string().trim().min(1, "lastName"),
  birthDate: z.string().min(1, "birthDate"),
  position: z.enum(POSITIONS),
  secondaryPosition: z.string().optional(),
  dominantFoot: z.enum(["R", "L", "B"]),
  sex: z.enum(["M", "F"]),
  jerseyNumber: z.string().optional(),
  heightCm: z.string().optional(),
  weightKg: z.string().optional(),
  status: z.enum(PLAYER_STATUSES),
  email: z.string().optional(),
  externalId: z.string().optional(),
  notes: z.string().optional(),
});

const optionalNumber = (value: string | undefined): number | null => {
  if (!value || value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const readPlayerForm = (formData: FormData) =>
  playerSchema.safeParse({
    teamId: String(formData.get("teamId") ?? ""),
    firstName: String(formData.get("firstName") ?? ""),
    lastName: String(formData.get("lastName") ?? ""),
    birthDate: String(formData.get("birthDate") ?? ""),
    position: String(formData.get("position") ?? "CM"),
    secondaryPosition: String(formData.get("secondaryPosition") ?? ""),
    dominantFoot: String(formData.get("dominantFoot") ?? "R"),
    sex: String(formData.get("sex") ?? "M"),
    jerseyNumber: String(formData.get("jerseyNumber") ?? ""),
    heightCm: String(formData.get("heightCm") ?? ""),
    weightKg: String(formData.get("weightKg") ?? ""),
    status: String(formData.get("status") ?? "ACTIVE"),
    email: String(formData.get("email") ?? ""),
    externalId: String(formData.get("externalId") ?? ""),
    notes: String(formData.get("notes") ?? ""),
  });

export async function createPlayerAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const t = await getT();
  const parsed = readPlayerForm(formData);
  if (!parsed.success) return { error: t("manage.playerInvalid") };

  let user: CurrentUser;
  try {
    user = await requireTeamEditor(parsed.data.teamId);
  } catch {
    return forbidden();
  }

  // Le forfait du club plafonne le nombre de joueurs, toutes equipes confondues.
  const team = await prisma.team.findUnique({
    where: { id: parsed.data.teamId },
    select: { organizationId: true, organization: { select: { maxPlayers: true, plan: true } } },
  });
  if (!team) return { error: t("manage.teamNotFound") };

  const playerCount = await prisma.player.count({
    where: { team: { organizationId: team.organizationId }, status: { not: "LEFT" } },
  });
  if (playerCount >= team.organization.maxPlayers) {
    return {
      error: `${t("manage.playerLimit")} ${team.organization.plan} : ${team.organization.maxPlayers}.`,
    };
  }

  const player = await prisma.player.create({
    data: {
      teamId: parsed.data.teamId,
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      birthDate: new Date(parsed.data.birthDate),
      position: parsed.data.position,
      secondaryPosition: parsed.data.secondaryPosition || null,
      dominantFoot: parsed.data.dominantFoot,
      sex: parsed.data.sex,
      jerseyNumber: optionalNumber(parsed.data.jerseyNumber),
      heightCm: optionalNumber(parsed.data.heightCm),
      weightKg: optionalNumber(parsed.data.weightKg),
      status: parsed.data.status,
      email: parsed.data.email || null,
      externalId: parsed.data.externalId || null,
      notes: parsed.data.notes || null,
    },
  });

  await logAudit({
    userId: user.id,
    actorEmail: user.email,
    organizationId: team.organizationId,
    action: "CREATE",
    entity: "Player",
    entityId: player.id,
    meta: { name: `${player.firstName} ${player.lastName}`, teamId: parsed.data.teamId },
  });

  revalidatePath(`/app/teams/${parsed.data.teamId}`);
  revalidatePath(`/app/teams/${parsed.data.teamId}/manage`);
  revalidatePath("/app/players");

  return { success: `${player.firstName} ${player.lastName} ${t("manage.playerAdded")}` };
}

export async function updatePlayerAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const t = await getT();
  const playerId = String(formData.get("playerId") ?? "");
  const parsed = readPlayerForm(formData);
  if (!playerId || !parsed.success) return { error: t("manage.playerInvalid") };

  const existing = await prisma.player.findUnique({
    where: { id: playerId },
    select: { teamId: true, team: { select: { organizationId: true } } },
  });
  if (!existing) return { error: t("manage.playerNotFound") };

  let user: CurrentUser;
  try {
    // Droits sur l'equipe actuelle, et sur la nouvelle en cas de transfert.
    user = await requireTeamEditor(existing.teamId);
    if (parsed.data.teamId !== existing.teamId) await requireTeamEditor(parsed.data.teamId);
  } catch {
    return forbidden();
  }

  const player = await prisma.player.update({
    where: { id: playerId },
    data: {
      teamId: parsed.data.teamId,
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      birthDate: new Date(parsed.data.birthDate),
      position: parsed.data.position,
      secondaryPosition: parsed.data.secondaryPosition || null,
      dominantFoot: parsed.data.dominantFoot,
      sex: parsed.data.sex,
      jerseyNumber: optionalNumber(parsed.data.jerseyNumber),
      heightCm: optionalNumber(parsed.data.heightCm),
      weightKg: optionalNumber(parsed.data.weightKg),
      status: parsed.data.status,
      email: parsed.data.email || null,
      externalId: parsed.data.externalId || null,
      notes: parsed.data.notes || null,
    },
  });

  await logAudit({
    userId: user.id,
    actorEmail: user.email,
    organizationId: existing.team.organizationId,
    action: "UPDATE",
    entity: "Player",
    entityId: player.id,
    meta: { name: `${player.firstName} ${player.lastName}` },
  });

  revalidatePath(`/app/players/${playerId}`);
  revalidatePath(`/app/teams/${existing.teamId}`);
  revalidatePath(`/app/teams/${existing.teamId}/manage`);
  revalidatePath("/app/players");

  return { success: t("manage.playerSaved") };
}

/**
 * Suppression definitive d'un joueur, avec tout son historique de mesures.
 *
 * Le statut "parti" existe pour sortir un joueur de l'effectif sans perdre ses
 * donnees : c'est presque toujours ce qu'il faut. Cette action est reservee aux
 * saisies erronees.
 */
export async function deletePlayerAction(playerId: string) {
  const player = await prisma.player.findUnique({
    where: { id: playerId },
    select: { teamId: true, firstName: true, lastName: true, team: { select: { organizationId: true } } },
  });
  if (!player) redirect("/app/players");

  const user = await requireTeamEditor(player.teamId);

  await prisma.player.delete({ where: { id: playerId } });

  await logAudit({
    userId: user.id,
    actorEmail: user.email,
    organizationId: player.team.organizationId,
    action: "DELETE",
    entity: "Player",
    entityId: playerId,
    meta: { name: `${player.firstName} ${player.lastName}` },
  });

  revalidatePath(`/app/teams/${player.teamId}/manage`);
  redirect(`/app/teams/${player.teamId}/manage`);
}

// ---------------------------------------------------------------------------
// Equipes
// ---------------------------------------------------------------------------

const teamSchema = z.object({
  name: z.string().trim().min(2, "name"),
  category: z.enum(CATEGORIES),
  level: z.string().optional(),
  sex: z.enum(["M", "F"]),
  season: z.string().trim().min(4, "season"),
  colorHex: z.string().optional(),
});

const readTeamForm = (formData: FormData) =>
  teamSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    category: String(formData.get("category") ?? "SENIOR"),
    level: String(formData.get("level") ?? ""),
    sex: String(formData.get("sex") ?? "M"),
    season: String(formData.get("season") ?? ""),
    colorHex: String(formData.get("colorHex") ?? ""),
  });

export async function createTeamInClubAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const t = await getT();
  const organizationId = String(formData.get("organizationId") ?? "");
  const parsed = readTeamForm(formData);
  if (!organizationId || !parsed.success) return { error: t("manage.teamInvalid") };

  let user: CurrentUser;
  try {
    user = await requireClubAdmin(organizationId);
  } catch {
    return forbidden();
  }

  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    include: { _count: { select: { teams: true } } },
  });
  if (!organization) return { error: t("manage.clubNotFound") };

  if (organization._count.teams >= organization.maxTeams) {
    return { error: `${t("manage.teamLimit")} ${organization.plan} : ${organization.maxTeams}.` };
  }

  const team = await prisma.team.create({
    data: {
      organizationId,
      name: parsed.data.name,
      category: parsed.data.category,
      level: parsed.data.level || null,
      sex: parsed.data.sex,
      season: parsed.data.season,
      colorHex: parsed.data.colorHex || "#1E40AF",
    },
  });

  // Le preparateur qui cree l'equipe y est rattache, sinon il ne la verrait pas.
  if (user.role === "CLUB_ADMIN") {
    await prisma.teamMember.create({
      data: { teamId: team.id, userId: user.id, accessLevel: "MANAGE" },
    });
  }

  await logAudit({
    userId: user.id,
    actorEmail: user.email,
    organizationId,
    action: "CREATE",
    entity: "Team",
    entityId: team.id,
    meta: { name: team.name },
  });

  revalidatePath("/app/teams");
  return { success: `${team.name} ${t("manage.teamCreated")}` };
}

export async function updateTeamAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const t = await getT();
  const teamId = String(formData.get("teamId") ?? "");
  const parsed = readTeamForm(formData);
  if (!teamId || !parsed.success) return { error: t("manage.teamInvalid") };

  let user: CurrentUser;
  try {
    user = await requireTeamEditor(teamId);
  } catch {
    return forbidden();
  }

  const team = await prisma.team.update({
    where: { id: teamId },
    data: {
      name: parsed.data.name,
      category: parsed.data.category,
      level: parsed.data.level || null,
      sex: parsed.data.sex,
      season: parsed.data.season,
      colorHex: parsed.data.colorHex || "#1E40AF",
    },
  });

  await logAudit({
    userId: user.id,
    actorEmail: user.email,
    organizationId: team.organizationId,
    action: "UPDATE",
    entity: "Team",
    entityId: team.id,
    meta: { name: team.name, category: team.category },
  });

  revalidatePath(`/app/teams/${teamId}`);
  revalidatePath(`/app/teams/${teamId}/manage`);
  revalidatePath("/app/teams");

  return { success: t("manage.teamSaved") };
}

export async function toggleTeamActiveAction(teamId: string) {
  const user = await requireTeamEditor(teamId);
  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team) redirect("/app/teams");

  await prisma.team.update({ where: { id: teamId }, data: { isActive: !team.isActive } });

  await logAudit({
    userId: user.id,
    actorEmail: user.email,
    organizationId: team.organizationId,
    action: "UPDATE",
    entity: "Team.isActive",
    entityId: teamId,
    meta: { name: team.name, to: !team.isActive },
  });

  revalidatePath("/app/teams");
  revalidatePath(`/app/teams/${teamId}/manage`);
}

// ---------------------------------------------------------------------------
// Staff rattache a une equipe
// ---------------------------------------------------------------------------

export async function addTeamMemberAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const t = await getT();
  const teamId = String(formData.get("teamId") ?? "");
  const userId = String(formData.get("userId") ?? "");
  const accessLevel = String(formData.get("accessLevel") ?? "MANAGE") === "VIEW" ? "VIEW" : "MANAGE";

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    select: { organizationId: true, name: true },
  });
  if (!team) return { error: t("manage.teamNotFound") };

  let admin: CurrentUser;
  try {
    admin = await requireClubAdmin(team.organizationId);
  } catch {
    return forbidden();
  }

  const target = await prisma.user.findUnique({ where: { id: userId } });
  // Un staff ne peut etre rattache qu'a une equipe de son propre club.
  if (!target || target.organizationId !== team.organizationId) {
    return { error: t("manage.userNotInClub") };
  }

  await prisma.teamMember.upsert({
    where: { teamId_userId: { teamId, userId } },
    update: { accessLevel },
    create: { teamId, userId, accessLevel },
  });

  await logAudit({
    userId: admin.id,
    actorEmail: admin.email,
    organizationId: team.organizationId,
    action: "UPDATE",
    entity: "TeamMember",
    entityId: teamId,
    meta: { team: team.name, user: target.email, accessLevel },
  });

  revalidatePath(`/app/teams/${teamId}/manage`);
  return { success: `${target.name} ${t("manage.staffAdded")}` };
}

export async function removeTeamMemberAction(teamId: string, userId: string) {
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    select: { organizationId: true, name: true },
  });
  if (!team) return;

  const admin = await requireClubAdmin(team.organizationId);

  await prisma.teamMember.deleteMany({ where: { teamId, userId } });

  await logAudit({
    userId: admin.id,
    actorEmail: admin.email,
    organizationId: team.organizationId,
    action: "DELETE",
    entity: "TeamMember",
    entityId: teamId,
    meta: { team: team.name, removedUserId: userId },
  });

  revalidatePath(`/app/teams/${teamId}/manage`);
}

// ---------------------------------------------------------------------------
// Club
// ---------------------------------------------------------------------------

const clubSchema = z.object({
  organizationId: z.string().min(1),
  name: z.string().trim().min(2, "name"),
  city: z.string().optional(),
  country: z.string().optional(),
});

export async function updateClubAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const t = await getT();
  const parsed = clubSchema.safeParse({
    organizationId: String(formData.get("organizationId") ?? ""),
    name: String(formData.get("name") ?? ""),
    city: String(formData.get("city") ?? ""),
    country: String(formData.get("country") ?? ""),
  });
  if (!parsed.success) return { error: t("manage.clubInvalid") };

  let user: CurrentUser;
  try {
    user = await requireClubAdmin(parsed.data.organizationId);
  } catch {
    return forbidden();
  }

  // Le forfait et les plafonds restent la main du proprietaire : un client ne
  // peut pas relever ses propres limites.
  const organization = await prisma.organization.update({
    where: { id: parsed.data.organizationId },
    data: {
      name: parsed.data.name,
      city: parsed.data.city || null,
      country: parsed.data.country || null,
    },
  });

  await logAudit({
    userId: user.id,
    actorEmail: user.email,
    organizationId: organization.id,
    action: "UPDATE",
    entity: "Organization",
    entityId: organization.id,
    meta: { name: organization.name },
  });

  revalidatePath("/app/club");
  revalidatePath("/admin/organizations");
  return { success: t("manage.clubSaved") };
}

/** Reserve au proprietaire : forfait, plafonds et date de fin d'acces. */
export async function updateClubPlanAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const t = await getT();
  const user = await requireUser();
  if (user.role !== "OWNER") return forbidden();

  const organizationId = String(formData.get("organizationId") ?? "");
  const plan = String(formData.get("plan") ?? "TRIAL");
  const maxTeams = Number(formData.get("maxTeams") ?? 0);
  const maxPlayers = Number(formData.get("maxPlayers") ?? 0);
  const expiresAt = String(formData.get("expiresAt") ?? "");

  if (!organizationId || !Number.isFinite(maxTeams) || !Number.isFinite(maxPlayers)) {
    return { error: t("manage.clubInvalid") };
  }

  const organization = await prisma.organization.update({
    where: { id: organizationId },
    data: {
      plan,
      maxTeams: Math.max(1, Math.round(maxTeams)),
      maxPlayers: Math.max(1, Math.round(maxPlayers)),
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    },
  });

  await logAudit({
    userId: user.id,
    actorEmail: user.email,
    organizationId,
    action: "UPDATE",
    entity: "Organization.plan",
    entityId: organizationId,
    meta: { plan: organization.plan, maxTeams: organization.maxTeams, maxPlayers: organization.maxPlayers },
  });

  revalidatePath("/admin/organizations");
  return { success: t("manage.clubSaved") };
}
