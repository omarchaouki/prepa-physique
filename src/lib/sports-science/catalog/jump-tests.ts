import { computeCmj, computeDropJump, computeHopTests, heightFromFlightTime } from "../jump";
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
): ComputedMetric => ({ key, label: { fr, en }, value, unit, higherIsBetter, primary, decimals, side });

export const cmjTest: TestDefinition = {
  key: "cmj",
  name: { fr: "Saut avec contre mouvement", en: "Countermovement jump" },
  shortName: { fr: "CMJ", en: "CMJ" },
  category: "JUMP",
  description: {
    fr: "Test de reference de la puissance des membres inferieurs et marqueur le plus sensible de la fatigue neuromusculaire au quotidien.",
    en: "Reference test of lower limb power and the most sensitive day to day marker of neuromuscular fatigue.",
  },
  protocol: {
    fr: "Mains aux hanches, descente libre jusqu'a environ 90 degres de flexion de genou puis extension explosive. Trois essais avec 30 secondes de recuperation, meilleur essai retenu. Toujours tester a la meme heure et apres le meme echauffement.",
    en: "Hands on hips, free descent to about 90 degrees knee flexion then explosive extension. Three trials with 30 s rest, best trial kept. Always test at the same time of day after the same warm up.",
  },
  equipment: { fr: "Tapis de contact, plateforme de force ou application video", en: "Contact mat, force plate or video app" },
  durationMin: 8,
  reference: "Bosco et al. 1983, Sayers et al. 1999, Gathercole et al. 2015",
  needsContext: ["bodyMassKg"],
  fields: [
    { key: "height", label: { fr: "Hauteur de saut", en: "Jump height" }, unit: "cm", type: "number", step: 0.1, min: 10, max: 90, optional: true, group: { fr: "Mesure principale", en: "Main measure" } },
    { key: "flightTime", label: { fr: "Temps de vol", en: "Flight time" }, unit: "s", type: "number", step: 0.001, min: 0.2, max: 1, optional: true, group: { fr: "Mesure principale", en: "Main measure" }, help: { fr: "A renseigner si la hauteur n'est pas fournie directement.", en: "Fill in if jump height is not provided directly." } },
    { key: "timeToTakeoff", label: { fr: "Temps de mise en action", en: "Time to takeoff" }, unit: "s", type: "number", step: 0.001, min: 0.3, max: 2, optional: true, group: { fr: "Analyse avancee", en: "Advanced analysis" }, help: { fr: "Permet de calculer le RSI modifie. Disponible sur plateforme de force.", en: "Used to compute the modified RSI. Available on force plates." } },
    { key: "sjHeight", label: { fr: "Hauteur du squat jump associe", en: "Associated squat jump height" }, unit: "cm", type: "number", step: 0.1, min: 10, max: 90, optional: true, group: { fr: "Analyse avancee", en: "Advanced analysis" }, help: { fr: "Permet de calculer le ratio d'utilisation du cycle etirement detente.", en: "Used to compute the eccentric utilisation ratio." } },
    { key: "leftHeight", label: { fr: "Saut unilateral gauche", en: "Left single leg jump" }, unit: "cm", type: "number", step: 0.1, min: 5, max: 60, optional: true, group: { fr: "Unilateral", en: "Single leg" } },
    { key: "rightHeight", label: { fr: "Saut unilateral droit", en: "Right single leg jump" }, unit: "cm", type: "number", step: 0.1, min: 5, max: 60, optional: true, group: { fr: "Unilateral", en: "Single leg" } },
  ],
  compute: (raw, ctx) => {
    const result = computeCmj({
      heightCm: num(raw, "height"),
      flightTimeS: num(raw, "flightTime"),
      bodyMassKg: ctx.bodyMassKg,
      timeToTakeoffS: num(raw, "timeToTakeoff"),
      sjHeightCm: num(raw, "sjHeight"),
      leftHeightCm: num(raw, "leftHeight"),
      rightHeightCm: num(raw, "rightHeight"),
    });

    const metrics: ComputedMetric[] = [
      metric("cmj_height", "Hauteur CMJ", "CMJ height", result.heightCm, "cm", true, true, 1),
      metric("cmj_power_rel", "Puissance relative", "Relative power", result.relativePowerWkg, "W/kg", true, true, 1),
      metric("cmj_power", "Puissance maximale", "Peak power", result.peakPowerW, "W", true, false, 0),
    ];

    if (result.rsiMod != null)
      metrics.push(metric("cmj_rsi_mod", "RSI modifie", "Modified RSI", result.rsiMod, "m/s", true, true, 3));
    if (result.eur != null)
      metrics.push(metric("cmj_eur", "Ratio CMJ sur SJ", "CMJ to SJ ratio", result.eur, "", true, true, 3));
    if (result.bilateralDeficit != null)
      metrics.push(metric("cmj_bilateral_deficit", "Deficit bilateral", "Bilateral deficit", result.bilateralDeficit, "%", false, false, 1));
    if (result.asymmetryPct != null)
      metrics.push(metric("cmj_asym", "Asymetrie de saut", "Jump asymmetry", result.asymmetryPct, "%", false, true, 1));
    if (num(raw, "leftHeight") !== undefined)
      metrics.push(metric("cmj_sl_height", "Saut unilateral", "Single leg jump", num(raw, "leftHeight")!, "cm", true, false, 1, "L"));
    if (num(raw, "rightHeight") !== undefined)
      metrics.push(metric("cmj_sl_height", "Saut unilateral", "Single leg jump", num(raw, "rightHeight")!, "cm", true, false, 1, "R"));

    return {
      metrics,
      summary: {
        fr: `Detente de ${result.heightCm} cm pour une puissance relative de ${result.relativePowerWkg} W/kg. Enregistrer cette valeur comme reference individuelle pour detecter la fatigue les jours suivants.`,
        en: `Jump height of ${result.heightCm} cm with a relative power of ${result.relativePowerWkg} W/kg. Store this as the individual baseline to detect fatigue on following days.`,
      },
      flags: result.flags,
      details: { result },
    };
  },
};

