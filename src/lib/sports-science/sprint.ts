/**
 * Sprint lineaire et profil force vitesse horizontal.
 *
 * Methode de terrain validee, dite "methode simple", qui reconstruit la production
 * de force horizontale a partir des seuls temps de passage :
 *  - Samozino P, Rabita G, Dorel S, et al. (2016) A simple method for measuring
 *    power, force, velocity properties and mechanical effectiveness of sprint
 *    running. Scand J Med Sci Sports 26(6):648-658.
 *  - Morin JB, Samozino P (2016) Interpreting power output variables during
 *    sprinting. Int J Sports Physiol Perform 11(2):267-272.
 *  - Morin JB et al. (2019) Very high force mechanical output of world class
 *    sprinters. (valeurs de reference de RF et DRF)
 *
 * Modele : la vitesse suit une montee mono exponentielle
 *   v(t) = Vmax x (1 moins exp(moins t / tau))
 * dont l'integration donne la position
 *   x(t) = Vmax x (t + tau x exp(moins t / tau)) moins Vmax x tau
 */

import { linearRegression, round } from "./stats";

export interface SprintSplit {
  /** Distance du portique en metres. */
  distance: number;
  /** Temps cumule en secondes depuis le depart. */
  time: number;
}

export interface SprintProfileInput {
  splits: SprintSplit[];
  bodyMassKg: number;
  heightM: number;
  /** Temperature de l'air en degres Celsius, pour la densite de l'air. */
  temperatureC?: number;
  /** Pression atmospherique en hPa. */
  pressureHpa?: number;
  /** Vitesse du vent de face positive, de dos negative, en metres par seconde. */
  windMs?: number;
  /**
   * Correction du declenchement du chronometre, en secondes.
   *
   * Le modele exige que l'instant zero corresponde au premier mouvement du coureur.
   * Or les cellules photoelectriques se declenchent au passage du faisceau, alors
   * que le joueur est deja lance, ce qui raccourcit tous les temps d'une constante.
   * Sans correction, le modele conclut a une acceleration initiale irrealiste et
   * surestime fortement F0.
   *
   * Voir Haugen T, Buchheit M (2016) Sprint running performance monitoring:
   * methodological and practical considerations. Sports Medicine 46:641-656.
   */
  timingOffsetS?: number;
}

/** Corrections usuelles selon la facon dont le chronometre est declenche. */
export const TIMING_OFFSETS: Record<string, { seconds: number; label: string; detail: string }> = {
  movement: {
    seconds: 0,
    label: "Depart au premier mouvement",
    detail:
      "Video haute frequence, radar ou plateforme de depart. L'instant zero correspond deja au premier mouvement, aucune correction n'est appliquee.",
  },
  photocell_05: {
    seconds: 0.37,
    label: "Cellules, depart 0.5 m en arriere",
    detail:
      "Montage le plus repandu en football. Le joueur est deja en mouvement quand il coupe le premier faisceau, une correction de 0.37 seconde ramene l'instant zero au premier mouvement.",
  },
  photocell_1m: {
    seconds: 0.45,
    label: "Cellules, depart 1 m en arriere",
    detail:
      "Le joueur a parcouru davantage de distance avant le declenchement, la correction est donc plus importante.",
  },
};

