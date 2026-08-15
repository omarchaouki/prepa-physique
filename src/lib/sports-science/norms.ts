/**
 * Valeurs de reference utilisees pour situer un joueur par rapport a sa population.
 *
 * Les valeurs sont issues de synthese de la litterature de terrain, principalement :
 *  - Haugen T, Tonnessen E, Seiler S (2013, 2019) Sprint and countermovement jump
 *    performance across the football career.
 *  - Jimenez-Reyes P et al. (2018) Sprint mechanical force velocity profile in
 *    soccer players. Front Physiol.
 *  - Bangsbo J et al. (2008) Yo-Yo intermittent recovery test norms.
 *  - Buchheit M (2008, 2010) 30-15 IFT reference values in team sports.
 *  - Opar DA et al. (2015) Nordic hamstring reference values.
 *  - Thorborg K et al. (2011, 2017) Hip adduction and abduction strength profiles.
 *  - Loturco I et al. (2018, 2021) Physical qualities of elite Brazilian footballers.
 *  - Bishop C et al. (2021) Interlimb asymmetry thresholds.
 *
 * Ces valeurs sont des reperes de population, jamais des objectifs individuels.
 * La reference la plus utile reste toujours l'historique du joueur lui meme.
 */

import { percentileFromTable, percentileFromZ, zScore } from "./stats";

export type Population =
  | "SENIOR_PRO"
  | "SENIOR_SEMIPRO"
  | "SENIOR_AMATEUR"
  | "U21"
  | "U19"
  | "U17"
  | "U15"
  | "U13";

export interface NormRow {
  metricKey: string;
  population: Population;
  sex: "M" | "F";
  position?: string;
  mean: number;
  sd: number;
  higherIsBetter: boolean;
  source: string;
}

const N = (
  metricKey: string,
  population: Population,
  sex: "M" | "F",
  mean: number,
  sd: number,
  higherIsBetter: boolean,
  source: string,
  position?: string,
): NormRow => ({ metricKey, population, sex, position, mean, sd, higherIsBetter, source });

const HAUGEN = "Haugen et al. 2013 et 2019";
const JIMENEZ = "Jimenez-Reyes et al. 2018";
const BANGSBO = "Bangsbo et al. 2008";
const BUCHHEIT = "Buchheit 2008 et 2010";
const OPAR = "Opar et al. 2015";
const THORBORG = "Thorborg et al. 2011 et 2017";
const LOTURCO = "Loturco et al. 2018 et 2021";
const BISHOP = "Bishop et al. 2021";