export const squatJumpTest: TestDefinition = {
  key: "squat_jump",
  name: { fr: "Squat jump", en: "Squat jump" },
  shortName: { fr: "SJ", en: "SJ" },
  category: "JUMP",
  description: {
    fr: "Saut depart statique sans contre mouvement. Isole la force concentrique pure des membres inferieurs.",
    en: "Jump from a static position without countermovement. Isolates pure concentric lower limb force.",
  },
  protocol: {
    fr: "Position accroupie a 90 degres de flexion de genou maintenue trois secondes, mains aux hanches, extension explosive sans reprise d'elan. Tout contre mouvement invalide l'essai.",
    en: "Squat position at 90 degrees knee flexion held for three seconds, hands on hips, explosive extension with no countermovement. Any dip invalidates the trial.",
  },
  equipment: { fr: "Tapis de contact ou plateforme de force", en: "Contact mat or force plate" },
  durationMin: 6,
  reference: "Bosco et al. 1983",
  needsContext: ["bodyMassKg"],
  fields: [
    { key: "height", label: { fr: "Hauteur de saut", en: "Jump height" }, unit: "cm", type: "number", step: 0.1, min: 10, max: 90, optional: true },
    { key: "flightTime", label: { fr: "Temps de vol", en: "Flight time" }, unit: "s", type: "number", step: 0.001, min: 0.2, max: 1, optional: true },
  ],
  compute: (raw, ctx) => {
    const heightCm =
      num(raw, "height") ??
      (num(raw, "flightTime") ? round(heightFromFlightTime(num(raw, "flightTime")!) * 100, 1) : undefined);
    if (!heightCm) return { metrics: [], summary: null, flags: [], details: {} };

    const power = round(68.5 * heightCm + 46.3 * ctx.bodyMassKg - 2470, 0);
    return {
      metrics: [
        metric("sj_height", "Hauteur SJ", "SJ height", heightCm, "cm", true, true, 1),
        metric("sj_power_rel", "Puissance relative SJ", "SJ relative power", round(power / ctx.bodyMassKg, 1), "W/kg", true, false, 1),
      ],
      summary: {
        fr: "A comparer au saut avec contre mouvement pour evaluer l'exploitation du cycle etirement detente.",
        en: "Compare with the countermovement jump to assess use of the stretch shortening cycle.",
      },
      flags: [],
      details: {},
    };
  },
};

