import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import { getLocale, getT } from "@/lib/i18n/server";
import { LocaleProvider } from "@/lib/i18n/client";
import { CONTACT } from "@/lib/marketing";
import { Wordmark } from "@/components/marketing/wordmark";
import { Forward } from "./forward";

export const dynamic = "force-dynamic";

/**
 * Confirmation d'inscription, puis passage a l'application.
 *
 * ---------------------------------------------------------------------------
 * Pourquoi cette page existe
 * ---------------------------------------------------------------------------
 *
 * Elle n'a pas ete ajoutee pour le confort : elle repare une consequence.
 *
 * Les balises de mesure ne s'executent plus dans `/app` ni dans `/admin`, pour
 * les raisons detaillees dans components/tracking/paths.ts. Or l'inscription
 * se terminait par une redirection vers `/app`, et c'est precisement la que
 * l'evenement de conversion partait. Couper la mesure sans rien deplacer aurait
 * supprime le Lead cote navigateur, en silence, et le defaut ne se serait vu
 * que sur le cout par prospect, des semaines plus tard.
 *
 * Cette page est publique. Elle recoit l'identifiant d'evenement engendre par
 * le serveur, laisse le pixel partir avec, puis passe la main a l'application.
 *
 * ---------------------------------------------------------------------------
 * Ce qu'elle ne fait pas
 * ---------------------------------------------------------------------------
 *
 * Elle ne retient personne. Il n'y a ni bouton, ni message a lire, ni delai
 * decoratif : le passage a l'application est immediat. Un ecran de felicitations
 * entre un formulaire rempli et le produit est une friction que personne n'a
 * demandee.
 *
 * Elle refuse aussi de servir a autre chose. Sans identifiant d'evenement dans
 * l'adresse, elle redirige sans rien mesurer : une adresse recopiee ou visitee
 * deux fois ne doit pas compter un second prospect.
 */
export default async function BienvenuePage({
  searchParams,
}: {
  searchParams: Promise<{ eid?: string }>;
}) {
  const [user, { eid }, locale, t] = await Promise.all([
    getCurrentUser(),
    searchParams,
    getLocale(),
    getT(),
  ]);

  // Quelqu'un qui n'est pas connecte n'a rien a faire ici : cette page ne se
  // traverse qu'au sortir d'une inscription reussie.
  if (!user) redirect("/login");

  const destination = user.role === "OWNER" ? "/admin" : "/app";

  return (
    <LocaleProvider locale={locale}>
      <main
        className="min-h-dvh grid place-items-center px-5"
        style={{ background: "var(--surface-page)" }}
      >
        {/* Le contenu tient en trois lignes et n'est visible qu'une fraction de
            seconde. Il existe pour les cas ou le passage tarde : reseau lent,
            script differe. Un ecran blanc a cet instant precis, juste apres
            avoir tape un mot de passe, se lit comme un echec. */}
        <div className="text-center">
          <div className="inline-flex mb-6">
            <Wordmark name={CONTACT.brand} size="lg" />
          </div>

          <p
            className="display-sm"
            style={{ fontSize: "clamp(1.25rem, 4vw, 1.625rem)" }}
            role="status"
          >
            {t("signup.welcomeTitle")}
          </p>
          <p className="mt-2 text-[0.9375rem]" style={{ color: "var(--text-secondary)" }}>
            {t("signup.welcomeBody")}
          </p>
        </div>

        <Forward destination={destination} eventId={eid ?? null} />
      </main>
    </LocaleProvider>
  );
}
