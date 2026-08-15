/**
 * Charge d'entrainement, ratio aigu sur chronique et etat de fraicheur.
 *
 * References :
 *  - Foster C et al. (2001) A new approach to monitoring exercise training.
 *    J Strength Cond Res 15(1):109-115.  (charge seance, monotonie, contrainte)
 *  - Williams S, West S, Cross MJ, Stokes KA (2017) Better way to determine the
 *    acute:chronic workload ratio? Br J Sports Med 51:209-210.  (moyenne exponentielle)
 *  - Gabbett TJ (2016) The training injury prevention paradox. BJSM 50:273-280.
 *  - Impellizzeri FM, Marcora SM, Coutts AJ (2019) Internal and external training
 *    load: 15 years on. Int J Sports Physiol Perform 14:270-273.
 *  - Plews DJ et al. (2013) Training adaptation and heart rate variability in
 *    elite endurance athletes. Sports Medicine 43:773-781.
 *  - Hooper SL, Mackinnon LT (1995) Monitoring overtraining in athletes.
 */

import { ewma, mean, round, sd } from "./stats";

/** Charge d'une seance : perception de l'effort multipliee par la duree. */
export const sessionRpeLoad = (rpe: number, durationMin: number): number =>
  round(rpe * durationMin, 0);

export interface WeeklyLoadSummary {
  totalLoad: number;
  dailyMean: number;
  /** Monotonie : moyenne quotidienne divisee par l'ecart type. Au dessus de 2, la semaine manque de variation. */
  monotony: number;
  /** Contrainte : charge totale multipliee par la monotonie. */
  strain: number;
  flags: string[];
}

export const weeklyLoad = (dailyLoads: number[]): WeeklyLoadSummary => {
  const total = dailyLoads.reduce((a, b) => a + b, 0);
  const dailyMean = mean(dailyLoads);
  const deviation = sd(dailyLoads);
  const monotony = deviation === 0 ? 0 : round(dailyMean / deviation, 2);
  const strain = round(total * monotony, 0);
  const flags: string[] = [];

  if (monotony > 2) {
    flags.push(
      `Monotonie a ${monotony}. La semaine manque d'alternance entre jours durs et jours faciles, ce qui augmente le risque de surmenage.`,
    );
  }
  if (strain > 6000) {
    flags.push(
      `Contrainte hebdomadaire a ${strain}, valeur elevee. Prevoir une journee de recuperation complete.`,
    );
  }

  return { totalLoad: round(total, 0), dailyMean: round(dailyMean, 0), monotony, strain, flags };
};

export interface AcwrPoint {
  date: string;
  load: number;
  acute: number;
  chronic: number;
  ratio: number;
  zone: "sous charge" | "optimale" | "vigilance" | "risque";
}

/**
 * Ratio aigu sur chronique en moyenne mobile exponentielle.
 * La version exponentielle est preferee a la version glissante car elle pondere
 * davantage les seances recentes et gere correctement les periodes sans donnee.
 */
export const computeAcwr = (
  series: Array<{ date: string; load: number }>,
  acuteDays = 7,
  chronicDays = 28,
): AcwrPoint[] => {
  const loads = series.map((s) => s.load);
  const acuteSeries = ewma(loads, acuteDays);
  const chronicSeries = ewma(loads, chronicDays);

  return series.map((entry, index) => {
    const acute = acuteSeries[index];
    const chronic = chronicSeries[index];
    const ratio = chronic === 0 ? 0 : round(acute / chronic, 2);

    let zone: AcwrPoint["zone"];
    if (ratio < 0.8) zone = "sous charge";
    else if (ratio <= 1.3) zone = "optimale";
    else if (ratio <= 1.5) zone = "vigilance";
    else zone = "risque";

    return {
      date: entry.date,
      load: entry.load,
      acute: round(acute, 0),
      chronic: round(chronic, 0),
      ratio,
      zone,
    };
  });
};