export const dropJumpTest: TestDefinition = {
  key: "drop_jump",
  name: { fr: "Drop jump et indice de force reactive", en: "Drop jump and reactive strength index" },
  shortName: { fr: "Drop jump", en: "Drop jump" },
  category: "JUMP",
  description: {
    fr: "Saut apres chute d'une hauteur donnee. Mesure la raideur musculo tendineuse et la capacite a produire de la force en un temps tres court.",
    en: "Jump following a drop from a set height. Measures musculotendinous stiffness and the ability to produce force in a very short time.",
  },
  protocol: {
    fr: "Le joueur se laisse tomber de la boite sans sauter vers le haut ni vers le bas, puis rebondit le plus vite et le plus haut possible. Consigne : minimiser le temps de contact au sol. Trois essais par hauteur.",
    en: "The athlete steps off the box without jumping up or down, then rebounds as fast and as high as possible. Instruction: minimise ground contact time. Three trials per height.",
  },
  equipment: { fr: "Boite reglable, tapis de contact", en: "Adjustable box, contact mat" },
  durationMin: 10,
  reference: "Flanagan & Comyns 2008",
  needsContext: ["bodyMassKg"],
  fields: [
    { key: "dropHeight", label: { fr: "Hauteur de chute", en: "Drop height" }, unit: "cm", type: "number", step: 5, min: 15, max: 75 },
    { key: "jumpHeight", label: { fr: "Hauteur de saut", en: "Jump height" }, unit: "cm", type: "number", step: 0.1, min: 5, max: 80, optional: true },
    { key: "flightTime", label: { fr: "Temps de vol", en: "Flight time" }, unit: "s", type: "number", step: 0.001, min: 0.2, max: 1, optional: true },
    { key: "contactTime", label: { fr: "Temps de contact", en: "Contact time" }, unit: "s", type: "number", step: 0.001, min: 0.1, max: 1 },
  ],
  compute: (raw, ctx) => {
    const contactTime = num(raw, "contactTime");
    if (!contactTime) return { metrics: [], summary: null, flags: [], details: {} };

    const result = computeDropJump({
      dropHeightCm: num(raw, "dropHeight") ?? 30,
      jumpHeightCm: num(raw, "jumpHeight"),
      flightTimeS: num(raw, "flightTime"),
      contactTimeS: contactTime,
      bodyMassKg: ctx.bodyMassKg,
    });

    return {
      metrics: [
        metric("dj_rsi", "Indice de force reactive", "Reactive strength index", result.rsi, "m/s", true, true, 2),
        metric("dj_height", "Hauteur drop jump", "Drop jump height", result.jumpHeightCm, "cm", true, false, 1),
        metric("dj_contact", "Temps de contact", "Contact time", result.contactTimeS, "s", false, false, 3),
      ],
      summary: { fr: `Niveau ${result.category}. ${result.recommendation}`, en: `Level ${result.category}. ${result.recommendation}` },
      flags: contactTime > 0.3 ? ["Temps de contact superieur a 300 millisecondes, le saut perd son caractere reactif."] : [],
      details: { result },
    };
  },
};

