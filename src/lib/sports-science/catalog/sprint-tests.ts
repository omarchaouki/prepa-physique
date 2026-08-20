import { computeSprintProfile, flyingSpeed, interpretSprintProfile, TIMING_OFFSETS } from "../sprint";
import { computeChangeOfDirection, classifyIllinois, classifyTTest } from "../agility";
import { round } from "../stats";
import { num, type ComputedMetric, type TestDefinition } from "../types";

const metric = (
  key: string,
  fr: string,
  en: string,
  value: number,
  unit: string,
  higherIsBetter: boolean,
  primary = false,
  decimals = 2,
  side?: "L" | "R",
): ComputedMetric => ({
  key,
  label: { fr, en },
  value,
  unit,
  higherIsBetter,
  primary,
  decimals,
  side,
});

export const sprintLinear: TestDefinition = {
  key: "sprint_linear",
  name: { fr: "Sprint linéaire et profil force vitesse", en: "Linear sprint and force velocity profile" },
  shortName: { fr: "Sprint", en: "Sprint" },
  category: "SPRINT",
  description: {
    fr: "Sprint maximal départ arrêté avec temps de passage. Reconstruit le profil force vitesse horizontal par la méthode de Samozino.",
    en: "Maximal sprint from a standing start with split times. Rebuilds the horizontal force velocity profile using the Samozino method.",
  },
  protocol: {
    fr: "Échauffement complet incluant trois accélérations progressives. Départ arrêté, pied avant à 50 centimètres de la première cellule. Deux à trois essais maximaux avec 4 à 5 minutes de récupération. Retenir le meilleur essai. Noter la température et le vent.",
    en: "Full warm up with three progressive accelerations. Standing start, front foot 50 cm behind the first gate. Two to three maximal trials with 4 to 5 minutes rest. Keep the best trial. Record temperature and wind.",
  },
  equipment: { fr: "Cellules photoélectriques ou radar, 40 mètres de piste", en: "Timing gates or radar, 40 m runway" },
  durationMin: 20,
  reference: "Samozino et al. 2016, Morin & Samozino 2016",
  needsContext: ["bodyMassKg", "heightCm"],
  fields: [
    { key: "t5", label: { fr: "Temps à 5 m", en: "5 m time" }, unit: "s", type: "number", step: 0.001, min: 0.5, max: 3, optional: true, group: { fr: "Temps de passage", en: "Split times" } },
    { key: "t10", label: { fr: "Temps à 10 m", en: "10 m time" }, unit: "s", type: "number", step: 0.001, min: 1, max: 4, group: { fr: "Temps de passage", en: "Split times" } },
    { key: "t20", label: { fr: "Temps à 20 m", en: "20 m time" }, unit: "s", type: "number", step: 0.001, min: 2, max: 6, group: { fr: "Temps de passage", en: "Split times" } },
    { key: "t30", label: { fr: "Temps à 30 m", en: "30 m time" }, unit: "s", type: "number", step: 0.001, min: 3, max: 8, optional: true, group: { fr: "Temps de passage", en: "Split times" } },
    { key: "t40", label: { fr: "Temps à 40 m", en: "40 m time" }, unit: "s", type: "number", step: 0.001, min: 4, max: 10, optional: true, group: { fr: "Temps de passage", en: "Split times" } },
    {
      key: "timingStart",
      label: { fr: "Déclenchement du chronomètre", en: "Timing trigger" },
      unit: "",
      type: "select",
      optional: true,
      group: { fr: "Conditions", en: "Conditions" },
      help: {
        fr: "Cellules avec départ 0.5 m en arrière par défaut. Le profil force vitesse exige que l'instant zéro corresponde au premier mouvement, or avec des cellules le joueur est déjà lance au passage du faisceau, une correction est donc appliquée.",
        en: "The force velocity profile requires time zero to be the first movement. With timing gates the athlete is already moving at the beam, so a correction is applied.",
      },
      options: [
        { value: "photocell_05", label: { fr: "Cellules, départ 0.5 m en arrière", en: "Gates, 0.5 m behind start" } },
        { value: "photocell_1m", label: { fr: "Cellules, départ 1 m en arrière", en: "Gates, 1 m behind start" } },
        { value: "movement", label: { fr: "Vidéo ou radar, départ au premier mouvement", en: "Video or radar, movement onset" } },
      ],
    },
    { key: "temperature", label: { fr: "Température", en: "Temperature" }, unit: "C", type: "number", step: 0.5, min: -10, max: 50, optional: true, group: { fr: "Conditions", en: "Conditions" }, help: { fr: "Sert à corriger la densité de l'air. Par défaut 20 degrés.", en: "Used to correct air density. Defaults to 20 degrees." } },
    { key: "wind", label: { fr: "Vent de face", en: "Head wind" }, unit: "m/s", type: "number", step: 0.1, min: -5, max: 5, optional: true, group: { fr: "Conditions", en: "Conditions" }, help: { fr: "Positif pour un vent de face, négatif pour un vent de dos.", en: "Positive for head wind, negative for tail wind." } },
  ],
  compute: (raw, ctx) => {
    const splits = [
      { distance: 5, time: num(raw, "t5") },
      { distance: 10, time: num(raw, "t10") },
      { distance: 20, time: num(raw, "t20") },
      { distance: 30, time: num(raw, "t30") },
      { distance: 40, time: num(raw, "t40") },
    ]
      .filter((s): s is { distance: number; time: number } => s.time !== undefined)
      .sort((a, b) => a.distance - b.distance);

    const metrics: ComputedMetric[] = [];
    const flags: string[] = [];

    splits.forEach((s) => {
      metrics.push(
        metric(
          `sprint_${s.distance}m`,
          `Temps ${s.distance} m`,
          `${s.distance} m time`,
          s.time,
          "s",
          false,
          s.distance === 10 || s.distance === 30,
          3,
        ),
      );
    });

    if (splits.length >= 2) {
      const t10 = splits.find((s) => s.distance === 10)?.time;
      const t30 = splits.find((s) => s.distance === 30)?.time;
      if (t10 && t30) {
        const flying = flyingSpeed(20, t30 - t10);
        metrics.push(metric("sprint_flying_20", "Vitesse 10 a 30 m", "10 to 30 m speed", flying.kmh, "km/h", true, true, 2));
      }
    }

    // Par defaut on suppose le montage le plus repandu, cellules avec depart
    // 0.5 metre en arriere, car c'est celui que le staff utilise en general.
    const timingKey = String(raw.timingStart ?? "photocell_05");
    const timing = TIMING_OFFSETS[timingKey] ?? TIMING_OFFSETS.photocell_05;

    const profile =
      splits.length >= 2 && ctx.bodyMassKg > 0 && ctx.heightCm > 0
        ? computeSprintProfile({
            splits,
            bodyMassKg: ctx.bodyMassKg,
            heightM: ctx.heightCm / 100,
            temperatureC: num(raw, "temperature"),
            windMs: num(raw, "wind"),
            timingOffsetS: timing.seconds,
          })
        : null;

    let summary: { fr: string; en: string } | null = null;
    const details: Record<string, unknown> = {};

    if (profile) {
      const orientation = interpretSprintProfile(profile);
      metrics.push(
        metric("sprint_vmax", "Vitesse maximale", "Maximum velocity", profile.vmaxKmh, "km/h", true, true, 2),
        metric("sprint_f0", "F0 force horizontale", "F0 horizontal force", profile.f0, "N/kg", true, true, 2),
        metric("sprint_v0", "V0 vitesse theorique", "V0 theoretical velocity", profile.v0, "m/s", true, true, 2),
        metric("sprint_pmax", "Puissance maximale", "Maximum power", profile.pmax, "W/kg", true, true, 2),
        metric("sprint_rfmax", "Ratio de force maximal", "Maximum force ratio", profile.rfMax, "%", true, false, 2),
        metric("sprint_drf", "Decroissance du ratio de force", "Force ratio decrease", profile.drf, "%/m/s", true, false, 3),
        metric("sprint_tau", "Constante d'acceleration", "Acceleration constant", profile.tau, "s", false, false, 3),
      );

      details.profile = profile;
      details.orientation = orientation;
      details.timing = timing;
      flags.push(...profile.warnings);

      summary = {
        fr: `${orientation.message} ${orientation.priority}`,
        en: `${orientation.message} ${orientation.priority}`,
      };

      if (profile.quality === "douteux") {
        flags.push(
          "Qualite du modele insuffisante. Verifier les temps de passage, un portique mal positionne fausse tout le profil.",
        );
      }
    }

    return { metrics, summary, flags, details };
  },
};

