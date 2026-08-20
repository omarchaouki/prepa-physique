import { JOB_TITLES, JOB_TITLE_LABELS } from "@/lib/constants";
import type { Locale, Translator } from "@/lib/i18n/dictionary";
import type { MarketingLocale, MarketingTranslator } from "@/lib/i18n/marketing";
import { direction } from "@/lib/i18n/marketing";
import { SIGNUP_ERROR_KEYS, type SignupCopy } from "./copy";

/**
 * Fabrication des textes du formulaire d'inscription, une fonction par surface.
 *
 * Elles sont appelees depuis un composant serveur et le resultat traverse la
 * frontiere vers le client : d'ou un objet de chaines et non un traducteur.
 * Voir copy.ts pour le raisonnement complet.
 */

/** Version de la page d'inscription du site, en francais et en anglais. */
export const signupCopyFromApp = (t: Translator, locale: Locale): SignupCopy => ({
  dir: "ltr",
  countryLocale: locale,

  step1: t("signup.step1"),
  step2: t("signup.step2"),
  step3: t("signup.step3"),
  stepPosition: t("signup.stepPosition"),

  club: t("signup.club"),
  clubHint: t("signup.clubHint"),
  country: t("signup.country"),
  countryHint: t("signup.countryHint"),
  countryPlaceholder: t("signup.countryPlaceholder"),
  countryEmpty: t("signup.countryEmpty"),
  countryCount: t("signup.countryCount"),

  name: t("signup.name"),
  jobTitle: t("signup.jobTitle"),
  jobTitleOther: t("signup.jobTitleOther"),
  email: t("signup.email"),
  emailHint: t("signup.emailHint"),
  phone: t("signup.phone"),
  phoneHint: t("signup.phoneHint"),
  optional: t("signup.optional"),

  password: t("signup.password"),
  passwordHint: t("signup.passwordHint"),
  confirm: t("signup.confirm"),
  mismatch: t("signup.mismatch"),
  showPassword: t("login.showPassword"),
  hidePassword: t("login.hidePassword"),

  recap: t("signup.recap"),
  back: t("signup.back"),
  next: t("signup.next"),
  submit: t("signup.submit"),
  pending: t("signup.pending"),
  required: t("common.required"),
  choose: t("common.none"),
  draftRestored: t("signup.draftRestored"),
  terms: t("signup.terms"),

  included: [t("signup.included1"), t("signup.included2"), t("signup.included3")],

  jobTitles: JOB_TITLES.map((value) => ({ value, label: JOB_TITLE_LABELS[value][locale] })),

  errors: Object.fromEntries(
    SIGNUP_ERROR_KEYS.map((key) => [key, t(key)]),
  ) as SignupCopy["errors"],
});

/**
 * Version de la page publicitaire, qui ajoute l'arabe.
 *
 * Les chiffres du palier gratuit sont passes en argument plutot que lus ici :
 * ce module ne doit connaitre ni le catalogue ni les plafonds, sinon il
 * deviendrait impossible de le rendre depuis le client.
 */
export const signupCopyFromMarketing = (
  t: MarketingTranslator,
  locale: MarketingLocale,
  counts: { players: number; teams: number; tests: number; norms: number },
): SignupCopy => ({
  dir: direction(locale),
  countryLocale: locale,

  step1: t("signup.step1"),
  step2: t("signup.step2"),
  step3: t("signup.step3"),
  stepPosition: t("signup.stepPosition"),

  club: t("signup.club"),
  clubHint: t("signup.clubHint"),
  country: t("signup.country"),
  countryHint: t("signup.countryHint"),
  countryPlaceholder: t("signup.countryPlaceholder"),
  countryEmpty: t("signup.countryEmpty"),
  countryCount: t("signup.countryCount"),

  name: t("signup.name"),
  jobTitle: t("signup.jobTitle"),
  jobTitleOther: t("signup.jobTitleOther"),
  email: t("signup.email"),
  emailHint: t("signup.emailHint"),
  phone: t("signup.phone"),
  phoneHint: t("signup.phoneHint"),
  optional: t("signup.optional"),

  password: t("signup.password"),
  passwordHint: t("signup.passwordHint"),
  confirm: t("signup.confirm"),
  mismatch: t("signup.mismatch"),
  showPassword: t("signup.showPassword"),
  hidePassword: t("signup.hidePassword"),

  recap: t("signup.recap"),
  back: t("signup.back"),
  next: t("signup.next"),
  submit: t("signup.submit"),
  pending: t("signup.pending"),
  required: t("signup.required"),
  choose: t("signup.none"),
  draftRestored: t("signup.draftRestored"),
  terms: t("signup.terms"),

  included: [
    t("signup.included1", { players: counts.players, teams: counts.teams }),
    t("signup.included2", { tests: counts.tests, norms: counts.norms }),
    t("signup.included3"),
  ],

  jobTitles: JOB_TITLES.map((value) => ({ value, label: t(`job.${value}`) })),

  errors: Object.fromEntries(
    SIGNUP_ERROR_KEYS.map((key) => [key, t(key)]),
  ) as SignupCopy["errors"],
});
