/**
 * Anthropometrie, composition corporelle et maturation biologique.
 *
 * References :
 *  - Durnin JVGA, Womersley J (1974) Body fat assessed from total body density
 *    and its estimation from skinfold thickness. Br J Nutr 32:77-97.
 *  - Jackson AS, Pollock ML (1978) Generalized equations for predicting body
 *    density of men. Br J Nutr 40:497-504.
 *  - Siri WE (1961) Body composition from fluid spaces and density.
 *  - Mirwald RL, Baxter-Jones ADG, Bailey DA, Beunen GP (2002) An assessment of
 *    maturity from anthropometric measurements. Med Sci Sports Exerc 34:689-694.
 *  - Fransen J et al. (2018) Improving the prediction of maturity from
 *    anthropometric variables using a maturity ratio. Pediatr Exerc Sci 30:296-307.
 *  - Tanner JM (1989) Foetus into man.  (taille adulte a partir des parents)
 *  - Lloyd RS, Oliver JL (2012) The Youth Physical Development Model.
 */

import { round } from "./stats";

export const bmi = (weightKg: number, heightCm: number): number =>
  heightCm === 0 ? 0 : round(weightKg / (heightCm / 100) ** 2, 1);

/** Conversion densite corporelle en pourcentage de masse grasse (Siri 1961). */
export const siriBodyFat = (bodyDensity: number): number =>
  round(495 / bodyDensity - 450, 1);

export interface DurninSkinfolds {
  biceps: number;
  triceps: number;
  subscapular: number;
  suprailiac: number;
}

/**
 * Durnin et Womersley : quatre plis cutanes, coefficients specifiques par sexe
 * et par tranche d'age. Methode robuste et rapide, adaptee au terrain.
 */
export const durninWomersley = (
  skinfolds: DurninSkinfolds,
  ageYears: number,
  sex: "M" | "F",
): { bodyDensity: number; bodyFatPct: number; sumMm: number } => {
  const sum =
    skinfolds.biceps + skinfolds.triceps + skinfolds.subscapular + skinfolds.suprailiac;
  const log = Math.log10(sum);

  const table: Record<"M" | "F", Array<{ max: number; c: number; m: number }>> = {
    M: [
      { max: 19, c: 1.162, m: 0.063 },
      { max: 29, c: 1.1631, m: 0.0632 },
      { max: 39, c: 1.1422, m: 0.0544 },
      { max: 49, c: 1.162, m: 0.07 },
      { max: 200, c: 1.1715, m: 0.0779 },
    ],
    F: [
      { max: 19, c: 1.1549, m: 0.0678 },
      { max: 29, c: 1.1599, m: 0.0717 },
      { max: 39, c: 1.1423, m: 0.0632 },
      { max: 49, c: 1.1333, m: 0.0612 },
      { max: 200, c: 1.1339, m: 0.0645 },
    ],
  };

  const row = table[sex].find((r) => ageYears <= r.max) ?? table[sex][table[sex].length - 1];
  const bodyDensity = row.c - row.m * log;

  return {
    bodyDensity: round(bodyDensity, 4),
    bodyFatPct: siriBodyFat(bodyDensity),
    sumMm: round(sum, 1),
  };
};

export interface JacksonPollock7 {
  chest: number;
  midaxillary: number;
  triceps: number;
  subscapular: number;
  abdominal: number;
  suprailiac: number;
  thigh: number;
}

/** Jackson et Pollock a sept sites, reference chez le sportif masculin. */
export const jacksonPollock7 = (
  skinfolds: JacksonPollock7,
  ageYears: number,
  sex: "M" | "F",
) => {
  const sum = Object.values(skinfolds).reduce((a, b) => a + b, 0);
  const bodyDensity =
    sex === "M"
      ? 1.112 - 0.00043499 * sum + 0.00000055 * sum ** 2 - 0.00028826 * ageYears
      : 1.097 - 0.00046971 * sum + 0.00000056 * sum ** 2 - 0.00012828 * ageYears;
  return {
    bodyDensity: round(bodyDensity, 4),
    bodyFatPct: siriBodyFat(bodyDensity),
    sumMm: round(sum, 1),
  };
};

export const bodyComposition = (weightKg: number, bodyFatPct: number) => {
  const fatMassKg = round((weightKg * bodyFatPct) / 100, 1);
  return {
    fatMassKg,
    leanMassKg: round(weightKg - fatMassKg, 1),
    /** Indice de masse maigre, plus pertinent que l'indice de masse corporelle chez le sportif. */
    fatFreeMassIndex: (heightCm: number) =>
      round((weightKg - fatMassKg) / (heightCm / 100) ** 2, 1),
  };
};

// ---------------------------------------------------------------------------
// MATURATION BIOLOGIQUE
// ---------------------------------------------------------------------------

export interface MaturityInput {
  ageYears: number;
  heightCm: number;
  sittingHeightCm: number;
  weightKg: number;
  sex: "M" | "F";
  motherHeightCm?: number;
  fatherHeightCm?: number;
}

export interface MaturityResult {
  /** Ecart en annees par rapport au pic de croissance. Negatif avant le pic. */
  maturityOffsetYears: number;
  /** Age au pic de vitesse de croissance. */
  aphvYears: number;
  legLengthCm: number;
  status: "pre pic" | "autour du pic" | "post pic";
  /** Taille adulte predite, si les tailles parentales sont renseignees. */
  predictedAdultHeightCm: number | null;
  pctAdultHeight: number | null;
  /** Categorie de maturite basee sur le pourcentage de taille adulte atteint. */
  maturityBand: string | null;
  trainingGuidance: string;
  flags: string[];
}

