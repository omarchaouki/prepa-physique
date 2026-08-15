import {
  computeGroinStrength,
  computeImtp,
  computeLoadVelocityProfile,
  computeNordic,
  consensusOneRm,
  loadTable,
} from "../strength";
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
  side?: "L" | "R",
): ComputedMetric => ({ key, label: { fr, en }, value, unit, higherIsBetter, primary, decimals, side });

export const nordicTest: TestDefinition = {
  key: "nordic",
  name: { fr: "Nordic hamstring", en: "Nordic hamstring test" },
  shortName: { fr: "Nordic", en: "Nordic" },
  category: "STRENGTH",
  description: {
    fr: "Force excentrique maximale des ischio jambiers. C'est le marqueur de terrain le plus directement associe au risque de lesion des ischio jambiers.",
    en: "Maximal eccentric hamstring strength. The field marker most directly associated with hamstring injury risk.",
  },
  protocol: {
    fr: "Genoux sur un coussin, chevilles maintenues par le dynamometre. Le joueur resiste a la chute vers l'avant le plus longtemps possible, bras croises sur la poitrine, bassin en extension. Trois repetitions, pic de force retenu.",
    en: "Kneeling on a pad, ankles held by the dynamometer. The athlete resists the forward fall as long as possible, arms crossed on the chest, hips extended. Three repetitions, peak force retained.",
  },
  equipment: { fr: "Dynamometre Nordic (NordBord ou equivalent)", en: "Nordic dynamometer (NordBord or equivalent)" },
  durationMin: 10,
  reference: "Opar et al. 2015, Bourne et al. 2018",
  needsContext: ["bodyMassKg"],
  fields: [
    { key: "left", label: { fr: "Force jambe gauche", en: "Left leg force" }, unit: "N", type: "number", step: 1, min: 50, max: 700 },
    { key: "right", label: { fr: "Force jambe droite", en: "Right leg force" }, unit: "N", type: "number", step: 1, min: 50, max: 700 },
  ],
  compute: (raw, ctx) => {
    const left = num(raw, "left");
    const right = num(raw, "right");
    if (!left || !right) return { metrics: [], summary: null, flags: [], details: {} };

    const result = computeNordic({ leftForceN: left, rightForceN: right, bodyMassKg: ctx.bodyMassKg });
    return {
      metrics: [
        metric("nordic_force", "Force Nordic", "Nordic force", left, "N", true, true, 0, "L"),
        metric("nordic_force", "Force Nordic", "Nordic force", right, "N", true, true, 0, "R"),
        metric("nordic_rel", "Force Nordic relative", "Relative Nordic force", result.relativeNkg, "N/kg", true, true, 2),
        metric("nordic_asym", "Asymetrie Nordic", "Nordic asymmetry", result.asymmetryPct, "%", false, true, 1),
      ],
      summary: { fr: result.recommendation, en: result.recommendation },
      flags: result.flags,
      details: { result },
    };
  },
};

export const groinTest: TestDefinition = {
  key: "groin_squeeze",
  name: { fr: "Force isometrique des adducteurs et abducteurs", en: "Isometric adductor and abductor strength" },
  shortName: { fr: "Adducteurs", en: "Groin" },
  category: "STRENGTH",
  description: {
    fr: "Test de reference de la prevention de la pubalgie. Un rapport adducteurs sur abducteurs bas precede souvent la douleur inguinale.",
    en: "Reference test for groin injury prevention. A low adductor to abductor ratio often precedes groin pain.",
  },
  protocol: {
    fr: "Allonge sur le dos, hanches et genoux flechis a 45 et 90 degres, dynamometre place entre les genoux pour l'adduction et a l'exterieur pour l'abduction. Trois contractions maximales de cinq secondes, meilleur essai retenu.",
    en: "Supine, hips and knees flexed at 45 and 90 degrees, dynamometer between the knees for adduction and outside for abduction. Three maximal five second contractions, best trial retained.",
  },
  equipment: { fr: "Dynamometre a main ou groin bar", en: "Handheld dynamometer or groin bar" },
  durationMin: 10,
  reference: "Esteve et al. 2020, Thorborg et al. 2011",
  needsContext: ["bodyMassKg"],
  fields: [
    { key: "addLeft", label: { fr: "Adduction gauche", en: "Left adduction" }, unit: "N", type: "number", step: 1, min: 50, max: 600, group: { fr: "Adduction", en: "Adduction" } },
    { key: "addRight", label: { fr: "Adduction droite", en: "Right adduction" }, unit: "N", type: "number", step: 1, min: 50, max: 600, group: { fr: "Adduction", en: "Adduction" } },
    { key: "abdLeft", label: { fr: "Abduction gauche", en: "Left abduction" }, unit: "N", type: "number", step: 1, min: 50, max: 600, optional: true, group: { fr: "Abduction", en: "Abduction" } },
    { key: "abdRight", label: { fr: "Abduction droite", en: "Right abduction" }, unit: "N", type: "number", step: 1, min: 50, max: 600, optional: true, group: { fr: "Abduction", en: "Abduction" } },
  ],
  compute: (raw, ctx) => {
    const addLeft = num(raw, "addLeft");
    const addRight = num(raw, "addRight");
    if (!addLeft || !addRight) return { metrics: [], summary: null, flags: [], details: {} };

    const result = computeGroinStrength({
      adductionLeftN: addLeft,
      adductionRightN: addRight,
      abductionLeftN: num(raw, "abdLeft"),
      abductionRightN: num(raw, "abdRight"),
      bodyMassKg: ctx.bodyMassKg,
    });

    const metrics: ComputedMetric[] = [
      metric("groin_add", "Adduction", "Adduction", addLeft, "N", true, false, 0, "L"),
      metric("groin_add", "Adduction", "Adduction", addRight, "N", true, false, 0, "R"),
      metric("groin_add_rel", "Adduction relative", "Relative adduction", result.adductionRelativeNkg, "N/kg", true, true, 2),
      metric("groin_add_asym", "Asymetrie adducteurs", "Adductor asymmetry", result.adductionAsymmetryPct, "%", false, true, 1),
    ];
    if (result.adductorAbductorRatio != null)
      metrics.push(metric("groin_ratio", "Rapport adducteurs sur abducteurs", "Adductor to abductor ratio", result.adductorAbductorRatio, "", true, true, 2));

    return {
      metrics,
      summary: { fr: result.recommendation, en: result.recommendation },
      flags: result.flags,
      details: { result },
    };
  },
};

