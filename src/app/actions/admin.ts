"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { hashPassword, logAudit, requireOwner } from "@/lib/auth";
import { PLAN_LIMITS, ROLES, type Plan } from "@/lib/constants";
import { slugify } from "@/lib/utils";
import type { ActionState } from "./auth";

// ---------------------------------------------------------------------------
// Clubs
// ---------------------------------------------------------------------------

const organizationSchema = z.object({
  name: z.string().min(2, "Nom du club requis"),
  country: z.string().optional(),
  city: z.string().optional(),
  plan: z.enum(["FREE", "STARTER", "PRO", "ELITE"]),
  expiresAt: z.string().optional(),
  notes: z.string().optional(),
});

export async function createOrganizationAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const owner = await requireOwner();

  const parsed = organizationSchema.safeParse({
    name: String(formData.get("name") ?? "").trim(),
    country: String(formData.get("country") ?? ""),
    city: String(formData.get("city") ?? ""),
    plan: String(formData.get("plan") ?? "FREE"),
    expiresAt: String(formData.get("expiresAt") ?? ""),
    notes: String(formData.get("notes") ?? ""),
  });

  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Donnees invalides" };

  let slug = slugify(parsed.data.name);
  const existing = await prisma.organization.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;

  const limits = PLAN_LIMITS[parsed.data.plan as Plan];

  const organization = await prisma.organization.create({
    data: {
      name: parsed.data.name,
      slug,
      country: parsed.data.country || null,
      city: parsed.data.city || null,
      plan: parsed.data.plan,
      maxTeams: limits.maxTeams,
      maxPlayers: limits.maxPlayers,
      expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
      notes: parsed.data.notes || null,
    },
  });

  await logAudit({
    userId: owner.id,
    actorEmail: owner.email,
    organizationId: organization.id,
    action: "CREATE",
    entity: "Organization",
    entityId: organization.id,
    meta: { name: organization.name, plan: organization.plan },
  });

  revalidatePath("/admin/organizations");
  return { success: `Club ${organization.name} cree.` };
}

export async function toggleOrganizationAction(organizationId: string) {
  const owner = await requireOwner();
  const organization = await prisma.organization.findUnique({ where: { id: organizationId } });
  if (!organization) return;

  await prisma.organization.update({
    where: { id: organizationId },
    data: { isActive: !organization.isActive },
  });

  await logAudit({
    userId: owner.id,
    actorEmail: owner.email,
    organizationId,
    action: "UPDATE",
    entity: "Organization.isActive",
    entityId: organizationId,
    meta: { from: organization.isActive, to: !organization.isActive },
  });

  revalidatePath("/admin/organizations");
  revalidatePath("/admin");
}

export async function updateOrganizationPlanAction(organizationId: string, plan: Plan) {
  const owner = await requireOwner();
  const limits = PLAN_LIMITS[plan];

  await prisma.organization.update({
    where: { id: organizationId },
    data: { plan, maxTeams: limits.maxTeams, maxPlayers: limits.maxPlayers },
  });

  await logAudit({
    userId: owner.id,
    actorEmail: owner.email,
    organizationId,
    action: "UPDATE",
    entity: "Organization.plan",
    entityId: organizationId,
    meta: { plan },
  });

  revalidatePath("/admin/organizations");
}

// ---------------------------------------------------------------------------
// Utilisateurs
// ---------------------------------------------------------------------------

const userSchema = z.object({
  email: z.string().email("Adresse email invalide"),
  name: z.string().min(2, "Nom requis"),
  role: z.enum(ROLES),
  organizationId: z.string().optional(),
  jobTitle: z.string().optional(),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caracteres"),
});

