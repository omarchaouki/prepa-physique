/**
 * Controle de la normalisation envoyee a l'API Conversions de Meta.
 *
 * Ce controle existe parce que l'erreur qu'il attrape est silencieuse. Meta
 * accepte n'importe quelle empreinte SHA 256 : elle est bien formee, la reponse
 * est un succes, et le tableau de bord affiche l'evenement. Simplement, elle ne
 * correspond a personne, l'appariement tombe, et le cout par prospect monte
 * sans qu'aucun message n'explique pourquoi.
 *
 * Un numero marocain saisi « 0674679965 » doit devenir « 212674679965 » avant
 * hachage. C'est la regle la plus facile a casser en touchant au formulaire.
 *
 * Usage : npx tsx scripts/verify-capi.ts
 */

import { createHash } from "node:crypto";

import { hash, hashEmail, hashPhone } from "../src/lib/capi-normalize";

const sha = (value: string): string =>
  createHash("sha256").update(value, "utf8").digest("hex");

interface Cas {
  nom: string;
  obtenu: string | null;
  attendu: string | null;
}

const cas: Cas[] = [
  // --- Adresses ---
  {
    nom: "adresse en majuscules et avec espaces",
    obtenu: hashEmail("  Omar.Chaouki@LAMSAA.MA  "),
    attendu: sha("omar.chaouki@lamsaa.ma"),
  },
  {
    nom: "texte sans arobase, refuse",
    obtenu: hashEmail("pas une adresse"),
    attendu: null,
  },

  // --- Numeros ---
  {
    nom: "numero marocain national, zero remplace par 212",
    obtenu: hashPhone("0674679965", "MA"),
    attendu: sha("212674679965"),
  },
  {
    nom: "meme numero avec espaces et tirets",
    obtenu: hashPhone("06-74 67 99 65", "MA"),
    attendu: sha("212674679965"),
  },
  {
    nom: "numero deja international avec un plus",
    obtenu: hashPhone("+212 674 679 965", null),
    attendu: sha("212674679965"),
  },
  {
    nom: "numero international avec double zero",
    obtenu: hashPhone("00212674679965", null),
    attendu: sha("212674679965"),
  },
  {
    nom: "numero francais national",
    obtenu: hashPhone("06 12 34 56 78", "FR"),
    attendu: sha("33612345678"),
  },
  {
    nom: "pays inconnu et numero national, omis plutot qu'approxime",
    obtenu: hashPhone("0674679965", "ZZ"),
    attendu: null,
  },
  {
    nom: "pays absent et numero national, omis",
    obtenu: hashPhone("0674679965", null),
    attendu: null,
  },
  {
    nom: "numero vide",
    obtenu: hashPhone("   ", "MA"),
    attendu: null,
  },

  // --- Empreinte elle meme ---
  {
    nom: "empreinte SHA 256 en hexadecimal minuscule",
    obtenu: hash("ma"),
    attendu: sha("ma"),
  },
];

let echecs = 0;
console.log("\nNormalisation avant hachage, API Conversions\n" + "=".repeat(70));

for (const c of cas) {
  const ok = c.obtenu === c.attendu;
  if (!ok) echecs += 1;
  const etat = ok ? "OK  " : "ECHEC";
  const detail = ok
    ? c.attendu === null
      ? "omis, comme attendu"
      : `${c.attendu.slice(0, 16)}...`
    : `obtenu ${String(c.obtenu).slice(0, 16)} au lieu de ${String(c.attendu).slice(0, 16)}`;
  console.log(`  ${etat}  ${c.nom.padEnd(52)} ${detail}`);
}

console.log("=".repeat(70));
if (echecs > 0) {
  console.error(`${echecs} controle(s) en echec. L'appariement Meta serait degrade.`);
  process.exit(1);
}
console.log("Toutes les valeurs partent au format attendu par Meta.\n");