export const imtpTest: TestDefinition = {
  key: "imtp",
  name: { fr: "Traction isometrique a mi cuisse", en: "Isometric mid thigh pull" },
  shortName: { fr: "IMTP", en: "IMTP" },
  category: "STRENGTH",
  description: {
    fr: "Mesure de la force maximale globale sans charge externe mobilisee, donc sans risque technique. Combinee au saut, elle indique si le joueur exprime la force dont il dispose.",
    en: "Measures global maximal force with no external load moved, hence no technical risk. Combined with the jump it shows whether the athlete expresses the force available.",
  },
  protocol: {
    fr: "Barre bloquee a hauteur de mi cuisse, angles de hanche entre 140 et 150 degres et de genou entre 125 et 145 degres. Consigne : pousser le sol le plus fort et le plus vite possible pendant cinq secondes. Trois essais.",
    en: "Bar fixed at mid thigh height, hip angle 140 to 150 degrees and knee angle 125 to 145 degrees. Instruction: push the ground as hard and as fast as possible for five seconds. Three trials.",
  },
  equipment: { fr: "Cage avec barre bloquee et plateforme de force", en: "Rack with fixed bar and force plate" },
  durationMin: 12,
  reference: "Comfort et al. 2019",
  needsContext: ["bodyMassKg"],
  fields: [
    { key: "peakForce", label: { fr: "Pic de force", en: "Peak force" }, unit: "N", type: "number", step: 1, min: 500, max: 6000 },
    { key: "force100", label: { fr: "Force a 100 ms", en: "Force at 100 ms" }, unit: "N", type: "number", step: 1, min: 100, max: 4000, optional: true },
    { key: "force200", label: { fr: "Force a 200 ms", en: "Force at 200 ms" }, unit: "N", type: "number", step: 1, min: 100, max: 5000, optional: true },
    { key: "cmjPeakForce", label: { fr: "Pic de force au CMJ", en: "CMJ peak force" }, unit: "N", type: "number", step: 1, min: 500, max: 5000, optional: true, help: { fr: "Permet de calculer l'indice de force dynamique.", en: "Used to compute the dynamic strength index." } },
  ],
  compute: (raw, ctx) => {
    const peakForce = num(raw, "peakForce");
    if (!peakForce) return { metrics: [], summary: null, flags: [], details: {} };

    const result = computeImtp({
      peakForceN: peakForce,
      bodyMassKg: ctx.bodyMassKg,
      force100msN: num(raw, "force100"),
      force200msN: num(raw, "force200"),
      cmjPeakForceN: num(raw, "cmjPeakForce"),
    });

    const metrics: ComputedMetric[] = [
      metric("imtp_peak", "Pic de force IMTP", "IMTP peak force", result.peakForceN, "N", true, false, 0),
      metric("imtp_rel", "Force relative IMTP", "IMTP relative force", result.relativeNkg, "N/kg", true, true, 2),
    ];
    if (result.rfd100msNs) metrics.push(metric("imtp_rfd100", "Gradient de force 100 ms", "RFD 100 ms", result.rfd100msNs, "N/s", true, false, 0));
    if (result.rfd200msNs) metrics.push(metric("imtp_rfd200", "Gradient de force 200 ms", "RFD 200 ms", result.rfd200msNs, "N/s", true, false, 0));
    if (result.dynamicStrengthIndex != null)
      metrics.push(metric("dsi", "Indice de force dynamique", "Dynamic strength index", result.dynamicStrengthIndex, "", true, true, 2));

    return {
      metrics,
      summary: result.dsiInterpretation ? { fr: result.dsiInterpretation, en: result.dsiInterpretation } : null,
      flags: result.flags,
      details: { result },
    };
  },
};

