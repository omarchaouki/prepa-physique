import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

import { SESSION_COOKIE } from "@/lib/constants";

/**
 * Premier filtre d'acces, execute avant tout rendu.
 *
 * Il se contente de verifier la signature du jeton, sans aucune requete a la
 * base : c'est ce qui permet de rediriger un visiteur non connecte en quelques
 * millisecondes au lieu d'attendre un aller retour vers Supabase.
 *
 * Les controles reels (compte actif, version du jeton, droits sur l'equipe)
 * restent faits dans les pages, ou l'acces a la base est disponible.
 */

const secret = () => new TextEncoder().encode(process.env.AUTH_SECRET ?? "");

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const { pathname, search } = request.nextUrl;

  let payload: { role?: string } | null = null;
  if (token && process.env.AUTH_SECRET) {
    try {
      const verified = await jwtVerify(token, secret());
      payload = verified.payload as { role?: string };
    } catch {
      payload = null;
    }
  }

  // Zones protegees
  if (pathname.startsWith("/app") || pathname.startsWith("/admin")) {
    if (!payload) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      // On garde la destination pour y revenir apres connexion.
      url.search = pathname === "/app" ? "" : `?from=${encodeURIComponent(pathname + search)}`;
      return NextResponse.redirect(url);
    }
    if (pathname.startsWith("/admin") && payload.role !== "OWNER") {
      const url = request.nextUrl.clone();
      url.pathname = "/app";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  // La redirection des utilisateurs deja connectes hors de la page de connexion
  // est volontairement laissee a la page elle meme.
  //
  // Le middleware ne peut verifier que la signature du jeton, pas l'existence du
  // compte. Un jeton signe dont l'utilisateur a ete supprime ou dont la version
  // a ete revoquee passerait donc ce filtre, tandis que la page le rejetterait
  // et renverrait vers la connexion : les deux se renverraient la balle
  // indefiniment. La page, elle, dispose de la base et tranche pour de bon.

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/admin/:path*"],
};
