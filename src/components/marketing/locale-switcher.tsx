"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { setMarketingLocaleAction } from "@/app/actions/marketing";
import {
  MARKETING_LOCALES,
  MARKETING_LOCALE_LABELS,
  MARKETING_LOCALE_SHORT,
  type MarketingLocale,
} from "@/lib/i18n/marketing";

/**
 * Choix entre les trois langues de la page publicitaire.
 *
 * Un groupe de trois boutons, et non un menu deroulant. La langue est le
 * premier obstacle pour un visiteur arabophone qui arrive depuis une
 * publicite : elle doit se changer d'un geste, sans ouvrir quoi que ce soit,
 * et se voir depuis le premier ecran.
 *
 * L'etiquette de chaque langue est ecrite dans cette langue. « Arabic » ne veut
 * rien dire pour quelqu'un qui ne lit pas l'anglais, alors que « العربية » se
 * reconnait sans etre lu.
 */
export function MarketingLocaleSwitcher({
  current,
  label,
}: {
  current: MarketingLocale;
  label: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const choose = (locale: MarketingLocale) => {
    if (locale === current) return;
    startTransition(async () => {
      await setMarketingLocaleAction(locale);
      router.refresh();
    });
  };

  return (
    <div
      className="inline-flex rounded-lg p-0.5 gap-0.5"
      style={{ background: "var(--surface-sunken)" }}
      role="group"
      aria-label={label}
    >
      {MARKETING_LOCALES.map((locale) => {
        const active = locale === current;
        return (
          <button
            key={locale}
            type="button"
            onClick={() => choose(locale)}
            disabled={pending}
            aria-pressed={active}
            // Le libelle complet part a la voix, l'abrege reste a l'ecran :
            // trois noms de langues entiers ne tiennent pas dans une entete de
            // telephone.
            aria-label={MARKETING_LOCALE_LABELS[locale]}
            className="grid place-items-center rounded-md cursor-pointer transition-colors disabled:opacity-50"
            style={{
              minWidth: "2.75rem",
              height: "2.75rem",
              background: active ? "var(--surface-panel)" : "transparent",
              color: active ? "var(--text-primary)" : "var(--text-muted)",
              fontWeight: active ? 700 : 500,
              fontSize: "0.8125rem",
              boxShadow: active ? "var(--shadow-panel)" : "none",
            }}
          >
            <span aria-hidden="true">{MARKETING_LOCALE_SHORT[locale]}</span>
          </button>
        );
      })}
    </div>
  );
}