export const NORMS: NormRow[] = [
  // --- Sprint 10 metres, en secondes -------------------------------------
  N("sprint_10m", "SENIOR_PRO", "M", 1.72, 0.06, false, HAUGEN),
  N("sprint_10m", "SENIOR_SEMIPRO", "M", 1.78, 0.07, false, HAUGEN),
  N("sprint_10m", "SENIOR_AMATEUR", "M", 1.84, 0.08, false, HAUGEN),
  N("sprint_10m", "U21", "M", 1.74, 0.06, false, HAUGEN),
  N("sprint_10m", "U19", "M", 1.76, 0.07, false, HAUGEN),
  N("sprint_10m", "U17", "M", 1.8, 0.07, false, HAUGEN),
  N("sprint_10m", "U15", "M", 1.88, 0.09, false, HAUGEN),
  N("sprint_10m", "U13", "M", 2.02, 0.11, false, HAUGEN),
  N("sprint_10m", "SENIOR_PRO", "F", 1.9, 0.08, false, HAUGEN),
  N("sprint_10m", "U19", "F", 1.95, 0.09, false, HAUGEN),
  N("sprint_10m", "U17", "F", 2.0, 0.09, false, HAUGEN),

  // --- Sprint 30 metres --------------------------------------------------
  N("sprint_30m", "SENIOR_PRO", "M", 4.1, 0.13, false, HAUGEN),
  N("sprint_30m", "SENIOR_SEMIPRO", "M", 4.22, 0.15, false, HAUGEN),
  N("sprint_30m", "SENIOR_AMATEUR", "M", 4.35, 0.17, false, HAUGEN),
  N("sprint_30m", "U21", "M", 4.14, 0.14, false, HAUGEN),
  N("sprint_30m", "U19", "M", 4.2, 0.15, false, HAUGEN),
  N("sprint_30m", "U17", "M", 4.32, 0.16, false, HAUGEN),
  N("sprint_30m", "U15", "M", 4.55, 0.2, false, HAUGEN),
  N("sprint_30m", "U13", "M", 4.95, 0.25, false, HAUGEN),
  N("sprint_30m", "SENIOR_PRO", "F", 4.6, 0.18, false, HAUGEN),
  N("sprint_30m", "U19", "F", 4.72, 0.2, false, HAUGEN),

  // --- Vitesse maximale, en kilometres par heure -------------------------
  N("sprint_vmax", "SENIOR_PRO", "M", 32.2, 1.4, true, HAUGEN),
  N("sprint_vmax", "SENIOR_SEMIPRO", "M", 31.2, 1.5, true, HAUGEN),
  N("sprint_vmax", "SENIOR_AMATEUR", "M", 30.2, 1.6, true, HAUGEN),
  N("sprint_vmax", "U19", "M", 31.2, 1.5, true, HAUGEN),
  N("sprint_vmax", "U17", "M", 30.2, 1.6, true, HAUGEN),
  N("sprint_vmax", "U15", "M", 28.5, 1.8, true, HAUGEN),
  N("sprint_vmax", "SENIOR_PRO", "F", 28.5, 1.4, true, HAUGEN),
  N("max_speed", "SENIOR_PRO", "M", 32.5, 1.4, true, HAUGEN),
  N("max_speed", "SENIOR_SEMIPRO", "M", 31.4, 1.5, true, HAUGEN),
  N("max_speed", "U19", "M", 31.4, 1.5, true, HAUGEN),
  N("max_speed", "U17", "M", 30.4, 1.6, true, HAUGEN),
  N("max_speed", "U15", "M", 28.7, 1.8, true, HAUGEN),
  N("max_speed", "SENIOR_PRO", "F", 28.7, 1.4, true, HAUGEN),

  // --- Profil force vitesse horizontal -----------------------------------
  N("sprint_f0", "SENIOR_PRO", "M", 7.6, 0.8, true, JIMENEZ),
  N("sprint_f0", "SENIOR_SEMIPRO", "M", 7.3, 0.8, true, JIMENEZ),
  N("sprint_f0", "U19", "M", 7.3, 0.8, true, JIMENEZ),
  N("sprint_f0", "U17", "M", 7.0, 0.8, true, JIMENEZ),
  N("sprint_f0", "U15", "M", 6.5, 0.9, true, JIMENEZ),
  N("sprint_f0", "SENIOR_PRO", "F", 6.6, 0.7, true, JIMENEZ),
  N("sprint_v0", "SENIOR_PRO", "M", 9.1, 0.5, true, JIMENEZ),
  N("sprint_v0", "U19", "M", 8.9, 0.5, true, JIMENEZ),
  N("sprint_v0", "U17", "M", 8.6, 0.5, true, JIMENEZ),
  N("sprint_v0", "U15", "M", 8.1, 0.6, true, JIMENEZ),
  N("sprint_v0", "SENIOR_PRO", "F", 8.1, 0.5, true, JIMENEZ),
  N("sprint_pmax", "SENIOR_PRO", "M", 17.3, 2.0, true, JIMENEZ),
  N("sprint_pmax", "SENIOR_SEMIPRO", "M", 16.4, 2.0, true, JIMENEZ),
  N("sprint_pmax", "U19", "M", 16.5, 2.0, true, JIMENEZ),
  N("sprint_pmax", "U17", "M", 15.4, 2.0, true, JIMENEZ),
  N("sprint_pmax", "U15", "M", 13.5, 2.1, true, JIMENEZ),
  N("sprint_pmax", "SENIOR_PRO", "F", 13.6, 1.8, true, JIMENEZ),
  N("sprint_rfmax", "SENIOR_PRO", "M", 52.0, 2.0, true, JIMENEZ),
  N("sprint_rfmax", "U19", "M", 50.5, 2.0, true, JIMENEZ),
  N("sprint_rfmax", "U17", "M", 49.0, 2.0, true, JIMENEZ),
  N("sprint_rfmax", "SENIOR_PRO", "F", 49.5, 2.0, true, JIMENEZ),

  // --- Detente verticale --------------------------------------------------
  N("cmj_height", "SENIOR_PRO", "M", 38.5, 4.5, true, HAUGEN),
  N("cmj_height", "SENIOR_SEMIPRO", "M", 36.5, 4.5, true, HAUGEN),
  N("cmj_height", "SENIOR_AMATEUR", "M", 34.5, 5.0, true, HAUGEN),
  N("cmj_height", "U21", "M", 37.5, 4.5, true, HAUGEN),
  N("cmj_height", "U19", "M", 36.5, 4.5, true, HAUGEN),
  N("cmj_height", "U17", "M", 34.0, 4.5, true, HAUGEN),
  N("cmj_height", "U15", "M", 30.0, 4.5, true, HAUGEN),
  N("cmj_height", "U13", "M", 25.5, 4.0, true, HAUGEN),
  N("cmj_height", "SENIOR_PRO", "F", 29.5, 4.0, true, HAUGEN),
  N("cmj_height", "U19", "F", 28.0, 4.0, true, HAUGEN),
  N("cmj_height", "SENIOR_PRO", "M", 42.0, 4.5, true, HAUGEN, "GK"),
  // Puissance relative estimee par l'equation de Sayers, echelle propre a cette equation.
  N("cmj_power_rel", "SENIOR_PRO", "M", 49.5, 3.5, true, LOTURCO),
  N("cmj_power_rel", "U19", "M", 46.5, 3.5, true, LOTURCO),
  N("cmj_power_rel", "U17", "M", 43.0, 3.5, true, LOTURCO),
  N("cmj_rsi_mod", "SENIOR_PRO", "M", 0.45, 0.08, true, LOTURCO),
  N("cmj_rsi_mod", "U19", "M", 0.42, 0.08, true, LOTURCO),
  N("cmj_eur", "SENIOR_PRO", "M", 1.08, 0.07, true, LOTURCO),
  N("dj_rsi", "SENIOR_PRO", "M", 1.85, 0.35, true, LOTURCO),
  N("dj_rsi", "U19", "M", 1.7, 0.35, true, LOTURCO),
  N("dj_rsi", "U17", "M", 1.55, 0.35, true, LOTURCO),

  // --- Force ---------------------------------------------------------------
  N("nordic_force", "SENIOR_PRO", "M", 344, 60, true, OPAR),
  N("nordic_force", "SENIOR_SEMIPRO", "M", 320, 60, true, OPAR),
  N("nordic_force", "U19", "M", 310, 58, true, OPAR),
  N("nordic_force", "U17", "M", 280, 55, true, OPAR),
  N("nordic_force", "SENIOR_PRO", "F", 250, 50, true, OPAR),
  N("nordic_rel", "SENIOR_PRO", "M", 8.8, 1.4, true, OPAR),
  N("nordic_rel", "U19", "M", 8.4, 1.4, true, OPAR),
  N("groin_add_rel", "SENIOR_PRO", "M", 3.4, 0.6, true, THORBORG),
  N("groin_add_rel", "U19", "M", 3.2, 0.6, true, THORBORG),
  N("groin_add_rel", "SENIOR_PRO", "F", 2.8, 0.5, true, THORBORG),
  N("groin_ratio", "SENIOR_PRO", "M", 1.05, 0.14, true, THORBORG),
  N("imtp_rel", "SENIOR_PRO", "M", 31.0, 5.0, true, LOTURCO),
  N("imtp_rel", "U19", "M", 28.5, 5.0, true, LOTURCO),
  N("onerm_rel_back_squat", "SENIOR_PRO", "M", 1.75, 0.3, true, LOTURCO),
  N("onerm_rel_back_squat", "U19", "M", 1.55, 0.3, true, LOTURCO),
  N("onerm_rel_back_squat", "U17", "M", 1.3, 0.3, true, LOTURCO),

  // --- Endurance ------------------------------------------------------------
  // Chaque methode d'estimation a sa propre echelle : une valeur issue du Yo-Yo
  // n'est pas comparable a une valeur issue du 30-15. Les cles sont donc distinctes.
  N("vo2max_yoyo", "SENIOR_PRO", "M", 60.0, 4.5, true, BANGSBO),
  N("vo2max_yoyo", "SENIOR_SEMIPRO", "M", 57.0, 4.5, true, BANGSBO),
  N("vo2max_yoyo", "SENIOR_AMATEUR", "M", 54.0, 5.0, true, BANGSBO),
  N("vo2max_yoyo", "U19", "M", 58.5, 4.5, true, BANGSBO),
  N("vo2max_yoyo", "U17", "M", 56.5, 4.5, true, BANGSBO),
  N("vo2max_yoyo", "U15", "M", 53.5, 4.5, true, BANGSBO),
  N("vo2max_yoyo", "SENIOR_PRO", "F", 51.0, 4.0, true, BANGSBO),
  N("vo2max_yoyo", "SENIOR_PRO", "M", 52.0, 4.5, true, BANGSBO, "GK"),
  N("vo2max_ift", "SENIOR_PRO", "M", 52.5, 3.5, true, BUCHHEIT),
  N("vo2max_ift", "SENIOR_SEMIPRO", "M", 50.5, 3.5, true, BUCHHEIT),
  N("vo2max_ift", "SENIOR_AMATEUR", "M", 48.5, 3.8, true, BUCHHEIT),
  N("vo2max_ift", "U19", "M", 51.0, 3.5, true, BUCHHEIT),
  N("vo2max_ift", "U17", "M", 49.0, 3.5, true, BUCHHEIT),
  N("vo2max_ift", "U15", "M", 46.5, 3.6, true, BUCHHEIT),
  N("vo2max_ift", "SENIOR_PRO", "F", 45.0, 3.2, true, BUCHHEIT),
  N("vo2max_ift", "SENIOR_PRO", "M", 47.5, 3.5, true, BUCHHEIT, "GK"),
  N("vo2max_mas", "SENIOR_PRO", "M", 59.5, 3.5, true, "VMA x 3.5"),
  N("vo2max_mas", "U19", "M", 57.8, 3.5, true, "VMA x 3.5"),
  N("vo2max_mas", "U17", "M", 56.0, 3.5, true, "VMA x 3.5"),
  N("yoyo_ir1_distance", "SENIOR_PRO", "M", 2100, 400, true, BANGSBO),
  N("yoyo_ir1_distance", "SENIOR_SEMIPRO", "M", 1800, 400, true, BANGSBO),
  N("yoyo_ir1_distance", "U19", "M", 1900, 400, true, BANGSBO),
  N("yoyo_ir1_distance", "U17", "M", 1680, 380, true, BANGSBO),
  N("yoyo_ir1_distance", "SENIOR_PRO", "F", 1250, 300, true, BANGSBO),
  N("yoyo_ir2_distance", "SENIOR_PRO", "M", 880, 200, true, BANGSBO),
  N("vift", "SENIOR_PRO", "M", 19.5, 1.2, true, BUCHHEIT),
  N("vift", "SENIOR_SEMIPRO", "M", 18.8, 1.2, true, BUCHHEIT),
  N("vift", "U19", "M", 19.0, 1.2, true, BUCHHEIT),
  N("vift", "U17", "M", 18.3, 1.2, true, BUCHHEIT),
  N("vift", "U15", "M", 17.3, 1.3, true, BUCHHEIT),
  N("vift", "SENIOR_PRO", "F", 17.5, 1.1, true, BUCHHEIT),
  N("mas", "SENIOR_PRO", "M", 17.0, 1.0, true, BUCHHEIT),
  N("mas", "U19", "M", 16.5, 1.0, true, BUCHHEIT),
  N("mas", "U17", "M", 16.0, 1.0, true, BUCHHEIT),
  N("rsa_decrement", "SENIOR_PRO", "M", 4.2, 1.5, false, "Impellizzeri et al. 2008"),
  N("bronco_time", "SENIOR_PRO", "M", 300, 22, false, "Reperes de terrain rugby et football"),
  N("asr", "SENIOR_PRO", "M", 13.0, 2.0, true, BUCHHEIT),

  // --- Changement de direction ---------------------------------------------
  N("cod_505_best", "SENIOR_PRO", "M", 2.42, 0.12, false, "Nimphius et al. 2016"),
  N("cod_505_best", "U19", "M", 2.48, 0.12, false, "Nimphius et al. 2016"),
  N("cod_505_best", "U17", "M", 2.56, 0.13, false, "Nimphius et al. 2016"),
  N("cod_deficit", "SENIOR_PRO", "M", 0.68, 0.12, false, "Nimphius et al. 2018"),
  N("illinois_time", "SENIOR_PRO", "M", 15.8, 0.7, false, "Hachana et al. 2013"),
  N("t_test_time", "SENIOR_PRO", "M", 9.6, 0.5, false, "Pauole et al. 2000"),

  // --- Composition corporelle ------------------------------------------------
  // Valeurs obtenues par plis cutanes, equation de Durnin et Womersley.
  N("body_fat", "SENIOR_PRO", "M", 11.5, 2.0, false, LOTURCO),
  N("body_fat", "SENIOR_SEMIPRO", "M", 12.5, 2.2, false, LOTURCO),
  N("body_fat", "SENIOR_AMATEUR", "M", 13.5, 2.5, false, LOTURCO),
  N("body_fat", "U19", "M", 11.0, 2.2, false, LOTURCO),
  N("body_fat", "U17", "M", 11.5, 2.4, false, LOTURCO),
  N("body_fat", "U15", "M", 12.5, 2.6, false, LOTURCO),
  N("body_fat", "SENIOR_PRO", "F", 19.5, 2.6, false, LOTURCO),
  N("body_fat", "SENIOR_PRO", "M", 13.5, 2.2, false, LOTURCO, "GK"),

  // --- Mobilite ----------------------------------------------------------------
  N("dorsiflexion", "SENIOR_PRO", "M", 11.5, 2.2, true, "Bennell et al. 1998"),
  N("dorsiflexion", "U19", "M", 11.0, 2.2, true, "Bennell et al. 1998"),
];

