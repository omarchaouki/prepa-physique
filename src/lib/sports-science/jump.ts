/**
 * Detente verticale et qualites neuromusculaires.
 *
 * References :
 *  - Bosco C, Luhtanen P, Komi PV (1983) A simple method for measurement of
 *    mechanical power in jumping. Eur J Appl Physiol 50:273-282.
 *  - Sayers SP et al. (1999) Cross validation of three jump power equations.
 *    Med Sci Sports Exerc 31(4):572-577.
 *  - Flanagan EP, Comyns TM (2008) The use of contact time and the reactive
 *    strength index to optimize fast stretch shortening cycle training.
 *    Strength Cond J 30(5):32-38.
 *  - Bishop C et al. (2021) Interlimb asymmetries: the need for an individual
 *    approach to data analysis. J Strength Cond Res 35(3):695-701.
 *  - Gathercole R et al. (2015) Alternative countermovement jump analysis to
 *    quantify acute neuromuscular fatigue. Int J Sports Physiol Perform 10:84-92.
 */

import { asymmetryIndex, round } from "./stats";

const GRAVITY = 9.81;

/** Hauteur de saut deduite du temps de vol. Suppose un decollage et une reception identiques. */
export const heightFromFlightTime = (flightTimeS: number): number =>
  round((GRAVITY * flightTimeS ** 2) / 8, 3);

/** Hauteur de saut deduite de la vitesse de decollage, methode de reference sur plateforme de force. */
export const heightFromTakeoffVelocity = (velocityMs: number): number =>
  round(velocityMs ** 2 / (2 * GRAVITY), 3);

export const takeoffVelocityFromHeight = (heightM: number): number =>
  round(Math.sqrt(2 * GRAVITY * heightM), 3);

/** Puissance maximale estimee lors d'un saut avec contre mouvement (Sayers 1999). */
export const cmjPeakPower = (heightCm: number, bodyMassKg: number): number =>
  round(60.7 * heightCm + 45.3 * bodyMassKg - 2055, 0);

/** Puissance maximale estimee lors d'un squat jump (Sayers 1999). */
export const sjPeakPower = (heightCm: number, bodyMassKg: number): number =>
  round(68.5 * heightCm + 46.3 * bodyMassKg - 2470, 0);

export interface CmjInput {
  heightCm?: number;
  flightTimeS?: number;
  bodyMassKg: number;
  /** Temps entre le debut du contre mouvement et le decollage, en secondes. */
  timeToTakeoffS?: number;
  /** Squat jump associe, pour calculer le ratio d'utilisation du cycle etirement detente. */
  sjHeightCm?: number;
  /** Sauts unilateraux, en centimetres. */
  leftHeightCm?: number;
  rightHeightCm?: number;
}

export interface CmjResult {
  heightCm: number;
  peakPowerW: number;
  relativePowerWkg: number;
  takeoffVelocityMs: number;
  /** Reactive Strength Index modifie : hauteur divisee par le temps de mise en action. */
  rsiMod: number | null;
  /** Eccentric Utilisation Ratio : rapport CMJ sur SJ. */
  eur: number | null;
  /** Deficit bilateral en pourcentage. Positif quand la somme des unilateraux depasse le bilateral. */
  bilateralDeficit: number | null;
  asymmetryPct: number | null;
  asymmetryFavours: "gauche" | "droite" | null;
  flags: string[];
}

