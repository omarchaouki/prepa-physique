"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";

import {
  createTranslator,
  localeTag,
  type Locale,
  type MessageKey,
  type Translator,
} from "./dictionary";

interface LocaleContextValue {
  locale: Locale;
  t: Translator;
  tag: string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

/**
 * La langue est resolue une seule fois cote serveur et transmise ici, ce qui
 * evite que chaque composant client relise le cookie de son cote.
 */
export function LocaleProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  const value = useMemo(
    () => ({ locale, t: createTranslator(locale), tag: localeTag(locale) }),
    [locale],
  );
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

const useLocaleContext = (): LocaleContextValue => {
  const context = useContext(LocaleContext);
  // Repli sur le francais plutot qu'une exception : un composant isole hors du
  // fournisseur doit continuer a s'afficher.
  if (!context) return { locale: "fr", t: createTranslator("fr"), tag: localeTag("fr") };
  return context;
};

export const useT = (): Translator => useLocaleContext().t;

export const useLocale = (): Locale => useLocaleContext().locale;

export const useLocaleTag = (): string => useLocaleContext().tag;

/** Choisit la bonne variante d'un texte du catalogue scientifique. */
export const usePick = () => {
  const { locale } = useLocaleContext();
  return <T extends { fr: string; en: string }>(text: T): string =>
    locale === "en" ? text.en : text.fr;
};

export type { MessageKey };
