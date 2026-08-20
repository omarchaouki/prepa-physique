import {
  compute3015Ift,
  computeBronco,
  computeMas,
  computeRsa,
  computeYoYo,
  predictedMaxHr,
  type YoYoLevel,
} from "../endurance";
import { anaerobicSpeedReserve } from "../sprint";
import { round } from "../stats";
import { num, str, type ComputedMetric, type TestDefinition } from "../types";

const metric = (
  key: string,
  fr: string,
  en: string,
  value: number,
  unit: string,
  higherIsBetter: boolean,
  primary = false,
  decimals = 2,
): ComputedMetric => ({ key, label: { fr, en }, value, unit, higherIsBetter, primary, decimals });

export const yoyoTest: TestDefinition = {
  key: "yoyo",
  name: { fr: "Yo-Yo intermittent recovery", en: "Yo-Yo intermittent recovery" },
  shortName: { fr: "Yo-Yo", en: "Yo-Yo" },
  category: "ENDURANCE",
  description: {
    fr: "Test navette progressif avec récupération active de dix secondes. C'est le test de terrain le plus spécifique des exigences intermittentes du football.",
    en: "Progressive shuttle test with ten seconds of active recovery. The field test most specific to the intermittent demands of football.",
  },
  protocol: {
    fr: "Navettes de deux fois vingt mètres au rythme des signaux sonores, suivies de dix secondes de récupération active sur cinq mètres. Le test s'arrêté après deux avertissements. Noter la distance totale parcourue.",
    en: "Two by twenty metre shuttles paced by audio signals, followed by ten seconds of active recovery over five metres. The test ends after two warnings. Record total distance covered.",
  },
  equipment: { fr: "Bande sonore, plots, terrain de 25 mètres", en: "Audio track, cones, 25 m area" },
  durationMin: 20,
  reference: "Bangsbo, Iaia & Krustrup 2008",
  fields: [
    {
      key: "level",
      label: { fr: "Niveau du test", en: "Test level" },
      unit: "",
      type: "select",
      options: [
        { value: "IR1", label: { fr: "Niveau 1 (capacité)", en: "Level 1 (capacity)" } },
        { value: "IR2", label: { fr: "Niveau 2 (puissance)", en: "Level 2 (power)" } },
      ],
    },
    { key: "distance", label: { fr: "Distance totale", en: "Total distance" }, unit: "m", type: "number", step: 40, min: 200, max: 4000 },
    { key: "maxHr", label: { fr: "Fréquence cardiaque maximale atteinte", en: "Peak heart rate reached" }, unit: "bpm", type: "number", step: 1, min: 120, max: 230, optional: true },
  ],
  compute: (raw) => {
    const distance = num(raw, "distance");
    if (!distance) return { metrics: [], summary: null, flags: [], details: {} };
    const level = (str(raw, "level") as YoYoLevel) ?? "IR1";
    const result = computeYoYo(distance, level);

    const metrics: ComputedMetric[] = [
      metric(`yoyo_${level.toLowerCase()}_distance`, `Distance Yo-Yo ${level}`, `Yo-Yo ${level} distance`, distance, "m", true, true, 0),
      // La cle est propre a la methode : les equations Yo-Yo, 30-15 et VMA ne
      // produisent pas des valeurs comparables entre elles.
      metric("vo2max_yoyo", "VO2max (Yo-Yo)", "VO2max (Yo-Yo)", result.vo2maxMlKgMin, "ml/kg/min", true, true, 1),
    ];
    const maxHr = num(raw, "maxHr");
    if (maxHr) metrics.push(metric("hr_max_measured", "Frequence cardiaque maximale", "Maximum heart rate", maxHr, "bpm", true, false, 0));

    return {
      metrics,
      summary: { fr: `Niveau ${result.category}. ${result.interpretation}`, en: `Level ${result.category}. ${result.interpretation}` },
      flags: [],
      details: { result },
    };
  },
};