export const sprintFlying: TestDefinition = {
  key: "sprint_flying",
  name: { fr: "Sprint lance", en: "Flying sprint" },
  shortName: { fr: "Lance", en: "Flying" },
  category: "SPRINT",
  description: {
    fr: "Mesure directe de la vitesse maximale sur un tronçon lance. Référence pour individualiser les seuils GPS et la réserve de vitesse.",
    en: "Direct measurement of maximum velocity over a flying section. Reference for individualising GPS thresholds and speed reserve.",
  },
  protocol: {
    fr: "Zone d'élan de 20 à 30 mètres puis tronçon chronomètre de 10 ou 20 mètres. Deux essais maximaux avec 5 minutes de récupération complète.",
    en: "20 to 30 m run up then a timed 10 or 20 m section. Two maximal trials with 5 minutes full recovery.",
  },
  equipment: { fr: "Cellules photoélectriques, 50 mètres", en: "Timing gates, 50 m" },
  durationMin: 12,
  reference: "Haugen et al. 2019",
  fields: [
    { key: "distance", label: { fr: "Distance chronométrée", en: "Timed distance" }, unit: "m", type: "number", step: 5, min: 5, max: 30 },
    { key: "time", label: { fr: "Temps", en: "Time" }, unit: "s", type: "number", step: 0.001, min: 0.3, max: 5 },
  ],
  compute: (raw) => {
    const distance = num(raw, "distance") ?? 20;
    const time = num(raw, "time");
    if (!time) return { metrics: [], summary: null, flags: [], details: {} };

    const speed = flyingSpeed(distance, time);
    const flags: string[] = [];
    if (speed.kmh < 29) {
      flags.push(
        "Vitesse maximale en dessous de 29 km/h, valeur basse pour un footballeur de champ. Verifier l'exposition hebdomadaire au sprint maximal.",
      );
    }

    return {
      metrics: [
        metric("max_speed", "Vitesse maximale", "Maximum speed", speed.kmh, "km/h", true, true, 2),
        metric("max_speed_ms", "Vitesse maximale", "Maximum speed", speed.ms, "m/s", true, false, 2),
      ],
      summary: {
        fr: `Vitesse maximale de ${speed.kmh} km/h. Cette valeur sert de reference pour individualiser le seuil de sprint en GPS, generalement fixe a 85% de la vitesse maximale.`,
        en: `Maximum speed of ${speed.kmh} km/h. Use this as the reference for individual GPS sprint thresholds, usually set at 85% of maximum speed.`,
      },
      flags,
      details: {
        gpsThresholds: {
          sprintThresholdKmh: round(speed.kmh * 0.85, 1),
          highSpeedThresholdKmh: round(speed.kmh * 0.6, 1),
        },
      },
    };
  },
};

