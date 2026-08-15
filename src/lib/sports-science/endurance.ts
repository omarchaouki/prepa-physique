/**
 * Capacites aerobies, intermittentes et de sprints repetes.
 *
 * References :
 *  - Bangsbo J, Iaia FM, Krustrup P (2008) The Yo-Yo intermittent recovery test.
 *    Sports Medicine 38(1):37-51.
 *  - Buchheit M (2008) The 30-15 Intermittent Fitness Test: accuracy for
 *    individualizing interval training. J Strength Cond Res 22(2):365-374.
 *  - Buchheit M, Laursen PB (2013) High intensity interval training, solutions to
 *    the programming puzzle. Sports Medicine 43:313-338 et 927-954.
 *  - Leger L, Boucher R (1980) An indirect continuous running multistage field test.
 *  - Impellizzeri FM et al. (2008) Validity of a repeated sprint ability test.
 *  - Bangsbo J (1994) The physiology of soccer, with special reference to intense
 *    intermittent exercise.
 */

import { round } from "./stats";

// ---------------------------------------------------------------------------
// YO-YO INTERMITTENT RECOVERY
// ---------------------------------------------------------------------------

export type YoYoLevel = "IR1" | "IR2";

export interface YoYoResult {
  distanceM: number;
  vo2maxMlKgMin: number;
  level: YoYoLevel;
  category: string;
  interpretation: string;
}

/**
 * Yo-Yo IR1 : VO2max = distance x 0.0084 + 36.4
 * Yo-Yo IR2 : VO2max = distance x 0.0136 + 45.3
 * Equations publiees par Bangsbo et al. (2008).
 */
export const computeYoYo = (distanceM: number, level: YoYoLevel = "IR1"): YoYoResult => {
  const vo2max =
    level === "IR1" ? distanceM * 0.0084 + 36.4 : distanceM * 0.0136 + 45.3;

  // Reperes de terrain chez le footballeur masculin adulte, niveau professionnel.
  const thresholds =
    level === "IR1"
      ? { low: 1400, mid: 1900, high: 2400, elite: 2800 }
      : { low: 480, mid: 720, high: 960, elite: 1200 };

  let category: string;
  let interpretation: string;
  if (distanceM < thresholds.low) {
    category = "Insuffisant";
    interpretation =
      "Capacite de recuperation entre efforts intenses tres limitee. Prioriser un bloc de developpement aerobie avant tout travail intermittent severe.";
  } else if (distanceM < thresholds.mid) {
    category = "Moyen";
    interpretation =
      "Base aerobie a consolider. Deux seances hebdomadaires de courses intermittentes courtes, type 15 secondes effort et 15 secondes recuperation.";
  } else if (distanceM < thresholds.high) {
    category = "Bon";
    interpretation =
      "Niveau compatible avec les exigences du match. Maintenir par des jeux reduits a forte sollicitation et un rappel intermittent hebdomadaire.";
  } else if (distanceM < thresholds.elite) {
    category = "Tres bon";
    interpretation =
      "Excellente capacite intermittente. Le maintien suffit, orienter le temps disponible vers la vitesse et la force.";
  } else {
    category = "Elite";
    interpretation =
      "Valeur de reference internationale. Attention a ne pas sur solliciter le systeme aerobie au detriment des qualites neuromusculaires.";
  }

  return {
    distanceM,
    vo2maxMlKgMin: round(vo2max, 1),
    level,
    category,
    interpretation,
  };
};

// ---------------------------------------------------------------------------
// 30-15 INTERMITTENT FITNESS TEST
// ---------------------------------------------------------------------------

export interface Ift3015Input {
  /** Derniere palier complete, en kilometres par heure. */
  viftKmh: number;
  ageYears: number;
  bodyMassKg: number;
  sex: "M" | "F";
}

export interface Ift3015Result {
  viftKmh: number;
  vo2maxMlKgMin: number;
  /** Vitesses de prescription derivees de la VIFT. */
  prescriptions: Array<{ label: string; speedKmh: number; detail: string }>;
  category: string;
}

/**
 * Equation de Buchheit (2008) :
 * VO2max = 28.3 moins 2.15 x G moins 0.741 x A moins 0.0357 x W
 *          + 0.0586 x A x VIFT + 1.03 x VIFT
 * avec G = 1 pour les hommes et 2 pour les femmes, A l'age, W la masse corporelle.
 */