export const computeCmj = (input: CmjInput): CmjResult => {
  const heightM =
    input.heightCm != null
      ? input.heightCm / 100
      : input.flightTimeS != null
        ? heightFromFlightTime(input.flightTimeS)
        : 0;
  const heightCm = round(heightM * 100, 1);
  const peakPowerW = cmjPeakPower(heightCm, input.bodyMassKg);
  const flags: string[] = [];

  let rsiMod: number | null = null;
  if (input.timeToTakeoffS && input.timeToTakeoffS > 0) {
    rsiMod = round(heightM / input.timeToTakeoffS, 3);
    // Reference footballeur professionnel : 0.40 a 0.55. En dessous de 0.35 la
    // strategie de saut est lente, signe frequent de fatigue neuromusculaire.
    if (rsiMod < 0.35) {
      flags.push(
        "RSImod inferieur a 0.35 : strategie de saut lente, surveiller la fatigue neuromusculaire ou travailler la vitesse de mise en action.",
      );
    }
  }

  let eur: number | null = null;
  if (input.sjHeightCm && input.sjHeightCm > 0) {
    eur = round(heightCm / input.sjHeightCm, 3);
    if (eur < 1.0) {
      flags.push(
        "Ratio CMJ sur SJ inferieur a 1.00 : le joueur n'exploite pas le cycle etirement detente. Prioriser le travail pliometrique et la raideur.",
      );
    } else if (eur > 1.15) {
      flags.push(
        "Ratio CMJ sur SJ superieur a 1.15 : tres bonne exploitation elastique mais force concentrique pure limitante. Ajouter du travail de force lourde.",
      );
    }
  }

  let bilateralDeficit: number | null = null;
  let asymmetryPct: number | null = null;
  let asymmetryFavours: CmjResult["asymmetryFavours"] = null;

  if (input.leftHeightCm != null && input.rightHeightCm != null) {
    const sum = input.leftHeightCm + input.rightHeightCm;
    if (sum > 0) {
      bilateralDeficit = round(((heightCm - sum) / sum) * 100, 1);
    }
    asymmetryPct = asymmetryIndex(input.leftHeightCm, input.rightHeightCm);
    asymmetryFavours = input.leftHeightCm > input.rightHeightCm ? "gauche" : "droite";
    if (asymmetryPct > 10) {
      flags.push(
        `Asymetrie de ${asymmetryPct}% au saut unilateral, au dessus du seuil de 10% associe a une hausse du risque de blessure. Programmer du renforcement unilateral cible.`,
      );
    }
  }

  if (heightCm > 0 && heightCm < 28) {
    flags.push(
      "Detente verticale faible pour un footballeur. Verifier la technique de saut avant de conclure.",
    );
  }

  return {
    heightCm,
    peakPowerW,
    relativePowerWkg: round(peakPowerW / input.bodyMassKg, 1),
    takeoffVelocityMs: takeoffVelocityFromHeight(heightM),
    rsiMod,
    eur,
    bilateralDeficit,
    asymmetryPct,
    asymmetryFavours,
    flags,
  };
};

export interface DropJumpInput {
  dropHeightCm: number;
  jumpHeightCm?: number;
  flightTimeS?: number;
  contactTimeS: number;
  bodyMassKg: number;
}

export interface DropJumpResult {
  jumpHeightCm: number;
  contactTimeS: number;
  /** Reactive Strength Index : hauteur en metres divisee par le temps de contact. */
  rsi: number;
  category: string;
  recommendation: string;
}

export const computeDropJump = (input: DropJumpInput): DropJumpResult => {
  const heightM =
    input.jumpHeightCm != null
      ? input.jumpHeightCm / 100
      : input.flightTimeS != null
        ? heightFromFlightTime(input.flightTimeS)
        : 0;
  const rsi = input.contactTimeS === 0 ? 0 : round(heightM / input.contactTimeS, 2);

  // Grille d'interpretation de Flanagan et Comyns, adaptee au footballeur.
  let category: string;
  let recommendation: string;
  if (rsi < 1.0) {
    category = "Faible";
    recommendation =
      "Raideur insuffisante. Commencer par des bonds bas, des sauts a la corde et des impulsions sur place avant tout travail de choc.";
  } else if (rsi < 1.5) {
    category = "Moyen";
    recommendation =
      "Introduire des drop jumps depuis 20 a 30 centimetres avec consigne de temps de contact inferieur a 250 millisecondes.";
  } else if (rsi < 2.0) {
    category = "Bon";
    recommendation =
      "Progresser vers des hauteurs de chute de 30 a 40 centimetres et des bonds horizontaux enchaines.";
  } else if (rsi < 2.5) {
    category = "Tres bon";
    recommendation =
      "Maintenir par un travail pliometrique intense a faible volume, deux fois par semaine hors periode de match dense.";
  } else {
    category = "Elite";
    recommendation =
      "Qualite reactive de haut niveau. Preserver par un volume reduit et surveiller la charge sur le tendon d'Achille.";
  }

  if (input.contactTimeS > 0.3) {
    recommendation += " Le temps de contact depasse 300 millisecondes, le saut n'est plus reactif : reduire la hauteur de chute.";
  }

  return {
    jumpHeightCm: round(heightM * 100, 1),
    contactTimeS: input.contactTimeS,
    rsi,
    category,
    recommendation,
  };
};