export const ift3015Test: TestDefinition = {
  key: "ift_30_15",
  name: { fr: "30-15 Intermittent Fitness Test", en: "30-15 Intermittent Fitness Test" },
  shortName: { fr: "30-15 IFT", en: "30-15 IFT" },
  category: "ENDURANCE",
  description: {
    fr: "Test progressif intermittent qui intégré la capacité aérobie, la tolérance aux changements de direction et la capacité de récupération. Sa vitesse finale est directement utilisable pour prescrire les séances intermittentes.",
    en: "Progressive intermittent test that integrates aerobic capacity, tolerance to direction changes and recovery ability. Its final speed is directly usable to prescribe interval sessions.",
  },
  protocol: {
    fr: "Courses de trente secondes sur quarante mètres entrecoupées de quinze secondes de marche, vitesse initiale de 8 km/h augmentée de 0.5 km/h par palier. Retenir la dernière vitesse maintenue pendant trente secondes complètes.",
    en: "Thirty second runs over forty metres separated by fifteen seconds of walking, starting at 8 km/h and increasing by 0.5 km/h per stage. Record the last speed sustained for a full thirty seconds.",
  },
  equipment: { fr: "Bande sonore, plots, terrain de 40 mètres", en: "Audio track, cones, 40 m area" },
  durationMin: 25,
  reference: "Buchheit 2008",
  needsContext: ["bodyMassKg", "ageYears", "sex"],
  fields: [
    { key: "vift", label: { fr: "Vitesse finale (VIFT)", en: "Final speed (VIFT)" }, unit: "km/h", type: "number", step: 0.5, min: 10, max: 26 },
    { key: "maxSprintSpeed", label: { fr: "Vitesse maximale de sprint", en: "Maximum sprint speed" }, unit: "km/h", type: "number", step: 0.1, min: 20, max: 40, optional: true, help: { fr: "Permet de calculer la réserve de vitesse anaérobie et d'individualiser les intervalles.", en: "Used to compute the anaerobic speed reserve and individualise intervals." } },
  ],
  compute: (raw, ctx) => {
    const vift = num(raw, "vift");
    if (!vift) return { metrics: [], summary: null, flags: [], details: {} };

    const result = compute3015Ift({
      viftKmh: vift,
      ageYears: ctx.ageYears,
      bodyMassKg: ctx.bodyMassKg,
      sex: ctx.sex,
    });

    const metrics: ComputedMetric[] = [
      metric("vift", "VIFT", "VIFT", vift, "km/h", true, true, 1),
      metric("vo2max_ift", "VO2max (30-15)", "VO2max (30-15)", result.vo2maxMlKgMin, "ml/kg/min", true, true, 1),
    ];

    const details: Record<string, unknown> = { result, maxHrPredicted: predictedMaxHr(ctx.ageYears) };
    const flags: string[] = [];

    const maxSprint = num(raw, "maxSprintSpeed");
    if (maxSprint) {
      const asr = anaerobicSpeedReserve(maxSprint, vift);
      metrics.push(metric("asr", "Reserve de vitesse anaerobie", "Anaerobic speed reserve", asr.asrKmh, "km/h", true, true, 2));
      details.asr = {
        asrKmh: asr.asrKmh,
        interpretation: asr.interpretation,
        prescriptions: [30, 50, 70].map((p) => ({ percentAsr: p, speedKmh: asr.speedAtPercent(p) })),
      };
      flags.push(asr.interpretation);
    }

    return {
      metrics,
      summary: {
        fr: `Niveau ${result.category}. Les vitesses de prescription individualisees sont calculees a partir de la VIFT et disponibles dans le detail du test.`,
        en: `Level ${result.category}. Individualised prescription speeds are derived from VIFT and available in the test details.`,
      },
      flags,
      details,
    };
  },
};

export const masTest: TestDefinition = {
  key: "mas",
  name: { fr: "Vitesse aérobie maximale (VAMEVAL ou Léger)", en: "Maximal aerobic speed (VAMEVAL or Leger)" },
  shortName: { fr: "VMA", en: "MAS" },
  category: "ENDURANCE",
  description: {
    fr: "Test progressif continu qui donne la vitesse aérobie maximale, base historique de la prescription des allures de course.",
    en: "Continuous progressive test giving maximal aerobic speed, the historical basis for running pace prescription.",
  },
  protocol: {
    fr: "Piste balisée tous les vingt mètres, départ à 8 km/h avec augmentation de 0.5 km/h toutes les minutes. Le test s'arrêté quand le joueur ne peut plus suivre les plots.",
    en: "Track marked every twenty metres, starting at 8 km/h with 0.5 km/h increments every minute. The test ends when the athlete can no longer keep up with the markers.",
  },
  equipment: { fr: "Bande sonore, plots tous les 20 mètres, piste", en: "Audio track, cones every 20 m, running track" },
  durationMin: 20,
  reference: "Cazorla 1990, Leger & Boucher 1980",
  fields: [{ key: "mas", label: { fr: "Vitesse finale", en: "Final speed" }, unit: "km/h", type: "number", step: 0.5, min: 10, max: 25 }],
  compute: (raw) => {
    const mas = num(raw, "mas");
    if (!mas) return { metrics: [], summary: null, flags: [], details: {} };
    const result = computeMas(mas);

    return {
      metrics: [
        metric("mas", "VMA", "MAS", result.masKmh, "km/h", true, true, 1),
        metric("vo2max_mas", "VO2max (VMA)", "VO2max (MAS)", result.vo2maxMlKgMin, "ml/kg/min", true, true, 1),
      ],
      summary: {
        fr: `VMA de ${result.masKmh} km/h, soit ${result.distance6minM} metres en six minutes. Les allures de prescription sont disponibles dans le detail du test.`,
        en: `MAS of ${result.masKmh} km/h, that is ${result.distance6minM} metres in six minutes. Prescription paces are available in the test details.`,
      },
      flags: mas < 15 ? ["VMA inferieure a 15 km/h, base aerobie a developper en priorite."] : [],
      details: { result },
    };
  },
};