export const test505: TestDefinition = {
  key: "test_505",
  name: { fr: "Test 505 et déficit de changement de direction", en: "505 test and change of direction deficit" },
  shortName: { fr: "505", en: "505" },
  category: "COD",
  description: {
    fr: "Demi tour à 180 degrés après 10 mètres d'élan. Compare au sprint sur 10 mètres, il isole la qualité de réorientation indépendamment de la vitesse linéaire.",
    en: "180 degree turn after a 10 m run up. Compared with the 10 m sprint it isolates reorientation quality independently of linear speed.",
  },
  protocol: {
    fr: "Cellule placee à 10 mètres du départ. Le joueur accéléré sur 10 mètres, franchit la cellule, pivote sur la ligne à 15 mètres et revient franchir la cellule. Deux essais par jambe de pivot, meilleur temps retenu.",
    en: "Gate placed 10 m from the start. The athlete accelerates over 10 m, crosses the gate, turns on the line at 15 m and returns through the gate. Two trials per turning leg, best time kept.",
  },
  equipment: { fr: "Cellules photoélectriques, 20 mètres, plots", en: "Timing gates, 20 m, cones" },
  durationMin: 15,
  reference: "Nimphius et al. 2016 et 2018",
  fields: [
    { key: "left", label: { fr: "505 pivot pied gauche", en: "505 left turning foot" }, unit: "s", type: "number", step: 0.001, min: 1.5, max: 5 },
    { key: "right", label: { fr: "505 pivot pied droit", en: "505 right turning foot" }, unit: "s", type: "number", step: 0.001, min: 1.5, max: 5 },
    { key: "sprint10", label: { fr: "Temps de référence 10 m", en: "10 m reference time" }, unit: "s", type: "number", step: 0.001, min: 1, max: 3, optional: true, help: { fr: "Nécessaire pour calculer le déficit de changement de direction. Repris automatiquement du test de sprint si laisse vide.", en: "Needed for the change of direction deficit. Taken from the sprint test automatically if left empty." } },
  ],
  compute: (raw) => {
    const result = computeChangeOfDirection({
      test505LeftS: num(raw, "left"),
      test505RightS: num(raw, "right"),
      sprint10mS: num(raw, "sprint10"),
    });

    const metrics: ComputedMetric[] = [];
    if (num(raw, "left") !== undefined)
      metrics.push(metric("cod_505", "Test 505", "505 test", num(raw, "left")!, "s", false, true, 3, "L"));
    if (num(raw, "right") !== undefined)
      metrics.push(metric("cod_505", "Test 505", "505 test", num(raw, "right")!, "s", false, true, 3, "R"));
    if (result.best505S != null)
      metrics.push(metric("cod_505_best", "Meilleur 505", "Best 505", result.best505S, "s", false, true, 3));
    if (result.asymmetryPct != null)
      metrics.push(metric("cod_505_asym", "Asymetrie 505", "505 asymmetry", result.asymmetryPct, "%", false, true, 1));
    if (result.codDeficitLeftS != null)
      metrics.push(metric("cod_deficit", "Deficit de changement de direction", "Change of direction deficit", result.codDeficitLeftS, "s", false, false, 3, "L"));
    if (result.codDeficitRightS != null)
      metrics.push(metric("cod_deficit", "Deficit de changement de direction", "Change of direction deficit", result.codDeficitRightS, "s", false, false, 3, "R"));

    return {
      metrics,
      summary: { fr: result.recommendation, en: result.recommendation },
      flags: result.flags,
      details: { result },
    };
  },
};

