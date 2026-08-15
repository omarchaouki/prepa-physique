/**
 * Outils statistiques communs a tous les modules.
 *
 * References principales :
 *  - Hopkins WG (2000) Measures of reliability in sports medicine and science.
 *    Sports Medicine 30(1):1-15.  (erreur typique, CV, plus petite variation utile)
 *  - Williams S et al. (2017) Better way to determine the acute:chronic workload
 *    ratio? Br J Sports Med 51:209-210.  (moyenne mobile exponentielle)
 */

export const round = (value: number, decimals = 2): number => {
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
};

export const mean = (values: number[]): number =>
  values.length === 0 ? 0 : values.reduce((a, b) => a + b, 0) / values.length;

/** Ecart type de l'echantillon (denominateur n moins 1). */
export const sd = (values: number[]): number => {
  if (values.length < 2) return 0;
  const m = mean(values);
  const variance =
    values.reduce((acc, v) => acc + (v - m) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
};

export const median = (values: number[]): number => {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
};

/** Coefficient de variation en pourcentage. Un CV inferieur a 5% traduit un test fiable. */
export const cv = (values: number[]): number => {
  const m = mean(values);
  return m === 0 ? 0 : (sd(values) / m) * 100;
};

/**
 * Plus petite variation utile (Smallest Worthwhile Change).
 * Convention de Hopkins : 0.2 fois l'ecart type inter individuel.
 */
export const swc = (values: number[], factor = 0.2): number => sd(values) * factor;

export const zScore = (value: number, populationMean: number, populationSd: number): number =>
  populationSd === 0 ? 0 : (value - populationMean) / populationSd;

/** Fonction de repartition de la loi normale centree reduite (approximation d'Abramowitz et Stegun). */
export const normalCdf = (z: number): number => {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp((-z * z) / 2);
  const p =
    d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z > 0 ? 1 - p : p;
};

/** Percentile a partir d'un z score, borne entre 1 et 99 pour rester lisible. */
export const percentileFromZ = (z: number): number =>
  Math.min(99, Math.max(1, Math.round(normalCdf(z) * 100)));

/** Rang percentile d'une valeur au sein d'un echantillon observe. */
export const percentileRank = (value: number, sample: number[], higherIsBetter = true): number => {
  if (sample.length === 0) return 50;
  const below = sample.filter((v) => (higherIsBetter ? v < value : v > value)).length;
  const equal = sample.filter((v) => v === value).length;
  return Math.min(99, Math.max(1, Math.round(((below + equal * 0.5) / sample.length) * 100)));
};

/**
 * Interpolation lineaire d'un percentile a partir d'une table p10 a p90.
 * Utilise quand la population de reference n'est publiee que sous forme de deciles.
 */
export const percentileFromTable = (
  value: number,
  table: { p10?: number | null; p25?: number | null; p50?: number | null; p75?: number | null; p90?: number | null },
  higherIsBetter = true,
): number | null => {
  const points: Array<[number, number]> = [];
  if (table.p10 != null) points.push([table.p10, 10]);
  if (table.p25 != null) points.push([table.p25, 25]);
  if (table.p50 != null) points.push([table.p50, 50]);
  if (table.p75 != null) points.push([table.p75, 75]);
  if (table.p90 != null) points.push([table.p90, 90]);
  if (points.length < 2) return null;

  // Quand une valeur basse est meilleure (un temps de sprint), on inverse l'echelle.
  const scale = higherIsBetter ? points : points.map(([v, p]) => [v, 100 - p] as [number, number]);
  scale.sort((a, b) => a[0] - b[0]);

  if (value <= scale[0][0]) return Math.max(1, scale[0][1]);
  if (value >= scale[scale.length - 1][0]) return Math.min(99, scale[scale.length - 1][1]);

  for (let i = 0; i < scale.length - 1; i += 1) {
    const [v1, p1] = scale[i];
    const [v2, p2] = scale[i + 1];
    if (value >= v1 && value <= v2) {
      const ratio = v2 === v1 ? 0 : (value - v1) / (v2 - v1);
      return Math.round(p1 + ratio * (p2 - p1));
    }
  }
  return null;
};

/** Regression lineaire simple par moindres carres. */
export const linearRegression = (
  xs: number[],
  ys: number[],
): { slope: number; intercept: number; r2: number } => {
  const n = xs.length;
  if (n < 2) return { slope: 0, intercept: ys[0] ?? 0, r2: 0 };
  const mx = mean(xs);
  const my = mean(ys);
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i += 1) {
    num += (xs[i] - mx) * (ys[i] - my);
    den += (xs[i] - mx) ** 2;
  }
  const slope = den === 0 ? 0 : num / den;
  const intercept = my - slope * mx;

  let ssRes = 0;
  let ssTot = 0;
  for (let i = 0; i < n; i += 1) {
    const predicted = slope * xs[i] + intercept;
    ssRes += (ys[i] - predicted) ** 2;
    ssTot += (ys[i] - my) ** 2;
  }
  return { slope, intercept, r2: ssTot === 0 ? 1 : 1 - ssRes / ssTot };
};

/** Moyenne mobile simple sur une fenetre glissante. */
export const rollingMean = (values: number[], window: number): number[] =>
  values.map((_, i) => {
    const start = Math.max(0, i - window + 1);
    return mean(values.slice(start, i + 1));
  });

/**
 * Moyenne mobile exponentielle. lambda = 2 / (N + 1).
 * Base de la charge aigue et chronique selon Williams et al. (2017).
 */
export const ewma = (values: number[], window: number): number[] => {
  const lambda = 2 / (window + 1);
  const output: number[] = [];
  let previous = values[0] ?? 0;
  values.forEach((value, index) => {
    previous = index === 0 ? value : value * lambda + previous * (1 - lambda);
    output.push(previous);
  });
  return output;
};

/** Indice d'asymetrie en pourcentage. Convention : 100 x (fort moins faible) / fort. */
export const asymmetryIndex = (left: number, right: number): number => {
  const high = Math.max(left, right);
  const low = Math.min(left, right);
  if (high === 0) return 0;
  return round(((high - low) / high) * 100, 1);
};

/** Limb Symmetry Index : cote teste rapporte au cote sain, en pourcentage. */
export const limbSymmetryIndex = (involved: number, uninvolved: number): number =>
  uninvolved === 0 ? 0 : round((involved / uninvolved) * 100, 1);

export const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

/** Variation en pourcentage entre deux mesures successives. */
export const percentChange = (from: number, to: number): number =>
  from === 0 ? 0 : round(((to - from) / from) * 100, 1);
