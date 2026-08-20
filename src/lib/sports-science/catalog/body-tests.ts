import {
  bmi,
  bodyComposition,
  computeMaturity,
  durninWomersley,
  jacksonPollock7,
} from "../anthropometry";
import { asymmetryIndex, round } from "../stats";
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

export const anthropometryTest: TestDefinition = {
  key: "anthropometry",
  name: { fr: "Anthropométrie et composition corporelle", en: "Anthropometry and body composition" },
  shortName: { fr: "Anthropométrie", en: "Anthropometry" },
  category: "ANTHRO",
  description: {
    fr: "Taille, masse, plis cutanés et maturation biologique. Chez le jeune, la taille assise permet d'estimer la distance au pic de croissance, information indispensable pour adapter la charge.",
    en: "Height, mass, skinfolds and biological maturation. In youth, sitting height allows estimation of the distance to peak growth, essential information for adapting load.",
  },
  protocol: {
    fr: "Mesures à jeun ou à distance des repas, toujours au même moment de la journée, par le même opérateur. Plis cutanés mesures trois fois du côté droit, médiane retenue. Taille assise mesurée dos droit contre le mur, sur une boîte de hauteur connue.",
    en: "Measurements fasted or away from meals, always at the same time of day, by the same operator. Skinfolds measured three times on the right side, median retained. Sitting height measured with the back straight against the wall on a box of known height.",
  },
  equipment: { fr: "Toise, balance, pied à coulisse à plis cutanés, boîte de mesure", en: "Stadiometer, scale, skinfold caliper, measuring box" },
  durationMin: 12,
  reference: "Mirwald et al. 2002, Durnin & Womersley 1974, Jackson & Pollock 1978",
  needsContext: ["ageYears", "sex"],
  fields: [
    { key: "height", label: { fr: "Taille", en: "Height" }, unit: "cm", type: "number", step: 0.1, min: 120, max: 220, group: { fr: "Mesures de base", en: "Basic measures" } },
    { key: "weight", label: { fr: "Masse corporelle", en: "Body mass" }, unit: "kg", type: "number", step: 0.1, min: 25, max: 150, group: { fr: "Mesures de base", en: "Basic measures" } },
    { key: "sittingHeight", label: { fr: "Taille assise", en: "Sitting height" }, unit: "cm", type: "number", step: 0.1, min: 60, max: 120, optional: true, group: { fr: "Maturation", en: "Maturation" }, help: { fr: "Indispensable pour estimer la maturation chez les moins de 19 ans.", en: "Required to estimate maturation in players under 19." } },
    { key: "motherHeight", label: { fr: "Taille de la mère", en: "Mother height" }, unit: "cm", type: "number", step: 0.5, min: 130, max: 200, optional: true, group: { fr: "Maturation", en: "Maturation" } },
    { key: "fatherHeight", label: { fr: "Taille du père", en: "Father height" }, unit: "cm", type: "number", step: 0.5, min: 140, max: 220, optional: true, group: { fr: "Maturation", en: "Maturation" } },
    {
      key: "method",
      label: { fr: "Méthode des plis cutanés", en: "Skinfold method" },
      unit: "",
      type: "select",
      optional: true,
      group: { fr: "Plis cutanés", en: "Skinfolds" },
      options: [
        { value: "none", label: { fr: "Aucune", en: "None" } },
        { value: "durnin", label: { fr: "Durnin et Womersley, 4 plis", en: "Durnin and Womersley, 4 sites" } },
        { value: "jp7", label: { fr: "Jackson et Pollock, 7 plis", en: "Jackson and Pollock, 7 sites" } },
      ],
    },
    { key: "biceps", label: { fr: "Biceps", en: "Biceps" }, unit: "mm", type: "number", step: 0.1, min: 1, max: 60, optional: true, group: { fr: "Plis cutanés", en: "Skinfolds" } },
    { key: "triceps", label: { fr: "Triceps", en: "Triceps" }, unit: "mm", type: "number", step: 0.1, min: 1, max: 60, optional: true, group: { fr: "Plis cutanés", en: "Skinfolds" } },
    { key: "subscapular", label: { fr: "Sous scapulaire", en: "Subscapular" }, unit: "mm", type: "number", step: 0.1, min: 1, max: 60, optional: true, group: { fr: "Plis cutanés", en: "Skinfolds" } },
    { key: "suprailiac", label: { fr: "Supra iliaque", en: "Suprailiac" }, unit: "mm", type: "number", step: 0.1, min: 1, max: 60, optional: true, group: { fr: "Plis cutanés", en: "Skinfolds" } },
    { key: "chest", label: { fr: "Pectoral", en: "Chest" }, unit: "mm", type: "number", step: 0.1, min: 1, max: 60, optional: true, group: { fr: "Plis cutanés (7 sites)", en: "Skinfolds (7 sites)" } },
    { key: "midaxillary", label: { fr: "Axillaire moyen", en: "Midaxillary" }, unit: "mm", type: "number", step: 0.1, min: 1, max: 60, optional: true, group: { fr: "Plis cutanés (7 sites)", en: "Skinfolds (7 sites)" } },
    { key: "abdominal", label: { fr: "Abdominal", en: "Abdominal" }, unit: "mm", type: "number", step: 0.1, min: 1, max: 60, optional: true, group: { fr: "Plis cutanés (7 sites)", en: "Skinfolds (7 sites)" } },
    { key: "thigh", label: { fr: "Cuisse", en: "Thigh" }, unit: "mm", type: "number", step: 0.1, min: 1, max: 60, optional: true, group: { fr: "Plis cutanés (7 sites)", en: "Skinfolds (7 sites)" } },
  ],
  compute: (raw, ctx) => {
    const height = num(raw, "height");
    const weight = num(raw, "weight");
    if (!height || !weight) return { metrics: [], summary: null, flags: [], details: {} };

    const metrics: ComputedMetric[] = [
      metric("height", "Taille", "Height", height, "cm", true, true, 1),
      metric("weight", "Masse corporelle", "Body mass", weight, "kg", true, true, 1),
      metric("bmi", "Indice de masse corporelle", "Body mass index", bmi(weight, height), "kg/m2", true, false, 1),
    ];
    const flags: string[] = [];
    const details: Record<string, unknown> = {};

    const method = str(raw, "method");
    let bodyFatPct: number | null = null;

    if (method === "durnin") {
      const biceps = num(raw, "biceps");
      const triceps = num(raw, "triceps");
      const subscapular = num(raw, "subscapular");
      const suprailiac = num(raw, "suprailiac");
      if (biceps && triceps && subscapular && suprailiac) {
        const result = durninWomersley({ biceps, triceps, subscapular, suprailiac }, ctx.ageYears, ctx.sex);
        bodyFatPct = result.bodyFatPct;
        details.skinfolds = result;
      }
    } else if (method === "jp7") {
      const sites = {
        chest: num(raw, "chest"),
        midaxillary: num(raw, "midaxillary"),
        triceps: num(raw, "triceps"),
        subscapular: num(raw, "subscapular"),
        abdominal: num(raw, "abdominal"),
        suprailiac: num(raw, "suprailiac"),
        thigh: num(raw, "thigh"),
      };
      if (Object.values(sites).every((v) => v !== undefined)) {
        const result = jacksonPollock7(sites as Record<keyof typeof sites, number>, ctx.ageYears, ctx.sex);
        bodyFatPct = result.bodyFatPct;
        details.skinfolds = result;
      }
    }

    if (bodyFatPct != null) {
      const composition = bodyComposition(weight, bodyFatPct);
      metrics.push(
        metric("body_fat", "Masse grasse", "Body fat", bodyFatPct, "%", false, true, 1),
        metric("lean_mass", "Masse maigre", "Lean mass", composition.leanMassKg, "kg", true, true, 1),
        metric("ffmi", "Indice de masse maigre", "Fat free mass index", composition.fatFreeMassIndex(height), "kg/m2", true, false, 1),
      );
      // Reperes chez le footballeur masculin professionnel : 8 a 12% de masse grasse.
      if (ctx.sex === "M" && bodyFatPct > 14) {
        flags.push(
          `Masse grasse a ${bodyFatPct}%, au dessus de la fourchette habituelle de 8 a 12% chez le footballeur masculin. A croiser avec l'evolution de la masse maigre avant toute conclusion.`,
        );
      }
    }

    const sittingHeight = num(raw, "sittingHeight");
    if (sittingHeight && ctx.ageYears < 20) {
      const maturity = computeMaturity({
        ageYears: ctx.ageYears,
        heightCm: height,
        sittingHeightCm: sittingHeight,
        weightKg: weight,
        sex: ctx.sex,
        motherHeightCm: num(raw, "motherHeight"),
        fatherHeightCm: num(raw, "fatherHeight"),
      });
      metrics.push(
        metric("maturity_offset", "Ecart au pic de croissance", "Maturity offset", maturity.maturityOffsetYears, "ans", true, true, 2),
        metric("aphv", "Age au pic de croissance", "Age at peak height velocity", maturity.aphvYears, "ans", true, false, 2),
      );
      if (maturity.pctAdultHeight != null)
        metrics.push(metric("pct_adult_height", "Pourcentage de taille adulte", "Percent of adult height", maturity.pctAdultHeight, "%", true, true, 1));

      details.maturity = maturity;
      flags.push(...maturity.flags);

      return {
        metrics,
        summary: { fr: maturity.trainingGuidance, en: maturity.trainingGuidance },
        flags,
        details,
      };
    }

    return {
      metrics,
      summary: {
        fr: "Suivre l'évolution de la masse maigre plutôt que la seule masse corporelle, en particulier pendant les blocs de force.",
        en: "Track lean mass rather than body mass alone, especially during strength blocks.",
      },
      flags,
      details,
    };
  },
};