export const compute3015Ift = (input: Ift3015Input): Ift3015Result => {
  const g = input.sex === "M" ? 1 : 2;
  const vo2max =
    28.3 -
    2.15 * g -
    0.741 * input.ageYears -
    0.0357 * input.bodyMassKg +
    0.0586 * input.ageYears * input.viftKmh +
    1.03 * input.viftKmh;

  const v = input.viftKmh;
  const prescriptions = [
    {
      label: "Intermittent long 30 s / 30 s",
      speedKmh: round(v * 0.86, 1),
      detail: "86% de la VIFT. Serie de 8 a 12 minutes, developpement de la capacite aerobie.",
    },
    {
      label: "Intermittent court 15 s / 15 s",
      speedKmh: round(v * 0.95, 1),
      detail: "95% de la VIFT. Deux a trois series de 6 a 8 minutes, puissance aerobie.",
    },
    {
      label: "Intermittent court 10 s / 20 s",
      speedKmh: round(v * 1.05, 1),
      detail: "105% de la VIFT. Sollicitation supra maximale bien toleree grace au ratio de recuperation.",
    },
    {
      label: "Repetition longue 4 min",
      speedKmh: round(v * 0.78, 1),
      detail: "78% de la VIFT. Blocs continus pour construire la base en debut de preparation.",
    },
  ];

  let category: string;
  if (v < 17) category = "Insuffisant";
  else if (v < 19) category = "Moyen";
  else if (v < 20.5) category = "Bon";
  else if (v < 22) category = "Tres bon";
  else category = "Elite";

  return {
    viftKmh: v,
    vo2maxMlKgMin: round(vo2max, 1),
    prescriptions,
    category,
  };
};

// ---------------------------------------------------------------------------
// VITESSE AEROBIE MAXIMALE
// ---------------------------------------------------------------------------

export interface MasResult {
  masKmh: number;
  masMs: number;
  vo2maxMlKgMin: number;
  /** Distance parcourue en six minutes a la VMA, repere de terrain classique. */
  distance6minM: number;
  paces: Array<{ label: string; speedKmh: number; detail: string }>;
}

/**
 * Vitesse aerobie maximale issue d'un test progressif type VAMEVAL ou Leger Boucher.
 * L'equivalent metabolique retenu est de 3.5 millilitres par kilogramme et par minute
 * pour chaque kilometre par heure.
 */
export const computeMas = (masKmh: number): MasResult => ({
  masKmh: round(masKmh, 1),
  masMs: round(masKmh / 3.6, 2),
  vo2maxMlKgMin: round(masKmh * 3.5, 1),
  distance6minM: round((masKmh * 1000 * 6) / 60, 0),
  paces: [
    {
      label: "Endurance fondamentale",
      speedKmh: round(masKmh * 0.65, 1),
      detail: "65% de la VMA. Recuperation active et volume de base.",
    },
    {
      label: "Seuil",
      speedKmh: round(masKmh * 0.85, 1),
      detail: "85% de la VMA. Blocs de 8 a 20 minutes.",
    },
    {
      label: "Puissance aerobie",
      speedKmh: round(masKmh, 1),
      detail: "100% de la VMA. Fractionne 30 secondes effort et 30 secondes recuperation.",
    },
    {
      label: "Supra maximal",
      speedKmh: round(masKmh * 1.2, 1),
      detail: "120% de la VMA. Repetitions de 15 a 30 secondes avec recuperation longue.",
    },
  ],
});

// ---------------------------------------------------------------------------
// BRONCO
// ---------------------------------------------------------------------------

/**
 * Test Bronco : cinq series de navettes 20, 40 puis 60 metres, soit 1200 metres.
 * Tres utilise en rugby et de plus en plus en football pour la capacite intermittente.
 */
export const computeBronco = (totalTimeS: number) => {
  const minutes = Math.floor(totalTimeS / 60);
  const seconds = round(totalTimeS % 60, 1);
  let category: string;
  if (totalTimeS < 270) category = "Elite";
  else if (totalTimeS < 300) category = "Tres bon";
  else if (totalTimeS < 330) category = "Bon";
  else if (totalTimeS < 360) category = "Moyen";
  else category = "Insuffisant";

  return {
    totalTimeS: round(totalTimeS, 1),
    display: `${minutes} min ${seconds.toString().padStart(4, "0")} s`,
    averageSpeedKmh: round((1200 / totalTimeS) * 3.6, 2),
    category,
  };
};

// ---------------------------------------------------------------------------
// SPRINTS REPETES
// ---------------------------------------------------------------------------

export interface RsaInput {
  /** Temps de chaque repetition, en secondes. */
  times: number[];
  /** Meilleur temps du joueur sur la meme distance en sprint isole, si disponible. */
  bestSingleSprintS?: number;
}

export interface RsaResult {
  bestTimeS: number;
  meanTimeS: number;
  totalTimeS: number;
  worstTimeS: number;
  /** Pourcentage de decrement, methode de Fitzsimons et al. (1993). */
  decrementPct: number;
  /** Indice de fatigue simple : ecart entre le pire et le meilleur temps. */
  fatigueIndexPct: number;
  category: string;
  interpretation: string;
}