export interface SprintProfileResult {
  /** Vitesse maximale theorique du modele, en metres par seconde. */
  vmax: number;
  /** Constante de temps d'acceleration en secondes. Plus elle est basse, plus le depart est explosif. */
  tau: number;
  /** Acceleration maximale theorique a l'instant zero, en metres par seconde carree. */
  amax: number;
  /** Force horizontale theorique a vitesse nulle, en newtons par kilogramme. */
  f0: number;
  /** Force horizontale absolue a vitesse nulle, en newtons. */
  f0Abs: number;
  /** Vitesse theorique a force nulle, en metres par seconde. */
  v0: number;
  /** Puissance horizontale maximale relative, en watts par kilogramme. */
  pmax: number;
  pmaxAbs: number;
  /** Pente du profil force vitesse, en newtons par kilogramme et par metre par seconde. */
  sfv: number;
  /** Ratio de force horizontale maximal, en pourcentage. */
  rfMax: number;
  /** Taux de decroissance du ratio de force. Une valeur peu negative traduit une bonne efficacite technique. */
  drf: number;
  /** Qualite de l'ajustement du modele sur les temps de passage. */
  modelR2: number;
  /** Qualite de la regression force vitesse. Doit depasser 0.95 pour etre exploitable. */
  fvR2: number;
  /** Vitesse maximale en kilometres par heure. */
  vmaxKmh: number;
  /** Temps reconstruits a chaque distance de reference. */
  predictedSplits: Array<{ distance: number; time: number }>;
  quality: "excellent" | "acceptable" | "douteux";
  warnings: string[];
}

const GRAVITY = 9.81;
const DRAG_COEFFICIENT = 0.9;

/** Densite de l'air corrigee de la temperature et de la pression. */
const airDensity = (temperatureC: number, pressureHpa: number): number =>
  1.293 * (pressureHpa / 1013.25) * (273.15 / (273.15 + temperatureC));

/**
 * Aire frontale du coureur (Arsac et Locatelli 2002), derivee de la surface
 * corporelle de Du Bois multipliee par un facteur de projection frontale.
 */
const frontalArea = (heightM: number, bodyMassKg: number): number =>
  0.2025 * heightM ** 0.725 * bodyMassKg ** 0.425 * 0.266;

/** Position predite par le modele mono exponentiel a l'instant t. */
const modelPosition = (t: number, vmax: number, tau: number): number =>
  vmax * (t + tau * Math.exp(-t / tau)) - vmax * tau;

/**
 * Ajustement des deux parametres du modele par recherche sur grille affinee.
 * Trois passes suffisent pour une precision au millieme, sans dependance externe.
 */
const fitModel = (splits: SprintSplit[]): { vmax: number; tau: number; r2: number } => {
  let bestVmax = 9;
  let bestTau = 1.2;
  let bestError = Number.POSITIVE_INFINITY;

  let vmaxRange: [number, number] = [5, 14];
  let tauRange: [number, number] = [0.4, 3];
  let steps = 60;

  for (let pass = 0; pass < 4; pass += 1) {
    const vStep = (vmaxRange[1] - vmaxRange[0]) / steps;
    const tStep = (tauRange[1] - tauRange[0]) / steps;

    for (let i = 0; i <= steps; i += 1) {
      const vmax = vmaxRange[0] + i * vStep;
      for (let j = 0; j <= steps; j += 1) {
        const tau = tauRange[0] + j * tStep;
        let error = 0;
        for (const split of splits) {
          const predicted = modelPosition(split.time, vmax, tau);
          error += (predicted - split.distance) ** 2;
        }
        if (error < bestError) {
          bestError = error;
          bestVmax = vmax;
          bestTau = tau;
        }
      }
    }

    vmaxRange = [bestVmax - vStep * 2, bestVmax + vStep * 2];
    tauRange = [Math.max(0.05, bestTau - tStep * 2), bestTau + tStep * 2];
    steps = 30;
  }

  const observedMean = splits.reduce((a, s) => a + s.distance, 0) / splits.length;
  const ssTot = splits.reduce((a, s) => a + (s.distance - observedMean) ** 2, 0);
  const r2 = ssTot === 0 ? 1 : 1 - bestError / ssTot;

  return { vmax: bestVmax, tau: bestTau, r2 };
};

