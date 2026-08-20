import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { getCurrentUser } from "@/lib/auth";
import { CONTACT } from "@/lib/marketing";
import { getLocale, getT } from "@/lib/i18n/server";
import { LocaleProvider } from "@/lib/i18n/client";
import { LanguageSwitcher } from "@/components/shell/language-switcher";
import { Wordmark } from "@/components/marketing/wordmark";
import { SignUpForm } from "@/components/marketing/signup/signup-form";
import { signupCopyFromApp } from "@/components/marketing/signup/build-copy";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return {
    title: `${t("signup.title")} . ${CONTACT.brand}`,
    description: t("signup.subtitle"),
    // Une page d'inscription n'a rien a faire dans un moteur de recherche :
    // le trafic doit passer par la page d'accueil, qui explique le produit.
    robots: { index: false, follow: true },
  };
}

/**
 * Inscription publique, cible de la publicite.
 *
 * Un visiteur qui arrive ici a clique sur une promesse et veut la verifier en
 * quelques secondes. La page tient donc en un ecran : le formulaire, ce que
 * contient le palier gratuit, et rien d'autre. Aucun argumentaire, il est sur
 * la page d'accueil pour ceux qui le cherchent.
 */
export default async function SignUpPage() {
  const [user, locale, t] = await Promise.all([getCurrentUser(), getLocale(), getT()]);

  // Un visiteur deja connecte n'a rien a faire sur une page d'inscription.
  if (user) redirect(user.role === "OWNER" ? "/admin" : "/app");

  return (
    <LocaleProvider locale={locale}>
      <header
        className="sticky top-0 z-40"
        style={{
          background: "color-mix(in srgb, var(--surface-page) 88%, transparent)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <div className="mx-auto max-w-lg px-5 h-16 flex items-center gap-4">
          <Link href="/" className="cursor-pointer shrink-0" aria-label={CONTACT.brand}>
            <Wordmark name={CONTACT.brand} size="sm" />
          </Link>
          <div className="flex items-center gap-2 ml-auto">
            <LanguageSwitcher current={locale} />
            <Link href="/" className="btn btn-secondary" style={{ minHeight: "2.5rem" }}>
              <ChevronLeft size={15} aria-hidden="true" />
              {locale === "en" ? "Home" : "Accueil"}
            </Link>
          </div>
        </div>
      </header>

      <main className="form-comfortable mx-auto max-w-lg px-5 py-10">
        <h1 className="display-sm" style={{ fontSize: "clamp(1.75rem, 5vw, 2.25rem)" }}>
          {t("signup.title")}
        </h1>
        <p className="mt-3 text-[1rem] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          {t("signup.subtitle")}
        </p>

        <hr className="rule my-7" />

        <SignUpForm copy={signupCopyFromApp(t, locale)} />

        <hr className="rule mt-8" />

        <p className="text-[0.875rem] mt-5" style={{ color: "var(--text-secondary)" }}>
          {t("signup.haveAccount")}{" "}
          <Link href="/login" className="link-quiet cursor-pointer font-semibold">
            {t("signup.signIn")}
          </Link>
        </p>
      </main>
    </LocaleProvider>
  );
}