/** Ordre de repli quand la population exacte n'a pas de reference publiee. */
const FALLBACK: Record<Population, Population[]> = {
  SENIOR_PRO: ["SENIOR_SEMIPRO", "SENIOR_AMATEUR"],
  SENIOR_SEMIPRO: ["SENIOR_PRO", "SENIOR_AMATEUR"],
  SENIOR_AMATEUR: ["SENIOR_SEMIPRO", "SENIOR_PRO"],
  U21: ["U19", "SENIOR_PRO"],
  U19: ["U21", "U17", "SENIOR_PRO"],
  U17: ["U19", "U15"],
  U15: ["U17", "U13"],
  U13: ["U15"],
};

/** Deduit la population de reference a partir de la categorie et du niveau de l'equipe. */
export const resolvePopulation = (category: string, level?: string | null): Population => {
  if (category !== "SENIOR") return (category as Population) ?? "SENIOR_AMATEUR";
  if (level === "PRO") return "SENIOR_PRO";
  if (level === "SEMI_PRO") return "SENIOR_SEMIPRO";
  return "SENIOR_AMATEUR";
};

export const findNorm = (
  metricKey: string,
  population: Population,
  sex: "M" | "F",
  position?: string | null,
): NormRow | null => {
  const candidates = NORMS.filter((n) => n.metricKey === metricKey && n.sex === sex);
  if (candidates.length === 0) return null;

  const chain: Population[] = [population, ...(FALLBACK[population] ?? [])];
  for (const pop of chain) {
    const withPosition = position
      ? candidates.find((n) => n.population === pop && n.position === position)
      : undefined;
    if (withPosition) return withPosition;
    const withoutPosition = candidates.find((n) => n.population === pop && !n.position);
    if (withoutPosition) return withoutPosition;
  }
  return null;
};

