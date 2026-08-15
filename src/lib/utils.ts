import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const formatNumber = (
  value: number | null | undefined,
  decimals = 2,
  locale = "fr-FR",
): string => {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

export const formatDate = (date: Date | string, locale = "fr-FR"): string =>
  new Intl.DateTimeFormat(locale, { day: "2-digit", month: "short", year: "numeric" }).format(
    typeof date === "string" ? new Date(date) : date,
  );

export const formatDateShort = (date: Date | string, locale = "fr-FR"): string =>
  new Intl.DateTimeFormat(locale, { day: "2-digit", month: "2-digit", year: "2-digit" }).format(
    typeof date === "string" ? new Date(date) : date,
  );

export const formatDateInput = (date: Date): string => date.toISOString().slice(0, 10);

export const ageFrom = (birthDate: Date | string): number => {
  const d = typeof birthDate === "string" ? new Date(birthDate) : birthDate;
  return Math.floor((Date.now() - d.getTime()) / (365.25 * 86_400_000));
};

export const ageExact = (birthDate: Date | string, at: Date = new Date()): number => {
  const d = typeof birthDate === "string" ? new Date(birthDate) : birthDate;
  return Number(((at.getTime() - d.getTime()) / (365.25 * 86_400_000)).toFixed(2));
};

export const initials = (firstName: string, lastName: string): string =>
  `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

export const slugify = (input: string): string =>
  input
    .normalize("NFD")
    .replace(new RegExp("[\\u0300-\\u036f]", "g"), "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/** Couleur associee a un percentile, du rouge au vert, lisible dans les deux themes. */
export const percentileColor = (percentile: number): string => {
  if (percentile < 15) return "var(--danger)";
  if (percentile < 35) return "var(--warning)";
  if (percentile < 65) return "var(--text-secondary)";
  if (percentile < 85) return "var(--accent)";
  return "var(--success)";
};

export const percentileLabel = (percentile: number): string => {
  if (percentile < 15) return "Tres faible";
  if (percentile < 35) return "Faible";
  if (percentile < 65) return "Moyen";
  if (percentile < 85) return "Bon";
  return "Tres bon";
};
