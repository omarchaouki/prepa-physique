/**
 * Bascule le connecteur de base de donnees dans prisma/schema.prisma.
 *
 * Usage :
 *   node scripts/set-db-provider.mjs sqlite       (developpement local, fichier)
 *   node scripts/set-db-provider.mjs postgresql   (Supabase ou tout PostgreSQL)
 *
 * Le schema est ecrit dans l'intersection des deux connecteurs : aucun enum
 * natif, aucun type Json, aucune liste scalaire. La bascule se limite donc au
 * bloc datasource.
 *
 * En PostgreSQL le bloc declare deux adresses :
 *   DATABASE_URL  connexion applicative, passe par le pooler de Supabase
 *   DIRECT_URL    connexion directe, utilisee par prisma db push et migrate
 * Le pooler en mode transaction ne supporte pas les instructions de schema,
 * d'ou la seconde adresse.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const target = process.argv[2];
const allowed = ["sqlite", "postgresql"];

if (!allowed.includes(target)) {
  console.error(`Connecteur invalide. Valeurs acceptees : ${allowed.join(", ")}`);
  process.exit(1);
}

const path = resolve(process.cwd(), "prisma/schema.prisma");
const source = readFileSync(path, "utf8");

const datasourceBlock =
  target === "sqlite"
    ? `datasource db {
  provider = "sqlite" // production : node scripts/set-db-provider.mjs postgresql
  url      = env("DATABASE_URL")
}`
    : `datasource db {
  provider  = "postgresql" // developpement local : node scripts/set-db-provider.mjs sqlite
  url       = env("DATABASE_URL")
  // Connexion directe, sans pooler : indispensable pour db push et migrate.
  directUrl = env("DIRECT_URL")
}`;

const updated = source.replace(/datasource db \{[\s\S]*?\n\}/, datasourceBlock);

if (updated === source) {
  console.log(`Le connecteur est deja ${target}, aucune modification.`);
  process.exit(0);
}

writeFileSync(path, updated, "utf8");

console.log(`Connecteur bascule vers ${target}.`);
console.log("");
if (target === "postgresql") {
  console.log("Renseigner dans .env :");
  console.log("  DATABASE_URL  adresse du pooler, port 6543, avec ?pgbouncer=true");
  console.log("  DIRECT_URL    adresse directe, port 5432");
} else {
  console.log('Renseigner dans .env :  DATABASE_URL="file:./dev.db"');
}
console.log("");
console.log("Puis :");
console.log("  npx prisma generate");
console.log("  npx prisma db push");