/**
 * Equations de Mirwald et al. (2002). L'ecart de maturite est exprime en annees
 * avant ou apres le pic de vitesse de croissance staturale.
 * Elles restent les plus utilisees sur le terrain, avec une precision de plus ou
 * moins un an, meilleure quand le sujet est proche du pic.
 */
export const computeMaturity = (input: MaturityInput): MaturityResult => {
  const legLength = input.heightCm - input.sittingHeightCm;
  const a = input.ageYears;
  const flags: string[] = [];

  const maturityOffset =
    input.sex === "M"
      ? -9.236 +
        0.0002708 * legLength * input.sittingHeightCm +
        -0.001663 * a * legLength +
        0.007216 * a * input.sittingHeightCm +
        0.02292 * ((input.weightKg / input.heightCm) * 100)
      : -9.376 +
        0.0001882 * legLength * input.sittingHeightCm +
        0.0022 * a * legLength +
        0.005841 * a * input.sittingHeightCm +
        -0.002658 * a * input.weightKg +
        0.07693 * ((input.weightKg / input.heightCm) * 100);

  const aphv = a - maturityOffset;

  let status: MaturityResult["status"];
  if (maturityOffset < -0.5) status = "pre pic";
  else if (maturityOffset <= 0.5) status = "autour du pic";
  else status = "post pic";

  let predictedAdultHeightCm: number | null = null;
  let pctAdultHeight: number | null = null;
  let maturityBand: string | null = null;

  if (input.motherHeightCm && input.fatherHeightCm) {
    // Taille cible parentale (Tanner), ajustee du dimorphisme sexuel de 13 centimetres.
    predictedAdultHeightCm =
      input.sex === "M"
        ? round((input.motherHeightCm + 13 + input.fatherHeightCm) / 2, 1)
        : round((input.motherHeightCm + input.fatherHeightCm - 13) / 2, 1);
    pctAdultHeight = round((input.heightCm / predictedAdultHeightCm) * 100, 1);

    if (pctAdultHeight < 88) maturityBand = "Maturation precoce a venir (pre pubertaire)";
    else if (pctAdultHeight < 95) maturityBand = "Phase de croissance rapide (circa pic)";
    else maturityBand = "Croissance quasi achevee (post pubertaire)";
  }

  let trainingGuidance: string;
  if (status === "pre pic") {
    trainingGuidance =
      "Phase pre pic : privilegier la coordination, la technique de course, la pliometrie de faible intensite et la force au poids de corps. Le developpement de la vitesse gestuelle est prioritaire.";
  } else if (status === "autour du pic") {
    trainingGuidance =
      "Phase de croissance rapide : la coordination se degrade temporairement et le risque de lesion d'apophyse augmente. Reduire le volume de sauts et de sprints maximaux, maintenir la mobilite, surveiller les douleurs au genou et au talon.";
    flags.push(
      "Joueur autour du pic de croissance. Surveiller mensuellement la taille et adapter la charge de sauts et de sprints.",
    );
  } else {
    trainingGuidance =
      "Phase post pic : fenetre favorable au developpement de la force maximale et de la puissance. Introduire progressivement les charges lourdes avec une technique maitrisee.";
  }

  return {
    maturityOffsetYears: round(maturityOffset, 2),
    aphvYears: round(aphv, 2),
    legLengthCm: round(legLength, 1),
    status,
    predictedAdultHeightCm,
    pctAdultHeight,
    maturityBand,
    trainingGuidance,
    flags,
  };
};

/**
 * Vitesse de croissance staturale entre deux mesures. Une valeur superieure a
 * 7 centimetres par an chez le garcon signale une poussee de croissance et impose
 * une reduction du volume a haute contrainte mecanique.
 */
export const growthVelocity = (
  previous: { heightCm: number; date: Date },
  current: { heightCm: number; date: Date },
) => {
  const days = (current.date.getTime() - previous.date.getTime()) / 86_400_000;
  if (days <= 0) return null;
  const cmPerYear = round(((current.heightCm - previous.heightCm) / days) * 365.25, 1);
  return {
    cmPerYear,
    isPeakGrowth: cmPerYear >= 7,
    message:
      cmPerYear >= 9
        ? "Poussee de croissance tres marquee. Reduire fortement le volume de sauts, de sprints maximaux et de charges axiales pendant au moins six semaines."
        : cmPerYear >= 7
          ? "Poussee de croissance en cours. Adapter le volume a haute contrainte et renforcer le travail de mobilite et de gainage."
          : "Vitesse de croissance normale pour la periode.",
  };
};

/**
 * Difference entre l'age chronologique et l'age relatif dans l'annee de naissance.
 * L'effet de l'age relatif reste un biais majeur de selection en formation.
 */
export const relativeAgeQuarter = (birthDate: Date, cutoffMonth = 1): number => {
  const month = birthDate.getMonth() + 1;
  const shifted = (month - cutoffMonth + 12) % 12;
  return Math.floor(shifted / 3) + 1;
};

export const ageInYears = (birthDate: Date, at: Date = new Date()): number =>
  round((at.getTime() - birthDate.getTime()) / (365.25 * 86_400_000), 2);
