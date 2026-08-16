"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Languages } from "lucide-react";

import { setLocaleAction } from "@/app/actions/auth";
import { LOCALES, type Locale } from "@/lib/i18n/dictionary";

/**
 * Bascule francais anglais.
 *
 * Le choix est ecrit dans un cookie et, si l'utilisateur est connecte, dans son
 * profil. Un rafraichissement du routeur suffit ensuite : toutes les pages sont
 * rendues cote serveur, elles reviennent donc traduites sans rechargement complet.
 */
export function LanguageSwitcher({ current }: { current: Locale }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const next: Locale = current === "fr" ? "en" : "fr";

  const switchTo = () => {
    startTransition(async () => {
      await setLocaleAction(next);
      router.refresh();
    });
  };

  return (
    <button
      type="button"
      onClick={switchTo}
      disabled={pending}
      className="inline-flex items-center gap-1 h-7 px-1.5 rounded-md cursor-pointer transition-colors disabled:opacity-50"
      style={{ color: "var(--text-muted)" }}
      aria-label={current === "fr" ? "Switch to English" : "Passer en francais"}
      title={current === "fr" ? "Switch to English" : "Passer en francais"}
    >
      <Languages size={15} aria-hidden="true" />
      <span className="text-[0.6875rem] font-semibold uppercase tracking-wide">{current}</span>
    </button>
  );
}

/** Version en boutons, pour la page des parametres. */
export function LanguageChoice({ current }: { current: Locale }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const choose = (locale: Locale) => {
    if (locale === current) return;
    startTransition(async () => {
      await setLocaleAction(locale);
      router.refresh();
    });
  };

  const labels: Record<Locale, string> = { fr: "Francais", en: "English" };

  return (
    <div
      className="inline-flex rounded-lg p-0.5 gap-0.5"
      style={{ background: "var(--surface-sunken)" }}
      role="group"
      aria-label="Language"
    >
      {LOCALES.map((locale) => {
        const active = locale === current;
        return (
          <button
            key={locale}
            type="button"
            onClick={() => choose(locale)}
            disabled={pending}
            aria-pressed={active}
            className="px-3 h-9 rounded-md text-sm cursor-pointer transition-colors disabled:opacity-50"
            style={{
              background: active ? "var(--surface-panel)" : "transparent",
              color: active ? "var(--text-primary)" : "var(--text-muted)",
              fontWeight: active ? 600 : 400,
              boxShadow: active ? "var(--shadow-panel)" : "none",
            }}
          >
            {labels[locale]}
          </button>
        );
      })}
    </div>
  );
}
