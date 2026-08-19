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
 * Devises proposees au visiteur.
 *
 * Deux prix ecrits en dur, jamais une conversion a la volee. Un taux de change
 * qui bouge ferait varier le prix affiche d'un jour a l'autre, ce qui est
 * illisible pour le client et intenable pour la facturation. Chaque montant est
 * une decision commerciale, pas le resultat d'un calcul.
 */
export const CURRENCIES = ["MAD", "EUR"] as const;
export type Currency = (typeof CURRENCIES)[number];

export const CURRENCY_LABELS: Record<Currency, { code: string; name: { fr: string; en: string } }> = {
  MAD: { code: "DH", name: { fr: "Dirham marocain", en: "Moroccan dirham" } },
  EUR: { code: "EUR", name: { fr: "Euro", en: "Euro" } },
};

/** Devise proposee par defaut selon la langue lue. */
export const defaultCurrency = (locale: "fr" | "en"): Currency => (locale === "fr" ? "MAD" : "EUR");

/**
 * Tarifs mensuels, hors taxes.
 *
 * `null` veut dire sur devis, et la page affiche alors un bouton de contact a
 * la place d'un montant. Zero veut dire gratuit, sans date de fin.
 *
 * A CONFIRMER PAR OMAR. Les montants en dirham suivent des paliers ronds du
 * marche local plutot que la conversion stricte de l'euro : c'est un choix
 * commercial, pas une erreur d'arrondi.
 */
export const PRICING: Record<Plan, { monthly: Record<Currency, number | null>; highlight: boolean }> = {
  FREE: { monthly: { MAD: 0, EUR: 0 }, highlight: false },
  STARTER: { monthly: { MAD: 399, EUR: 39 }, highlight: false },
  PRO: { monthly: { MAD: 999, EUR: 99 }, highlight: true },
  ELITE: { monthly: { MAD: 2499, EUR: 249 }, highlight: false },
};

/** Delai de reponse annonce au visiteur, en heures ouvrees. */
export const RESPONSE_HOURS = 24;

/**
 * Met un montant en forme dans la devise demandee.
 *
 * Le dirham est ecrit avec son sigle usuel plutot qu'avec le code ISO : un
 * client marocain lit « 399 DH », pas « 399 MAD ». `Intl` produit la seconde
 * forme, on la remplace donc.
 */
export const formatPrice = (
  amount: number,
  currency: Currency,
  locale: "fr" | "en",
): string => {
  const formatted = new Intl.NumberFormat(locale === "en" ? "en-GB" : "fr-FR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);

  return currency === "MAD" ? formatted.replace(/MAD\s?/u, "").trim() + " DH" : formatted;
};

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
