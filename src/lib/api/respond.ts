import { NextResponse } from "next/server";

/**
 * Reponses de l'API mobile.
 *
 * Une seule forme d'erreur pour toute l'API : un code stable que le client peut
 * tester, et un message lisible. Le client mobile doit pouvoir distinguer sans
 * ambiguite trois situations qui appellent trois comportements differents :
 *
 *   UNAUTHENTICATED  le jeton est absent, expire ou revoque  -> retour a l'ecran
 *                    de connexion, on efface la session locale
 *   FORBIDDEN        le jeton est bon mais le droit manque   -> on garde la
 *                    session, on affiche le refus
 *   CONFLICT         la donnee a change entre temps          -> on resynchronise
 *
 * Un client qui ne sait pas les distinguer deconnecte l'utilisateur au moindre
 * refus, ce qui est le defaut le plus penible d'une application de terrain.
 */

export type ApiErrorCode =
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "INVALID_INPUT"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "SERVER_ERROR";

const STATUS: Record<ApiErrorCode, number> = {
  UNAUTHENTICATED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INVALID_INPUT: 422,
  CONFLICT: 409,
  RATE_LIMITED: 429,
  SERVER_ERROR: 500,
};

export const ok = <T>(data: T, init?: ResponseInit) =>
  NextResponse.json(data, {
    ...init,
    headers: {
      // Une reponse d'API ne doit jamais etre mise en cache par un
      // intermediaire : elle depend du porteur du jeton.
      "Cache-Control": "no-store",
      ...init?.headers,
    },
  });

export const fail = (code: ApiErrorCode, message: string, details?: unknown) =>
  NextResponse.json(
    { error: { code, message, ...(details ? { details } : {}) } },
    { status: STATUS[code], headers: { "Cache-Control": "no-store" } },
  );

/**
 * Enveloppe un gestionnaire de route.
 *
 * Sans cela, une exception inattendue renvoie la trace d'appel de Next.js, qui
 * expose les chemins du serveur et parfois le contenu d'une requete. Ici elle
 * est journalisee cote serveur et le client ne recoit qu'un code.
 */
export const handler =
  <A extends unknown[]>(fn: (...args: A) => Promise<Response>) =>
  async (...args: A): Promise<Response> => {
    try {
      return await fn(...args);
    } catch (error) {
      console.error("[api]", error);
      return fail("SERVER_ERROR", "Une erreur inattendue est survenue.");
    }
  };
