import { cache } from "react";
import { cookies, headers } from "next/headers";

import { LOCALE_COOKIE } from "@/lib/constants";
import { createTranslator, localeTag, type Locale, type Translator } from "./dictionary";

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