export const broncoTest: TestDefinition = {
  key: "bronco",
  name: { fr: "Test Bronco", en: "Bronco test" },
  shortName: { fr: "Bronco", en: "Bronco" },
  category: "ENDURANCE",
  description: {
    fr: "Mille deux cents mètres en navettes de 20, 40 et 60 mètres répétées cinq fois. Test de capacité intermittente exigeant et facile à organiser.",
    en: "Twelve hundred metres in 20, 40 and 60 metre shuttles repeated five times. A demanding intermittent capacity test that is easy to set up.",
  },
  protocol: {
    fr: "Plots à 20, 40 et 60 mètres. Le joueur enchaîne aller retour 20, aller retour 40, aller retour 60, cinq fois de suite, le plus vite possible et sans pause.",
    en: "Cones at 20, 40 and 60 metres. The athlete runs out and back to 20, then 40, then 60, five times in a row, as fast as possible with no rest.",
  },
  equipment: { fr: "Trois plots, chronomètre", en: "Three cones, stopwatch" },
  durationMin: 12,
  reference: "All Blacks protocol, rugby and football reference values",
  fields: [{ key: "time", label: { fr: "Temps total", en: "Total time" }, unit: "s", type: "number", step: 0.1, min: 200, max: 500 }],
  compute: (raw) => {
    const time = num(raw, "time");
    if (!time) return { metrics: [], summary: null, flags: [], details: {} };
    const result = computeBronco(time);
    return {
      metrics: [
        metric("bronco_time", "Temps Bronco", "Bronco time", result.totalTimeS, "s", false, true, 1),
        metric("bronco_speed", "Vitesse moyenne Bronco", "Bronco average speed", result.averageSpeedKmh, "km/h", true, false, 2),
      ],
      summary: { fr: `${result.display}, niveau ${result.category}.`, en: `${result.display}, level ${result.category}.` },
      flags: [],
      details: { result },
    };
  },
};

