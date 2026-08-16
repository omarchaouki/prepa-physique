import { cache } from "react";
import { cookies } from "next/headers";

import { LOCALE_COOKIE } from "@/lib/constants";
import { createTranslator, localeTag, type Locale, type Translator } from "./dictionary";

/**
 * Langue de la requete en cours.
 *
 * Elle vient du cookie, ecrit lors du changement de langue et aligne sur la
 * preference enregistree du compte a la connexion. cache() garantit une seule
 * lecture par requete HTTP, meme si la mise en page et plusieurs zones la
 * demandent chacune de leur cote.
 */
export const getLocale = cache(async (): Promise<Locale> => {
  const store = await cookies();
  return store.get(LOCALE_COOKIE)?.value === "en" ? "en" : "fr";
});

/** Traducteur pret a l'emploi dans un composant serveur. */
export const getT = cache(async (): Promise<Translator> => createTranslator(await getLocale()));

/** Etiquette de format pour les nombres et les dates. */
export const getLocaleTag = cache(async (): Promise<string> => localeTag(await getLocale()));

/** Choisit la bonne variante d'un texte du catalogue scientifique. */
export const pick = <T extends { fr: string; en: string }>(text: T, locale: Locale): string =>
  locale === "en" ? text.en : text.fr;
