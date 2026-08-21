import { createHash } from "node:crypto";

/**
 * Normalisation des donnees envoyees a l'API Conversions de Meta.
 *
 * Separe de capi.ts, qui porte `server-only` parce qu'il lit le jeton d'acces.
 * Ces fonctions ci ne touchent ni la base ni aucun secret : ce sont des
 * transformations pures, et les enfermer derriere `server-only` les rendait
 * intestables, `scripts/verify-capi.ts` ne pouvant plus les importer.
 *
 * Elles meritent d'etre verifiees, parce que l'erreur qu'elles peuvent
 * introduire ne se voit nulle part. Meta accepte n'importe quelle empreinte
 * SHA 256 : elle est bien formee, la reponse est un succes, l'evenement
 * apparait dans le gestionnaire. Simplement, elle ne correspond a personne.
 * L'appariement tombe, le cout par prospect monte, et aucun message n'explique
 * pourquoi.
 */

/**
 * Indicatifs telephoniques, pour les pays d'ou viennent reellement les
 * inscriptions.
 *
 * Meta apparie un numero sur son format international. Un numero marocain
 * saisi « 0674679965 » ne correspond a rien tant qu'il n'est pas devenu
 * « 212674679965 ». Un pays absent de cette table n'empeche pas l'envoi de
 * l'evenement : le numero est simplement omis, ce qui vaut mieux qu'une
 * empreinte fausse, laquelle degraderait l'appariement au lieu de l'aider.
 */
export const DIAL_CODES: Record<string, string> = {
  MA: "212", DZ: "213", TN: "216", FR: "33", BE: "32", CH: "41",
  ES: "34", PT: "351", IT: "39", DE: "49", NL: "31", GB: "44",
  CA: "1", US: "1", SN: "221", CI: "225", CM: "237", ML: "223",
  SA: "966", AE: "971", QA: "974", KW: "965", EG: "20",
};

/** Empreinte SHA 256 en hexadecimal minuscule, telle que Meta l'attend. */
export const hash = (value: string): string =>
  createHash("sha256").update(value, "utf8").digest("hex");

/**
 * Normalise puis hache une adresse electronique.
 * Meta impose la minuscule et le retrait des espaces avant le hachage.
 */
export const hashEmail = (email: string): string | null => {
  const clean = email.trim().toLowerCase();
  return clean.includes("@") ? hash(clean) : null;
};

/**
 * Normalise puis hache un numero de telephone.
 *
 * Trois cas, dans cet ordre : deja international, national avec zero initial,
 * ou inexploitable. Le dernier renvoie `null` plutot qu'une approximation.
 */
export const hashPhone = (phone: string, country: string | null): string | null => {
  const raw = phone.trim();
  if (!raw) return null;

  const digits = raw.replace(/[^0-9]/gu, "");
  if (!digits) return null;

  // Deja international : le visiteur a tape un plus ou un double zero.
  if (raw.startsWith("+") || raw.startsWith("00")) {
    const international = digits.replace(/^00/u, "");
    return international.length >= 8 ? hash(international) : null;
  }

  const dial = country ? DIAL_CODES[country.toUpperCase()] : undefined;
  if (!dial) return null;

  // Le zero initial est une convention nationale : il disparait a l'international.
  const national = digits.replace(/^0+/u, "");
  return national.length >= 6 ? hash(`${dial}${national}`) : null;
};