export interface NormComparison {
  metricKey: string;
  value: number;
  percentile: number;
  zScore: number;
  normMean: number;
  normSd: number;
  population: Population;
  source: string;
  higherIsBetter: boolean;
  band: "tres faible" | "faible" | "moyen" | "bon" | "tres bon";
}

const bandFromPercentile = (percentile: number): NormComparison["band"] => {
  if (percentile < 15) return "tres faible";
  if (percentile < 35) return "faible";
  if (percentile < 65) return "moyen";
  if (percentile < 85) return "bon";
  return "tres bon";
};

/**
 * Situe une valeur par rapport a la population de reference.
 * Pour les metriques ou une valeur basse est meilleure, le z score est inverse
 * afin qu'un percentile eleve signifie toujours une meilleure performance.
 */
export const compareToNorm = (
  metricKey: string,
  value: number,
  population: Population,
  sex: "M" | "F",
  position?: string | null,
): NormComparison | null => {
  const norm = findNorm(metricKey, population, sex, position);
  if (!norm) return null;

  const rawZ = zScore(value, norm.mean, norm.sd);
  const adjustedZ = norm.higherIsBetter ? rawZ : -rawZ;
  const percentile = percentileFromZ(adjustedZ);

  return {
    metricKey,
    value,
    percentile,
    zScore: Number(adjustedZ.toFixed(2)),
    normMean: norm.mean,
    normSd: norm.sd,
    population: norm.population,
    source: norm.source,
    higherIsBetter: norm.higherIsBetter,
    band: bandFromPercentile(percentile),
  };
};

