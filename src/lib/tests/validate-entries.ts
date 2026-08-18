import { getTest } from "@/lib/sports-science/catalog";
import type { ResultEntry } from "./apply-results";

/**
 * Controle des valeurs saisies, avant enregistrement par l'API.
 *
 * Sur le site, ce controle serait redondant : le formulaire est engendre a
 * partir de la definition du test, il ne peut donc produire que des cles qui
 * existent, avec les bornes du champ deja posees sur l'element de saisie.
 *
 * Une API n'offre aucune de ces garanties. Sans ce filtre, une application
 * cliente qui se trompe de nom de champ obtient une reponse « enregistre » et
 * une detente de zero centimetre en base : la valeur inconnue est ignoree, le
 * calcul tourne sur ce qui reste, et personne ne voit passer l'erreur. C'est le
 * pire des trois resultats possibles, loin derriere un refus franc.
 *
 * Les bornes viennent des definitions de tests. Elles ne cherchent pas a juger
 * la performance, seulement a rattraper l'erreur de saisie ou d'unite : une
 * detente de 3,8 cm est une valeur en metres tapee dans un champ en centimetres.
 */

export interface EntryProblem {
  playerId: string;
  field: string;
  reason: "unknown_field" | "not_a_number" | "out_of_range";
  message: string;
}

export const validateEntries = (
  testKey: string,
  entries: ResultEntry[],
): { ok: true } | { ok: false; problems: EntryProblem[] } => {
  const definition = getTest(testKey);
  if (!definition) {
    return {
      ok: false,
      problems: [
        { playerId: "", field: "", reason: "unknown_field", message: `Test inconnu : ${testKey}` },
      ],
    };
  }

  const fields = new Map(definition.fields.map((field) => [field.key, field]));
  const problems: EntryProblem[] = [];

  for (const entry of entries) {
    for (const [key, value] of Object.entries(entry.values)) {
      // Une valeur vide veut dire « non mesure », elle est legitime partout.
      if (String(value ?? "").trim() === "") continue;

      const field = fields.get(key);
      if (!field) {
        problems.push({
          playerId: entry.playerId,
          field: key,
          reason: "unknown_field",
          message: `Le test ${testKey} n'a pas de champ ${key}.`,
        });
        continue;
      }

      if (field.type !== "number") continue;

      const parsed = typeof value === "number" ? value : Number.parseFloat(String(value));
      if (!Number.isFinite(parsed)) {
        problems.push({
          playerId: entry.playerId,
          field: key,
          reason: "not_a_number",
          message: `${key} attend un nombre, recu ${JSON.stringify(value)}.`,
        });
        continue;
      }

      const { min, max } = field;
      if ((min != null && parsed < min) || (max != null && parsed > max)) {
        problems.push({
          playerId: entry.playerId,
          field: key,
          reason: "out_of_range",
          message: `${key} vaut ${parsed}, hors des bornes ${min ?? "?"} a ${max ?? "?"}.`,
        });
      }
    }
  }

  return problems.length === 0 ? { ok: true } : { ok: false, problems };
};
