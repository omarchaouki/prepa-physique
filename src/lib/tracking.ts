import { cache } from "react";

import { prisma } from "@/lib/db";

/**
 * Identifiants des outils de mesure d'audience.
 *
 * ---------------------------------------------------------------------------
 * Pourquoi en base et non dans l'environnement
 * ---------------------------------------------------------------------------
 *
 * Un pixel se change en pleine campagne. Meta invalide un compte publicitaire,
 * on en ouvre un autre, et il faut que la page se remette a mesurer dans la
 * minute. Passer par une variable d'environnement imposerait un redeploiement,
 * donc une compilation de cinq minutes sur une instance de 911 Mo, pour changer
 * seize chiffres.
 *
 * La table `Setting` existe pour exactement ce genre de valeur : globale,
 * modifiable par le proprietaire, sans consequence sur le schema.
 *
 * ---------------------------------------------------------------------------
 * Pourquoi une lecture qui n'echoue jamais
 * ---------------------------------------------------------------------------
 *
 * Cette lecture est faite par la mise en page racine, donc par toutes les pages
 * du site, page publique comprise. Une base injoignable ne doit pas rendre le
 * site blanc pour une raison aussi accessoire qu'un pixel publicitaire : en cas
 * d'erreur on renvoie des valeurs vides, la page s'affiche, et on ne mesure
 * simplement rien pendant l'incident.
 */

export const TRACKING_KEYS = {
  facebookPixelId: "tracking.facebookPixelId",
  clarityProjectId: "tracking.clarityProjectId",
} as const;

export interface TrackingSettings {
  /** Identifiant du pixel Meta, quinze ou seize chiffres. */
  facebookPixelId: string | null;
  /** Identifiant de projet Microsoft Clarity, dix caracteres alphanumeriques. */
  clarityProjectId: string | null;
}

const EMPTY: TrackingSettings = { facebookPixelId: null, clarityProjectId: null };

const envValue = (name: string): string | null => process.env[name]?.trim() || null;

/**
 * Formats acceptes.
 *
 * Le controle est volontairement strict : ces valeurs sont injectees dans un
 * script de la page. Un identifiant reduit a des chiffres ou a des lettres ne
 * peut porter ni guillemet ni balise, ce qui ferme la porte a une injection par
 * le formulaire du panneau proprietaire.
 */
export const PIXEL_PATTERN = /^\d{15,16}$/;
export const CLARITY_PATTERN = /^[a-z0-9]{8,12}$/;

export const isPixelId = (value: string): boolean => PIXEL_PATTERN.test(value);
export const isClarityId = (value: string): boolean => CLARITY_PATTERN.test(value);

/**
 * Reglages de mesure de la requete en cours.
 *
 * cache() garantit une seule requete par rendu, meme si la mise en page et une
 * page les demandent chacune de leur cote.
 */
export const getTracking = cache(async (): Promise<TrackingSettings> => {
  try {
    const rows = await prisma.setting.findMany({
      where: { key: { in: [TRACKING_KEYS.facebookPixelId, TRACKING_KEYS.clarityProjectId] } },
    });

    const read = (key: string): string | null => {
      const value = rows.find((row) => row.key === key)?.value.trim();
      return value ? value : null;
    };

    // L'environnement sert de valeur par defaut, la base a le dernier mot. Cela
    // permet de livrer une instance deja mesuree sans passer par le panneau,
    // tout en laissant le proprietaire changer d'identifiant sans redeployer.
    const pixel = read(TRACKING_KEYS.facebookPixelId) ?? envValue("FACEBOOK_PIXEL_ID");
    const clarity = read(TRACKING_KEYS.clarityProjectId) ?? envValue("CLARITY_PROJECT_ID");

    // Une valeur mal formee en base, ecrite avant ce controle ou a la main, est
    // ignoree plutot que servie : mieux vaut ne pas mesurer que casser la page.
    return {
      facebookPixelId: pixel && isPixelId(pixel) ? pixel : null,
      clarityProjectId: clarity && isClarityId(clarity.toLowerCase()) ? clarity.toLowerCase() : null,
    };
  } catch {
    return EMPTY;
  }
});
