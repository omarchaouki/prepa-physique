import type { NextConfig } from "next";

/**
 * Compilation allegee sur le serveur.
 *
 * L'instance de production a 911 Mo de memoire. La phase de verification des
 * types de `next build` tient tout le graphe du projet en memoire d'un seul
 * coup, et Next la repartit sur plusieurs processus enfants qui reclament
 * chacun leur part : sur cette machine, la compilation meurt avant la fin.
 *
 * Cette verification est redondante la ou elle coute le plus cher. Elle a deja
 * tourne sur la machine de developpement, ou `npm run typecheck` et
 * `npm run build` verifient tout, sans contrainte de memoire. La refaire sur le
 * serveur ne protege de rien : le code y arrive par `git pull`, il est donc
 * exactement celui qui vient d'etre verifie.
 *
 * La variable n'est donc posee que sur le serveur, et jamais en developpement.
 * Ainsi une erreur de type reste bloquante la ou elle doit l'etre, au moment de
 * l'ecrire, et ne l'est plus la ou elle ne peut plus rien apprendre.
 *
 *   SKIP_BUILD_CHECKS=1 npm run build     sur le serveur uniquement
 *
 * La regle qui va avec, et qui n'est pas negociable : `npm run typecheck` doit
 * passer avant chaque `git push`.
 */
const skipChecks = process.env.SKIP_BUILD_CHECKS === "1";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  typescript: {
    // Voir le commentaire ci dessus. Faux par defaut, donc la verification a
    // lieu partout sauf la ou elle a ete explicitement desactivee.
    ignoreBuildErrors: skipChecks,
  },
  eslint: {
    ignoreDuringBuilds: skipChecks,
  },

  experimental: {
    optimizePackageImports: ["lucide-react", "recharts", "date-fns"],

    // Un seul processus de generation quand la memoire est comptee. Next en
    // lance autant que de coeurs, et chacun charge sa propre copie du graphe
    // de modules : sur une petite instance, la somme depasse la memoire
    // disponible bien avant que le parallelisme n'ait fait gagner du temps.
    ...(skipChecks ? { cpus: 1, workerThreads: false } : {}),
  },
};

export default nextConfig;
