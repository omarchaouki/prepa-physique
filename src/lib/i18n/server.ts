import { cache } from "react";
import { cookies, headers } from "next/headers";

import { LOCALE_COOKIE } from "@/lib/constants";
import { createTranslator, localeTag, type Locale, type Translator } from "./dictionary";
import {
  createMarketingTranslator,
  type MarketingLocale,
  type MarketingTranslator,
} from "./marketing";

/**
 * Choisit la langue a partir de l'entete envoye par le navigateur.
 *
 * L'entete ressemble a `fr-CA,fr;q=0.9,en-US;q=0.8,en;q=0.7` : une liste de
 * langues classees par une qualite decroissante. On garde la premiere que
 * l'application sait parler, en comparant sur les deux premieres lettres pour
 * que `fr-CA` et `en-GB` soient reconnus comme du francais et de l'anglais.
 *
 * Le classement est explicite plutot que suppose : Safari envoie parfois ses
 * langues dans un ordre qui ne correspond pas aux valeurs de qualite.
 */
const fromAcceptLanguage = (header: string | null): Locale | null => {
  if (!header) return null;

  const ranked = header
    .split(",")
    .map((part) => {
      const [tag, ...parameters] = part.trim().split(";");
      const quality = parameters
        .map((parameter) => parameter.trim())
        .find((parameter) => parameter.startsWith("q="));
      return {
        code: tag.trim().slice(0, 2).toLowerCase(),
        quality: quality ? Number.parseFloat(quality.slice(2)) || 0 : 1,
      };
    })
    .sort((a, b) => b.quality - a.quality);

  const match = ranked.find((entry) => entry.code === "fr" || entry.code === "en");
  return match ? (match.code as Locale) : null;
};

/**
 * Langue de la requete en cours, dans cet ordre :
 *
 *   1. le cookie, ecrit par le selecteur de langue et aligne sur la preference
 *      du compte a la connexion. Un choix explicite prime toujours.
 *   2. la langue du navigateur, pour qu'un premier visiteur anglophone tombe
 *      sur une page en anglais sans avoir rien a chercher.
 *   3. le francais.
 *
 * cache() garantit une seule lecture par requete HTTP, meme si la mise en page
 * et plusieurs zones la demandent chacune de leur cote.
 */
export const getLocale = cache(async (): Promise<Locale> => {
  const store = await cookies();
  const chosen = store.get(LOCALE_COOKIE)?.value;
  if (chosen === "en" || chosen === "fr") return chosen;

  const requestHeaders = await headers();
  return fromAcceptLanguage(requestHeaders.get("accept-language")) ?? "fr";
});

/** Traducteur pret a l'emploi dans un composant serveur. */
export const getT = cache(async (): Promise<Translator> => createTranslator(await getLocale()));

/** Etiquette de format pour les nombres et les dates. */
export const getLocaleTag = cache(async (): Promise<string> => localeTag(await getLocale()));

/** Choisit la bonne variante d'un texte du catalogue scientifique. */
export const pick = <T extends { fr: string; en: string }>(text: T, locale: Locale): string =>
  locale === "en" ? text.en : text.fr;

// ---------------------------------------------------------------------------
// Page publicitaire
// ---------------------------------------------------------------------------

/**
 * Meme lecture d'entete, mais avec l'arabe dans les langues reconnues.
 *
 * La fonction est dupliquee plutot que generalisee, et c'est volontaire :
 * l'ensemble des langues acceptees est precisement ce qui distingue les deux
 * surfaces. Un parametre partage laisserait croire qu'il suffit de le changer
 * pour que l'application connectee parle arabe, ce qui est faux, ses sept cents
 * cles n'existent qu'en deux langues.
 */
const marketingFromAcceptLanguage = (header: string | null): MarketingLocale | null => {
  if (!header) return null;

  const ranked = header
    .split(",")
    .map((part) => {
      const [tag, ...parameters] = part.trim().split(";");
      const quality = parameters
        .map((parameter) => parameter.trim())
        .find((parameter) => parameter.startsWith("q="));
      return {
        code: tag.trim().slice(0, 2).toLowerCase(),
        quality: quality ? Number.parseFloat(quality.slice(2)) || 0 : 1,
      };
    })
    .sort((a, b) => b.quality - a.quality);

  const match = ranked.find(
    (entry) => entry.code === "fr" || entry.code === "en" || entry.code === "ar",
  );
  return match ? (match.code as MarketingLocale) : null;
};

/**
 * Langue de la page publicitaire.
 *
 * Meme ordre que pour l'application : un choix explicite, puis le navigateur,
 * puis le francais. C'est cette seconde marche qui compte pour une campagne :
 * un preparateur marocain dont le telephone est en arabe voit la page en arabe
 * sans avoir rien a chercher, et une seconde d'hesitation en moins sur une page
 * de publicite se paie en inscriptions.
 *
 * Le cookie est le meme que celui de l'application. Un visiteur qui a choisi
 * l'arabe ici et qui ouvre ensuite l'application la verra en francais, puisque
 * `getLocale` ne reconnait pas cette valeur et retombe sur son repli. C'est le
 * comportement voulu tant que l'application n'est pas traduite.
 */
export const getMarketingLocale = cache(async (): Promise<MarketingLocale> => {
  const store = await cookies();
  const chosen = store.get(LOCALE_COOKIE)?.value;
  if (chosen === "en" || chosen === "fr" || chosen === "ar") return chosen;

  const requestHeaders = await headers();
  return marketingFromAcceptLanguage(requestHeaders.get("accept-language")) ?? "fr";
});

/** Traducteur de la page publicitaire, pret a l'emploi cote serveur. */
export const getMarketingT = cache(
  async (): Promise<MarketingTranslator> => createMarketingTranslator(await getMarketingLocale()),
);
