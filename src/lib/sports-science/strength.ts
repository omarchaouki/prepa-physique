/**
 * Force maximale, force isometrique et ratios de prevention.
 *
 * References :
 *  - Epley B (1985), Brzycki M (1993), Wathan D (1994) : estimation du maximum
 *    a une repetition.
 *  - Opar DA, Williams MD, Shield AJ (2015) Eccentric hamstring strength and
 *    hamstring injury risk in Australian footballers. Med Sci Sports Exerc 47:857-865.
 *  - Bourne MN et al. (2018) An evidence based framework for strengthening
 *    exercises to prevent hamstring injury. Sports Medicine 48:251-267.
 *  - Esteve E et al. (2020) Adductor squeeze test and groin injuries. BJSM.
 *  - Comfort P et al. (2019) Standardization and methodological considerations
 *    for the isometric midthigh pull. Strength Cond J 41(2):57-79.
 *  - Sheppard JM, Young WB (2006) Agility literature review.
 *  - Gonzalez Badillo JJ, Sanchez Medina L (2010) Movement velocity as a measure
 *    of loading intensity in resistance training. Int J Sports Med 31:347-352.
 */

import { asymmetryIndex, linearRegression, round } from "./stats";

// ---------------------------------------------------------------------------
// MAXIMUM A UNE REPETITION
// ---------------------------------------------------------------------------

export type OneRmFormula = "epley" | "brzycki" | "lombardi" | "oconner" | "wathan";

export const estimateOneRm = (
  weightKg: number,
  reps: number,
  formula: OneRmFormula = "epley",
): number => {
  if (reps <= 1) return round(weightKg, 1);
  switch (formula) {
    case "brzycki":
      return round((weightKg * 36) / (37 - reps), 1);
    case "lombardi":
      return round(weightKg * reps ** 0.1, 1);
    case "oconner":
      return round(weightKg * (1 + 0.025 * reps), 1);
    case "wathan":
      return round((100 * weightKg) / (48.8 + 53.8 * Math.exp(-0.075 * reps)), 1);
    case "epley":
    default:
      return round(weightKg * (1 + reps / 30), 1);
  }
};

/** Moyenne des cinq formules, plus robuste qu'une estimation isolee. */
export const consensusOneRm = (weightKg: number, reps: number) => {
  const formulas: OneRmFormula[] = ["epley", "brzycki", "lombardi", "oconner", "wathan"];
  const values = formulas.map((f) => estimateOneRm(weightKg, reps, f));
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  return {
    estimate: round(avg, 1),
    spread: round(Math.max(...values) - Math.min(...values), 1),
    byFormula: Object.fromEntries(formulas.map((f, i) => [f, values[i]])),
    confidence: reps <= 5 ? "elevee" : reps <= 10 ? "moyenne" : "faible",
  };
};

/** Table de charge a partir du maximum estime, pour prescrire une seance. */
export const loadTable = (oneRmKg: number) =>
  [95, 90, 85, 80, 75, 70, 65, 60].map((pct) => ({
    percent: pct,
    loadKg: round((oneRmKg * pct) / 100, 1),
    estimatedReps:
      pct >= 95 ? 2 : pct >= 90 ? 4 : pct >= 85 ? 6 : pct >= 80 ? 8 : pct >= 75 ? 10 : pct >= 70 ? 12 : 15,
  }));

// ---------------------------------------------------------------------------
// PROFIL CHARGE VITESSE
// ---------------------------------------------------------------------------

export interface LoadVelocityPoint {
  loadKg: number;
  /** Vitesse moyenne concentrique en metres par seconde. */
  meanVelocityMs: number;
}

/**
 * Profil charge vitesse. La relation est lineaire chez le sujet entraine, ce qui
 * permet d'estimer le maximum sans jamais aller a l'echec.
 * La vitesse au maximum vaut environ 0.31 m/s au squat et 0.17 m/s au developpe couche.
 */
export const computeLoadVelocityProfile = (
  points: LoadVelocityPoint[],
  minimalVelocityThreshold = 0.31,
) => {
  if (points.length < 2) return null;
  const loads = points.map((p) => p.loadKg);
  const velocities = points.map((p) => p.meanVelocityMs);
  const { slope, intercept, r2 } = linearRegression(velocities, loads);
  const oneRm = slope * minimalVelocityThreshold + intercept;
  const v0 = slope === 0 ? 0 : -intercept / slope;

  return {
    estimatedOneRmKg: round(oneRm, 1),
    slope: round(slope, 2),
    r2: round(r2, 4),
    theoreticalV0: round(v0, 2),
    quality: r2 >= 0.95 ? "fiable" : r2 >= 0.9 ? "acceptable" : "a refaire",
    velocityForPercent: (percent: number) =>
      slope === 0 ? 0 : round(((oneRm * percent) / 100 - intercept) / slope, 2),
  };
};

