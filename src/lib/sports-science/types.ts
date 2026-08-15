export type Locale = "fr" | "en";

export interface I18nText {
  fr: string;
  en: string;
}

export type TestCategory =
  | "SPRINT"
  | "JUMP"
  | "STRENGTH"
  | "ENDURANCE"
  | "COD"
  | "ANTHRO"
  | "MOBILITY";

export interface TestField {
  key: string;
  label: I18nText;
  unit: string;
  type: "number" | "select" | "text";
  step?: number;
  min?: number;
  max?: number;
  optional?: boolean;
  options?: Array<{ value: string; label: I18nText }>;
  help?: I18nText;
  /** Regroupement visuel dans le formulaire de saisie. */
  group?: I18nText;
}

/** Contexte joueur necessaire aux calculs qui dependent de la morphologie. */
export interface PlayerContext {
  bodyMassKg: number;
  heightCm: number;
  ageYears: number;
  sex: "M" | "F";
  position?: string;
  category?: string;
}

export interface ComputedMetric {
  key: string;
  label: I18nText;
  value: number;
  unit: string;
  side?: "L" | "R";
  higherIsBetter: boolean;
  /** Metrique mise en avant sur la fiche joueur et dans le radar. */
  primary?: boolean;
  decimals?: number;
}

export interface TestComputation {
  metrics: ComputedMetric[];
  summary: I18nText | null;
  flags: string[];
  /** Donnees additionnelles serialisees pour l'affichage detaille, par exemple une courbe. */
  details: Record<string, unknown>;
}

export interface TestDefinition {
  key: string;
  name: I18nText;
  shortName: I18nText;
  category: TestCategory;
  description: I18nText;
  protocol: I18nText;
  equipment: I18nText;
  durationMin: number;
  reference: string;
  fields: TestField[];
  needsContext?: Array<"bodyMassKg" | "heightCm" | "ageYears" | "sex">;
  compute: (raw: Record<string, number | string>, ctx: PlayerContext) => TestComputation;
}

/**
 * Version serialisable d'un test, sans la fonction de calcul.
 * C'est ce qui traverse la frontiere serveur vers client, une fonction ne pouvant
 * pas etre transmise dans les props d'un composant client.
 */
export type TestSpec = Omit<TestDefinition, "compute">;

export const toTestSpec = (definition: TestDefinition): TestSpec => {
  const { compute: _compute, ...spec } = definition;
  return spec;
};

export const num = (raw: Record<string, number | string>, key: string): number | undefined => {
  const value = raw[key];
  if (value === undefined || value === null || value === "") return undefined;
  const parsed = typeof value === "number" ? value : Number.parseFloat(String(value));
  return Number.isFinite(parsed) ? parsed : undefined;
};

export const str = (raw: Record<string, number | string>, key: string): string | undefined => {
  const value = raw[key];
  return value === undefined || value === null || value === "" ? undefined : String(value);
};
