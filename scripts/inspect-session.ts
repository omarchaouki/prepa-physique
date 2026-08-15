/**
 * Inspection rapide d'une passation : valeurs brutes saisies et metriques derivees.
 * Usage : npx tsx scripts/inspect-session.ts "Nom de la passation"
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const main = async () => {
  const name = process.argv[2];
  const session = await prisma.testSession.findFirst({
    where: name ? { name } : undefined,
    orderBy: { createdAt: "desc" },
    include: { results: { include: { player: true, metrics: true } } },
  });

  if (!session) {
    console.log("Aucune passation trouvee.");
    return;
  }

  console.log(`Passation : ${session.name} (${session.results.length} resultats)\n`);

  for (const result of session.results) {
    console.log(
      `${result.player.lastName} ${result.player.firstName} · ${result.player.weightKg} kg · ${result.player.heightCm} cm · test ${result.testKey}`,
    );
    console.log("  saisie   :", JSON.parse(result.rawJson));
    console.log(
      "  calcule  :",
      result.metrics.map((m) => `${m.key}${m.side ? `[${m.side}]` : ""}=${m.value} ${m.unit}`).join("  "),
    );
    const computed = JSON.parse(result.computedJson) as { flags?: string[] };
    if (computed.flags && computed.flags.length > 0) {
      console.log("  alertes  :", computed.flags.join(" | "));
    }
    console.log("");
  }
};

main().finally(() => prisma.$disconnect());