export const computeSprintProfile = (input: SprintProfileInput): SprintProfileResult | null => {
  const offset = input.timingOffsetS ?? 0;

  // La correction ramene l'origine des temps au premier mouvement du coureur.
  const splits = [...input.splits]
    .filter((s) => s.distance > 0 && s.time > 0)
    .map((s) => ({ distance: s.distance, time: s.time + offset }))
    .sort((a, b) => a.distance - b.distance);

  const warnings: string[] = [];
  if (splits.length < 2) return null;
  if (offset === 0) {
    warnings.push(
      "Aucune correction de declenchement appliquee. Si les temps proviennent de cellules photoelectriques, F0 et la puissance seront surestimes.",
    );
  }
  if (splits.length < 3) {
    warnings.push(
      "Deux temps de passage seulement. Le profil reste indicatif, il en faut au moins trois pour etre fiable.",
    );
  }
  if (splits[splits.length - 1].distance < 25) {
    warnings.push(
      "La distance maximale est inferieure a 25 metres. La vitesse maximale sera sous estimee.",
    );
  }

  const { vmax, tau, r2 } = fitModel(splits);
  const mass = input.bodyMassKg;
  const rho = airDensity(input.temperatureC ?? 20, input.pressureHpa ?? 1013.25);
  const af = frontalArea(input.heightM, mass);
  const k = 0.5 * rho * af * DRAG_COEFFICIENT;
  const wind = input.windMs ?? 0;

  // Echantillonnage du sprint tous les 10 millisecondes.
  const duration = splits[splits.length - 1].time;
  const velocities: number[] = [];
  const forces: number[] = [];
  const times: number[] = [];

  for (let t = 0; t <= duration; t += 0.01) {
    const v = vmax * (1 - Math.exp(-t / tau));
    const a = (vmax / tau) * Math.exp(-t / tau);
    const relativeVelocity = v + wind;
    const drag = k * relativeVelocity * Math.abs(relativeVelocity);
    const force = mass * a + drag;
    times.push(t);
    velocities.push(v);
    forces.push(force / mass); // force horizontale relative, en newtons par kilogramme
  }

  const { slope, intercept, r2: fvR2 } = linearRegression(velocities, forces);
  const f0 = intercept;
  const v0 = slope === 0 ? 0 : -intercept / slope;
  const pmax = (f0 * v0) / 4;

  // Ratio de force : part horizontale de la force totale appliquee au sol.
  const rfSeries: number[] = [];
  const rfVelocities: number[] = [];
  for (let i = 0; i < times.length; i += 1) {
    const fh = forces[i] * mass;
    const fTotal = Math.sqrt(fh ** 2 + (mass * GRAVITY) ** 2);
    const rf = (fh / fTotal) * 100;
    // La litterature calcule RFmax et DRF a partir de 0.3 seconde, le temps que le
    // coureur quitte la position de depart.
    if (times[i] >= 0.3) {
      rfSeries.push(rf);
      rfVelocities.push(velocities[i]);
    }
  }
  const rfMax = rfSeries.length > 0 ? Math.max(...rfSeries) : 0;
  const drfFit = linearRegression(rfVelocities, rfSeries);

  const referenceDistances = [5, 10, 20, 30, 40];
  const predictedSplits = referenceDistances
    .filter((d) => d <= splits[splits.length - 1].distance + 5)
    .map((distance) => {
      // Inversion numerique de x(t) par dichotomie.
      let low = 0;
      let high = 20;
      for (let i = 0; i < 60; i += 1) {
        const mid = (low + high) / 2;
        if (modelPosition(mid, vmax, tau) < distance) low = mid;
        else high = mid;
      }
      // On retire la correction pour que les temps reconstruits soient comparables
      // a ceux que le staff a reellement lus sur le chronometre.
      return { distance, time: round((low + high) / 2 - offset, 3) };
    });

  let quality: SprintProfileResult["quality"] = "excellent";
  if (fvR2 < 0.95 || r2 < 0.98) quality = "acceptable";
  if (fvR2 < 0.9 || r2 < 0.95 || splits.length < 3) quality = "douteux";
  if (fvR2 < 0.95) {
    warnings.push(
      `Ajustement force vitesse a R2 = ${round(fvR2, 3)}. Verifier les temps de passage saisis.`,
    );
  }

  return {
    vmax: round(vmax, 2),
    tau: round(tau, 3),
    amax: round(vmax / tau, 2),
    f0: round(f0, 2),
    f0Abs: round(f0 * mass, 1),
    v0: round(v0, 2),
    pmax: round(pmax, 2),
    pmaxAbs: round(pmax * mass, 0),
    sfv: round(slope, 3),
    rfMax: round(rfMax, 2),
    drf: round(drfFit.slope, 3),
    modelR2: round(r2, 4),
    fvR2: round(fvR2, 4),
    vmaxKmh: round(vmax * 3.6, 2),
    predictedSplits,
    quality,
    warnings,
  };
};

