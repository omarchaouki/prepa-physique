import { PrismaClient } from "@prisma/client";

/**
 * Simulation de latence, uniquement en developpement.
 *
 * En local la base est un fichier : les reponses arrivent en une poignee de
 * millisecondes et les etats de chargement ne s'affichent jamais. Definir
 * SIMULATE_LATENCY_MS ajoute ce delai a chaque requete, ce qui reproduit le
 * comportement d'une base distante et permet de verifier les squelettes.
 *
 *   SIMULATE_LATENCY_MS=400 npm run dev
 *
 * En production la variable est ignoree, sauf si ALLOW_LATENCY_SIMULATION vaut 1.
 * Cette seconde condition existe uniquement pour verifier le comportement d'une
 * version compilee, ou la prefetch des liens est active alors qu'elle ne l'est
 * pas en developpement. Deux variables sont necessaires, ce qui rend
 * l'activation accidentelle en production impossible.
 */
const latency = () => {
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_LATENCY_SIMULATION !== "1") {
    return 0;
  }
  const value = Number(process.env.SIMULATE_LATENCY_MS ?? 0);
  return Number.isFinite(value) && value > 0 ? value : 0;
};

const createClient = () => {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

  const delay = latency();
  if (delay === 0) return client;

  console.log(`[db] latence simulee : ${delay} ms par requete`);

  return client.$extends({
    query: {
      async $allOperations({ args, query }) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        return query(args);
      },
    },
  }) as unknown as PrismaClient;
};

// En developpement, Next recharge les modules a chaque modification. Sans ce cache
// global, chaque rechargement ouvrirait une nouvelle connexion a la base.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
