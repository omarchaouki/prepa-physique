import type { I18nText, TestCategory, TestDefinition } from "../types";
import { illinoisTest, sprintFlying, sprintLinear, tTest, test505 } from "./sprint-tests";
import { cmjTest, dropJumpTest, hopTest, squatJumpTest } from "./jump-tests";
import { groinTest, imtpTest, loadVelocityTest, nordicTest, oneRmTest } from "./strength-tests";
import {
  broncoTest,
  heartRateProfile,
  ift3015Test,
  masTest,
  rsaTest,
  yoyoTest,
} from "./endurance-tests";
import { anthropometryTest, mobilityTest } from "./body-tests";

export const TEST_DEFINITIONS: TestDefinition[] = [
  sprintLinear,
  sprintFlying,
  test505,
  illinoisTest,
  tTest,
  cmjTest,
  squatJumpTest,
  dropJumpTest,
  hopTest,
  nordicTest,
  groinTest,
  imtpTest,
  oneRmTest,
  loadVelocityTest,
  yoyoTest,
  ift3015Test,
  masTest,
  broncoTest,
  rsaTest,
  heartRateProfile,
  anthropometryTest,
  mobilityTest,
];

export const TEST_MAP: Record<string, TestDefinition> = Object.fromEntries(
  TEST_DEFINITIONS.map((t) => [t.key, t]),
);

export const getTest = (key: string): TestDefinition | undefined => TEST_MAP[key];

export const CATEGORY_LABELS: Record<TestCategory, I18nText> = {
  SPRINT: { fr: "Vitesse", en: "Speed" },
  JUMP: { fr: "Detente et puissance", en: "Jump and power" },
  STRENGTH: { fr: "Force", en: "Strength" },
  ENDURANCE: { fr: "Endurance", en: "Endurance" },
  COD: { fr: "Changement de direction", en: "Change of direction" },
  ANTHRO: { fr: "Anthropometrie", en: "Anthropometry" },
  MOBILITY: { fr: "Mobilite", en: "Mobility" },
};

export const CATEGORY_ORDER: TestCategory[] = [
  "SPRINT",
  "JUMP",
  "STRENGTH",
  "COD",
  "ENDURANCE",
  "ANTHRO",
  "MOBILITY",
];

export const testsByCategory = (): Array<{ category: TestCategory; label: I18nText; tests: TestDefinition[] }> =>
  CATEGORY_ORDER.map((category) => ({
    category,
    label: CATEGORY_LABELS[category],
    tests: TEST_DEFINITIONS.filter((t) => t.category === category),
  })).filter((group) => group.tests.length > 0);

/** Batteries pretes a l'emploi, alignees sur les moments cles de la saison. */
export interface TestBattery {
  key: string;
  name: I18nText;
  description: I18nText;
  testKeys: string[];
  estimatedMinutesPerPlayer: number;
  when: I18nText;
}

export const TEST_BATTERIES: TestBattery[] = [
  {
    key: "preseason_full",
    name: { fr: "Bilan complet de reprise", en: "Full preseason assessment" },
    description: {
      fr: "Photographie complete du joueur en debut de preparation. Sert de reference pour toute la saison.",
      en: "Complete picture of the athlete at the start of preseason. Serves as the reference for the whole season.",
    },
    testKeys: [
      "anthropometry",
      "cmj",
      "squat_jump",
      "sprint_linear",
      "test_505",
      "nordic",
      "groin_squeeze",
      "ift_30_15",
      "mobility",
    ],
    estimatedMinutesPerPlayer: 35,
    when: { fr: "Semaine 1 de la preparation", en: "Week 1 of preseason" },
  },
  {
    key: "midseason_control",
    name: { fr: "Controle de mi saison", en: "Mid season control" },
    description: {
      fr: "Version courte pour verifier le maintien des qualites sans perturber la semaine de match.",
      en: "Short version to check that qualities are being maintained without disrupting the match week.",
    },
    testKeys: ["cmj", "sprint_linear", "nordic", "groin_squeeze"],
    estimatedMinutesPerPlayer: 18,
    when: { fr: "Toutes les 6 a 8 semaines, un jour MD moins 4", en: "Every 6 to 8 weeks, on an MD minus 4 day" },
  },
  {
    key: "injury_prevention",
    name: { fr: "Depistage du risque de blessure", en: "Injury risk screening" },
    description: {
      fr: "Batterie centree sur les facteurs de risque modifiables les mieux documentes : force excentrique des ischio jambiers, adducteurs, asymetries et mobilite.",
      en: "Battery focused on the best documented modifiable risk factors: eccentric hamstring strength, adductors, asymmetries and mobility.",
    },
    testKeys: ["nordic", "groin_squeeze", "hop_tests", "mobility", "cmj"],
    estimatedMinutesPerPlayer: 25,
    when: { fr: "Reprise, puis tous les trimestres", en: "Preseason, then every quarter" },
  },
  {
    key: "return_to_play",
    name: { fr: "Criteres de retour au jeu", en: "Return to play criteria" },
    description: {
      fr: "Tests objectifs a valider avant la reintegration collective apres une blessure du membre inferieur.",
      en: "Objective tests to clear before returning to team training after a lower limb injury.",
    },
    testKeys: ["hop_tests", "cmj", "nordic", "test_505", "sprint_linear"],
    estimatedMinutesPerPlayer: 40,
    when: { fr: "Fin de phase de reathletisation", en: "End of the reconditioning phase" },
  },
  {
    key: "youth_development",
    name: { fr: "Suivi du joueur en formation", en: "Youth development monitoring" },
    description: {
      fr: "Ajoute la maturation biologique aux qualites physiques, pour interpreter les performances a l'aune du stade de croissance.",
      en: "Adds biological maturation to physical qualities, so performance can be interpreted against growth stage.",
    },
    testKeys: ["anthropometry", "cmj", "sprint_linear", "test_505", "yoyo", "mobility"],
    estimatedMinutesPerPlayer: 30,
    when: { fr: "Trois fois par saison, plus une mesure de taille mensuelle", en: "Three times per season, plus a monthly height measurement" },
  },
  {
    key: "aerobic_only",
    name: { fr: "Evaluation aerobie", en: "Aerobic assessment" },
    description: {
      fr: "Un seul test progressif pour actualiser les allures de prescription de tout le groupe.",
      en: "A single progressive test to refresh prescription paces for the whole squad.",
    },
    testKeys: ["ift_30_15", "hr_profile"],
    estimatedMinutesPerPlayer: 30,
    when: { fr: "Reprise et retour de treve hivernale", en: "Preseason and after the winter break" },
  },
];

export const getBattery = (key: string): TestBattery | undefined =>
  TEST_BATTERIES.find((b) => b.key === key);
