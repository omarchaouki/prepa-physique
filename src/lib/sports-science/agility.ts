/**
 * Changement de direction et agilite.
 *
 * References :
 *  - Nimphius S, Callaghan SJ, Bezodis NE, Lockie RG (2018) Change of direction
 *    and agility tests: challenging our current measures of performance.
 *    Strength Cond J 40(1):26-38.  (deficit de changement de direction)
 *  - Nimphius S et al. (2016) Change of direction deficit: a more isolated measure
 *    of change of direction performance. J Strength Cond Res 30(11):3024-3032.
 *  - Young WB, Dawson B, Henry GJ (2015) Agility and change of direction speed
 *    are independent skills.
 *  - Dos'Santos T et al. (2019) The effect of angle and velocity on change of
 *    direction biomechanics. Sports Medicine 48:2235-2253.
 */

import { asymmetryIndex, round } from "./stats";

export interface CodInput {
  /** Temps au test 505, jambe gauche en appui de pivot, en secondes. */
  test505LeftS?: number;
  test505RightS?: number;
  /** Temps de reference sur sprint lineaire 10 metres, en secondes. */
  sprint10mS?: number;
}

export interface CodResult {
  best505S: number | null;
  asymmetryPct: number | null;
  slowerSide: "gauche" | "droite" | null;
  /** Deficit de changement de direction : temps 505 moins temps sur 10 metres. */
  codDeficitLeftS: number | null;
  codDeficitRightS: number | null;
  codDeficitAsymmetryPct: number | null;
  category: string | null;
  flags: string[];
  recommendation: string;
}

/**
 * Le deficit de changement de direction isole la qualite de reorientation en
 * neutralisant la vitesse lineaire du joueur. Deux joueurs avec le meme temps
 * au 505 peuvent avoir des besoins opposes selon leur vitesse de base.
 */
export const computeChangeOfDirection = (input: CodInput): CodResult => {
  const flags: string[] = [];
  const left = input.test505LeftS ?? null;
  const right = input.test505RightS ?? null;
  const best = left != null && right != null ? Math.min(left, right) : (left ?? right);

  let asymmetryPct: number | null = null;
  let slowerSide: CodResult["slowerSide"] = null;
  if (left != null && right != null) {
    asymmetryPct = asymmetryIndex(left, right);
    slowerSide = left > right ? "gauche" : "droite";
    if (asymmetryPct > 10) {
      flags.push(
        `Asymetrie de ${asymmetryPct}% au test 505, le cote ${slowerSide} est plus lent. Un ecart superieur a 10% justifie un travail unilateral cible.`,
      );
    }
  }

  let codDeficitLeftS: number | null = null;
  let codDeficitRightS: number | null = null;
  let codDeficitAsymmetryPct: number | null = null;

  if (input.sprint10mS) {
    if (left != null) codDeficitLeftS = round(left - input.sprint10mS, 3);
    if (right != null) codDeficitRightS = round(right - input.sprint10mS, 3);
    if (codDeficitLeftS != null && codDeficitRightS != null) {
      codDeficitAsymmetryPct = asymmetryIndex(codDeficitLeftS, codDeficitRightS);
      if (codDeficitAsymmetryPct > 15) {
        flags.push(
          `Asymetrie du deficit de changement de direction de ${codDeficitAsymmetryPct}%. La capacite de freinage et de reorientation differe nettement entre les deux appuis.`,
        );
      }
    }
    const worstDeficit = Math.max(codDeficitLeftS ?? 0, codDeficitRightS ?? 0);
    if (worstDeficit > 0.9) {
      flags.push(
        `Deficit de changement de direction de ${round(worstDeficit, 2)} seconde. Le joueur est rapide en ligne mais perd beaucoup dans le demi tour : travailler le freinage excentrique et la technique de repositionnement.`,
      );
    }
  }

  let category: string | null = null;
  if (best != null) {
    if (best < 2.3) category = "Elite";
    else if (best < 2.45) category = "Tres bon";
    else if (best < 2.6) category = "Bon";
    else if (best < 2.8) category = "Moyen";
    else category = "Insuffisant";
  }

  const recommendation =
    flags.length === 0
      ? "Profil de changement de direction equilibre. Maintenir par des exercices d'agilite reactive integres a l'echauffement."
      : "Programmer un bloc de 4 a 6 semaines : freinage excentrique unilateral (fentes sautees avec arret, decelerations sur 10 metres), renforcement du moyen fessier, et technique de pose d'appui a 45 et 90 degres.";

  return {
    best505S: best != null ? round(best, 3) : null,
    asymmetryPct,
    slowerSide,
    codDeficitLeftS,
    codDeficitRightS,
    codDeficitAsymmetryPct,
    category,
    flags,
    recommendation,
  };
};

/** Test Illinois : reperes chez le footballeur masculin adulte. */
export const classifyIllinois = (timeS: number, sex: "M" | "F" = "M") => {
  const bands =
    sex === "M"
      ? [15.2, 16.1, 18.1, 18.3]
      : [17.0, 17.9, 21.7, 23.0];
  let category: string;
  if (timeS < bands[0]) category = "Elite";
  else if (timeS < bands[1]) category = "Tres bon";
  else if (timeS < bands[2]) category = "Moyen";
  else if (timeS < bands[3]) category = "Faible";
  else category = "Insuffisant";
  return { timeS: round(timeS, 2), category };
};

/** Test en T : reperes chez le sportif de sport collectif. */
export const classifyTTest = (timeS: number, sex: "M" | "F" = "M") => {
  const bands = sex === "M" ? [9.5, 10.5, 11.5] : [10.5, 11.5, 12.5];
  let category: string;
  if (timeS < bands[0]) category = "Excellent";
  else if (timeS < bands[1]) category = "Bon";
  else if (timeS < bands[2]) category = "Moyen";
  else category = "Insuffisant";
  return { timeS: round(timeS, 2), category };
};

/**
 * Agilite reactive : difference entre un parcours planifie et le meme parcours
 * declenche par un stimulus. L'ecart traduit la composante perceptivo decisionnelle.
 */
export const reactiveAgilityIndex = (plannedTimeS: number, reactiveTimeS: number) => {
  const deficitS = round(reactiveTimeS - plannedTimeS, 3);
  const deficitPct = round((deficitS / plannedTimeS) * 100, 1);
  return {
    deficitS,
    deficitPct,
    interpretation:
      deficitPct > 12
        ? "Ecart important entre parcours planifie et parcours reactif. Le facteur limitant est la prise d'information, pas la qualite physique. Travailler avec stimulus visuel et opposition."
        : "Ecart faible, la composante perceptive est bien maitrisee. Le travail physique de changement de direction reste pertinent.",
  };
};
