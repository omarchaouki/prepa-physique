import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { CONTACT } from "@/lib/marketing";
import { LocaleProvider } from "@/lib/i18n/client";
import type { Locale } from "@/lib/i18n/dictionary";
import { LanguageSwitcher } from "@/components/shell/language-switcher";
import { Wordmark } from "@/components/marketing/wordmark";

/**
 * Gabarit commun aux pages legales.
 *
 * Ces pages existent pour deux raisons qui vont dans le meme sens : la loi les
 * impose, et Stripe refuse d'ouvrir un compte a un site qui ne les publie pas.
 * Elles sont donc traitees comme du contenu de premiere classe, pas comme un
 * pied de page : meme navigation, meme selecteur de langue, meme soin.
 *
 * Le contenu est fourni dans les deux langues par la page appelante. Il n'est
 * volontairement pas range dans le dictionnaire de l'interface : un paragraphe
 * de conditions generales se relit en entier, dans son ordre, pas cle par cle
 * au milieu de six cents libelles de boutons.
 */

export interface LegalSection {
  heading: { fr: string; en: string };
  /** Paragraphes. Une chaine vide est ignoree. */
  paragraphs?: Array<{ fr: string; en: string }>;
  /** Liste a puces, facultative, affichee apres les paragraphes. */
  bullets?: Array<{ fr: string; en: string }>;
}

export function LegalPage({
  locale,
  title,
  updatedOn,
  intro,
  sections,
}: {
  locale: Locale;
  title: { fr: string; en: string };
  /** Date de derniere mise a jour, format AAAA-MM-JJ. */
  updatedOn: string;
  intro?: { fr: string; en: string };
  sections: LegalSection[];
}) {
  const pick = (text: { fr: string; en: string }) => (locale === "en" ? text.en : text.fr);

  const updatedLabel = new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${updatedOn}T00:00:00Z`));

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
        <div className="mx-auto max-w-3xl px-5 h-16 flex items-center gap-4">
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

      <main className="mx-auto max-w-3xl px-5 py-14">
        <h1 className="display-sm" style={{ fontSize: "clamp(1.875rem, 5vw, 2.75rem)" }}>
          {pick(title)}
        </h1>
        <p className="text-[0.8125rem] mt-3" style={{ color: "var(--text-muted)" }}>
          {locale === "en" ? "Last updated " : "Derniere mise a jour le "}
          {updatedLabel}
        </p>

        {intro ? (
          <p
            className="mt-7 text-[1.0625rem] leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            {pick(intro)}
          </p>
        ) : null}

        <div className="mt-10">
          {sections.map((section, index) => (
            <section key={section.heading.fr}>
              <hr className="rule" />
              <div className="py-7">
                <h2 className="display-sm flex items-baseline gap-3" style={{ fontSize: "1.125rem" }}>
                  <span className="tabular shrink-0" style={{ color: "var(--text-muted)" }}>
                    {index + 1}.
                  </span>
                  {pick(section.heading)}
                </h2>

                {section.paragraphs?.map((paragraph) => (
                  <p
                    key={paragraph.fr}
                    className="mt-3 text-[0.9375rem] leading-relaxed"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {pick(paragraph)}
                  </p>
                ))}

                {section.bullets ? (
                  <ul className="mt-3 space-y-1.5">
                    {section.bullets.map((bullet) => (
                      <li
                        key={bullet.fr}
                        className="flex gap-2.5 text-[0.9375rem] leading-relaxed"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        <span
                          className="mt-2 size-1 rounded-full shrink-0"
                          style={{ background: "var(--text-muted)" }}
                          aria-hidden="true"
                        />
                        {pick(bullet)}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </section>
          ))}
          <hr className="rule" />
        </div>

        <p className="mt-10 text-[0.9375rem] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          {locale === "en" ? "Questions about this page: " : "Une question sur cette page : "}
          <a href={`mailto:${CONTACT.support}`} className="link-quiet cursor-pointer font-medium">
            {CONTACT.support}
          </a>
        </p>
      </main>
    </LocaleProvider>
  );
}