// ---------------------------------------------------------------------------
// NORDIC HAMSTRING
// ---------------------------------------------------------------------------

export interface NordicInput {
  leftForceN: number;
  rightForceN: number;
  bodyMassKg: number;
}

export interface NordicResult {
  leftForceN: number;
  rightForceN: number;
  totalForceN: number;
  relativeNkg: number;
  asymmetryPct: number;
  weakerSide: "gauche" | "droite";
  riskLevel: "faible" | "modere" | "eleve";
  flags: string[];
  recommendation: string;
}

/**
 * Force excentrique des ischio jambiers au Nordic.
 * Opar et al. (2015) situent le sur risque de lesion sous 337 newtons par jambe
 * et au dela de 15% d'asymetrie.
 */
export const computeNordic = (input: NordicInput): NordicResult => {
  const total = input.leftForceN + input.rightForceN;
  const relative = round(total / input.bodyMassKg, 2);
  const asymmetryPct = asymmetryIndex(input.leftForceN, input.rightForceN);
  const weakerSide = input.leftForceN < input.rightForceN ? "gauche" : "droite";
  const weakest = Math.min(input.leftForceN, input.rightForceN);
  const flags: string[] = [];

  let riskLevel: NordicResult["riskLevel"] = "faible";
  if (weakest < 280) {
    riskLevel = "eleve";
    flags.push(
      `Force excentrique de ${weakest} N du cote ${weakerSide}, tres en dessous du seuil de 337 N associe a un risque accru de lesion des ischio jambiers.`,
    );
  } else if (weakest < 337) {
    riskLevel = "modere";
    flags.push(
      `Force excentrique de ${weakest} N du cote ${weakerSide}, sous le seuil de reference de 337 N.`,
    );
  }

  if (asymmetryPct > 15) {
    riskLevel = riskLevel === "faible" ? "modere" : "eleve";
    flags.push(
      `Asymetrie de ${asymmetryPct}% entre les deux jambes, au dessus du seuil de 15%. Cibler le cote ${weakerSide}.`,
    );
  }

  const recommendation =
    riskLevel === "eleve"
      ? "Protocole Nordic progressif obligatoire : 2 seances par semaine, 3 series de 5 repetitions, avec une serie supplementaire unilaterale du cote faible. Ajouter du soulevede terre roumain et des extensions de hanche."
      : riskLevel === "modere"
        ? "Maintenir 1 a 2 seances de Nordic par semaine avec surcharge progressive et corriger l'asymetrie par du travail unilateral."
        : "Niveau de force protecteur. Une seance hebdomadaire de maintien suffit pendant la saison.";

  return {
    leftForceN: input.leftForceN,
    rightForceN: input.rightForceN,
    totalForceN: round(total, 0),
    relativeNkg: relative,
    asymmetryPct,
    weakerSide,
    riskLevel,
    flags,
    recommendation,
  };
};

// ---------------------------------------------------------------------------
// ADDUCTEURS ET ABDUCTEURS
// ---------------------------------------------------------------------------

export interface GroinInput {
  adductionLeftN: number;
  adductionRightN: number;
  abductionLeftN?: number;
  abductionRightN?: number;
  bodyMassKg: number;
}

/**
 * Test isometrique de pression des adducteurs, reference de la prevention de la
 * pubalgie. Un rapport adducteurs sur abducteurs inferieur a 0.90 est associe a
 * une augmentation du risque de lesion inguinale.
 */
export const computeGroinStrength = (input: GroinInput) => {
  const addRelative = round(
    (input.adductionLeftN + input.adductionRightN) / 2 / input.bodyMassKg,
    2,
  );
  const addAsymmetry = asymmetryIndex(input.adductionLeftN, input.adductionRightN);
  const flags: string[] = [];

  let ratio: number | null = null;
  if (input.abductionLeftN && input.abductionRightN) {
    const addMean = (input.adductionLeftN + input.adductionRightN) / 2;
    const abdMean = (input.abductionLeftN + input.abductionRightN) / 2;
    ratio = round(addMean / abdMean, 2);
    if (ratio < 0.9) {
      flags.push(
        `Rapport adducteurs sur abducteurs a ${ratio}, sous le seuil de 0.90. Risque de douleur inguinale majore.`,
      );
    }
  }

  if (addRelative < 3.0) {
    flags.push(
      `Force relative des adducteurs a ${addRelative} N/kg, valeur basse pour un footballeur. Cible de progression : au dessus de 3.5 N/kg.`,
    );
  }
  if (addAsymmetry > 10) {
    flags.push(`Asymetrie des adducteurs de ${addAsymmetry}%, au dessus du seuil de 10%.`);
  }

  return {
    adductionRelativeNkg: addRelative,
    adductionAsymmetryPct: addAsymmetry,
    adductorAbductorRatio: ratio,
    flags,
    recommendation:
      flags.length > 0
        ? "Integrer le protocole Copenhagen Adduction, 2 seances par semaine en progression sur 8 semaines, plus du gainage lateral et du travail d'abduction."
        : "Force inguinale satisfaisante. Maintenir le Copenhagen Adduction une fois par semaine en saison.",
  };
};

