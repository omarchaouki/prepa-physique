import { z } from "zod";

import { prisma } from "@/lib/db";
import { getPlayerProfile } from "@/lib/queries";
import { apiAccessibleTeamIds, getApiUser } from "@/lib/api/session";
import { fail, handler, ok } from "@/lib/api/respond";
import type { Locale } from "@/lib/i18n/dictionary";

export const dynamic = "force-dynamic";

/**
 * Fiches joueurs completes, telles que le site les affiche.
 *
 * ---------------------------------------------------------------------------
 * Pourquoi cette route existe
 * ---------------------------------------------------------------------------
 *
 * La descente de `sync` transporte des mesures brutes : une valeur, une unite,
 * une date. Elle suffit a lister un effectif, pas a repondre a la question que
 * le preparateur se pose devant un joueur.
 *
 * Pour y repondre il faut le libelle lisible de chaque metrique, le percentile
 * dans la bonne population par age et par niveau, la lecture par seuil des
 * asymetries, la comparaison a la moyenne de l'equipe, et les recommandations
 * ecrites. Tout cela demande les tables de normes et le moteur de
 * recommandations, qui vivent sur le serveur.
 *
 * Le telephone recoit donc le resultat, pas les ingredients. C'est le meme
 * choix que pour les calculs de tests : une seule implementation, un seul
 * endroit ou corriger une formule.
 *
 * ---------------------------------------------------------------------------
 * Pourquoi par lots, et non joueur par joueur
 * ---------------------------------------------------------------------------
 *
 * Une fiche par requete obligerait le telephone a etre connecte pour ouvrir un
 * joueur, ce qui ruinerait le hors ligne. Il les demande donc toutes d'un coup
 * apres la descente, et les garde. Un effectif de trois cents joueurs
 * represente quelques centaines de kilo octets, negligeable a cote des mesures
 * qui viennent d'etre telechargees.
 *
 * Les fiches sont calculees en series courtes plutot que toutes en parallele :
 * chacune declenche plusieurs requetes, et le pool de connexions de Supabase
 * est vite sature.
 */

const schema = z.object({
  /** Sans liste, toutes les fiches accessibles sont renvoyees. */
  playerIds: z.array(z.string().min(1)).max(400).optional(),
  locale: z.enum(["fr", "en"]).optional(),
});

/** Nombre de fiches calculees simultanement. */
const BATCH = 6;

/**
 * Retire du profil ce que le telephone possede deja.
 *
 * `results` et `metrics` representaient a eux seuls les deux tiers du poids de
 * la reponse, alors que la descente de `sync` vient de les ecrire dans la base
 * locale. Les renvoyer ici revenait a telecharger deux fois la meme chose, sur
 * un forfait de terrain.
 *
 * Ce qui reste est precisement ce que le telephone ne sait pas produire :
 * libelles lisibles, percentiles dans la bonne population, lecture par seuil,
 * comparaison a l'equipe, radar et recommandations.
 */
const trim = (profile: Record<string, unknown>) => {
  const { results: _results, metrics: _metrics, ...keep } = profile;
  return keep;
};

export const POST = handler(async (request: Request) => {
  const user = await getApiUser(request);
  if (!user) return fail("UNAUTHENTICATED", "Session expiree.");

  const body = await request.json().catch(() => ({}));
  const parsed = schema.safeParse(body ?? {});
  if (!parsed.success) return fail("INVALID_INPUT", "Requete invalide.");

  const locale = (parsed.data.locale ?? "fr") as Locale;
  const ids = await apiAccessibleTeamIds(user);
  if (ids !== "ALL" && ids.length === 0) return ok({ profiles: [] });

  // Le filtre par equipe est applique en base plutot que sur la liste recue :
  // un client qui demanderait un joueur hors de son perimetre ne doit pas
  // obtenir sa fiche, meme s'il en connait l'identifiant.
  const players = await prisma.player.findMany({
    where: {
      ...(ids === "ALL" ? {} : { teamId: { in: ids } }),
      ...(parsed.data.playerIds ? { id: { in: parsed.data.playerIds } } : {}),
      status: { not: "LEFT" },
    },
    select: { id: true },
  });

  const profiles: unknown[] = [];
  for (let index = 0; index < players.length; index += BATCH) {
    const slice = players.slice(index, index + BATCH);
    const built = await Promise.all(
      slice.map((player) => getPlayerProfile(player.id, locale)),
    );
    for (const profile of built) {
      if (profile) profiles.push(trim(profile));
    }
  }

  return ok({ profiles, locale, builtAt: new Date().toISOString() });
});
