"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { hashPassword, logAudit, requestIp, setSessionCookie, signSession } from "@/lib/auth";
import { JOB_TITLES, JOB_TITLE_LABELS, PLAN_LIMITS, type JobTitle } from "@/lib/constants";
import { slugify } from "@/lib/utils";
import type { ActionState } from "./auth";

/**
 * Inscription publique d'un club.
 *
 * ---------------------------------------------------------------------------
 * Ce que l'inscription cree
 * ---------------------------------------------------------------------------
 *
 * Un club au forfait gratuit, et un compte administrateur de ce club. Rien
 * d'autre : pas d'equipe automatique, pas de joueur de demonstration. Un
 * preparateur qui arrive veut voir son propre effectif, pas nettoyer des
 * donnees inventees avant de commencer.
 *
 * Le forfait gratuit n'a pas de date de fin. Le club paie le jour ou il depasse
 * trente joueurs, et ce jour la seulement.
 *
 * ---------------------------------------------------------------------------
 * Ce qui protege ce formulaire
 * ---------------------------------------------------------------------------
 *
 * Il est public et vise par de la publicite, donc il sera trouve par des robots
 * avant d'etre trouve par des clubs. Trois defenses, dans l'ordre de ce qu'elles
 * arretent :
 *
 * 1. Une limite par adresse IP. Cinq inscriptions par heure suffisent
 *    largement a un usage humain, et coupent court a une creation en masse.
 * 2. Un refus des adresses jetables, celles des services de boite temporaire.
 *    Un club qui s'inscrit avec une adresse qui expire dans dix minutes ne sera
 *    jamais joignable, et ses donnees deviendraient orphelines.
 * 3. Un champ leurre, invisible a l'oeil et rempli par la plupart des robots.
 *
 * Il n'y a pas de verification par courriel : c'est un choix assume pour ne pas
 * casser la conversion depuis une publicite. La consequence est qu'il y aura de
 * faux comptes, et qu'il faudra les nettoyer de temps en temps depuis le
 * panneau proprietaire.
 */

const schema = z
  .object({
    club: z.string().trim().min(2, "Le nom du club est requis").max(80),
    name: z.string().trim().min(2, "Votre nom est requis").max(80),
    email: z.string().trim().toLowerCase().email("Adresse de courriel invalide"),
    password: z
      .string()
      .min(10, "Le mot de passe doit contenir au moins dix caracteres")
      .max(200),
    confirm: z.string(),
    /** Code ISO du pays, choisi dans la liste et non tape librement. */
    country: z.string().trim().length(2).optional().or(z.literal("")),
    jobTitle: z.enum(JOB_TITLES).optional().or(z.literal("")),
    jobTitleOther: z.string().trim().max(80).optional(),
    phone: z.string().trim().max(30).optional(),
    /** Champ leurre : un humain ne le voit pas, donc ne le remplit pas. */
    website: z.string().max(0, "Inscription refusee").optional(),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Les deux mots de passe ne correspondent pas",
    path: ["confirm"],
  });

/**
 * Domaines de boites jetables les plus courants.
 *
 * Liste volontairement courte : elle attrape le gros du bruit sans pretendre
 * etre exhaustive. Une liste longue donne l'illusion d'etre complete et finit
 * par bloquer un vrai client dont le domaine ressemble a l'un d'eux.
 */
const DISPOSABLE = new Set([
  "mailinator.com",
  "guerrillamail.com",
  "10minutemail.com",
  "tempmail.com",
  "temp-mail.org",
  "yopmail.com",
  "trashmail.com",
  "throwawaymail.com",
  "sharklasers.com",
  "getnada.com",
  "maildrop.cc",
  "fakeinbox.com",
]);

const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_IP = 5;
const attempts = new Map<string, { count: number; resetAt: number }>();

const rateLimited = (key: string): boolean => {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || entry.resetAt < now) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_PER_IP;
};

export async function signUpAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const ip = (await requestIp()) ?? "inconnu";
  if (rateLimited(ip)) {
    return { error: "Trop d'inscriptions depuis ce reseau. Reessayez dans une heure." };
  }

  const parsed = schema.safeParse({
    club: String(formData.get("club") ?? ""),
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    confirm: String(formData.get("confirm") ?? ""),
    country: String(formData.get("country") ?? ""),
    jobTitle: String(formData.get("jobTitle") ?? ""),
    jobTitleOther: String(formData.get("jobTitleOther") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    website: String(formData.get("website") ?? ""),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Donnees invalides" };
  }

  const { club, name, email, password, country, phone } = parsed.data;

  // La fonction est enregistree en clair et en francais : elle sert a
  // comprendre qui utilise le produit, pas a piloter des droits. Une valeur
  // libre est donc acceptable la ou un code ne le serait pas.
  const jobTitle =
    parsed.data.jobTitle === "OTHER"
      ? parsed.data.jobTitleOther?.trim() || null
      : parsed.data.jobTitle
        ? JOB_TITLE_LABELS[parsed.data.jobTitle as JobTitle].fr
        : null;

  const domain = email.split("@")[1] ?? "";
  if (DISPOSABLE.has(domain)) {
    return {
      error: "Cette adresse est temporaire. Utilisez l'adresse de votre club.",
    };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    // Le message ne dit pas si le compte existe : cela renseignerait un
    // visiteur sur les adresses deja inscrites. Il oriente vers la connexion,
    // ce qui aide la personne concernee sans rien apprendre aux autres.
    return {
      error: "Impossible de creer ce compte avec cette adresse. Essayez de vous connecter.",
    };
  }

  let slug = slugify(club);
  if (await prisma.organization.findUnique({ where: { slug } })) {
    slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
  }

  const limits = PLAN_LIMITS.FREE;

  // Le club et son administrateur naissent ensemble : un club sans compte ne
  // sert a rien, et un compte sans club n'a acces a aucune equipe.
  const { organization, user } = await prisma.$transaction(async (tx) => {
    const organization = await tx.organization.create({
      data: {
        name: club,
        slug,
        country: country || null,
        plan: "FREE",
        maxTeams: limits.maxTeams,
        maxPlayers: limits.maxPlayers,
        // Aucune date de fin : le forfait gratuit ne s'eteint pas.
        expiresAt: null,
        notes: "Inscription en ligne",
      },
    });

    const user = await tx.user.create({
      data: {
        email,
        name,
        passwordHash: await hashPassword(password),
        role: "CLUB_ADMIN",
        organizationId: organization.id,
        locale: "fr",
        jobTitle,
        phone: phone || null,
      },
    });

    return { organization, user };
  });

  await logAudit({
    userId: user.id,
    actorEmail: user.email,
    organizationId: organization.id,
    action: "CREATE",
    entity: "Organization",
    entityId: organization.id,
    meta: { canal: "inscription", club: organization.name, plan: "FREE" },
  });

  // Connexion immediate : demander de se reconnecter juste apres avoir choisi
  // un mot de passe est une friction gratuite, et la moitie des inscrits
  // s'arreteraient la.
  const token = await signSession({
    sub: user.id,
    role: "CLUB_ADMIN",
    organizationId: organization.id,
    tokenVersion: user.tokenVersion,
  });
  await setSessionCookie(token);

  redirect("/app");
}