// ---------------------------------------------------------------------------
// TRACTION ISOMETRIQUE A MI CUISSE
// ---------------------------------------------------------------------------

export interface ImtpInput {
  peakForceN: number;
  bodyMassKg: number;
  /** Force developpee dans les 100 premieres millisecondes, en newtons. */
  force100msN?: number;
  force200msN?: number;
  /** Force maximale au saut avec contre mouvement, pour le Dynamic Strength Index. */
  cmjPeakForceN?: number;
}

export const computeImtp = (input: ImtpInput) => {
  const relative = round(input.peakForceN / input.bodyMassKg, 2);
  const flags: string[] = [];

  // Reference footballeur professionnel : au dessus de 30 N/kg.
  if (relative < 25) {
    flags.push(
      `Force isometrique relative de ${relative} N/kg, faible pour un joueur de haut niveau. Cible : au dessus de 30 N/kg.`,
    );
  }

  const rfd100 = input.force100msN ? round(input.force100msN / 0.1, 0) : null;
  const rfd200 = input.force200msN ? round(input.force200msN / 0.2, 0) : null;

  let dsi: number | null = null;
  let dsiInterpretation: string | null = null;
  if (input.cmjPeakForceN) {
    dsi = round(input.cmjPeakForceN / input.peakForceN, 2);
    // Dynamic Strength Index (Sheppard et al. 2011) : rapport entre la force
    // exprimee en dynamique et la force maximale disponible.
    if (dsi < 0.6) {
      dsiInterpretation =
        "Le joueur possede de la force mais ne l'exprime pas vite. Prioriser la pliometrie, les mouvements balistiques et le travail a vitesse elevee.";
    } else if (dsi > 0.8) {
      dsiInterpretation =
        "Le joueur exprime presque toute sa force disponible. Le plafond est la force maximale : prioriser le travail lourd.";
    } else {
      dsiInterpretation = "Equilibre entre force maximale et capacite a l'exprimer rapidement.";
    }
  }

  return {
    peakForceN: input.peakForceN,
    relativeNkg: relative,
    rfd100msNs: rfd100,
    rfd200msNs: rfd200,
    dynamicStrengthIndex: dsi,
    dsiInterpretation,
    flags,
  };
};

// ---------------------------------------------------------------------------
// RATIOS ISCHIO JAMBIERS SUR QUADRICEPS
// ---------------------------------------------------------------------------

/**
 * Ratio conventionnel : ischio concentrique sur quadriceps concentrique, cible au dessus de 0.60.
 * Ratio fonctionnel : ischio excentrique sur quadriceps concentrique, cible au dessus de 1.00.
 */
export const computeHqRatio = (params: {
  hamstringConcentricNm?: number;
  hamstringEccentricNm?: number;
  quadricepsConcentricNm?: number;
}) => {
  const flags: string[] = [];
  let conventional: number | null = null;
  let functional: number | null = null;

  if (params.hamstringConcentricNm && params.quadricepsConcentricNm) {
    conventional = round(params.hamstringConcentricNm / params.quadricepsConcentricNm, 2);
    if (conventional < 0.6) {
      flags.push(
        `Ratio conventionnel a ${conventional}, sous la cible de 0.60. Desequilibre en faveur des quadriceps.`,
      );
    }
  }
  if (params.hamstringEccentricNm && params.quadricepsConcentricNm) {
    functional = round(params.hamstringEccentricNm / params.quadricepsConcentricNm, 2);
    if (functional < 1.0) {
      flags.push(
        `Ratio fonctionnel a ${functional}, sous la cible de 1.00. Capacite de freinage des ischio jambiers insuffisante en fin de phase pendulaire.`,
      );
    }
  }

  return { conventional, functional, flags };
};