export const interpretAcwr = (ratio: number): { zone: string; message: string; action: string } => {
  if (ratio < 0.8) {
    return {
      zone: "sous charge",
      message:
        "La charge recente est nettement inferieure a la charge de reference. Le joueur se desentraine et perd la protection acquise.",
      action:
        "Remonter progressivement le volume, sans depasser une hausse de 10 a 15% par semaine.",
    };
  }
  if (ratio <= 1.3) {
    return {
      zone: "optimale",
      message: "La charge recente est coherente avec la charge de reference.",
      action: "Poursuivre la progression actuelle.",
    };
  }
  if (ratio <= 1.5) {
    return {
      zone: "vigilance",
      message:
        "La charge recente depasse nettement la reference. La fenetre de risque s'ouvre, en particulier si elle se prolonge.",
      action:
        "Stabiliser la charge la semaine prochaine et surveiller le bien etre et la detente verticale.",
    };
  }
  return {
    zone: "risque",
    message:
      "Pic de charge important par rapport a la charge de reference. C'est la configuration la plus associee aux lesions musculaires.",
    action:
      "Reduire immediatement le volume a haute intensite, allonger la recuperation et recontroler les marqueurs neuromusculaires.",
  };
};

// ---------------------------------------------------------------------------
// BIEN ETRE ET VARIABILITE CARDIAQUE
// ---------------------------------------------------------------------------

export interface WellnessInput {
  sleepQuality: number;
  fatigue: number;
  soreness: number;
  stress: number;
  mood?: number;
}

/**
 * Indice de Hooper : somme de quatre items cotes de 1 a 5, ou 1 correspond au
 * meilleur etat. Une hausse de plus de 20% par rapport a la moyenne individuelle
 * signale une degradation reelle.
 */
export const hooperIndex = (input: WellnessInput): number =>
  input.sleepQuality + input.fatigue + input.soreness + input.stress;

export const wellnessStatus = (
  current: number,
  individualBaseline: number,
  baselineSd: number,
): { status: "bon" | "vigilance" | "alerte"; changePct: number; message: string } => {
  const changePct = round(((current - individualBaseline) / individualBaseline) * 100, 1);
  const threshold = Math.max(baselineSd, individualBaseline * 0.1);

  if (current > individualBaseline + threshold * 2) {
    return {
      status: "alerte",
      changePct,
      message:
        "Degradation nette du bien etre par rapport a la reference individuelle. Adapter la seance et echanger avec le joueur.",
    };
  }
  if (current > individualBaseline + threshold) {
    return {
      status: "vigilance",
      changePct,
      message: "Bien etre en baisse. Surveiller l'evolution sur les prochains jours.",
    };
  }
  return { status: "bon", changePct, message: "Bien etre conforme a la reference individuelle." };
};

/**
 * Variabilite de la frequence cardiaque : on travaille sur le logarithme neperien
 * du rMSSD, lisse sur sept jours, compare a la plus petite variation utile.
 */
export const hrvAnalysis = (rmssdSeries: number[]) => {
  if (rmssdSeries.length < 7) return null;
  const lnValues = rmssdSeries.map((v) => Math.log(Math.max(v, 1)));
  const rolling7 = ewma(lnValues, 7);
  const current = rolling7[rolling7.length - 1];
  const baselineWindow = lnValues.slice(-30);
  const baseline = mean(baselineWindow);
  const baselineSd = sd(baselineWindow);
  const swcValue = 0.5 * baselineSd;

  let status: "adapte" | "neutre" | "fatigue";
  if (current < baseline - swcValue) status = "fatigue";
  else if (current > baseline + swcValue) status = "adapte";
  else status = "neutre";

  return {
    lnRmssdCurrent: round(current, 3),
    lnRmssdBaseline: round(baseline, 3),
    coefficientOfVariation: round((baselineSd / baseline) * 100, 2),
    status,
    message:
      status === "fatigue"
        ? "Le lissage sur sept jours passe sous la plus petite variation utile. Signe de fatigue autonome, reduire l'intensite."
        : status === "adapte"
          ? "Le lissage sur sept jours est au dessus de la reference. Le joueur repond favorablement a la charge."
          : "Variabilite cardiaque stable autour de la reference individuelle.",
  };
};

