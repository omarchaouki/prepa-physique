import { getApiUser } from "@/lib/api/session";
import { fail, handler, ok } from "@/lib/api/respond";

export const dynamic = "force-dynamic";

/**
 * Verifie qu'un jeton est toujours valable et renvoie le compte associe.
 *
 * L'application appelle cette route au lancement, avant d'afficher quoi que ce
 * soit. Elle sert a distinguer deux situations que l'utilisateur vit tres
 * differemment :
 *
 *   reponse 401  le compte a ete desactive ou les sessions revoquees, il faut
 *                effacer la base locale et revenir a la connexion
 *   pas de reseau  le jeton est peut etre encore bon, on ouvre l'application
 *                  sur les donnees locales sans rien effacer
 *
 * Confondre les deux est le defaut classique : l'application deconnecte le
 * preparateur au milieu d'un terrain parce que le reseau a saute.
 */
export const GET = handler(async (request: Request) => {
  const user = await getApiUser(request);
  if (!user) return fail("UNAUTHENTICATED", "Session expiree.");

  return ok({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      locale: user.locale,
      mustChangePassword: user.mustChangePw,
      organizationId: user.organizationId,
      organizationName: user.organizationName,
    },
  });
});
