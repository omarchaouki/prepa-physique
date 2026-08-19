"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { setCurrencyAction } from "@/app/actions/auth";
import { CURRENCIES, CURRENCY_LABELS, type Currency } from "@/lib/marketing";
import type { Locale } from "@/lib/i18n/dictionary";

/**
 * Bascule dirham euro, posee a cote des tarifs.
 *
 * Elle est volontairement montree comme un choix, deux boutons cote a cote,
 * plutot que cachee derriere un menu deroulant. Un visiteur marocain qui voit
 * un prix en euro se demande d'abord si le produit lui est destine, et la
 * reponse doit tenir dans le meme coup d'oeil que la question.
 *
 * Le choix part dans un cookie, donc il survit a la navigation et au retour sur
 * le site. Un rafraichissement du routeur suffit ensuite : la page est rendue
 * cote serveur, elle revient avec les bons montants sans rechargement complet.
 */
export function CurrencySwitcher({
  current,
  locale,
  size = "md",
}: {
  current: Currency;
  locale: Locale;
  size?: "sm" | "md";
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const choose = (currency: Currency) => {
    if (currency === current) return;
    startTransition(async () => {
      await setCurrencyAction(currency);
      router.refresh();
    });
  };

  const height = size === "sm" ? "1.75rem" : "2.25rem";
  const font = size === "sm" ? "0.75rem" : "0.8125rem";

  return (
    <div
      className="inline-flex rounded-lg p-0.5 gap-0.5"
      style={{ background: "var(--surface-sunken)" }}
      role="group"
      aria-label={locale === "en" ? "Currency" : "Devise"}
    >
      {CURRENCIES.map((currency) => {
        const active = currency === current;
        return (
          <button
            key={currency}
            type="button"
            onClick={() => choose(currency)}
            disabled={pending}
            aria-pressed={active}
            // Le nom complet est donne a la voix, le sigle suffit a l'oeil.
            aria-label={CURRENCY_LABELS[currency].name[locale]}
            className="px-3 rounded-md cursor-pointer transition-colors disabled:opacity-50"
            style={{
              height,
              fontSize: font,
              background: active ? "var(--surface-panel)" : "transparent",
              color: active ? "var(--text-primary)" : "var(--text-muted)",
              fontWeight: active ? 700 : 500,
              boxShadow: active ? "var(--shadow-panel)" : "none",
            }}
          >
            {CURRENCY_LABELS[currency].code}
          </button>
        );
      })}
    </div>
  );
}
