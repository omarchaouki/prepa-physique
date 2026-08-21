import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Mail, MessageCircle, Star } from "lucide-react";

import { getCurrentUser } from "@/lib/auth";
import { PLANS, PLAN_LIMITS } from "@/lib/constants";
import {
  COMPANY,
  CONTACT,
  PRICING,
  PROOF,
  RESPONSE_HOURS,
  formatPrice,
  mailtoSales,
  mailtoSupport,
  whatsappDemo,
} from "@/lib/marketing";
import { TESTIMONIALS } from "@/lib/testimonials";
import { CATEGORY_LABELS, TEST_DEFINITIONS } from "@/lib/sports-science/catalog";
import { LocaleProvider } from "@/lib/i18n/client";
import { getLocale, getT, pick } from "@/lib/i18n/server";
import type { Locale } from "@/lib/i18n/dictionary";
import { LanguageSwitcher } from "@/components/shell/language-switcher";
import { ThemeToggle } from "@/components/shell/theme-toggle";
import { Wordmark } from "@/components/marketing/wordmark";
import { WhatsAppButton } from "@/components/marketing/whatsapp-button";
import { Shot } from "@/components/marketing/shot";
import { CurrencySwitcher } from "@/components/marketing/currency-switcher";
import { getCurrency } from "@/lib/currency-server";

/**
 * Page publique.
 *
 * C'est la seule page adressee a quelqu'un qui ne connait pas le produit : elle
 * doit tenir seule, sans session, et rester lisible sur un telephone tenu d'une
 * main.
 *
 * Quatre partis pris qui expliquent la forme :
 *
 * 1. Aucune grille de cartes. Les cadres arrondis alignes quatre par quatre
 *    sont devenus la signature visuelle des pages ecrites par une machine, et
 *    un visiteur les reconnait avant meme d'avoir lu une ligne. La hierarchie
 *    passe ici par la taille du texte, le blanc et des filets fins.
 * 2. Aucune bibliotheque d'animation, aucun composant client hors du selecteur
 *    de langue. Le mouvement au defilement vient des animations natives du
 *    navigateur, decrites dans globals.css. Une page commerciale qui met deux
 *    secondes a s'afficher a deja perdu son visiteur.
 * 3. Les chiffres, les tests et les tarifs sont lus dans le catalogue, les
 *    plafonds de forfait et src/lib/marketing.ts, jamais recopies a la main.
 * 4. Tout ce que Stripe exige d'une page de vente est present et atteignable
 *    en un clic depuis le pied de page : identite, tarifs, conditions,
 *    remboursement, confidentialite, et un service client joignable.
 */