export async function createUserAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const owner = await requireOwner();

  const parsed = userSchema.safeParse({
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    name: String(formData.get("name") ?? "").trim(),
    role: String(formData.get("role") ?? "COACH"),
    organizationId: String(formData.get("organizationId") ?? ""),
    jobTitle: String(formData.get("jobTitle") ?? ""),
    password: String(formData.get("password") ?? ""),
  });

  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Donnees invalides" };

  if (parsed.data.role !== "OWNER" && !parsed.data.organizationId) {
    return { error: "Un club doit etre selectionne pour ce role." };
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) return { error: "Cette adresse email est deja utilisee." };

  const user = await prisma.user.create({
    data: {
      email: parsed.data.email,
      name: parsed.data.name,
      role: parsed.data.role,
      organizationId: parsed.data.role === "OWNER" ? null : parsed.data.organizationId || null,
      jobTitle: parsed.data.jobTitle || null,
      passwordHash: await hashPassword(parsed.data.password),
      // L'utilisateur devra choisir son propre mot de passe a la premiere connexion.
      mustChangePw: true,
    },
  });

  await logAudit({
    userId: owner.id,
    actorEmail: owner.email,
    organizationId: user.organizationId,
    action: "CREATE",
    entity: "User",
    entityId: user.id,
    meta: { email: user.email, role: user.role },
  });

  revalidatePath("/admin/users");
  return { success: `Compte cree pour ${user.email}. Communiquez lui le mot de passe provisoire.` };
}

export async function toggleUserAction(userId: string) {
  const owner = await requireOwner();
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role === "OWNER") return;

  await prisma.user.update({
    where: { id: userId },
    data: {
      isActive: !user.isActive,
      // La desactivation invalide immediatement les sessions ouvertes.
      tokenVersion: user.isActive ? { increment: 1 } : undefined,
    },
  });

  await logAudit({
    userId: owner.id,
    actorEmail: owner.email,
    organizationId: user.organizationId,
    action: "UPDATE",
    entity: "User.isActive",
    entityId: userId,
    meta: { email: user.email, to: !user.isActive },
  });

  revalidatePath("/admin/users");
}

const resetSchema = z.object({
  userId: z.string().min(1),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caracteres"),
});

export async function resetUserPasswordAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const owner = await requireOwner();

  const parsed = resetSchema.safeParse({
    userId: String(formData.get("userId") ?? ""),
    password: String(formData.get("password") ?? ""),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Donnees invalides" };

  const user = await prisma.user.findUnique({ where: { id: parsed.data.userId } });
  if (!user) return { error: "Compte introuvable." };

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash: await hashPassword(parsed.data.password),
      mustChangePw: true,
      tokenVersion: { increment: 1 },
    },
  });

  await logAudit({
    userId: owner.id,
    actorEmail: owner.email,
    organizationId: user.organizationId,
    action: "UPDATE",
    entity: "User.password",
    entityId: user.id,
    meta: { email: user.email, byOwner: true },
  });

  revalidatePath("/admin/users");
  return { success: `Mot de passe reinitialise pour ${user.email}.` };
}

// ---------------------------------------------------------------------------
// Equipes
// ---------------------------------------------------------------------------

const teamSchema = z.object({
  organizationId: z.string().min(1, "Club requis"),
  name: z.string().min(2, "Nom de l'equipe requis"),
  category: z.string().min(1),
  level: z.string().optional(),
  sex: z.enum(["M", "F"]),
  season: z.string().min(4),
});

export async function createTeamAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const owner = await requireOwner();

  const parsed = teamSchema.safeParse({
    organizationId: String(formData.get("organizationId") ?? ""),
    name: String(formData.get("name") ?? "").trim(),
    category: String(formData.get("category") ?? "SENIOR"),
    level: String(formData.get("level") ?? ""),
    sex: String(formData.get("sex") ?? "M"),
    season: String(formData.get("season") ?? "2025-2026"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Donnees invalides" };

  const organization = await prisma.organization.findUnique({
    where: { id: parsed.data.organizationId },
    include: { _count: { select: { teams: true } } },
  });
  if (!organization) return { error: "Club introuvable." };

  if (organization._count.teams >= organization.maxTeams) {
    return {
      error: `Le forfait ${organization.plan} de ce club est limite a ${organization.maxTeams} equipes.`,
    };
  }

  const team = await prisma.team.create({
    data: {
      organizationId: parsed.data.organizationId,
      name: parsed.data.name,
      category: parsed.data.category,
      level: parsed.data.level || null,
      sex: parsed.data.sex,
      season: parsed.data.season,
    },
  });

  await logAudit({
    userId: owner.id,
    actorEmail: owner.email,
    organizationId: organization.id,
    action: "CREATE",
    entity: "Team",
    entityId: team.id,
    meta: { name: team.name },
  });

  revalidatePath("/admin/organizations");
  return { success: `Equipe ${team.name} creee.` };
}