export const mobilityTest: TestDefinition = {
  key: "mobility",
  name: { fr: "Mobilité et souplesse", en: "Mobility and flexibility" },
  shortName: { fr: "Mobilité", en: "Mobility" },
  category: "MOBILITY",
  description: {
    fr: "Amplitudes clés du footballeur : dorsiflexion de cheville, extension de hanche, chaîne postérieure. Une dorsiflexion limitée modifié la mécanique d'atterrissage et de freinage.",
    en: "Key football ranges: ankle dorsiflexion, hip extension, posterior chain. Limited dorsiflexion changes landing and braking mechanics.",
  },
  protocol: {
    fr: "Dorsiflexion mesurée en fente contre un mur, distance du gros orteil au mur avec le genou en contact et le talon au sol. Test de Thomas modifié pour l'extension de hanche. Souplesse assis mesurée après échauffement uniquement.",
    en: "Dorsiflexion measured in a wall lunge, distance from the big toe to the wall with the knee touching and the heel down. Modified Thomas test for hip extension. Sit and reach measured after warm up only.",
  },
  equipment: { fr: "Mètre ruban, inclinometre, boîte de souplesse", en: "Tape measure, inclinometer, sit and reach box" },
  durationMin: 10,
  reference: "Bennell et al. 1998, Hoog et al. 2016",
  fields: [
    { key: "dorsiLeft", label: { fr: "Dorsiflexion gauche", en: "Left dorsiflexion" }, unit: "cm", type: "number", step: 0.5, min: 0, max: 20, optional: true, group: { fr: "Cheville", en: "Ankle" } },
    { key: "dorsiRight", label: { fr: "Dorsiflexion droite", en: "Right dorsiflexion" }, unit: "cm", type: "number", step: 0.5, min: 0, max: 20, optional: true, group: { fr: "Cheville", en: "Ankle" } },
    { key: "sitAndReach", label: { fr: "Souplesse assis", en: "Sit and reach" }, unit: "cm", type: "number", step: 0.5, min: -20, max: 40, optional: true, group: { fr: "Chaîne postérieure", en: "Posterior chain" } },
    { key: "thomasLeft", label: { fr: "Thomas modifié gauche", en: "Modified Thomas left" }, unit: "deg", type: "number", step: 1, min: -30, max: 40, optional: true, group: { fr: "Hanche", en: "Hip" } },
    { key: "thomasRight", label: { fr: "Thomas modifié droit", en: "Modified Thomas right" }, unit: "deg", type: "number", step: 1, min: -30, max: 40, optional: true, group: { fr: "Hanche", en: "Hip" } },
  ],
  compute: (raw) => {
    const metrics: ComputedMetric[] = [];
    const flags: string[] = [];

    const dorsiLeft = num(raw, "dorsiLeft");
    const dorsiRight = num(raw, "dorsiRight");
    if (dorsiLeft !== undefined) metrics.push(metric("dorsiflexion", "Dorsiflexion", "Dorsiflexion", dorsiLeft, "cm", true, true, 1, "L"));
    if (dorsiRight !== undefined) metrics.push(metric("dorsiflexion", "Dorsiflexion", "Dorsiflexion", dorsiRight, "cm", true, true, 1, "R"));

    if (dorsiLeft !== undefined && dorsiRight !== undefined) {
      const asym = asymmetryIndex(dorsiLeft, dorsiRight);
      metrics.push(metric("dorsiflexion_asym", "Asymetrie de dorsiflexion", "Dorsiflexion asymmetry", asym, "%", false, false, 1));
      if (Math.abs(dorsiLeft - dorsiRight) >= 1.5) {
        flags.push(
          "Difference de dorsiflexion superieure a 1.5 centimetre entre les deux chevilles. Cette asymetrie modifie la repartition des contraintes a l'atterrissage.",
        );
      }
      const worst = Math.min(dorsiLeft, dorsiRight);
      if (worst < 10) {
        flags.push(
          `Dorsiflexion limitee a ${worst} centimetres. En dessous de 10 centimetres, la mecanique de freinage et la profondeur de squat sont contraintes. Travailler la mobilisation articulaire et le mollet en excentrique.`,
        );
      }
    }

    const sitAndReach = num(raw, "sitAndReach");
    if (sitAndReach !== undefined)
      metrics.push(metric("sit_and_reach", "Souplesse assis", "Sit and reach", sitAndReach, "cm", true, false, 1));

    const thomasLeft = num(raw, "thomasLeft");
    const thomasRight = num(raw, "thomasRight");
    if (thomasLeft !== undefined) metrics.push(metric("thomas", "Test de Thomas", "Thomas test", thomasLeft, "deg", true, false, 0, "L"));
    if (thomasRight !== undefined) metrics.push(metric("thomas", "Test de Thomas", "Thomas test", thomasRight, "deg", true, false, 0, "R"));

    return {
      metrics,
      summary:
        flags.length > 0
          ? { fr: "Restrictions de mobilité détectées, voir les alertes ci dessous.", en: "Mobility restrictions detected, see the alerts below." }
          : { fr: "Amplitudes articulaires dans les normes.", en: "Joint ranges within normal values." },
      flags,
      details: {},
    };
  },
};