export const oneRmTest: TestDefinition = {
  key: "one_rm",
  name: { fr: "Maximum a une repetition estime", en: "Estimated one repetition maximum" },
  shortName: { fr: "1RM", en: "1RM" },
  category: "STRENGTH",
  description: {
    fr: "Estimation du maximum a partir d'une serie sous maximale. Evite le risque d'un test a l'echec tout en fournissant une base de prescription fiable.",
    en: "Maximum estimated from a submaximal set. Avoids the risk of a true maximal test while providing a reliable prescription basis.",
  },
  protocol: {
    fr: "Apres echauffement progressif, realiser une serie a l'echec technique avec une charge permettant entre 3 et 8 repetitions. Au dela de 10 repetitions l'estimation perd en fiabilite.",
    en: "After a progressive warm up, perform a set to technical failure with a load allowing 3 to 8 repetitions. Beyond 10 repetitions the estimate loses reliability.",
  },
  equipment: { fr: "Barre et disques, cage de squat", en: "Barbell and plates, squat rack" },
  durationMin: 15,
  reference: "Epley 1985, Brzycki 1993, Wathan 1994",
  needsContext: ["bodyMassKg"],
  fields: [
    {
      key: "exercise",
      label: { fr: "Exercice", en: "Exercise" },
      unit: "",
      type: "select",
      options: [
        { value: "back_squat", label: { fr: "Squat arriere", en: "Back squat" } },
        { value: "front_squat", label: { fr: "Squat avant", en: "Front squat" } },
        { value: "deadlift", label: { fr: "Souleve de terre", en: "Deadlift" } },
        { value: "hip_thrust", label: { fr: "Hip thrust", en: "Hip thrust" } },
        { value: "bench_press", label: { fr: "Developpe couche", en: "Bench press" } },
        { value: "bulgarian_split_squat", label: { fr: "Fente bulgare", en: "Bulgarian split squat" } },
      ],
    },
    { key: "weight", label: { fr: "Charge", en: "Load" }, unit: "kg", type: "number", step: 0.5, min: 10, max: 400 },
    { key: "reps", label: { fr: "Repetitions realisees", en: "Repetitions performed" }, unit: "", type: "number", step: 1, min: 1, max: 15 },
  ],
  compute: (raw, ctx) => {
    const weight = num(raw, "weight");
    const reps = num(raw, "reps");
    const exercise = str(raw, "exercise") ?? "back_squat";
    if (!weight || !reps) return { metrics: [], summary: null, flags: [], details: {} };

    const result = consensusOneRm(weight, reps);
    const relative = round(result.estimate / ctx.bodyMassKg, 2);
    const flags: string[] = [];

    if (exercise === "back_squat" && relative < 1.5) {
      flags.push(
        `Squat estime a ${relative} fois la masse corporelle. La cible chez le footballeur de haut niveau se situe entre 1.7 et 2.0.`,
      );
    }
    if (result.confidence === "faible") {
      flags.push(
        "Serie realisee au dela de 10 repetitions, l'estimation du maximum devient imprecise. Refaire avec une charge plus lourde.",
      );
    }

    return {
      metrics: [
        metric(`onerm_${exercise}`, "Maximum estime", "Estimated maximum", result.estimate, "kg", true, true, 1),
        metric(`onerm_rel_${exercise}`, "Force relative", "Relative strength", relative, "x MC", true, true, 2),
      ],
      summary: {
        fr: `Maximum estime a ${result.estimate} kg, soit ${relative} fois la masse corporelle. Fiabilite ${result.confidence}.`,
        en: `Estimated maximum of ${result.estimate} kg, that is ${relative} times body mass. Confidence ${result.confidence}.`,
      },
      flags,
      details: { result, loadTable: loadTable(result.estimate) },
    };
  },
};