/** Percentile calcule sur une table de deciles saisie manuellement par le club. */
export const compareToCustomTable = percentileFromTable;

/**
 * Seuils absolus, pour les metriques que l'on ne doit pas lire en percentile.
 *
 * Les indices d'asymetrie sont bornes a zero et fortement asymetriques dans leur
 * distribution : leur appliquer un z score gaussien produirait des percentiles
 * trompeurs. La litterature raisonne d'ailleurs en seuils, pas en rangs.
 */
export interface MetricThreshold {
  warn: number;
  danger: number;
  /** true quand une valeur basse est souhaitable, cas de tous les indices d'asymetrie. */
  lowerIsBetter: boolean;
  reference: string;
}

export const METRIC_THRESHOLDS: Record<string, MetricThreshold> = {
  cmj_asym: { warn: 10, danger: 15, lowerIsBetter: true, reference: "Bishop et al. 2021" },
  nordic_asym: { warn: 10, danger: 15, lowerIsBetter: true, reference: "Opar et al. 2015" },
  groin_add_asym: { warn: 10, danger: 15, lowerIsBetter: true, reference: "Thorborg et al. 2017" },
  cod_505_asym: { warn: 10, danger: 15, lowerIsBetter: true, reference: "Nimphius et al. 2018" },
  dorsiflexion_asym: { warn: 15, danger: 25, lowerIsBetter: true, reference: "Hoog et al. 2016" },
  cmj_bilateral_deficit: { warn: 15, danger: 25, lowerIsBetter: true, reference: "Bishop et al. 2021" },
  hop_lsi_worst: { warn: 90, danger: 80, lowerIsBetter: false, reference: "Grindem et al. 2016" },
  groin_ratio: { warn: 0.9, danger: 0.8, lowerIsBetter: false, reference: "Esteve et al. 2020" },
};

export type ThresholdStatus = "bon" | "vigilance" | "alerte";

export const evaluateThreshold = (key: string, value: number): ThresholdStatus | null => {
  const threshold = METRIC_THRESHOLDS[key];
  if (!threshold) return null;
  if (threshold.lowerIsBetter) {
    if (value >= threshold.danger) return "alerte";
    if (value >= threshold.warn) return "vigilance";
    return "bon";
  }
  if (value <= threshold.danger) return "alerte";
  if (value <= threshold.warn) return "vigilance";
  return "bon";
};

/** Metriques retenues pour le radar de profil, dans l'ordre d'affichage. */
export const RADAR_METRICS: Array<{ key: string; label: { fr: string; en: string } }> = [
  { key: "sprint_10m", label: { fr: "Acceleration", en: "Acceleration" } },
  { key: "sprint_vmax", label: { fr: "Vitesse max", en: "Max speed" } },
  { key: "cmj_height", label: { fr: "Detente", en: "Jump" } },
  { key: "cod_505_best", label: { fr: "Changement de direction", en: "Change of direction" } },
  { key: "vift", label: { fr: "Endurance", en: "Endurance" } },
  { key: "nordic_rel", label: { fr: "Force ischio", en: "Hamstring strength" } },
];
