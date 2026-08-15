/**
 * Verifie la connexion a la base et liste les tables deja presentes.
 * A lancer avant tout db push sur une base que l'on ne connait pas :
 * cela evite d'ecraser des donnees existantes.
 *
 * Usage : npx tsx scripts/check-connection.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const main = async () => {
  const started = Date.now();

  const version = await prisma.$queryRawUnsafe<Array<{ version: string }>>("SELECT version()");
  console.log(`Connexion etablie en ${Date.now() - started} ms`);
  console.log(version[0]?.version?.split(",")[0] ?? "version inconnue");

  const tables = await prisma.$queryRawUnsafe<Array<{ table_name: string }>>(
    `SELECT table_name FROM information_schema.tables
     WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
     ORDER BY table_name`,
  );

  console.log("");
  if (tables.length === 0) {
    console.log("Schema public vide : aucune table.");
  } else {
    console.log(`${tables.length} table(s) dans le schema public :`);
    for (const table of tables) {
      const count = await prisma.$queryRawUnsafe<Array<{ n: bigint }>>(
        `SELECT count(*)::bigint AS n FROM public."${table.table_name}"`,
      );
      console.log(`  ${table.table_name.padEnd(20)} ${String(count[0]?.n ?? 0).padStart(8)} ligne(s)`);
    }
  }

  // Mesure de la latence applicative reelle, celle qui compte pour l'interface.
  const pings: number[] = [];
  for (let i = 0; i < 5; i += 1) {
    const t = Date.now();
    await prisma.$queryRawUnsafe("SELECT 1");
    pings.push(Date.now() - t);
  }
  const mean = Math.round(pings.reduce((a, b) => a + b, 0) / pings.length);
  console.log("");
  console.log(`Latence par requete : ${pings.join(" / ")} ms, moyenne ${mean} ms`);
};

main()
  .catch((error) => {
    console.error("Echec :", error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