export const loadVelocityTest: TestDefinition = {
  key: "load_velocity",
  name: { fr: "Profil charge vitesse", en: "Load velocity profile" },
  shortName: { fr: "Charge vitesse", en: "Load velocity" },
  category: "STRENGTH",
  description: {
    fr: "Relation lineaire entre la charge et la vitesse d'execution. Permet d'estimer le maximum sans aller a l'echec et de prescrire a la vitesse plutot qu'au pourcentage.",
    en: "Linear relationship between load and movement velocity. Estimates the maximum without going to failure and allows velocity based prescription.",
  },
  protocol: {
    fr: "Quatre a cinq charges croissantes, deux a trois repetitions par charge, vitesse moyenne concentrique la plus elevee retenue. Recuperation de trois minutes entre les charges.",
    en: "Four to five incremental loads, two to three repetitions per load, highest mean concentric velocity retained. Three minutes rest between loads.",
  },
  equipment: { fr: "Encodeur lineaire ou accelerometre de barre", en: "Linear encoder or barbell accelerometer" },
  durationMin: 25,
  reference: "Gonzalez Badillo & Sanchez Medina 2010",
  fields: [
    { key: "load1", label: { fr: "Charge 1", en: "Load 1" }, unit: "kg", type: "number", step: 0.5, min: 10, max: 400, group: { fr: "Point 1", en: "Point 1" } },
    { key: "vel1", label: { fr: "Vitesse 1", en: "Velocity 1" }, unit: "m/s", type: "number", step: 0.01, min: 0.1, max: 2, group: { fr: "Point 1", en: "Point 1" } },
    { key: "load2", label: { fr: "Charge 2", en: "Load 2" }, unit: "kg", type: "number", step: 0.5, min: 10, max: 400, group: { fr: "Point 2", en: "Point 2" } },
    { key: "vel2", label: { fr: "Vitesse 2", en: "Velocity 2" }, unit: "m/s", type: "number", step: 0.01, min: 0.1, max: 2, group: { fr: "Point 2", en: "Point 2" } },
    { key: "load3", label: { fr: "Charge 3", en: "Load 3" }, unit: "kg", type: "number", step: 0.5, min: 10, max: 400, optional: true, group: { fr: "Point 3", en: "Point 3" } },
    { key: "vel3", label: { fr: "Vitesse 3", en: "Velocity 3" }, unit: "m/s", type: "number", step: 0.01, min: 0.1, max: 2, optional: true, group: { fr: "Point 3", en: "Point 3" } },
    { key: "load4", label: { fr: "Charge 4", en: "Load 4" }, unit: "kg", type: "number", step: 0.5, min: 10, max: 400, optional: true, group: { fr: "Point 4", en: "Point 4" } },
    { key: "vel4", label: { fr: "Vitesse 4", en: "Velocity 4" }, unit: "m/s", type: "number", step: 0.01, min: 0.1, max: 2, optional: true, group: { fr: "Point 4", en: "Point 4" } },
    {
      key: "mvt",
      label: { fr: "Vitesse seuil du maximum", en: "Minimal velocity threshold" },
      unit: "m/s",
      type: "number",
      step: 0.01,
      min: 0.1,
      max: 0.6,
      optional: true,
      help: { fr: "0.31 au squat, 0.17 au developpe couche.", en: "0.31 for squat, 0.17 for bench press." },
    },
  ],
  compute: (raw) => {
    const points = [1, 2, 3, 4]
      .map((i) => ({ loadKg: num(raw, `load${i}`), meanVelocityMs: num(raw, `vel${i}`) }))
      .filter((p): p is { loadKg: number; meanVelocityMs: number } => p.loadKg !== undefined && p.meanVelocityMs !== undefined);

    if (points.length < 2) return { metrics: [], summary: null, flags: [], details: {} };

    const result = computeLoadVelocityProfile(points, num(raw, "mvt") ?? 0.31);
    if (!result) return { metrics: [], summary: null, flags: [], details: {} };

    const flags: string[] = [];
    if (result.quality === "a refaire") {
      flags.push(
        `Relation charge vitesse peu lineaire (R2 = ${result.r2}). Verifier que chaque repetition a ete realisee a vitesse maximale intentionnelle.`,
      );
    }

    return {
      metrics: [
        metric("lv_onerm", "Maximum estime par la vitesse", "Velocity based maximum", result.estimatedOneRmKg, "kg", true, true, 1),
        metric("lv_slope", "Pente charge vitesse", "Load velocity slope", result.slope, "kg par m/s", false, false, 2),
        metric("lv_v0", "Vitesse a charge nulle", "Velocity at zero load", result.theoreticalV0, "m/s", true, false, 2),
      ],
      summary: {
        fr: `Maximum estime a ${result.estimatedOneRmKg} kg, profil ${result.quality}. Utiliser les vitesses cibles plutot que les pourcentages pour tenir compte de la forme du jour.`,
        en: `Estimated maximum of ${result.estimatedOneRmKg} kg, profile ${result.quality}. Use target velocities instead of percentages to account for daily readiness.`,
      },
      flags,
      details: {
        result,
        targets: [90, 80, 70, 60].map((p) => ({ percent: p, velocity: result.velocityForPercent(p) })),
      },
    };
  },
};
