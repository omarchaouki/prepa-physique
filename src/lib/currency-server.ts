import { cache } from "react";
import { cookies } from "next/headers";

import { CURRENCY_COOKIE } from "@/lib/constants";
import { CURRENCIES, defaultCurrency, type Currency } from "@/lib/marketing";
import { getLocale } from "@/lib/i18n/server";

/**
 * Devise d'affichage de la requete en cours.
 *
 * Le choix explicite du visiteur prime. A defaut, la devise suit la langue :
 * un visiteur francophone voit des dirhams, un anglophone des euros. Ce n'est
 * pas une regle universelle, c'est celle qui correspond au marche vise, et le
 * selecteur reste visible pour la corriger en un geste.
 *
 * Volontairement separe de src/lib/marketing.ts : ce fichier lit les cookies,
 * donc il ne peut vivre que sur le serveur, alors que marketing.ts est importe
 * par des composants clients.
 */
export const getCurrency = cache(async (): Promise<Currency> => {
  const store = await cookies();
  const chosen = store.get(CURRENCY_COOKIE)?.value;
  if (chosen && (CURRENCIES as readonly string[]).includes(chosen)) return chosen as Currency;
  return defaultCurrency(await getLocale());
});
