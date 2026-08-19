import Link from "next/link";
import { redirect } from "next/navigation";
import { Activity } from "lucide-react";

import { getCurrentUser } from "@/lib/auth";
import { getLocale, getT } from "@/lib/i18n/server";
import { LocaleProvider } from "@/lib/i18n/client";
import { LanguageSwitcher } from "@/components/shell/language-switcher";
import { LoginForm } from "./login-form";

export const metadata = { title: "Connexion | Prepa Physique" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const [user, { from }, locale, t] = await Promise.all([
    getCurrentUser(),
    searchParams,
    getLocale(),
    getT(),
  ]);
  if (user) redirect(user.role === "OWNER" ? "/admin" : "/app");

  const points = [
    t("login.heroPoint1"),
    t("login.heroPoint2"),
    t("login.heroPoint3"),
    t("login.heroPoint4"),
  ];

  return (
    <LocaleProvider locale={locale}>
      <main className="min-h-dvh grid lg:grid-cols-2">
        {/* Colonne de presentation, masquee sur mobile pour laisser la place au formulaire */}
        <section
          className="hidden lg:flex flex-col justify-between p-10"
          style={{
            background: "var(--surface-panel)",
            borderRight: "1px solid var(--border-subtle)",
          }}
        >
          <div className="flex items-center gap-2.5">
            <span
              className="grid place-items-center size-9 rounded-lg"
              style={{ background: "var(--accent)", color: "var(--accent-text)" }}
            >
              <Activity size={19} strokeWidth={2.2} aria-hidden="true" />
            </span>
            <span className="font-semibold text-lg tracking-tight">Prepa Physique</span>
          </div>

          <div className="max-w-md">
            <h1 className="text-2xl font-semibold leading-snug tracking-tight">
              {t("login.heroTitle")}
            </h1>
            <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              {t("login.heroBody")}
            </p>

            <ul className="mt-6 space-y-2.5 text-sm" style={{ color: "var(--text-secondary)" }}>
              {points.map((item) => (
                <li key={item} className="flex gap-2.5">
                  <span
                    className="mt-1.5 size-1.5 rounded-full shrink-0"
                    style={{ background: "var(--accent)" }}
                    aria-hidden="true"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            {t("login.heroFooter")}
          </p>
        </section>

        <section className="flex flex-col items-center justify-center p-6">
          <div className="w-full max-w-sm">
            <div className="flex items-center justify-between gap-2 mb-8">
              <div className="lg:hidden flex items-center gap-2.5">
                <span
                  className="grid place-items-center size-9 rounded-lg"
                  style={{ background: "var(--accent)", color: "var(--accent-text)" }}
                >
                  <Activity size={19} strokeWidth={2.2} aria-hidden="true" />
                </span>
                <span className="font-semibold text-lg tracking-tight">Prepa Physique</span>
              </div>
              <div className="ml-auto">
                <LanguageSwitcher current={locale} />
              </div>
            </div>

            <h2 className="text-xl font-semibold tracking-tight">{t("login.title")}</h2>
            <p className="text-sm mt-1 mb-6" style={{ color: "var(--text-secondary)" }}>
              {t("login.subtitle")}
            </p>

            <LoginForm from={from} />

            {/* Un visiteur qui arrive ici depuis une publicite n'a pas encore
                de compte. Sans ce lien, il repart. */}
            <p
              className="text-sm mt-6 pt-6"
              style={{ borderTop: "1px solid var(--border-subtle)", color: "var(--text-secondary)" }}
            >
              {t("signup.noAccount")}{" "}
              <Link href="/inscription" className="cursor-pointer font-semibold hover:underline">
                {t("signup.cta")}
              </Link>
            </p>
          </div>
        </section>
      </main>
    </LocaleProvider>
  );
}
