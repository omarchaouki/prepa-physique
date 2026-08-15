/**
 * Controle de coherence : distribution des percentiles calcules sur les donnees
 * reellement presentes en base. Une metrique dont tous les joueurs se retrouvent
 * aux extremes signale une norme mal calibree ou une unite incoherente.
 *
 * Usage : npx tsx scripts/check-percentiles.ts
 */

import { PrismaClient } from "@prisma/client";
import { compareToNorm, resolvePopulation } from "../src/lib/sports-science/norms";
import { mean, sd } from "../src/lib/sports-science/stats";

const prisma = new PrismaClient();

const main = async () => {
  const teams = await prisma.team.findMany({ include: { players: true } });

  for (const team of teams) {
    const population = resolvePopulation(team.category, team.level);
    console.log(`\n=== ${team.name} · population ${population} ===`);

    const metrics = await prisma.metric.findMany({
      where: { teamId: team.id, side: null },
      orderBy: { date: "desc" },
    });

    // Derniere valeur par joueur et par metrique.
    const latest = new Map<string, Map<string, number>>();
    for (const metric of metrics) {
      const byKey = latest.get(metric.key) ?? new Map<string, number>();
      if (!byKey.has(metric.playerId)) byKey.set(metric.playerId, metric.value);
      latest.set(metric.key, byKey);
    }

    const rows: Array<{ key: string; n: number; mean: number; sd: number; p: number[] }> = [];

    for (const [key, byPlayer] of latest) {
      const percentiles: number[] = [];
      const values: number[] = [];
      for (const [playerId, value] of byPlayer) {
        const player = team.players.find((p) => p.id === playerId);
        if (!player) continue;
        const comparison = compareToNorm(
          key,
          value,
          population,
          player.sex === "F" ? "F" : "M",
          player.position,
        );
        values.push(value);
        if (comparison) percentiles.push(comparison.percentile);
      }
      if (percentiles.length === 0) continue;
      rows.push({ key, n: percentiles.length, mean: mean(values), sd: sd(values), p: percentiles });
    }

    rows.sort((a, b) => a.key.localeCompare(b.key));

    console.log(
      "metrique".padEnd(24) +
        "n".padStart(4) +
        "moyenne".padStart(11) +
        "ecart type".padStart(12) +
        "percentile median".padStart(19) +
        "  min-max   alerte",
    );

    for (const row of rows) {
      const sorted = [...row.p].sort((a, b) => a - b);
      const medianP = sorted[Math.floor(sorted.length / 2)];
      const min = sorted[0];
      const max = sorted[sorted.length - 1];
      // Un percentile median tres eloigne de 50 signale une norme mal calibree
      // pour cette population.
      const suspicious = medianP < 20 || medianP > 80 ? "  <-- a verifier" : "";
      console.log(
        row.key.padEnd(24) +
          String(row.n).padStart(4) +
          row.mean.toFixed(2).padStart(11) +
          row.sd.toFixed(2).padStart(12) +
          String(medianP).padStart(19) +
          `  ${min}-${max}` +
          suspicious,
      );
    }
  }
};

main().finally(() => prisma.$disconnect());
