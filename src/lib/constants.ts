import type { I18nText } from "./sports-science/types";

export const ROLES = ["OWNER", "CLUB_ADMIN", "COACH", "ANALYST", "VIEWER"] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, I18nText> = {
  OWNER: { fr: "Proprietaire", en: "Owner" },
  CLUB_ADMIN: { fr: "Administrateur du club", en: "Club administrator" },
  COACH: { fr: "Preparateur physique", en: "Physical coach" },
  ANALYST: { fr: "Analyste", en: "Analyst" },
  VIEWER: { fr: "Lecture seule", en: "Read only" },
};

/** Hierarchie utilisee pour les controles d'acces. Un rang plus bas donne plus de droits. */
export const ROLE_RANK: Record<Role, number> = {
  OWNER: 0,
  CLUB_ADMIN: 1,
  COACH: 2,
  ANALYST: 3,
  VIEWER: 4,
};

export const POSITIONS = ["GK", "CB", "FB", "DM", "CM", "AM", "W", "ST"] as const;
export type Position = (typeof POSITIONS)[number];

export const POSITION_LABELS: Record<Position, I18nText> = {
  GK: { fr: "Gardien", en: "Goalkeeper" },
  CB: { fr: "Defenseur central", en: "Centre back" },
  FB: { fr: "Lateral", en: "Full back" },
  DM: { fr: "Milieu defensif", en: "Defensive midfielder" },
  CM: { fr: "Milieu central", en: "Central midfielder" },
  AM: { fr: "Milieu offensif", en: "Attacking midfielder" },
  W: { fr: "Ailier", en: "Winger" },
  ST: { fr: "Attaquant", en: "Striker" },
};

export const CATEGORIES = ["U13", "U15", "U17", "U19", "U21", "SENIOR"] as const;
export type Category = (typeof CATEGORIES)[number];

export const TEAM_LEVELS = ["PRO", "SEMI_PRO", "AMATEUR", "ACADEMY"] as const;
export type TeamLevel = (typeof TEAM_LEVELS)[number];

export const TEAM_LEVEL_LABELS: Record<TeamLevel, I18nText> = {
  PRO: { fr: "Professionnel", en: "Professional" },
  SEMI_PRO: { fr: "Semi professionnel", en: "Semi professional" },
  AMATEUR: { fr: "Amateur", en: "Amateur" },
  ACADEMY: { fr: "Centre de formation", en: "Academy" },
};

export const PLAYER_STATUSES = ["ACTIVE", "INJURED", "REHAB", "LOANED", "LEFT"] as const;
export type PlayerStatus = (typeof PLAYER_STATUSES)[number];

export const PLAYER_STATUS_LABELS: Record<PlayerStatus, I18nText> = {
  ACTIVE: { fr: "Disponible", en: "Available" },
  INJURED: { fr: "Blesse", en: "Injured" },
  REHAB: { fr: "Reathletisation", en: "Rehabilitation" },
  LOANED: { fr: "Prete", en: "On loan" },
  LEFT: { fr: "Parti", en: "Left" },
};

export const PLAYER_STATUS_COLORS: Record<PlayerStatus, string> = {
  ACTIVE: "emerald",
  INJURED: "red",
  REHAB: "amber",
  LOANED: "slate",
  LEFT: "slate",
};

export const PLANS = ["TRIAL", "STARTER", "PRO", "ELITE"] as const;
export type Plan = (typeof PLANS)[number];

export const PLAN_LIMITS: Record<Plan, { maxTeams: number; maxPlayers: number; label: I18nText }> = {
  TRIAL: { maxTeams: 1, maxPlayers: 30, label: { fr: "Essai", en: "Trial" } },
  STARTER: { maxTeams: 3, maxPlayers: 90, label: { fr: "Starter", en: "Starter" } },
  PRO: { maxTeams: 10, maxPlayers: 300, label: { fr: "Pro", en: "Pro" } },
  ELITE: { maxTeams: 100, maxPlayers: 3000, label: { fr: "Elite", en: "Elite" } },
};

export const SESSION_COOKIE = "pp_session";
export const LOCALE_COOKIE = "pp_locale";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
