import { createHash } from "node:crypto";

import { getApiUser } from "@/lib/api/session";
import { fail, handler, ok } from "@/lib/api/respond";
import { CATEGORY_LABELS, TEST_BATTERIES, TEST_DEFINITIONS } from "@/lib/sports-science/catalog";
import { toTestSpec } from "@/lib/sports-science/types";

export const dynamic = "force-dynamic";

/**
 * Catalogue des tests, protocoles et batteries.
 *
 * L'application le telecharge a la premiere connexion et le garde. Sans lui,
 * impossible de dessiner une grille de saisie hors reseau : c'est ce catalogue
 * qui dit quels champs comporte un test, dans quelle unite, avec quelles bornes.
 *
 * La fonction de calcul, elle, ne part pas. Elle reste sur le serveur, qui
 * derive les metriques a la synchronisation. Le telephone enregistre donc des
 * valeurs brutes, ce qui est exactement ce que le preparateur saisit au bord du
 * terrain, et recoit les valeurs calculees au retour du reseau.
 *
 * L'empreinte permet a l'application de sauter le telechargement quand rien n'a
 * change, ce qui est le cas la plupart du temps : ce catalogue bouge une fois
 * par an.
 */

const payload = () => ({
  version: 1,
  categories: CATEGORY_LABELS,
  tests: TEST_DEFINITIONS.map(toTestSpec),
  batteries: TEST_BATTERIES,
});

/** Empreinte stable du catalogue, recalculee au demarrage du serveur. */
let cachedTag: string | null = null;
const etag = (body: unknown): string => {
  if (!cachedTag) {
    cachedTag = `"${createHash("sha1").update(JSON.stringify(body)).digest("hex").slice(0, 16)}"`;
  }
  return cachedTag;
};

export const GET = handler(async (request: Request) => {
  const user = await getApiUser(request);
  if (!user) return fail("UNAUTHENTICATED", "Session expiree.");

  const body = payload();
  const tag = etag(body);

  if (request.headers.get("if-none-match") === tag) {
    return new Response(null, { status: 304, headers: { ETag: tag, "Cache-Control": "no-store" } });
  }

  return ok(body, { headers: { ETag: tag } });
});