export const rsaTest: TestDefinition = {
  key: "rsa",
  name: { fr: "Capacité de sprints répétés", en: "Repeated sprint ability" },
  shortName: { fr: "RSA", en: "RSA" },
  category: "ENDURANCE",
  description: {
    fr: "Série de sprints maximaux avec récupération courte. Mesure la capacité à répéter les efforts décisifs du match.",
    en: "Series of maximal sprints with short recovery. Measures the ability to repeat the decisive efforts of the match.",
  },
  protocol: {
    fr: "Six à huit sprints de trente mètres, départ toutes les vingt ou trente secondes selon le protocole retenu. Encouragement systématique sur chaque répétition, sinon le décrément n'est pas interprétable.",
    en: "Six to eight thirty metre sprints, starting every twenty or thirty seconds depending on the chosen protocol. Consistent encouragement on every repetition, otherwise the decrement cannot be interpreted.",
  },
  equipment: { fr: "Cellules photoélectriques, 30 mètres", en: "Timing gates, 30 m" },
  durationMin: 15,
  reference: "Fitzsimons et al. 1993, Impellizzeri et al. 2008",
  fields: Array.from({ length: 8 }, (_, i) => ({
    key: `t${i + 1}`,
    label: { fr: `Sprint ${i + 1}`, en: `Sprint ${i + 1}` },
    unit: "s",
    type: "number" as const,
    step: 0.001,
    min: 3,
    max: 10,
    optional: i >= 6,
    group: { fr: "Temps par répétition", en: "Time per repetition" },
  })).concat([
    {
      key: "bestSingle",
      label: { fr: "Meilleur sprint isole de référence", en: "Best isolated sprint reference" },
      unit: "s",
      type: "number" as const,
      step: 0.001,
      min: 3,
      max: 10,
      optional: true,
      group: { fr: "Référence", en: "Reference" },
    },
  ]),
  compute: (raw) => {
    const times = Array.from({ length: 8 }, (_, i) => num(raw, `t${i + 1}`)).filter(
      (t): t is number => t !== undefined,
    );
    const result = computeRsa({ times, bestSingleSprintS: num(raw, "bestSingle") });
    if (!result) return { metrics: [], summary: null, flags: [], details: {} };

    return {
      metrics: [
        metric("rsa_best", "Meilleur temps", "Best time", result.bestTimeS, "s", false, true, 3),
        metric("rsa_mean", "Temps moyen", "Mean time", result.meanTimeS, "s", false, true, 3),
        metric("rsa_decrement", "Decrement", "Decrement", result.decrementPct, "%", false, true, 2),
        metric("rsa_total", "Temps total", "Total time", result.totalTimeS, "s", false, false, 2),
      ],
      summary: { fr: `Niveau ${result.category}. ${result.interpretation}`, en: `Level ${result.category}. ${result.interpretation}` },
      flags: result.decrementPct > 8 ? [result.interpretation] : [],
      details: { result, times },
    };
  },
};

export const heartRateProfile: TestDefinition = {
  key: "hr_profile",
  name: { fr: "Profil de fréquence cardiaque", en: "Heart rate profile" },
  shortName: { fr: "FC", en: "HR" },
  category: "ENDURANCE",
  description: {
    fr: "Fréquences cardiaques de repos et maximale, base des zones d'entraînement individualisées et du suivi de la charge interne.",
    en: "Resting and maximum heart rates, the basis of individualised training zones and internal load monitoring.",
  },
  protocol: {
    fr: "Fréquence de repos mesurée au réveil, allonge, pendant une minute, sur au moins trois matins. Fréquence maximale relevée lors d'un test progressif mène à épuisement, jamais estimée si une mesure est possible.",
    en: "Resting heart rate measured on waking, lying down, over one minute, on at least three mornings. Maximum heart rate taken from a progressive test to exhaustion, never estimated when a measurement is possible.",
  },
  equipment: { fr: "Cardiofréquencemètre à ceinture", en: "Chest strap heart rate monitor" },
  durationMin: 5,
  reference: "Tanaka et al. 2001, Buchheit 2014",
  needsContext: ["ageYears"],
  fields: [
    { key: "restingHr", label: { fr: "Fréquence de repos", en: "Resting heart rate" }, unit: "bpm", type: "number", step: 1, min: 30, max: 100 },
    { key: "maxHr", label: { fr: "Fréquence maximale mesurée", en: "Measured maximum heart rate" }, unit: "bpm", type: "number", step: 1, min: 150, max: 230, optional: true },
  ],
  compute: (raw, ctx) => {
    const restingHr = num(raw, "restingHr");
    const measuredMax = num(raw, "maxHr");
    const maxHr = measuredMax ?? predictedMaxHr(ctx.ageYears);
    const metrics: ComputedMetric[] = [];

    if (restingHr) metrics.push(metric("hr_rest", "Frequence de repos", "Resting heart rate", restingHr, "bpm", false, true, 0));
    metrics.push(metric("hr_max", "Frequence maximale", "Maximum heart rate", maxHr, "bpm", true, true, 0));
    if (restingHr) metrics.push(metric("hr_reserve", "Reserve cardiaque", "Heart rate reserve", round(maxHr - restingHr, 0), "bpm", true, false, 0));

    return {
      metrics,
      summary: {
        fr: measuredMax
          ? "Zones calculees a partir de la frequence maximale mesuree, ce qui est la reference."
          : `Aucune frequence maximale mesuree, valeur estimee a ${maxHr} bpm par l'equation de Tanaka. A remplacer des qu'une mesure est disponible.`,
        en: measuredMax
          ? "Zones computed from the measured maximum heart rate, which is the reference."
          : `No measured maximum heart rate, value estimated at ${maxHr} bpm using the Tanaka equation. Replace as soon as a measurement is available.`,
      },
      flags: [],
      details: { maxHr, restingHr, estimated: !measuredMax },
    };
  },
};
