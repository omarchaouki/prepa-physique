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
  /**
   * Numero WhatsApp, chiffres uniquement, indicatif compris et sans le plus.
   *
   * C'est la forme qu'attend wa.me. Un plus, une espace ou un tiret laisses ici
   * produisent un lien que WhatsApp ouvre sur une conversation vide, sans dire
   * pourquoi : la panne la plus discrete de toute cette page.
   */
  whatsapp: process.env.CONTACT_WHATSAPP?.replace(/[^0-9]/gu, "") || "13612180920",
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
/**
 * Devises proposees, dans l'ordre d'affichage du selecteur.
 *
 * Le dirham vient en premier parce que c'est le marche vise et la devise de
 * facturation. L'euro et le dollar suivent, pour le visiteur qui veut situer
 * le prix dans la sienne.
 */
export const CURRENCIES = ["MAD", "EUR", "USD"] as const;
export type Currency = (typeof CURRENCIES)[number];

export const CURRENCY_LABELS: Record<Currency, { code: string; name: { fr: string; en: string } }> = {
  MAD: { code: "DH", name: { fr: "Dirham marocain", en: "Moroccan dirham" } },
  EUR: { code: "EUR", name: { fr: "Euro", en: "Euro" } },
  USD: { code: "USD", name: { fr: "Dollar americain", en: "US dollar" } },
};

/**
 * Devise proposee par defaut.
 *
 * Le dirham pour tout le monde, quelle que soit la langue lue. La regle
 * precedente donnait l'euro a l'anglophone, ce qui partait d'une bonne
 * intention et se trompait de public : l'anglais est aussi la langue de
 * beaucoup de staffs au Maroc et dans le Golfe, et un club de Casablanca qui
 * lit la page en anglais voyait un prix en euro pour un service facture en
 * dirham.
 *
 * La devise de facturation est donc celle qui s'affiche, et le selecteur reste
 * a cote du tarif pour situer le montant en euro ou en dollar en un geste. Le
 * choix du visiteur, lui, prime toujours : il vit dans un cookie, lu par
 * `getCurrency`.
 *
 * Le parametre de langue est conserve bien qu'inutilise : il documente que
 * cette decision depend d'une politique commerciale et non d'un hasard, et il
 * evite de toucher les six appelants le jour ou la regle redevient variable.
 */
export const defaultCurrency = (_locale: "fr" | "en"): Currency => "MAD";

/**
 * Tarifs mensuels, hors taxes.
 *
 * `null` veut dire sur devis, et la page affiche alors un bouton de contact a
 * la place d'un montant. Zero veut dire gratuit, sans date de fin.
 *
 * A CONFIRMER PAR OMAR. Les montants en dirham suivent des paliers ronds du
 * marche local plutot que la conversion stricte de l'euro : c'est un choix
 * commercial, pas une erreur d'arrondi.
 *
 * Les montants en dollar sont poses au meme titre, et ils n'engagent personne
 * tant qu'Omar ne les a pas valides : 45, 109 et 279 sont des paliers ronds
 * legerement au dessus de l'euro, comme le veut l'usage sur ce marche. Ils sont
 * ecrits en dur, jamais convertis : un taux qui bouge ferait varier le prix
 * affiche d'un jour a l'autre, et deux visiteurs verraient deux prix pour la
 * meme offre.
 */
export const PRICING: Record<Plan, { monthly: Record<Currency, number | null>; highlight: boolean }> = {
  FREE: { monthly: { MAD: 0, EUR: 0, USD: 0 }, highlight: false },
  STARTER: { monthly: { MAD: 399, EUR: 39, USD: 45 }, highlight: false },
  PRO: { monthly: { MAD: 999, EUR: 99, USD: 109 }, highlight: true },
  ELITE: { monthly: { MAD: 2499, EUR: 249, USD: 279 }, highlight: false },
};

/** Delai de reponse annonce au visiteur, en heures ouvrees. */
export const RESPONSE_HOURS = 24;

/**
 * Met un montant en forme dans la devise demandee.
 *
 * Le dirham est ecrit avec son sigle usuel plutot qu'avec le code ISO : un
 * client marocain lit « 399 DH », pas « 399 MAD ». `Intl` produit la seconde
 * forme, on la remplace donc.
 *
 * Le dollar demande la meme correction, en francais seulement. `Intl` y ecrit
 * « 45 $US », qui est la forme correcte de la typographie francaise mais que
 * personne ne lit sur une page de tarifs : le visiteur cherche un signe dollar,
 * et le « US » accole se lit comme une coquille. En anglais la forme rendue est
 * deja « $45 », qui convient.
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

  if (currency === "MAD") return formatted.replace(/MAD\s?/u, "").trim() + " DH";
  if (currency === "USD") return formatted.replace(/\$US/u, "$");
  return formatted;
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