export const computeRsa = (input: RsaInput): RsaResult | null => {
  const times = input.times.filter((t) => t > 0);
  if (times.length < 3) return null;

  const bestTimeS = Math.min(...times);
  const worstTimeS = Math.max(...times);
  const totalTimeS = times.reduce((a, b) => a + b, 0);
  const meanTimeS = totalTimeS / times.length;
  const idealTotal = bestTimeS * times.length;
  const decrementPct = round((totalTimeS / idealTotal - 1) * 100, 2);
  const fatigueIndexPct = round(((worstTimeS - bestTimeS) / bestTimeS) * 100, 2);

  let category: string;
  let interpretation: string;
  if (decrementPct < 3) {
    category = "Excellent";
    interpretation =
      "Le joueur maintient sa vitesse tout au long de la serie. La capacite de resynthese entre les efforts est tres bonne.";
  } else if (decrementPct < 5) {
    category = "Bon";
    interpretation =
      "Decrement dans la norme du footballeur entraine. Maintenir par du travail de sprints repetes une fois par semaine.";
  } else if (decrementPct < 8) {
    category = "Moyen";
    interpretation =
      "La perte de vitesse est marquee. Travailler la capacite aerobie de recuperation et les sprints repetes avec recuperation incomplete.";
  } else {
    category = "Insuffisant";
    interpretation =
      "Effondrement de la performance sur la serie. Verifier d'abord la base aerobie, elle conditionne la recuperation entre les sprints.";
  }

  // Un joueur tres rapide obtient mecaniquement un decrement plus eleve.
  if (input.bestSingleSprintS && bestTimeS > input.bestSingleSprintS * 1.05) {
    interpretation +=
      " Le meilleur temps de la serie est nettement plus lent que le sprint isole du joueur, l'engagement sur les premieres repetitions doit etre verifie.";
  }

  return {
    bestTimeS: round(bestTimeS, 3),
    meanTimeS: round(meanTimeS, 3),
    totalTimeS: round(totalTimeS, 3),
    worstTimeS: round(worstTimeS, 3),
    decrementPct,
    fatigueIndexPct,
    category,
    interpretation,
  };
};

// ---------------------------------------------------------------------------
// FREQUENCE CARDIAQUE ET CHARGE INTERNE
// ---------------------------------------------------------------------------

/** Frequence cardiaque maximale theorique (Tanaka et al. 2001), plus fiable que 220 moins l'age. */
export const predictedMaxHr = (ageYears: number): number => round(208 - 0.7 * ageYears, 0);

/** Frequence cardiaque de reserve, methode de Karvonen. */
export const heartRateReserve = (maxHr: number, restingHr: number, intensityPct: number): number =>
  round(restingHr + ((maxHr - restingHr) * intensityPct) / 100, 0);

export const heartRateZones = (maxHr: number, restingHr?: number) => {
  const zones = [
    { zone: 1, label: "Recuperation", low: 50, high: 60 },
    { zone: 2, label: "Endurance", low: 60, high: 70 },
    { zone: 3, label: "Tempo", low: 70, high: 80 },
    { zone: 4, label: "Seuil", low: 80, high: 90 },
    { zone: 5, label: "Maximal", low: 90, high: 100 },
  ];
  return zones.map((z) => ({
    ...z,
    lowBpm: restingHr
      ? heartRateReserve(maxHr, restingHr, z.low)
      : round((maxHr * z.low) / 100, 0),
    highBpm: restingHr
      ? heartRateReserve(maxHr, restingHr, z.high)
      : round((maxHr * z.high) / 100, 0),
  }));
};

/**
 * TRIMP de Banister, pondere par l'exponentielle de la fraction de reserve cardiaque.
 * Le coefficient vaut 1.92 chez l'homme et 1.67 chez la femme.
 */
export const banisterTrimp = (
  durationMin: number,
  meanHr: number,
  restingHr: number,
  maxHr: number,
  sex: "M" | "F" = "M",
): number => {
  const hrr = (meanHr - restingHr) / (maxHr - restingHr);
  const coefficient = sex === "M" ? 1.92 : 1.67;
  return round(durationMin * hrr * 0.64 * Math.exp(coefficient * hrr), 1);
};

/** TRIMP d'Edwards : somme des durees par zone ponderees de 1 a 5. */
export const edwardsTrimp = (minutesPerZone: [number, number, number, number, number]): number =>
  round(minutesPerZone.reduce((acc, minutes, index) => acc + minutes * (index + 1), 0), 1);
