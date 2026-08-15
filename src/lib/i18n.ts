import { cookies } from "next/headers";
import { LOCALE_COOKIE } from "./constants";
import type { I18nText, Locale } from "./sports-science/types";

export type { Locale, I18nText };

export const LOCALES: Locale[] = ["fr", "en"];

export const getLocale = async (): Promise<Locale> => {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;
  return value === "en" ? "en" : "fr";
};

export const t = (text: I18nText, locale: Locale): string => text[locale] ?? text.fr;

type Dictionary = Record<string, I18nText>;

export const DICTIONARY: Dictionary = {
  // Navigation
  dashboard: { fr: "Tableau de bord", en: "Dashboard" },
  teams: { fr: "Equipes", en: "Teams" },
  team: { fr: "Equipe", en: "Team" },
  players: { fr: "Joueurs", en: "Players" },
  player: { fr: "Joueur", en: "Player" },
  tests: { fr: "Tests", en: "Tests" },
  testSessions: { fr: "Passations", en: "Test sessions" },
  analytics: { fr: "Analyses", en: "Analytics" },
  recommendations: { fr: "Recommandations", en: "Recommendations" },
  reference: { fr: "Referentiel", en: "Reference" },
  settings: { fr: "Parametres", en: "Settings" },
  admin: { fr: "Administration", en: "Administration" },
  organizations: { fr: "Clubs", en: "Clubs" },
  users: { fr: "Utilisateurs", en: "Users" },
  auditLog: { fr: "Journal d'audit", en: "Audit log" },
  logout: { fr: "Deconnexion", en: "Sign out" },

  // Actions
  save: { fr: "Enregistrer", en: "Save" },
  cancel: { fr: "Annuler", en: "Cancel" },
  create: { fr: "Creer", en: "Create" },
  edit: { fr: "Modifier", en: "Edit" },
  delete: { fr: "Supprimer", en: "Delete" },
  search: { fr: "Rechercher", en: "Search" },
  filter: { fr: "Filtrer", en: "Filter" },
  export: { fr: "Exporter", en: "Export" },
  back: { fr: "Retour", en: "Back" },
  add: { fr: "Ajouter", en: "Add" },
  confirm: { fr: "Confirmer", en: "Confirm" },
  loading: { fr: "Chargement", en: "Loading" },

  // Champs
  email: { fr: "Adresse email", en: "Email address" },
  password: { fr: "Mot de passe", en: "Password" },
  name: { fr: "Nom", en: "Name" },
  firstName: { fr: "Prenom", en: "First name" },
  lastName: { fr: "Nom", en: "Last name" },
  birthDate: { fr: "Date de naissance", en: "Date of birth" },
  position: { fr: "Poste", en: "Position" },
  height: { fr: "Taille", en: "Height" },
  weight: { fr: "Masse", en: "Body mass" },
  age: { fr: "Age", en: "Age" },
  date: { fr: "Date", en: "Date" },
  status: { fr: "Statut", en: "Status" },
  role: { fr: "Role", en: "Role" },
  category: { fr: "Categorie", en: "Category" },
  season: { fr: "Saison", en: "Season" },
  notes: { fr: "Notes", en: "Notes" },

  // Etats
  noData: { fr: "Aucune donnee", en: "No data" },
  noResults: { fr: "Aucun resultat", en: "No results" },
  percentile: { fr: "Percentile", en: "Percentile" },
  trend: { fr: "Evolution", en: "Trend" },
  squadAverage: { fr: "Moyenne de l'equipe", en: "Squad average" },
  lastTest: { fr: "Dernier test", en: "Last test" },
  alerts: { fr: "Alertes", en: "Alerts" },
};

export const tr = (key: keyof typeof DICTIONARY, locale: Locale): string =>
  t(DICTIONARY[key], locale);