/** Remplace les marqueurs d'un texte du dictionnaire. */
const fill = (text: string, values: Record<string, string | number>): string =>
  Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{${key}}`, String(value)),
    text,
  );

export async function generateMetadata(): Promise<Metadata> {
  const [t, locale] = await Promise.all([getT(), getLocale()]);
  const title = `${CONTACT.brand} . ${t("home.heroLine1")} ${t("home.heroLine2")}`;

  return {
    title,
    description: t("home.heroBody"),
    alternates: { canonical: "/" },
    openGraph: {
      title,
      description: t("home.heroBody"),
      images: ["/marketing/touche-1280.webp"],
      type: "website",
      locale: locale === "en" ? "en_GB" : "fr_FR",
    },
  };
}

// ---------------------------------------------------------------------------
// Briques locales
// ---------------------------------------------------------------------------

/** Intitule de section : un mot en capitales, precede d'un trait qui se trace. */
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-3 mb-5">
      <span
        className="rule-draw block h-px w-10 shrink-0"
        style={{ background: "var(--accent)" }}
        aria-hidden="true"
      />
      <span
        className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em]"
        style={{ color: "var(--accent)" }}
      >
        {children}
      </span>
    </p>
  );
}

/** Note sur cinq. Les etoiles sont decoratives, la valeur est donnee au texte. */
function Stars({ rating }: { rating: number }) {
  return (
    <p className="flex items-center gap-0.5" aria-label={`${rating} / 5`}>
      {[1, 2, 3, 4, 5].map((index) => (
        <Star
          key={index}
          size={14}
          aria-hidden="true"
          style={{
            fill: index <= rating ? "var(--warning)" : "transparent",
            color: index <= rating ? "var(--warning)" : "var(--border-strong)",
          }}
        />
      ))}
    </p>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function HomePage() {
  const [user, locale, t, currency] = await Promise.all([
    getCurrentUser(),
    getLocale(),
    getT(),
    getCurrency(),
  ]);

  const brand = CONTACT.brand;
  const demoLink = mailtoSales(t("home.demoSubject"));
  const whatsappLink = whatsappDemo(t("home.demoSubject"));

  // Un visiteur deja connecte n'a pas a se reconnecter : le bouton l'emmene
  // directement la ou son role a du sens.
  const appLink = user ? (user.role === "OWNER" ? "/admin" : "/app") : "/login";

  const proof = [
    { value: PROOF.tests, label: t("home.proofTests") },
    { value: PROOF.batteries, label: t("home.proofBatteries") },
    { value: PROOF.normRows, label: t("home.proofNorms") },
    { value: PROOF.populations, label: t("home.proofPopulations") },
  ];

  // Auteurs cites par le catalogue, dedupliques. C'est la preuve la plus solide
  // dont dispose la page : chaque nom se verifie dans une revue.
  //
  // Le decoupage retire les annees et les mentions de coauteurs. Sans le filtre
  // sur "al", la page affichait fierement un chercheur nomme "al." au milieu de
  // Samozino et Bangsbo.
  const authors = Array.from(
    new Set(
      TEST_DEFINITIONS.flatMap((test) =>
        test.reference
          .split(/,| et | & | and /)
          .map((part) =>
            part
              .trim()
              .replace(/\s*\d{4}.*$/, "")
              .replace(/^et\s+/i, "")
              .trim(),
          )
          .filter((part) => part.length > 2 && !/^al\.?$/i.test(part) && !/^\d/.test(part)),
      ),
    ),
  ).slice(0, 16);

  const gaps = [t("home.gap1"), t("home.gap2"), t("home.gap3")];

  const steps = [
    { title: t("home.step1Title"), body: t("home.step1Body") },
    { title: t("home.step2Title"), body: t("home.step2Body") },
    { title: t("home.step3Title"), body: t("home.step3Body") },
    { title: t("home.step4Title"), body: t("home.step4Body") },
  ];

  const fieldPoints = [t("home.fieldPoint1"), t("home.fieldPoint2"), t("home.fieldPoint3")];

  const staffPoints = [
    t("home.staffPoint1"),
    t("home.staffPoint2"),
    t("home.staffPoint3"),
    t("home.staffPoint4"),
  ];

  const faq = [
    { q: t("home.faq1Q"), a: t("home.faq1A") },
    { q: t("home.faq2Q"), a: t("home.faq2A") },
    { q: t("home.faq3Q"), a: t("home.faq3A") },
    { q: t("home.faq4Q"), a: t("home.faq4A") },
    { q: t("home.faq5Q"), a: t("home.faq5A") },
    { q: t("home.faq6Q"), a: t("home.faq6A") },
  ];

  const navLinks = [
    { href: "#mesures", label: t("home.navFeatures") },
    { href: "#science", label: t("home.navScience") },
    { href: "#tarifs", label: t("home.navPlans") },
    { href: "#questions", label: t("home.navQuestions") },
  ];

  const legalLinks = [
    { href: "/legal/conditions", label: locale === "en" ? "Terms of service" : "Conditions generales" },
    { href: "/legal/confidentialite", label: locale === "en" ? "Privacy" : "Confidentialite" },
    { href: "/legal/remboursement", label: locale === "en" ? "Refunds" : "Remboursement" },
    { href: "/legal/mentions", label: locale === "en" ? "Company details" : "Mentions legales" },
  ];

  return (
    <LocaleProvider locale={locale}>
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 btn btn-primary"
      >
        {t("home.skipToContent")}
      </a>

      {/* ------------------------------------------------------------------ */}
      {/* Navigation                                                          */}
      {/* ------------------------------------------------------------------ */}
      <header
        className="sticky top-0 z-40"
        style={{
          background: "color-mix(in srgb, var(--surface-page) 88%, transparent)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <div className="mx-auto max-w-6xl px-5 h-16 flex items-center gap-5">
          <Link href="/" className="cursor-pointer shrink-0" aria-label={brand}>
            <Wordmark name={brand} size="sm" />
          </Link>

          <nav
            className="hidden md:flex items-center gap-6 text-[0.875rem] ml-3"
            aria-label={t("home.navFeatures")}
          >
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="link-quiet cursor-pointer">
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2 ml-auto">
            <LanguageSwitcher current={locale} />
            {/* Clair, sombre, ou celui de l'appareil. Le troisieme etat est le
                defaut : rien n'est ecrit et la page suit prefers-color-scheme. */}
            <ThemeToggle compact />
            {/* Lien de connexion : la barre de progression du haut de page part
                au clic, avant meme la reponse du serveur. */}
            <Link href={appLink} className="btn btn-secondary" style={{ minHeight: "2.75rem" }}>
              {user ? t("home.navOpenApp") : t("home.navLogin")}
            </Link>
            {/* Le masquage porte sur l'enveloppe, pas sur le lien.
                `.btn` est declare hors couche dans globals.css : il gagne donc
                contre l'utilitaire `hidden` de Tailwind, qui est dans la couche
                utilities, et le bouton resterait affiche sur telephone en
                debordant l'ecran de quatre vingt douze pixels. */}
            {/* L'inscription est l'action principale depuis qu'un palier
                gratuit existe : elle ne demande ni carte ni rendez vous. La
                demonstration reste accessible plus bas dans la page, pour les
                clubs qui veulent parler a quelqu'un avant. */}
            <span className="hidden sm:inline-flex">
              <Link href="/inscription" className="btn btn-primary" style={{ minHeight: "2.75rem" }}>
                {t("signup.ctaShort")}
              </Link>
            </span>
          </div>
        </div>
      </header>

      <main id="contenu">
        {/* ---------------------------------------------------------------- */}
        {/* Hero                                                              */}
        {/* ---------------------------------------------------------------- */}
        {/* L'air au dessus du titre reste genereux sur telephone, ou il separe
            la promesse de l'entete collante. Au dela, il est resserre : sur un
            ordinateur portable, cinq rem au dessus d'un titre de cette taille
            repoussaient la ligne d'accroche et le premier bouton sous la ligne
            de flottaison, ce qui est le seul defaut vraiment couteux d'un
            premier ecran. */}
        <section className="mx-auto max-w-6xl px-5 pt-12 sm:pt-14 lg:pt-16 pb-10">
          {/* Les deux colonnes s'etirent a la meme hauteur, et l'image epouse
              celle du texte.

              L'alignement precedent, `items-end`, calait les deux colonnes par
              le bas. Comme la photographie etait plus haute que le texte de
              cent trente deux pixels, ce vide se reportait entierement au
              dessus du surtitre : un trou en haut a gauche du premier ecran,
              exactement la ou le regard se pose en premier.

              En laissant l'etirement par defaut et en donnant a l'image la
              hauteur de sa colonne, il n'y a plus de vide a repartir. */}
          <div className="grid lg:grid-cols-12 gap-9 lg:gap-8">
            <div className="lg:col-span-7">
              <p
                className="rise text-[0.6875rem] font-semibold uppercase tracking-[0.16em] mb-6"
                style={{ color: "var(--accent)" }}
              >
                {t("home.heroKicker")}
              </p>

              <h1
                className="display rise"
                style={{ fontSize: "clamp(3rem, 11vw, 6.25rem)", ["--d" as string]: "60ms" }}
              >
                {t("home.heroLine1")}
                <br />
                <span style={{ color: "var(--accent)" }}>{t("home.heroLine2")}</span>
              </h1>

              <p
                className="rise mt-7 text-[1.0625rem] leading-relaxed max-w-lg"
                style={{ color: "var(--text-secondary)", ["--d" as string]: "140ms" }}
              >
                {t("home.heroBody")}
              </p>

              <div
                className="rise flex flex-wrap items-center gap-3 mt-8"
                style={{ ["--d" as string]: "220ms" }}
              >
                <Link href="/inscription" className="btn btn-primary btn-lg">
                  {t("signup.cta")}
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
                <a href={demoLink} className="btn btn-secondary btn-lg">
                  {t("home.navDemo")}
                </a>
              </div>

              <p
                className="rise text-[0.8125rem] mt-4"
                style={{ color: "var(--text-muted)", ["--d" as string]: "300ms" }}
              >
                {t("home.heroNote")}
              </p>
            </div>

            {/* La photographie passe apres le texte sur telephone : la promesse
                et le bouton doivent tenir dans le premier ecran. */}
            <div className="rise lg:col-span-5" style={{ ["--d" as string]: "180ms" }}>
              <Shot
                base="terrain"
                widths={[480, 720, 1080]}
                sizes="(min-width: 1024px) 420px, calc(100vw - 2.5rem)"
                alt={t("home.heroImageAlt")}
                // Sur telephone la photographie garde un rapport fixe, elle est
                // seule sur sa ligne. Au dela elle prend la hauteur de la
                // colonne de texte, et le recadrage se fait par `object-cover`.
                frame="aspect-[5/3] lg:aspect-auto lg:h-full lg:min-h-[26rem]"
                objectPosition="center 30%"
                priority
              />
            </div>
          </div>
        </section>

        {/* Chiffres : comptes dans le catalogue, jamais ecrits a la main.
            Une ligne de chiffres separes par des filets, pas quatre cadres. */}
        <section className="mx-auto max-w-6xl px-5 pb-14">
          <hr className="rule" />
          <dl className="grid grid-cols-2 lg:grid-cols-4">
            {proof.map((item, index) => (
              // flex-col-reverse : le chiffre se lit au dessus de son intitule,
              // alors que l'ordre du document reste terme puis definition.
              <div
                key={item.label}
                className="flex flex-col-reverse py-6 lg:px-7 lg:first:pl-0"
                style={{
                  borderLeft: index % 2 === 1 ? "1px solid var(--border-subtle)" : undefined,
                  paddingLeft: index % 2 === 1 ? "1.25rem" : undefined,
                }}
              >
                <dt
                  className="text-[0.8125rem] mt-1 leading-snug"
                  style={{ color: "var(--text-muted)" }}
                >
                  {item.label}
                </dt>
                <dd
                  className="display-sm tabular"
                  style={{ fontSize: "clamp(2rem, 5vw, 2.75rem)" }}
                >
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
          <hr className="rule" />

          {/* Les auteurs cites, en une ligne qui defile si l'ecran est etroit. */}
          <div className="scroll-x py-4">
            <p
              className="flex items-center gap-4 whitespace-nowrap text-[0.75rem]"
              style={{ color: "var(--text-muted)" }}
            >
              {authors.map((author) => (
                <span key={author} className="shrink-0">
                  {author}
                </span>
              ))}
            </p>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Le probleme                                                       */}
        {/* ---------------------------------------------------------------- */}
        <section
          className="py-16 sm:py-20"
          style={{
            background: "var(--surface-panel)",
            borderTop: "1px solid var(--border-subtle)",
          }}
        >
          <div className="mx-auto max-w-6xl px-5">
            <div className="reveal grid lg:grid-cols-12 gap-7 lg:gap-10">
              <div className="lg:col-span-5">
                <h2
                  className="display-sm"
                  style={{ fontSize: "clamp(1.75rem, 4.2vw, 2.5rem)" }}
                >
                  {t("home.gapTitle")}
                </h2>
              </div>
              <p
                className="lg:col-span-7 text-[1.0625rem] leading-relaxed lg:pt-1"
                style={{ color: "var(--text-secondary)" }}
              >
                {t("home.gapBody")}
              </p>
            </div>

            <ol className="cascade mt-12">
              {gaps.map((gap, index) => (
                <li key={gap}>
                  <hr className="rule" />
                  <div className="row-quiet flex items-baseline gap-5 sm:gap-8 py-6">
                    <span
                      className="display tabular shrink-0"
                      style={{ fontSize: "1.75rem", color: "var(--text-muted)" }}
                      aria-hidden="true"
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <p className="text-[1rem] sm:text-[1.0625rem] leading-relaxed max-w-3xl">
                      {gap}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
            <hr className="rule" />
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Methode                                                           */}
        {/* ---------------------------------------------------------------- */}
        <section className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
          <Eyebrow>{t("home.methodTitle")}</Eyebrow>

          {/* `cascade` : les quatre etapes entrent l'une apres l'autre, ce qui
              raconte leur ordre. Le decalage vit dans globals.css, plus dans un
              style en ligne indexe sur la boucle. */}
          <ol className="cascade grid sm:grid-cols-2 lg:grid-cols-4 gap-x-8">
            {steps.map((step, index) => (
              <li key={step.title} className="pt-5">
                <hr className="rule mb-5" />
                <span
                  className="display block tabular"
                  style={{ fontSize: "2.5rem", color: "var(--accent)", lineHeight: 1 }}
                  aria-hidden="true"
                >
                  {index + 1}
                </span>
                <h3 className="display-sm mt-4" style={{ fontSize: "1.0625rem" }}>
                  {step.title}
                </h3>
                <p
                  className="mt-2 mb-8 text-[0.9375rem] leading-relaxed"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Bande terrain                                                     */}
        {/* ---------------------------------------------------------------- */}
        <section className="mx-auto max-w-6xl px-5 pb-16 sm:pb-20">
          <div className="reveal">
            <Shot
              base="touche"
              widths={[800, 1280, 1920]}
              sizes="(min-width: 1152px) 1088px, calc(100vw - 2.5rem)"
              alt={t("home.fieldImageAlt")}
              frame="aspect-[3/2] sm:aspect-[2/1] lg:aspect-[64/25]"
            />
          </div>

          <div className="reveal grid lg:grid-cols-12 gap-7 lg:gap-10 mt-10">
            <div className="lg:col-span-5">
              <h2 className="unveil display-sm" style={{ fontSize: "clamp(1.625rem, 3.6vw, 2.125rem)" }}>
                {t("home.fieldTitle")}
              </h2>
              <p
                className="mt-4 text-[1rem] leading-relaxed"
                style={{ color: "var(--text-secondary)" }}
              >
                {t("home.fieldBody")}
              </p>
            </div>

            <ul className="lg:col-span-7 lg:pt-1">
              {fieldPoints.map((point) => (
                <li key={point}>
                  <hr className="rule" />
                  <p className="row-quiet py-4 text-[0.9375rem] leading-relaxed">{point}</p>
                </li>
              ))}
              <hr className="rule" />
            </ul>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Ce que ca mesure                                                  */}
        {/* ---------------------------------------------------------------- */}
        <section
          id="mesures"
          className="anchor-offset py-16 sm:py-20"
          style={{
            background: "var(--surface-panel)",
            borderTop: "1px solid var(--border-subtle)",
          }}
        >
          <div className="mx-auto max-w-6xl px-5">
            <div className="reveal max-w-2xl mb-10">
              <Eyebrow>{t("home.navFeatures")}</Eyebrow>
              <h2 className="unveil display-sm" style={{ fontSize: "clamp(1.75rem, 4.2vw, 2.5rem)" }}>
                {t("home.measureTitle")}
              </h2>
              <p
                className="mt-4 text-[1rem] leading-relaxed"
                style={{ color: "var(--text-secondary)" }}
              >
                {t("home.measureBody")}
              </p>
            </div>

            <div className="reveal grid md:grid-cols-2 gap-x-10">
              {TEST_DEFINITIONS.map((test) => (
                <div key={test.key}>
                  <hr className="rule" />
                  <div className="row-quiet sm:flex sm:items-baseline sm:justify-between gap-4 py-3">
                    <span className="block text-[0.9375rem] font-medium leading-snug">
                      {pick(test.name, locale)}
                    </span>
                    {/* La famille et la reference tiennent sur une seule ligne
                        sur telephone : vingt deux blocs de trois lignes
                        faisaient de cette section la plus longue de la page. */}
                    <span
                      className="block text-[0.75rem] mt-0.5 sm:mt-0 sm:text-right sm:shrink-0 sm:max-w-[12rem] leading-snug"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      <span style={{ color: "var(--text-muted)" }}>
                        {pick(CATEGORY_LABELS[test.category], locale)} .{" "}
                      </span>
                      {test.reference}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Staff                                                             */}
        {/* ---------------------------------------------------------------- */}
        <section className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
          <div className="reveal grid lg:grid-cols-12 gap-9 items-center">
            <div className="lg:col-span-5 order-2 lg:order-1">
              <Shot
                base="staff"
                widths={[480, 720, 1080]}
                sizes="(min-width: 1024px) 400px, calc(100vw - 2.5rem)"
                alt={t("home.staffImageAlt")}
                frame="aspect-[4/3] lg:aspect-[4/5]"
                objectPosition="center 35%"
              />
            </div>

            <div className="lg:col-span-7 order-1 lg:order-2">
              <h2 className="unveil display-sm" style={{ fontSize: "clamp(1.75rem, 4vw, 2.375rem)" }}>
                {t("home.staffTitle")}
              </h2>
              <p
                className="mt-4 text-[1.0625rem] leading-relaxed"
                style={{ color: "var(--text-secondary)" }}
              >
                {t("home.staffBody")}
              </p>

              <ul className="mt-7">
                {staffPoints.map((point) => (
                  <li key={point}>
                    <hr className="rule" />
                    <p className="row-quiet py-3.5 text-[0.9375rem]">{point}</p>
                  </li>
                ))}
                <hr className="rule" />
              </ul>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Science                                                           */}
        {/* ---------------------------------------------------------------- */}
        <section
          id="science"
          className="anchor-offset py-16 sm:py-20"
          style={{
            background: "var(--surface-panel)",
            borderTop: "1px solid var(--border-subtle)",
            borderBottom: "1px solid var(--border-subtle)",
          }}
        >
          <div className="mx-auto max-w-3xl px-5 text-center">
            <h2
              className="display reveal"
              style={{ fontSize: "clamp(2rem, 6vw, 3.5rem)" }}
            >
              {t("home.scienceTitle")}
            </h2>
            <p
              className="reveal mt-6 text-[1.0625rem] leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              {t("home.scienceBody")}
            </p>
            <p className="reveal text-[0.8125rem] mt-8" style={{ color: "var(--text-muted)" }}>
              {t("home.scienceNote")}
            </p>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Avis                                                              */}
        {/*                                                                   */}
        {/* La section n'existe que s'il y a de vrais avis, signes par leur    */}
        {/* auteur. Voir src/lib/testimonials.ts : afficher un temoignage      */}
        {/* invente ferait refuser le compte Stripe et tomberait sous la       */}
        {/* publicite trompeuse.                                              */}
        {/* ---------------------------------------------------------------- */}
        {TESTIMONIALS.length > 0 ? (
          <section className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
            <Eyebrow>{t("home.reviewsTitle")}</Eyebrow>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-10">
              {TESTIMONIALS.map((review) => (
                <figure key={review.name} className="reveal">
                  <hr className="rule" />
                  <div className="py-7">
                    <Stars rating={review.rating} />
                    <blockquote className="mt-4 text-[1.0625rem] leading-relaxed">
                      {pick(review.quote, locale)}
                    </blockquote>
                    <figcaption className="mt-5 text-[0.8125rem]">
                      <span className="font-semibold">{review.name}</span>
                      <span className="block mt-0.5" style={{ color: "var(--text-muted)" }}>
                        {/* Le club n'est nomme que si la personne a pu le faire
                            autoriser : sans ce test, un avis sans club affichait
                            un point suivi du vide. */}
                        {review.club
                          ? `${pick(review.role, locale)} . ${review.club}`
                          : pick(review.role, locale)}
                      </span>
                    </figcaption>
                  </div>
                </figure>
              ))}
            </div>
          </section>
        ) : null}

        {/* ---------------------------------------------------------------- */}
        {/* Tarifs                                                            */}
        {/* ---------------------------------------------------------------- */}
        <section id="tarifs" className="anchor-offset mx-auto max-w-6xl px-5 py-16 sm:py-20">
          <div className="reveal flex flex-wrap items-end justify-between gap-5 mb-10">
            <div className="max-w-2xl">
              <Eyebrow>{t("home.navPlans")}</Eyebrow>
              <h2 className="unveil display-sm" style={{ fontSize: "clamp(1.75rem, 4.2vw, 2.5rem)" }}>
                {t("home.plansTitle")}
              </h2>
              <p
                className="mt-4 text-[1rem] leading-relaxed"
                style={{ color: "var(--text-secondary)" }}
              >
                {t("home.plansSubtitle")}
              </p>
            </div>

            {/* Le choix de devise se tient a hauteur du titre des tarifs, pas
                dans un menu. Un visiteur marocain qui voit un prix en euro se
                demande d'abord si le produit lui est destine, et la reponse
                doit tenir dans le meme coup d'oeil que la question. */}
            <div className="shrink-0">
              <p
                className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] mb-1.5"
                style={{ color: "var(--text-muted)" }}
              >
                {t("home.plansCurrency")}
              </p>
              <CurrencySwitcher current={currency} locale={locale} />
            </div>
          </div>

          <div className="reveal">
            {PLANS.map((plan) => {
              const limits = PLAN_LIMITS[plan];
              const price = PRICING[plan];
              const amount = price.monthly[currency];
              const isFree = amount === 0;

              return (
                <div key={plan}>
                  <hr className="rule" />
                  <div
                    className="row-quiet grid sm:grid-cols-12 items-baseline gap-x-6 gap-y-2 py-7"
                    style={
                      price.highlight
                        ? { background: "var(--accent-soft)", paddingLeft: "1rem" }
                        : undefined
                    }
                  >
                    {/* Nom du forfait */}
                    <div className="sm:col-span-3">
                      <h3 className="display-sm" style={{ fontSize: "1.25rem" }}>
                        {limits.label[locale]}
                      </h3>
                      {price.highlight ? (
                        <p
                          className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] mt-1"
                          style={{ color: "var(--accent-soft-text)" }}
                        >
                          {t("home.plansPopular")}
                        </p>
                      ) : null}
                    </div>

                    {/* Plafonds */}
                    <p
                      className="sm:col-span-4 text-[0.9375rem]"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      <span className="tabular font-medium" style={{ color: "var(--text-primary)" }}>
                        {limits.maxTeams}
                      </span>{" "}
                      {limits.maxTeams > 1 ? t("home.plansTeams") : t("home.plansTeam")}
                      <span style={{ color: "var(--text-muted)" }} aria-hidden="true">
                        {" . "}
                      </span>
                      <span className="tabular font-medium" style={{ color: "var(--text-primary)" }}>
                        {limits.maxPlayers}
                      </span>{" "}
                      {limits.maxPlayers > 1 ? t("home.plansPlayers") : t("home.plansPlayer")}
                    </p>

                    {/* Prix */}
                    <p className="sm:col-span-3">
                      {amount === null ? (
                        <span className="display-sm" style={{ fontSize: "1.375rem" }}>
                          {t("home.plansQuote")}
                        </span>
                      ) : isFree ? (
                        <>
                          <span className="display-sm" style={{ fontSize: "1.75rem" }}>
                            {t("home.plansFree")}
                          </span>
                          <span
                            className="block text-[0.75rem] mt-0.5"
                            style={{ color: "var(--text-muted)" }}
                          >
                            {t("home.plansForever")}
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="display-sm tabular" style={{ fontSize: "1.75rem" }}>
                            {formatPrice(amount, currency, locale)}
                          </span>
                          <span
                            className="block text-[0.75rem] mt-0.5"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            {t("home.plansMonth")} . {t("home.plansVat")}
                          </span>
                        </>
                      )}
                    </p>

                    {/* Action */}
                    <p className="sm:col-span-2 sm:text-right">
                      {isFree ? (
                        <Link href="/inscription" className="btn btn-primary">
                          {t("home.plansStart")}
                        </Link>
                      ) : (
                        <a
                          href={demoLink}
                          className={price.highlight ? "btn btn-primary" : "btn btn-secondary"}
                        >
                          {t("home.plansChoose")}
                        </a>
                      )}
                    </p>
                  </div>
                </div>
              );
            })}
            <hr className="rule" />
          </div>

          <div className="reveal grid md:grid-cols-2 gap-x-10 gap-y-4 mt-8">
            <p className="text-[0.875rem] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              {fill(t("home.plansAllIncluded"), { count: PROOF.tests })}
            </p>
            <p className="text-[0.875rem] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
                {t("home.plansWhiteLabel")}.
              </span>{" "}
              {t("home.plansWhiteLabelBody")}
            </p>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Questions                                                         */}
        {/* ---------------------------------------------------------------- */}
        <section
          id="questions"
          className="anchor-offset py-16 sm:py-20"
          style={{
            background: "var(--surface-panel)",
            borderTop: "1px solid var(--border-subtle)",
          }}
        >
          <div className="mx-auto max-w-3xl px-5">
            <Eyebrow>{t("home.faqTitle")}</Eyebrow>

            <div className="reveal">
              {faq.map((item) => (
                <details key={item.q} className="group">
                  <hr className="rule" />
                  <summary className="flex items-start justify-between gap-4 cursor-pointer list-none py-5 text-[1rem] font-medium leading-snug">
                    <span>{item.q}</span>
                    <span
                      className="shrink-0 mt-1 text-[1.25rem] leading-none transition-transform duration-200 group-open:rotate-45"
                      style={{ color: "var(--text-muted)" }}
                      aria-hidden="true"
                    >
                      +
                    </span>
                  </summary>
                  <p
                    className="pb-6 pr-8 text-[0.9375rem] leading-relaxed"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {item.a}
                  </p>
                </details>
              ))}
              <hr className="rule" />
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Contact                                                           */}
        {/* ---------------------------------------------------------------- */}
        <section className="mx-auto max-w-6xl px-5 py-20 sm:py-24">
          {/* L'appel final etait la seule section de la page sans image, et
              c'est celle qui demande le plus : elle arrive apres trois mille
              mots, au moment ou il reste a decider. Une photographie du staff
              au bord du terrain remet en tete a quoi sert le produit, juste au
              dessus du bouton.

              Elle passe apres le texte dans le document, donc apres lui sur
              telephone : le titre et le bouton doivent rester en premier sur un
              petit ecran. */}
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            <div className="lg:col-span-7">
          <h2
            className="display reveal max-w-3xl"
            style={{ fontSize: "clamp(2.25rem, 7vw, 4.5rem)" }}
          >
            {t("home.finalTitle")}
          </h2>
          <p
            className="reveal mt-6 text-[1.0625rem] leading-relaxed max-w-xl"
            style={{ color: "var(--text-secondary)" }}
          >
            {fill(t("home.finalBody"), { hours: RESPONSE_HOURS })}
          </p>

          <div className="reveal flex flex-wrap items-center gap-3 mt-9">
            <Link href="/inscription" className="btn btn-primary btn-lg">
              {t("signup.cta")}
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <a href={demoLink} className="btn btn-secondary btn-lg">
              <Mail size={16} aria-hidden="true" />
              {t("home.navDemo")}
            </a>
            {/* Le bouton WhatsApp n'existe que si un numero est configure :
                mieux vaut aucun bouton qu'un bouton qui ne mene nulle part. */}
            {whatsappLink ? (
              <a
                href={whatsappLink}
                className="btn btn-secondary btn-lg"
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle size={16} aria-hidden="true" />
                {t("home.contactWhatsapp")}
              </a>
            ) : null}
          </div>

            </div>

            <div className="lg:col-span-5">
              <Shot
                base="batterie"
                widths={[640, 960]}
                sizes="(min-width: 1024px) 440px, calc(100vw - 2.5rem)"
                alt={t("home.finalImageAlt")}
                frame="aspect-[16/9] lg:aspect-[4/3]"
                objectPosition="center 35%"
              />
            </div>
          </div>

          {/* Deux adresses distinctes, exigees par Stripe : un visiteur doit
              pouvoir joindre le service client sans passer par la vente. */}
          <div className="reveal grid sm:grid-cols-2 gap-x-10 mt-12 max-w-2xl">
            {[
              { label: t("home.contactSalesLabel"), address: CONTACT.sales, href: mailtoSales(t("home.demoSubject")) },
              { label: t("home.contactSupportLabel"), address: CONTACT.support, href: mailtoSupport(brand) },
            ].map((item) => (
              <div key={item.address}>
                <hr className="rule" />
                <div className="py-5">
                  <p className="text-[0.75rem] uppercase tracking-[0.1em]" style={{ color: "var(--text-muted)" }}>
                    {item.label}
                  </p>
                  <a
                    href={item.href}
                    className="link-quiet inline-flex items-center gap-1.5 mt-2 text-[1.0625rem] font-medium cursor-pointer"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {item.address}
                    <ArrowUpRight size={15} aria-hidden="true" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* ------------------------------------------------------------------ */}
      {/* Pied de page                                                        */}
      {/* ------------------------------------------------------------------ */}
      <footer
        style={{
          background: "var(--surface-panel)",
          borderTop: "1px solid var(--border-subtle)",
        }}
      >
        <div className="mx-auto max-w-6xl px-5 py-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-2">
            <Wordmark name={brand} size="sm" />
            <p
              className="text-[0.8125rem] mt-3 max-w-xs leading-relaxed"
              style={{ color: "var(--text-muted)" }}
            >
              {t("home.footerTagline")}
            </p>
          </div>

          <nav aria-label={t("home.footerProduct")}>
            <p className="text-[0.75rem] uppercase tracking-[0.1em] mb-3" style={{ color: "var(--text-muted)" }}>
              {t("home.footerProduct")}
            </p>
            <ul className="space-y-2 text-[0.875rem]">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="link-quiet cursor-pointer">
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <Link href={appLink} className="link-quiet cursor-pointer">
                  {user ? t("home.navOpenApp") : t("home.navLogin")}
                </Link>
              </li>
              {user ? null : (
                <li>
                  <Link href="/inscription" className="link-quiet cursor-pointer">
                    {t("signup.ctaShort")}
                  </Link>
                </li>
              )}
            </ul>
          </nav>

          <nav aria-label={t("home.footerLegal")}>
            <p className="text-[0.75rem] uppercase tracking-[0.1em] mb-3" style={{ color: "var(--text-muted)" }}>
              {t("home.footerLegal")}
            </p>
            <ul className="space-y-2 text-[0.875rem]">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="link-quiet cursor-pointer">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Identite de l'entreprise. Stripe la verifie, et un visiteur a le
            droit de savoir a qui il donne son numero de carte. */}
        <div
          className="mx-auto max-w-6xl px-5 py-5 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-[0.75rem]"
          style={{ borderTop: "1px solid var(--border-subtle)", color: "var(--text-muted)" }}
        >
          <p>
            © {new Date().getFullYear()} {COMPANY.legalName ?? brand}. {t("home.footerRights")}
          </p>
          {/* Rien ne s'affiche tant que l'adresse n'est pas renseignee.

              Il y avait ici un rappel jaune demandant de completer le fichier
              .env du serveur. C'etait une note de chantier laissee sur la seule
              page que voit un inconnu : elle ne s'adressait pas au visiteur,
              elle lui apprenait seulement que le site n'est pas fini. Le rappel
              vit desormais dans .env.example et dans docs/HANDOFF.md, ou il
              s'adresse a qui peut agir. */}
          {COMPANY.address ? <p>{COMPANY.address}</p> : null}
        </div>
      </footer>

      {/* Pas de `raised` ici : la page d'accueil n'a pas de barre collee en bas,
          le bouton peut donc rester dans le coin. */}
      <WhatsAppButton label={t("home.contactWhatsapp")} message={t("home.demoSubject")} />
    </LocaleProvider>
  );
}