export const illinoisTest: TestDefinition = {
  key: "illinois",
  name: { fr: "Test Illinois", en: "Illinois agility test" },
  shortName: { fr: "Illinois", en: "Illinois" },
  category: "COD",
  description: {
    fr: "Parcours d'agilité de 60 mètres avec slalom. Évalué la vitesse de déplacement avec changements de direction multiples.",
    en: "60 m agility course with slalom. Assesses movement speed with multiple direction changes.",
  },
  protocol: {
    fr: "Parcours de 10 mètres de long et 5 mètres de large, quatre plots centraux espaces de 3.3 mètres. Départ couche sur le ventre, mains au niveau des épaules. Deux essais.",
    en: "Course 10 m long and 5 m wide, four central cones 3.3 m apart. Start lying prone with hands at shoulder level. Two trials.",
  },
  equipment: { fr: "Huit plots, chronomètre ou cellules", en: "Eight cones, stopwatch or gates" },
  durationMin: 10,
  reference: "Getchell 1979, Hachana et al. 2013",
  needsContext: ["sex"],
  fields: [{ key: "time", label: { fr: "Temps", en: "Time" }, unit: "s", type: "number", step: 0.01, min: 12, max: 30 }],
  compute: (raw, ctx) => {
    const time = num(raw, "time");
    if (!time) return { metrics: [], summary: null, flags: [], details: {} };
    const result = classifyIllinois(time, ctx.sex);
    return {
      metrics: [metric("illinois_time", "Temps Illinois", "Illinois time", time, "s", false, true, 2)],
      summary: { fr: `Niveau ${result.category}.`, en: `Level ${result.category}.` },
      flags: [],
      details: { result },
    };
  },
};

export const tTest: TestDefinition = {
  key: "t_test",
  name: { fr: "Test en T", en: "T test" },
  shortName: { fr: "Test T", en: "T test" },
  category: "COD",
  description: {
    fr: "Parcours en T combinant course avant, pas chassés latéraux et course arrière. Évalué l'agilité multidirectionnelle.",
    en: "T shaped course combining forward running, lateral shuffling and backpedalling. Assesses multidirectional agility.",
  },
  protocol: {
    fr: "Course avant sur 9.14 mètres, pas chassés sur 4.57 mètres à gauche puis 9.14 mètres à droite, retour de 4.57 mètres, puis course arrière sur 9.14 mètres. Le joueur doit toucher chaque plot.",
    en: "9.14 m forward run, 4.57 m shuffle left then 9.14 m right, 4.57 m back, then 9.14 m backpedal. The athlete must touch each cone.",
  },
  equipment: { fr: "Quatre plots, chronomètre ou cellules", en: "Four cones, stopwatch or gates" },
  durationMin: 10,
  reference: "Semenick 1990, Pauole et al. 2000",
  needsContext: ["sex"],
  fields: [{ key: "time", label: { fr: "Temps", en: "Time" }, unit: "s", type: "number", step: 0.01, min: 7, max: 20 }],
  compute: (raw, ctx) => {
    const time = num(raw, "time");
    if (!time) return { metrics: [], summary: null, flags: [], details: {} };
    const result = classifyTTest(time, ctx.sex);
    return {
      metrics: [metric("t_test_time", "Temps test en T", "T test time", time, "s", false, true, 2)],
      summary: { fr: `Niveau ${result.category}.`, en: `Level ${result.category}.` },
      flags: [],
      details: { result },
    };
  },
};
