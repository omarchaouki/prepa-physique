import { cache } from "react";
import { headers } from "next/headers";

/**
 * D'ou vient le visiteur, pour savoir s'il faut lui demander son consentement.
 *
 * ---------------------------------------------------------------------------
 * Pourquoi ce n'est pas la meme regle pour tout le monde
 * ---------------------------------------------------------------------------
 *
 * Le pixel publicitaire et l'enregistrement de session deposent des cookies non
 * necessaires. En Europe ils exigent un consentement prealable ; au Maroc, ou
 * se trouve l'essentiel de la clientele visee, la loi 09-08 impose une
 * information et un droit d'opposition, pas un consentement bloquant.
 *
 * Poser la meme banniere partout ferait perdre entre un tiers et la moitie des
 * conversions remontees a Meta, donc degraderait l'optimisation de toute la
 * campagne, pour se conformer a un texte qui ne s'applique pas au visiteur.
 * Ne la poser nulle part exposerait a une sanction des le premier visiteur
 * europeen. On distingue donc.
 *
 * ---------------------------------------------------------------------------
 * Ce que cette detection vaut, et ce qu'elle ne vaut pas
 * ---------------------------------------------------------------------------
 *
 * Elle lit l'entete de pays pose par le reseau de diffusion, quand il y en a
 * un. L'installation actuelle est un Caddy devant un conteneur, sans service de
 * geolocalisation : l'entete sera donc souvent absent, et la reponse sera
 * `unknown`. C'est prevu, et ce n'est pas un echec : le navigateur tranche
 * alors depuis son fuseau horaire, ce qu'il est le seul a connaitre avec
 * certitude. Voir components/tracking/consent.tsx.
 *
 * Le doute profite toujours au visiteur : `unknown` traite par defaut comme
 * europeen si le fuseau ne dit pas le contraire.
 */

export type Region = "eea" | "other" | "unknown";

/**
 * Espace economique europeen, plus le Royaume Uni et la Suisse.
 *
 * Le Royaume Uni a quitte l'Union mais a repris le reglement dans son droit
 * interne, et la Suisse s'en est rapprochee avec sa loi revisee de 2023. Du
 * point de vue de ce qui nous interesse ici, les trois blocs se traitent
 * pareil.
 */
export const CONSENT_COUNTRIES = new Set([
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR",
  "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK",
  "SI", "ES", "SE",
  "IS", "LI", "NO",
  "GB", "CH",
]);

/**
 * Entetes de pays connus, dans l'ordre ou on les interroge.
 *
 * Aucun n'est present aujourd'hui sur l'installation de production. Ils sont
 * listes pour que passer derriere Cloudflare ou deployer sur Vercel un jour
 * suffise a rendre la detection exacte, sans toucher a ce fichier.
 */
const COUNTRY_HEADERS = [
  "cf-ipcountry",
  "x-vercel-ip-country",
  "x-geo-country",
  "x-country-code",
  "fastly-client-country",
];

export const getRegion = cache(async (): Promise<Region> => {
  const requestHeaders = await headers();

  for (const name of COUNTRY_HEADERS) {
    const value = requestHeaders.get(name)?.trim().toUpperCase();
    // Cloudflare renvoie XX pour une adresse qu'il n'a pas su situer, et T1
    // pour le reseau Tor. Ni l'un ni l'autre ne repond a la question.
    if (!value || value.length !== 2 || value === "XX" || value === "T1") continue;
    return CONSENT_COUNTRIES.has(value) ? "eea" : "other";
  }

  return "unknown";
});