/**
 * Score composite de disponibilite, agrege a partir des signaux disponibles.
 * Chaque composante est ramenee sur 100 et ponderee selon sa valeur informative.
 */
export interface ReadinessInput {
  wellnessScore?: number; // 0 a 100, 100 etant le meilleur etat
  hrvScore?: number;
  jumpScore?: number;
  acwrRatio?: number;
  sleepHours?: number;
}

export const computeReadiness = (input: ReadinessInput) => {
  const components: Array<{ label: string; value: number; weight: number }> = [];

  if (input.wellnessScore != null)
    components.push({ label: "Bien etre", value: input.wellnessScore, weight: 0.3 });
  if (input.hrvScore != null)
    components.push({ label: "Variabilite cardiaque", value: input.hrvScore, weight: 0.25 });
  if (input.jumpScore != null)
    components.push({ label: "Detente", value: input.jumpScore, weight: 0.25 });
  if (input.sleepHours != null) {
    const sleepScore = Math.min(100, (input.sleepHours / 8) * 100);
    components.push({ label: "Sommeil", value: sleepScore, weight: 0.1 });
  }
  if (input.acwrRatio != null) {
    // Une valeur proche de 1.0 vaut 100, on penalise l'ecart dans les deux sens.
    const acwrScore = Math.max(0, 100 - Math.abs(input.acwrRatio - 1.05) * 120);
    components.push({ label: "Ratio de charge", value: acwrScore, weight: 0.1 });
  }

  if (components.length === 0) return null;

  const totalWeight = components.reduce((a, c) => a + c.weight, 0);
  const score = round(
    components.reduce((a, c) => a + c.value * c.weight, 0) / totalWeight,
    0,
  );

  let level: "vert" | "orange" | "rouge";
  let guidance: string;
  if (score >= 75) {
    level = "vert";
    guidance = "Joueur disponible pour une charge normale a elevee.";
  } else if (score >= 55) {
    level = "orange";
    guidance =
      "Adapter la seance : reduire le volume a haute intensite et surveiller les retours du joueur.";
  } else {
    level = "rouge";
    guidance =
      "Charge fortement reduite ou recuperation. Echanger avec le staff medical avant la seance.";
  }

  return { score, level, guidance, components };
};

/**
 * Repartition classique de la charge dans un microcycle a un match,
 * exprimee en pourcentage de la charge du match.
 * Reperes issus des donnees GPS du football professionnel europeen.
 */
export const microcycleTargets: Record<
  string,
  { label: string; distancePct: number; hsrPct: number; sprintPct: number; focus: string }
> = {
  "MD+1": {
    label: "Lendemain de match",
    distancePct: 40,
    hsrPct: 15,
    sprintPct: 5,
    focus: "Recuperation active pour les joueurs ayant joue, seance compensatoire pour les autres.",
  },
  "MD+2": {
    label: "Deux jours apres",
    distancePct: 70,
    hsrPct: 60,
    sprintPct: 40,
    focus: "Force et volume aerobie, reprise progressive.",
  },
  "MD-4": {
    label: "Quatre jours avant",
    distancePct: 110,
    hsrPct: 90,
    sprintPct: 50,
    focus: "Journee la plus chargee en volume, jeux a effectifs reduits sur grand espace.",
  },
  "MD-3": {
    label: "Trois jours avant",
    distancePct: 95,
    hsrPct: 110,
    sprintPct: 90,
    focus: "Intensite maximale, sprints et jeux sur grand terrain.",
  },
  "MD-2": {
    label: "Deux jours avant",
    distancePct: 70,
    hsrPct: 50,
    sprintPct: 60,
    focus: "Volume reduit, travail tactique et vivacite.",
  },
  "MD-1": {
    label: "Veille de match",
    distancePct: 50,
    hsrPct: 25,
    sprintPct: 30,
    focus: "Activation courte, coups de pied arretes, quelques accelerations pour rester affute.",
  },
  MD: {
    label: "Jour de match",
    distancePct: 100,
    hsrPct: 100,
    sprintPct: 100,
    focus: "Match.",
  },
};
