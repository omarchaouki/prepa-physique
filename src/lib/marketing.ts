import type { Plan } from "./constants";
import { TEST_BATTERIES, TEST_DEFINITIONS } from "./sports-science/catalog";
import { NORMS } from "./sports-science/norms";

/**
 * Donnees de la page publique.
 *
 * Les chiffres avances au visiteur sont comptes ici a partir du catalogue et des
 * tables de normes, jamais ecrits a la main : une page commerciale qui annonce
 * vingt tests alors que l'application en propose vingt deux se decredibilise
 * toute seule, et personne ne penserait a la corriger.
 */

export const PROOF = {
  tests: TEST_DEFINITIONS.length,
  batteries: TEST_BATTERIES.length,
  normRows: NORMS.length,
  populations: new Set(NORMS.map((norm) => norm.population)).size,
} as const;

/**
 * Coordonnees de contact.
 *
 * Deux adresses distinctes, parce qu'elles ne repondent pas a la meme question :
 * l'une vend, l'autre depanne. Stripe verifie que le service client est joignable
 * avant d'ouvrir un compte, et une adresse unique qui melange les deux flux finit
 * par en negliger un.
 *
 * Elles vivent dans l'environnement plutot que dans le code : changer d'adresse
 * ne doit pas demander un redeploiement, et un revendeur en marque blanche
 * affiche les siennes.
 */
export const CONTACT = {
  sales: process.env.CONTACT_SALES_EMAIL?.trim() || "sales@lamsaa.ma",
  support: process.env.CONTACT_EMAIL?.trim() || "contact@lamsaa.ma",
  whatsapp: process.env.CONTACT_WHATSAPP?.trim() || null,
  brand: process.env.BRAND_NAME?.trim() || "Lamsaa",
} as const;

/**
 * Identite de l'entreprise, affichee dans les mentions legales et le pied de page.
 *
 * A COMPLETER PAR OMAR, dans le fichier .env du serveur. Stripe refuse un compte
 * dont le site n'identifie pas l'entreprise derriere le service : il faut une
 * raison sociale, une adresse postale reelle et un numero d'immatriculation.
 *
 *   COMPANY_LEGAL_NAME="Lamsaa SARL"
 *   COMPANY_ADDRESS="12 rue Example, 20000 Casablanca, Maroc"
 *   COMPANY_REGISTRATION="RC 123456 . ICE 001234567000012"
 *   COMPANY_PHONE="+212 6 00 00 00 00"
 *
 * Tant qu'une valeur manque, la page l'affiche comme une mention a completer,
 * bien visible, plutot que de laisser un vide que personne ne remarque.
 */
export const COMPANY = {
  legalName: process.env.COMPANY_LEGAL_NAME?.trim() || null,
  address: process.env.COMPANY_ADDRESS?.trim() || null,
  registration: process.env.COMPANY_REGISTRATION?.trim() || null,
  phone: process.env.COMPANY_PHONE?.trim() || null,
} as const;

/**
 * Tarifs mensuels, hors taxes, en euro.
 *
 * A CONFIRMER PAR OMAR. Ces montants sont un point de depart credible pour le
 * marche vise, pas une decision commerciale : une plateforme de preparation
 * physique se vend entre trente et deux cent cinquante euros par mois selon le
 * nombre d'equipes suivies. Corriger ici suffit, la page et les pages legales
 * lisent toutes cette table.
 *
 * `null` veut dire sur devis, et la page affiche alors un bouton de contact a
 * la place d'un montant.
 */
export const PRICING: Record<Plan, { monthlyEur: number | null; highlight: boolean }> = {
  TRIAL: { monthlyEur: 0, highlight: false },
  STARTER: { monthlyEur: 39, highlight: false },
  PRO: { monthlyEur: 99, highlight: true },
  ELITE: { monthlyEur: 249, highlight: false },
};

/** Duree de l'essai gratuit, en jours. Reprise telle quelle dans les conditions. */
export const TRIAL_DAYS = 14;

/** Delai de reponse annonce au visiteur, en heures ouvrees. */
export const RESPONSE_HOURS = 24;

export const formatPrice = (amount: number, locale: "fr" | "en"): string =>
  new Intl.NumberFormat(locale === "en" ? "en-GB" : "fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);

export const mailtoSales = (subject: string): string =>
  `mailto:${CONTACT.sales}?subject=${encodeURIComponent(subject)}`;

export const mailtoSupport = (subject: string): string =>
  `mailto:${CONTACT.support}?subject=${encodeURIComponent(subject)}`;

export const whatsappDemo = (message: string): string | null =>
  CONTACT.whatsapp
    ? `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(message)}`
    : null;

/**
 * Rend une donnee d'entreprise, ou une mention voyante si elle manque.
 *
 * Un blanc dans des mentions legales ne se voit pas et reste donc en place
 * pendant des mois. Une mention "a completer" se voit, et c'est exactement ce
 * qu'on veut : elle gene assez pour etre corrigee avant la mise en vente.
 */
export const orBlank = (
  value: string | null,
  missing: { fr: string; en: string },
  locale: "fr" | "en",
): string =>
  value ?? `[${locale === "en" ? "to complete: " : "a completer : "}${missing[locale]}]`;