export interface HopTestInput {
  /** Saut simple a cloche pied, en centimetres. */
  singleHopLeftCm?: number;
  singleHopRightCm?: number;
  /** Triple saut a cloche pied, en centimetres. */
  tripleHopLeftCm?: number;
  tripleHopRightCm?: number;
  /** Triple saut croise, en centimetres. */
  crossoverHopLeftCm?: number;
  crossoverHopRightCm?: number;
  /** Saut a cloche pied sur six metres, en secondes. */
  timedHopLeftS?: number;
  timedHopRightS?: number;
}

export interface HopTestResult {
  items: Array<{
    label: string;
    left: number;
    right: number;
    lsi: number;
    passes: boolean;
  }>;
  worstLsi: number | null;
  clearedForReturn: boolean;
  summary: string;
}

/**
 * Batterie de sauts unilateraux utilisee dans les criteres de retour au jeu.
 * Le seuil communement retenu est un index de symetrie superieur ou egal a 90%,
 * porte a 95% pour les suites de rupture du ligament croise anterieur
 * (Grindem et al. 2016, Br J Sports Med).
 */
export const computeHopTests = (input: HopTestInput, threshold = 90): HopTestResult => {
  const items: HopTestResult["items"] = [];

  const push = (label: string, left?: number, right?: number, lowerIsBetter = false) => {
    if (left == null || right == null || left === 0 || right === 0) return;
    const lsi = lowerIsBetter
      ? round((Math.min(left, right) / Math.max(left, right)) * 100, 1)
      : round((Math.min(left, right) / Math.max(left, right)) * 100, 1);
    items.push({ label, left, right, lsi, passes: lsi >= threshold });
  };

  push("Saut simple", input.singleHopLeftCm, input.singleHopRightCm);
  push("Triple saut", input.tripleHopLeftCm, input.tripleHopRightCm);
  push("Triple saut croise", input.crossoverHopLeftCm, input.crossoverHopRightCm);
  push("Saut chronometre 6 m", input.timedHopLeftS, input.timedHopRightS, true);

  if (items.length === 0) {
    return { items, worstLsi: null, clearedForReturn: false, summary: "Aucune donnee saisie." };
  }

  const worstLsi = Math.min(...items.map((i) => i.lsi));
  const clearedForReturn = items.every((i) => i.passes);

  return {
    items,
    worstLsi,
    clearedForReturn,
    summary: clearedForReturn
      ? `Tous les tests depassent le seuil de ${threshold}%. Le critere de symetrie du retour au jeu est rempli.`
      : `Index de symetrie le plus bas a ${worstLsi}%, sous le seuil de ${threshold}%. Poursuivre le renforcement unilateral du cote deficitaire avant progression.`,
  };
};

/**
 * Detection de fatigue neuromusculaire par comparaison a la valeur de reference du joueur.
 * Une chute de la hauteur de CMJ superieure a la plus petite variation utile signale
 * une fatigue residuelle (Gathercole et al. 2015).
 */
export const cmjFatigueFlag = (
  currentHeightCm: number,
  baselineHeightCm: number,
  baselineSd: number,
): { changePct: number; status: "frais" | "vigilance" | "fatigue"; message: string } => {
  const changePct = round(((currentHeightCm - baselineHeightCm) / baselineHeightCm) * 100, 1);
  const swcCm = 0.2 * baselineSd;
  const drop = baselineHeightCm - currentHeightCm;

  if (drop > Math.max(swcCm * 2, baselineHeightCm * 0.1)) {
    return {
      changePct,
      status: "fatigue",
      message:
        "Chute significative de la detente. Reduire la charge neuromusculaire du jour et privilegier la recuperation.",
    };
  }
  if (drop > swcCm) {
    return {
      changePct,
      status: "vigilance",
      message:
        "Baisse superieure a la plus petite variation utile. Adapter le volume de haute intensite et recontroler demain.",
    };
  }
  return {
    changePct,
    status: "frais",
    message: "Detente conforme a la reference individuelle, aucune fatigue neuromusculaire detectee.",
  };
};
