import type { JobTitle } from "@/lib/constants";
import type { CountryLocale } from "@/lib/countries";

/**
 * Textes du formulaire d'inscription, fournis par l'appelant.
 *
 * ---------------------------------------------------------------------------
 * Pourquoi le formulaire ne lit plus le dictionnaire lui meme
 * ---------------------------------------------------------------------------
 *
 * Il est affiche a deux endroits qui ne parlent pas les memes langues :
 *
 *   /inscription  page d'inscription du site, en francais et en anglais, dont
 *                 les textes viennent du dictionnaire de l'application.
 *   /lp           page publicitaire, en francais, en anglais et en arabe, dont
 *                 les textes viennent du dictionnaire marketing.
 *
 * Le dupliquer donnerait deux formulaires de cinq cents lignes a corriger en
 * parallele, et ils divergeraient des la premiere correction. Le brancher sur
 * un seul dictionnaire obligerait a traduire tout le dictionnaire concerne.
 *
 * Il recoit donc ses textes. Un objet de chaines simples, et non une fonction
 * de traduction : ce composant est rendu depuis un composant serveur, et une
 * fonction ne traverse pas cette frontiere.
 *
 * Ce fichier ne porte aucune directive et n'exporte que des types et des
 * constantes, pour pouvoir etre importe des deux cotes.
 */
export interface SignupCopy {
  /** Sens d'ecriture de la surface hote. Il retourne les fleches et le rail. */
  dir: "ltr" | "rtl";
  /** Langue dans laquelle chercher et afficher les noms de pays. */
  countryLocale: CountryLocale;

  step1: string;
  step2: string;
  step3: string;
  stepPosition: string;

  club: string;
  clubHint: string;
  country: string;
  countryHint: string;
  countryPlaceholder: string;
  countryEmpty: string;
  countryCount: string;

  name: string;
  jobTitle: string;
  jobTitleOther: string;
  email: string;
  emailHint: string;
  phone: string;
  phoneHint: string;
  optional: string;

  password: string;
  passwordHint: string;
  confirm: string;
  mismatch: string;
  showPassword: string;
  hidePassword: string;

  recap: string;
  back: string;
  next: string;
  submit: string;
  pending: string;
  required: string;
  choose: string;
  draftRestored: string;
  terms: string;

  /** Ce que contient le palier gratuit, affiche a la derniere etape. */
  included: readonly [string, string, string];

  /** Fonctions proposees, deja traduites et dans l'ordre d'affichage. */
  jobTitles: readonly { value: JobTitle; label: string }[];

  /**
   * Messages d'erreur, indexes par la cle que renvoie l'action serveur.
   *
   * L'action ne renvoie que des cles : elle ne sait pas dans quelle langue la
   * page qui l'appelle est rendue, et elle est appelee depuis trois langues.
   */
  errors: Readonly<Record<string, string>>;
}

/** Cles d'erreur que l'action d'inscription peut renvoyer. */
export const SIGNUP_ERROR_KEYS = [
  "error.rateLimit",
  "error.disposable",
  "error.emailTaken",
  "error.clubRequired",
  "error.nameRequired",
  "error.emailInvalid",
  "error.passwordShort",
  "error.passwordMismatch",
  "error.rejected",
  "error.invalid",
] as const;

export type SignupErrorKey = (typeof SIGNUP_ERROR_KEYS)[number];