export const hopTest: TestDefinition = {
  key: "hop_tests",
  name: { fr: "Batterie de sauts unilateraux", en: "Single leg hop battery" },
  shortName: { fr: "Hop tests", en: "Hop tests" },
  category: "JUMP",
  description: {
    fr: "Quatre sauts a cloche pied qui servent de criteres objectifs de retour au jeu apres blessure du membre inferieur.",
    en: "Four single leg hop tests used as objective return to play criteria after lower limb injury.",
  },
  protocol: {
    fr: "Mains libres, reception stabilisee trois secondes sans poser l'autre pied. Deux essais valides par jambe et par test. Toujours commencer par le cote sain.",
    en: "Hands free, landing held for three seconds without touching down with the other foot. Two valid trials per leg and per test. Always start with the healthy side.",
  },
  equipment: { fr: "Metre ruban, chronometre, couloir de 8 metres", en: "Tape measure, stopwatch, 8 m lane" },
  durationMin: 15,
  reference: "Grindem et al. 2016, Noyes et al. 1991",
  fields: [
    { key: "singleLeft", label: { fr: "Saut simple gauche", en: "Single hop left" }, unit: "cm", type: "number", step: 1, min: 30, max: 350, optional: true, group: { fr: "Saut simple", en: "Single hop" } },
    { key: "singleRight", label: { fr: "Saut simple droit", en: "Single hop right" }, unit: "cm", type: "number", step: 1, min: 30, max: 350, optional: true, group: { fr: "Saut simple", en: "Single hop" } },
    { key: "tripleLeft", label: { fr: "Triple saut gauche", en: "Triple hop left" }, unit: "cm", type: "number", step: 1, min: 100, max: 900, optional: true, group: { fr: "Triple saut", en: "Triple hop" } },
    { key: "tripleRight", label: { fr: "Triple saut droit", en: "Triple hop right" }, unit: "cm", type: "number", step: 1, min: 100, max: 900, optional: true, group: { fr: "Triple saut", en: "Triple hop" } },
    { key: "crossoverLeft", label: { fr: "Triple saut croise gauche", en: "Crossover hop left" }, unit: "cm", type: "number", step: 1, min: 100, max: 900, optional: true, group: { fr: "Triple saut croise", en: "Crossover hop" } },
    { key: "crossoverRight", label: { fr: "Triple saut croise droit", en: "Crossover hop right" }, unit: "cm", type: "number", step: 1, min: 100, max: 900, optional: true, group: { fr: "Triple saut croise", en: "Crossover hop" } },
    { key: "timedLeft", label: { fr: "Saut chronometre 6 m gauche", en: "6 m timed hop left" }, unit: "s", type: "number", step: 0.01, min: 1, max: 10, optional: true, group: { fr: "Saut chronometre", en: "Timed hop" } },
    { key: "timedRight", label: { fr: "Saut chronometre 6 m droit", en: "6 m timed hop right" }, unit: "s", type: "number", step: 0.01, min: 1, max: 10, optional: true, group: { fr: "Saut chronometre", en: "Timed hop" } },
    { key: "threshold", label: { fr: "Seuil de symetrie exige", en: "Required symmetry threshold" }, unit: "%", type: "number", step: 1, min: 80, max: 100, optional: true, help: { fr: "90% par defaut, 95% apres reconstruction du ligament croise anterieur.", en: "90% by default, 95% after anterior cruciate ligament reconstruction." } },
  ],
  compute: (raw) => {
    const result = computeHopTests(
      {
        singleHopLeftCm: num(raw, "singleLeft"),
        singleHopRightCm: num(raw, "singleRight"),
        tripleHopLeftCm: num(raw, "tripleLeft"),
        tripleHopRightCm: num(raw, "tripleRight"),
        crossoverHopLeftCm: num(raw, "crossoverLeft"),
        crossoverHopRightCm: num(raw, "crossoverRight"),
        timedHopLeftS: num(raw, "timedLeft"),
        timedHopRightS: num(raw, "timedRight"),
      },
      num(raw, "threshold") ?? 90,
    );

    const metrics: ComputedMetric[] = result.items.map((item, index) =>
      metric(`hop_lsi_${index}`, `Symetrie ${item.label}`, `${item.label} symmetry`, item.lsi, "%", true, index === 0, 1),
    );
    if (result.worstLsi != null)
      metrics.push(metric("hop_lsi_worst", "Symetrie la plus basse", "Lowest symmetry", result.worstLsi, "%", true, true, 1));

    return {
      metrics,
      summary: { fr: result.summary, en: result.summary },
      flags: result.clearedForReturn ? [] : [result.summary],
      details: { result },
    };
  },
};
