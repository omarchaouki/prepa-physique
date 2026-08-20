"use server";

import { cookies } from "next/headers";

import { LOCALE_COOKIE } from "@/lib/constants";
import { MARKETING_LOCALES, type MarketingLocale } from "@/lib/i18n/marketing";

/**
 * Choix de langue sur la page publicitaire.
 *
 * Volontairement distinct de `setLocaleAction`, qui ecrit aussi la preference
 * dans le profil de l'utilisateur connecte. Ici le visiteur n'a pas de compte,
 * et surtout la colonne `locale` de la base ne connait que deux valeurs : y
 * ecrire « ar » donnerait un profil dont l'application ne saurait rien faire.
 *
 * Le cookie est en revanche le meme. Un visiteur qui choisit l'arabe ici et
 * ouvre ensuite l'application la verra en francais, puisque `getLocale` ne
 * reconnait pas cette valeur et retombe sur son repli. C'est le comportement
 * voulu tant que l'application n'est pas traduite.
 */
export async function setMarketingLocaleAction(locale: MarketingLocale) {
  if (!MARKETING_LOCALES.includes(locale)) return;
  const store = await cookies();
  store.set(LOCALE_COOKIE, locale, { path: "/", maxAge: 60 * 60 * 24 * 365 });
}