/**
 * Interpretation du profil : oriente t on le travail vers la force ou vers la vitesse ?
 * Le rapport F0 sur V0 est compare aux valeurs de reference du football professionnel
 * (Jimenez Reyes et al. 2018, Haugen et al. 2019).
 */
export interface SprintOrientation {
  orientation: "deficit de force" | "equilibre" | "deficit de vitesse";
  ratio: number;
  message: string;
  priority: string;
}

export const interpretSprintProfile = (profile: SprintProfileResult): SprintOrientation => {
  const ratio = profile.v0 === 0 ? 0 : profile.f0 / profile.v0;
  // Zone d'equilibre observee chez le footballeur : F0 entre 7 et 9 N/kg, V0 entre 8.5 et 10 m/s.
  if (ratio > 0.95) {
    return {
      orientation: "deficit de vitesse",
      ratio: round(ratio, 3),
      message:
        "Le joueur produit beaucoup de force au demarrage mais plafonne vite. Sa vitesse theorique maximale est le facteur limitant.",
      priority:
        "Sprints lances 20 a 30 metres, survitesse legere en descente ou avec elastique, courses a haute frequence, volume de sprint maximal preserve chaque semaine.",
    };
  }
  if (ratio < 0.75) {
    return {
      orientation: "deficit de force",
      ratio: round(ratio, 3),
      message:
        "Le joueur atteint une vitesse elevee mais son acceleration initiale est faible. La capacite a produire de la force horizontale au demarrage limite la performance.",
      priority:
        "Sprints resistes a charge lourde (traineau a 45 a 80% de la masse corporelle), demi squat lourd, poussee de luge, departs sur 5 a 15 metres, hip thrust.",
    };
  }
  return {
    orientation: "equilibre",
    ratio: round(ratio, 3),
    message:
      "Le profil force vitesse est equilibre. Les deux qualites progressent au meme rythme.",
    priority:
      "Maintenir un travail mixte : sprints resistes legers a moderes et sprints libres maximaux, en conservant au moins une exposition hebdomadaire a la vitesse maximale.",
  };
};

/**
 * Vitesse maximale de sprint mesuree sur un troncon lance.
 * Sert de reference pour la reserve de vitesse anaerobie et pour les seuils GPS individualises.
 */
export const flyingSpeed = (distanceM: number, timeS: number) => {
  const ms = timeS === 0 ? 0 : distanceM / timeS;
  return { ms: round(ms, 2), kmh: round(ms * 3.6, 2) };
};

/**
 * Reserve de vitesse anaerobie : ecart entre la vitesse maximale de sprint et la
 * vitesse aerobie maximale. Buchheit M, Laursen PB (2013).
 * Elle conditionne la reponse a un meme pourcentage d'intensite entre deux joueurs.
 */
export const anaerobicSpeedReserve = (maxSprintSpeedKmh: number, masKmh: number) => {
  const asr = maxSprintSpeedKmh - masKmh;
  return {
    asrKmh: round(asr, 2),
    /** Vitesse correspondant a un pourcentage donne de la reserve. */
    speedAtPercent: (percent: number) => round(masKmh + (percent / 100) * asr, 2),
    interpretation:
      asr < 10
        ? "Reserve faible. Le joueur subit fortement les efforts supra maximaux repetes, individualiser les intervalles courts."
        : asr > 16
          ? "Reserve elevee. Profil de sprinteur, la tolerance aux courses intermittentes intenses est bonne mais l'endurance aerobie doit etre surveillee."
          : "Reserve dans la norme du footballeur de haut niveau.",
  };
};
