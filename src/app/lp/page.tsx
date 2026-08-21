import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Check, Mail, MessageCircle, Star } from "lucide-react";

import { getCurrentUser } from "@/lib/auth";
import { PLAN_LIMITS } from "@/lib/constants";
import { getCurrency } from "@/lib/currency-server";
import { getMarketingLocale, getMarketingT } from "@/lib/i18n/server";
import { direction, type MarketingLocale } from "@/lib/i18n/marketing";
import {
  CONTACT,
  PRICING,
  PROOF,
  RESPONSE_HOURS,
  formatPrice,
  mailtoSales,
  whatsappDemo,
} from "@/lib/marketing";
import { TESTIMONIALS } from "@/lib/testimonials";
import { TEST_DEFINITIONS } from "@/lib/sports-science/catalog";
import { Wordmark } from "@/components/marketing/wordmark";
import { Shot } from "@/components/marketing/shot";
import { MarketingLocaleSwitcher } from "@/components/marketing/locale-switcher";
import { ThemeSwitch } from "@/components/shell/theme-toggle";
import { StickyCta } from "@/components/marketing/sticky-cta";
import { WhatsAppButton } from "@/components/marketing/whatsapp-button";
import { CurrencySwitcher } from "@/components/marketing/currency-switcher";
import { SignUpForm } from "@/components/marketing/signup/signup-form";
import { signupCopyFromMarketing } from "@/components/marketing/signup/build-copy";

/**
 * Page d'atterrissage publicitaire.
 *
 * ---------------------------------------------------------------------------
 * Pourquoi elle est distincte de la page d'accueil
 * ---------------------------------------------------------------------------
 *
 * La page d'accueil s'adresse a quelqu'un qui cherche : il a le temps, il
 * compare, il veut voir les tarifs et l'entreprise. Celle ci s'adresse a
 * quelqu'un qui ne cherchait rien, qui a clique sur une publicite dans un fil
 * d'actualite, et qui repartira dans quelques secondes s'il ne comprend pas ce
 * qu'on lui propose.
 *
 * Trois consequences :
 *
 * . Une seule action possible, l'inscription. Pas de navigation vers douze
 *   sections, pas de bouton de demonstration en concurrence avec le formulaire.
 * . Le formulaire est dans le premier ecran sur ordinateur, et a un pouce de
 *   defilement sur telephone. Renvoyer vers une autre page pour s'inscrire perd
 *   une part importante du trafic a chaque saut.
 * . Trois langues, l'arabe compris. La page d'accueil, elle, suit les deux
 *   langues de l'application.
 *
 * ---------------------------------------------------------------------------
 * Le rythme visuel
 * ---------------------------------------------------------------------------
 *
 * L'essentiel du trafic vient d'un fil d'actualite, donc d'un telephone tenu
 * d'une main. La page alterne volontairement bloc de texte court et image
 * pleine largeur : une image apres chaque idee donne un point de repos, et
 * c'est ce qui fait qu'on continue de faire defiler.
 *
 * Aucun paragraphe ne depasse deux phrases. Une page publicitaire n'est pas
 * lue, elle est parcourue : ce qui n'est pas saisi en trois secondes n'est pas
 * saisi du tout.
 *
 * ---------------------------------------------------------------------------
 * Ce que la page respecte de la charte du site
 * ---------------------------------------------------------------------------
 *
 * Aucune grille de cartes, aucun tiret dans la copie, aucun chiffre ecrit a la
 * main, aucune bibliotheque d'animation. La hierarchie passe par la taille, le
 * blanc et des filets. Voir CLAUDE.md.
 *
 * Les avis viennent de `src/lib/testimonials.ts`, ou chaque entree porte la
 * date de l'accord ecrit de publication. La section disparait d'elle meme si le
 * tableau est vide.
 */

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const [t, locale] = await Promise.all([getMarketingT(), getMarketingLocale()]);
  const title = `${t("hero.title")} ${t("hero.titleAccent")} . ${CONTACT.brand}`;
  const description = t("hero.body", { norms: PROOF.normRows });
  const ALT_PARTAGE = t("product.altOutil");

  return {
    title,
    description,
    // Une page d'atterrissage publicitaire n'a rien a faire dans un moteur de
    // recherche : elle ferait doublon avec la page d'accueil, qui est la page
    // que Google doit indexer. Le trafic vient d'ailleurs.
    robots: { index: false, follow: true },
    alternates: { canonical: "/" },
    openGraph: {
      title,
      description,
      // Carte de partage : JPEG en 1200 x 630, pas la photographie WebP du
      // site. Les robots de Facebook et de WhatsApp ne lisent pas tous le
      // WebP, et ils recadrent en 1,91 pour 1. Voir share_card() dans
      // scripts/generate-marketing-images.py.
      images: [
        {
          url: "/marketing/partage.jpg",
          width: 1200,
          height: 630,
          alt: ALT_PARTAGE,
        },
      ],
      type: "website",
      locale: locale === "en" ? "en_GB" : locale === "ar" ? "ar_MA" : "fr_FR",
      siteName: CONTACT.brand,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/marketing/partage.jpg"],
    },
  };
}

// ---------------------------------------------------------------------------
// Briques locales
// ---------------------------------------------------------------------------

/** Intitule de section : un mot en capitales, precede d'un trait qui se trace. */
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-3 mb-4">
      <span
        className="rule-draw block h-px w-8 shrink-0"
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

/** Titre de section. Une seule taille pour toute la page, pour un rythme stable. */
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      // `unveil` et non `reveal` : un titre de section merite le mouvement le
      // plus marque de la page, il annonce ce qui suit.
      className="unveil display-sm max-w-2xl"
      style={{ fontSize: "clamp(1.625rem, 6vw, 2.75rem)" }}
    >
      {children}
    </h2>
  );
}

/**
 * Puce de liste : un signe plutot qu'un caractere de police.
 *
 * La variante posee sur une photographie abandonne la pastille verte pleine :
 * sur un fond sombre elle ressort comme une tache lumineuse et attire l'oeil
 * avant le texte qu'elle est censee introduire.
 */
function Tick({ onMedia = false }: { onMedia?: boolean }) {
  if (onMedia) {
    return (
      <Check
        size={15}
        strokeWidth={2.6}
        className="shrink-0 mt-0.5"
        style={{ color: "var(--media-accent)" }}
        aria-hidden="true"
      />
    );
  }

  return (
    <span
      className="grid place-items-center size-[1.125rem] rounded-full shrink-0 mt-0.5"
      style={{ background: "var(--success-soft)", color: "var(--success)" }}
      aria-hidden="true"
    >
      <Check size={11} strokeWidth={3} />
    </span>
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

export default async function LandingPage() {
  const [user, locale, t, currency] = await Promise.all([
    getCurrentUser(),
    getMarketingLocale(),
    getMarketingT(),
    getCurrency(),
  ]);

  // Quelqu'un qui a deja un compte et qui reclique sur la publicite ne doit pas
  // tomber sur un formulaire d'inscription : il n'a rien a y faire, et il
  // repartirait en pensant que le service ne le reconnait pas.
  if (user) redirect(user.role === "OWNER" ? "/admin" : "/app");

  const dir = direction(locale);
  const free = PLAN_LIMITS.FREE;
  const priceLocale: "fr" | "en" = locale === "en" ? "en" : "fr";
  const starter = PRICING.STARTER.monthly[currency];

  const counts = {
    tests: PROOF.tests,
    norms: PROOF.normRows,
    players: free.maxPlayers,
    teams: free.maxTeams,
  };

  const proof = [
    { value: PROOF.tests, label: t("proof.tests") },
    { value: PROOF.batteries, label: t("proof.batteries") },
    { value: PROOF.normRows, label: t("proof.norms") },
    { value: PROOF.populations, label: t("proof.populations") },
  ];

  const afterPoints = [t("after.point1"), t("after.point2"), t("after.point3")];

  // Cinq points de douleur, plus courts qu'a l'origine : huit paragraphes se
  // lisaient comme un article, et personne ne lit un article sur une page de
  // publicite. Ecrits une fois dans le dictionnaire, listes ici par leur
  // numero.
  const pains = ([1, 2, 3, 4, 5] as const).map((index) => ({
    title: t(`pain${index}.title`),
    pain: t(`pain${index}.pain`),
    fix: t(`pain${index}.fix`, { tests: PROOF.tests, norms: PROOF.normRows }),
  }));

  const steps = ([1, 2, 3, 4] as const).map((index) => ({
    title: t(`how.step${index}Title`),
    body: t(`how.step${index}Body`),
  }));

  const faq = ([1, 2, 3, 4, 5, 6] as const).map((index) => ({
    q: t(`faq${index}.q`),
    a: t(`faq${index}.a`, { hours: RESPONSE_HOURS }),
  }));

  // Auteurs cites par le catalogue, dedupliques. C'est la preuve la plus solide
  // dont dispose la page : chaque nom se verifie dans une revue.
  //
  // Le decoupage retire les annees et les mentions de coauteurs. Sans le filtre
  // sur « al », la page afficherait fierement un chercheur nomme « al. » au
  // milieu de Samozino et Bangsbo.
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
  ).slice(0, 12);

  const navLinks = [
    { href: "#quotidien", label: t("nav.pains") },
    { href: "#parcours", label: t("nav.how") },
    { href: "#tarifs", label: t("nav.pricing") },
    { href: "#questions", label: t("nav.faq") },
  ];

  const legalLinks = [
    { href: "/legal/conditions", label: t("footer.terms") },
    { href: "/legal/confidentialite", label: t("footer.privacy") },
    { href: "/legal/remboursement", label: t("footer.refund") },
    { href: "/legal/mentions", label: t("footer.company") },
    { href: "/", label: t("footer.home") },
  ];

  const whatsapp = whatsappDemo(t("hero.cta"));

  /** Traduit une des trois langues d'un texte du module d'avis. */
  const say = (text: { fr: string; en: string; ar: string }): string => text[locale];

  return (
    <div lang={locale} dir={dir}>
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:start-2 focus:z-50 btn btn-primary"
      >
        {t("nav.skip")}
      </a>

      {/* ------------------------------------------------------------------ */}
      {/* Entete                                                              */}
      {/* ------------------------------------------------------------------ */}
      <header
        className="sticky top-0 z-40"
        style={{
          background: "color-mix(in srgb, var(--surface-page) 88%, transparent)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <div className="mx-auto max-w-6xl px-5 h-16 flex items-center gap-4">
          {/* La marque n'est pas un lien vers l'accueil : sur une page
              publicitaire, le seul chemin qui compte est celui qui descend vers
              le formulaire. Le site complet reste atteignable par le pied de
              page, pour qui veut vraiment sortir. */}
          <span className="shrink-0">
            <Wordmark name={CONTACT.brand} size="sm" />
          </span>

          <nav
            className="hidden lg:flex items-center gap-6 text-[0.875rem] ms-3"
            aria-label={t("nav.pains")}
          >
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="link-quiet cursor-pointer">
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2 ms-auto">
            <MarketingLocaleSwitcher current={locale} label={t("nav.language")} />
            {/* `ThemeSwitch` et non `ThemeToggle` : cette page a son propre
                dictionnaire et n'est pas enveloppee par LocaleProvider, donc
                un composant qui appellerait useT() y planterait. */}
            <ThemeSwitch
              compact
              labels={{
                group: t("nav.theme"),
                light: t("nav.themeLight"),
                dark: t("nav.themeDark"),
                system: t("nav.themeSystem"),
              }}
            />
            <span className="hidden sm:inline-flex">
              <Link href="/login" className="btn btn-secondary" style={{ minHeight: "2.75rem" }}>
                {t("nav.login")}
              </Link>
            </span>
          </div>
        </div>
      </header>

      <main id="contenu">
        {/* ---------------------------------------------------------------- */}
        {/* Hero et formulaire                                                */}
        {/* ---------------------------------------------------------------- */}
        {/* L'espace au dessus du titre est genereux et assume : colle sous une
            entete fixe, une typographie de cette taille etouffe et donne
            l'impression d'une page mal montee des la premiere seconde. */}
        <section className="mx-auto max-w-6xl px-5 pt-4 sm:pt-10 lg:pt-16 pb-14">
          <div className="grid lg:grid-cols-12 gap-y-12 gap-x-12 items-start">
            {/* La promesse, posee sur une photographie assombrie.

                Elle est dans un panneau et non en fond de section : la hauteur
                d'une section qui contiendrait aussi le formulaire varierait du
                simple au double entre un telephone et un ordinateur, et l'image
                y serait rognee jusqu'a ne plus montrer qu'une bande. Un panneau
                se cale sur son propre contenu, l'image le remplit toujours
                correctement. */}
            <div className="lg:col-span-6">
              <div className="media-panel">
                {/* Deux cadrages de la meme scene : debout pour les telephones,
                    paysage au dela. Servis par <picture>, donc un seul des deux
                    est telecharge.

                    Cette image est le plus gros element du premier ecran, donc
                    celle que mesure le navigateur pour l'affichage du contenu
                    principal. Elle est chargee sans attendre et en priorite
                    haute, contrairement a toutes les autres images de la page. */}
                <picture>
                  <source
                    media="(max-width: 639px)"
                    srcSet="/marketing/lp-hero-debout-480.webp 480w, /marketing/lp-hero-debout-720.webp 720w, /marketing/lp-hero-debout-1080.webp 1080w"
                    sizes="100vw"
                  />
                  <source
                    srcSet="/marketing/lp-hero-640.webp 640w, /marketing/lp-hero-960.webp 960w, /marketing/lp-hero-1440.webp 1440w"
                    sizes="(min-width: 1024px) 544px, calc(100vw - 2.5rem)"
                  />
                  {/* eslint-disable-next-line @next/next/no-img-element -- images deja optimisees, voir components/marketing/shot.tsx */}
                  <img
                    src="/marketing/lp-hero-960.webp"
                    alt={t("product.altTablette")}
                    className="media-panel__image"
                    loading="eager"
                    decoding="async"
                    fetchPriority="high"
                  />
                </picture>
                <div className="media-panel__scrim" aria-hidden="true" />

                <div className="media-panel__body px-5 py-10 sm:p-9 lg:p-10">
                  <p className="rise media-kicker text-[0.6875rem] font-semibold uppercase tracking-[0.16em] mb-5">
                    {t("hero.kicker")}
                  </p>

                  {/* L'interlignage est desserre par rapport a la classe
                      `display`, reglee pour des titres d'une ou deux lignes sur
                      ordinateur. Sur un telephone celui ci en fait quatre, et a
                      0,94 elles se touchent. Il est porte par `.lp-title` et non
                      par un style en ligne, pour que la version arabe puisse
                      l'ouvrir davantage. */}
                  <h1
                    className="display lp-title rise"
                    style={{
                      // Le plafond tient compte de la colonne, plus etroite que
                      // la page : au dela, « Vos tests physiques » passe a la
                      // ligne et le titre en occupe quatre au lieu de trois.
                      fontSize: "clamp(1.875rem, 7.5vw, 2.875rem)",
                      ["--d" as string]: "60ms",
                    }}
                  >
                    {t("hero.title")}
                    <br />
                    <span style={{ color: "var(--media-accent)" }}>{t("hero.titleAccent")}</span>
                  </h1>

                  <p
                    className="rise media-lead mt-6 text-[1.0625rem] leading-relaxed max-w-md"
                    style={{ ["--d" as string]: "140ms" }}
                  >
                    {t("hero.body", { norms: PROOF.normRows })}
                  </p>

                  {/* Sur telephone, ce bouton evite de faire defiler a l'aveugle
                      pour trouver le formulaire. Sur ordinateur il ne s'affiche
                      pas : le formulaire est deja a cote. */}
                  <div className="rise lg:hidden mt-8" style={{ ["--d" as string]: "200ms" }}>
                    <a href="#compte" className="btn btn-primary btn-lg w-full">
                      {t("hero.cta")}
                      <ArrowRight size={16} aria-hidden="true" className="rtl:rotate-180" />
                    </a>
                  </div>

                  <p
                    className="rise media-note text-[0.875rem] mt-4 lg:mt-8"
                    style={{ ["--d" as string]: "260ms" }}
                  >
                    {t("hero.reassurance", { players: free.maxPlayers })}
                  </p>

                  {/* Ce qui se passe apres l'envoi, dit avant l'envoi : c'est la
                      question qu'on se pose la main sur le clavier, et une
                      reponse donnee plus bas dans la page arrive trop tard. */}
                  <hr className="media-rule mt-8 mb-6" />
                  <ul className="rise space-y-3" style={{ ["--d" as string]: "320ms" }}>
                    {afterPoints.map((point) => (
                      <li key={point} className="flex items-start gap-2.5 text-[0.875rem]">
                        <Tick onMedia />
                        <span className="media-lead">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Le formulaire. Sur ordinateur il reste dans le premier ecran, ce
                qui est la seule regle vraiment non negociable d'une page
                d'atterrissage : ce qui n'est pas visible n'est pas rempli. */}
            <div className="lg:col-span-6" id="compte">
              <div
                className="form-comfortable p-5 sm:p-7"
                style={{
                  background: "var(--surface-panel)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-panel)",
                  boxShadow: "var(--shadow-panel)",
                }}
              >
                <h2 className="display-sm" style={{ fontSize: "clamp(1.375rem, 4vw, 1.75rem)" }}>
                  {t("signup.title")}
                </h2>
                <p
                  className="mt-2 mb-7 text-[0.9375rem] leading-relaxed"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {t("signup.subtitle")}
                </p>

                <SignUpForm
                  copy={signupCopyFromMarketing(t, locale, counts)}
                  // Le formulaire est pose sur un panneau, pas sur le fond de page.
                  surface="var(--surface-panel)"
                />

                <hr className="rule mt-7" />
                <p className="text-[0.8125rem] mt-4" style={{ color: "var(--text-secondary)" }}>
                  {t("signup.haveAccount")}{" "}
                  <Link href="/login" className="link-quiet cursor-pointer font-semibold">
                    {t("signup.signIn")}
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Chiffres comptes dans le catalogue, jamais ecrits a la main. */}
        <section className="mx-auto max-w-6xl px-5 pt-14 pb-16">
          <dl className="grid grid-cols-2 lg:grid-cols-4">
            {proof.map((item, index) => (
              // flex-col-reverse : le chiffre se lit au dessus de son intitule,
              // alors que l'ordre du document reste terme puis definition.
              <div
                key={item.label}
                className="reveal flex flex-col-reverse py-5 lg:px-7 lg:first:ps-0"
                style={{
                  borderInlineStart:
                    index % 2 === 1 ? "1px solid var(--border-subtle)" : undefined,
                  paddingInlineStart: index % 2 === 1 ? "1.25rem" : undefined,
                  ["--d" as string]: `${index * 70}ms`,
                }}
              >
                <dt className="text-[0.8125rem]" style={{ color: "var(--text-muted)" }}>
                  {item.label}
                </dt>
                <dd
                  className="display-sm tabular"
                  style={{ fontSize: "clamp(1.75rem, 5vw, 2.5rem)" }}
                >
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Le quotidien                                                      */}
        {/* ---------------------------------------------------------------- */}
        <section
          id="quotidien"
          className="anchor-offset py-16"
          style={{ background: "var(--surface-sunken)" }}
        >
          <div className="mx-auto max-w-6xl px-5">
            <Eyebrow>{t("pains.eyebrow")}</Eyebrow>
            <SectionTitle>{t("pains.title")}</SectionTitle>

            {/* Deux colonnes de texte separees par des filets, jamais huit
                cadres arrondis : c'est la difference entre une page ecrite et
                une page generee, et le lecteur vise fait la difference. */}
            <div className="grid md:grid-cols-2 gap-x-12 mt-10">
              {pains.map((item, index) => (
                <article
                  key={item.title}
                  className="reveal py-6"
                  style={{
                    borderTop: "1px solid var(--border-subtle)",
                    ["--d" as string]: `${(index % 2) * 80}ms`,
                  }}
                >
                  <h3 className="text-[1.0625rem] font-semibold leading-snug">{item.title}</h3>
                  <p
                    className="mt-2 text-[0.9375rem] leading-relaxed"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {item.pain}
                  </p>
                  <p className="flex items-start gap-2.5 mt-3 text-[0.9375rem] leading-relaxed">
                    <Tick />
                    <span>{item.fix}</span>
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Respiration                                                       */}
        {/* ---------------------------------------------------------------- */}
        {/* Une image apres chaque idee. Sur un telephone tenu d'une main,
            c'est ce point de repos qui fait qu'on continue de faire defiler,
            bien plus qu'un argument supplementaire. */}
        <section className="reveal mx-auto max-w-6xl px-5 py-14">
          <Shot
            base="lp-brief"
            widths={[640, 960]}
            sizes="(min-width: 1152px) 1088px, calc(100vw - 2.5rem)"
            alt={t("product.altBrief")}
            frame="aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/9]"
            objectPosition="center 32%"
          />
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Avis                                                              */}
        {/* ---------------------------------------------------------------- */}
        {TESTIMONIALS.length > 0 ? (
          <section className="py-16" style={{ background: "var(--surface-sunken)" }}>
            <div className="mx-auto max-w-6xl px-5">
              <Eyebrow>{t("reviews.eyebrow")}</Eyebrow>
              <SectionTitle>{t("reviews.title")}</SectionTitle>

              <div className="grid md:grid-cols-2 gap-x-12 mt-10">
                {TESTIMONIALS.map((review, index) => (
                  <figure
                    key={review.name}
                    className="reveal py-7"
                    style={{
                      borderTop: "1px solid var(--border-subtle)",
                      ["--d" as string]: `${(index % 2) * 80}ms`,
                    }}
                  >
                    <Stars rating={review.rating} />

                    {review.headline ? (
                      <p className="text-[1.0625rem] font-semibold leading-snug mt-3">
                        {say(review.headline)}
                      </p>
                    ) : null}

                    <blockquote
                      className="mt-2 text-[0.9375rem] leading-relaxed"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {say(review.quote)}
                    </blockquote>

                    <figcaption className="mt-4 text-[0.8125rem]">
                      <span className="font-semibold">{review.name}</span>
                      <span className="block mt-0.5" style={{ color: "var(--text-muted)" }}>
                        {review.club
                          ? `${say(review.role)} . ${review.club}`
                          : say(review.role)}
                      </span>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {/* ---------------------------------------------------------------- */}
        {/* Le parcours                                                       */}
        {/* ---------------------------------------------------------------- */}
        <section id="parcours" className="anchor-offset mx-auto max-w-6xl px-5 py-16">
          <Eyebrow>{t("how.eyebrow")}</Eyebrow>
          <SectionTitle>{t("how.title")}</SectionTitle>

          <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-x-8 mt-10">
            {steps.map((step, index) => (
              <li
                key={step.title}
                className="reveal py-6"
                style={{
                  borderTop: "2px solid var(--accent)",
                  ["--d" as string]: `${index * 90}ms`,
                }}
              >
                <p
                  className="tabular text-[0.75rem] font-semibold mb-3"
                  style={{ color: "var(--accent)" }}
                >
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="text-[1rem] font-semibold">{step.title}</h3>
                <p
                  className="mt-2 text-[0.9375rem] leading-relaxed"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {step.body}
                </p>
              </li>
            ))}
          </ol>

          <div className="mt-10">
            <a href="#compte" className="btn btn-primary btn-lg w-full sm:w-auto">
              {t("hero.cta")}
              <ArrowRight size={16} aria-hidden="true" className="rtl:rotate-180" />
            </a>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Respiration                                                       */}
        {/* ---------------------------------------------------------------- */}
        <section className="reveal mx-auto max-w-6xl px-5 pb-16">
          <Shot
            base="lp-joueurs"
            widths={[640, 960]}
            sizes="(min-width: 1152px) 1088px, calc(100vw - 2.5rem)"
            alt={t("product.altPlayers")}
            frame="aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/9]"
            objectPosition="center 38%"
          />
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* La methode                                                        */}
        {/* ---------------------------------------------------------------- */}
        <section className="mx-auto max-w-6xl px-5 pb-16">
          <div className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5">
              <Eyebrow>{t("science.eyebrow")}</Eyebrow>
              <SectionTitle>{t("science.title")}</SectionTitle>
            </div>
            <div className="lg:col-span-7">
              <p
                className="text-[1rem] leading-relaxed"
                style={{ color: "var(--text-secondary)" }}
              >
                {t("science.body")}
              </p>

              <p
                className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] mt-7 mb-3"
                style={{ color: "var(--text-muted)" }}
              >
                {t("science.authors")}
              </p>
              {/* Les noms restent en caracteres latins meme dans la version
                  arabe : ce sont des noms propres d'auteurs, et les
                  translitterer les rendrait introuvables dans une revue. */}
              <ul dir="ltr" className="flex flex-wrap gap-x-4 gap-y-1.5">
                {authors.map((author) => (
                  <li
                    key={author}
                    className="text-[0.875rem]"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {author}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Tarifs                                                            */}
        {/* ---------------------------------------------------------------- */}
        <section
          id="tarifs"
          className="anchor-offset py-16"
          style={{ background: "var(--surface-sunken)" }}
        >
          <div className="mx-auto max-w-6xl px-5">
            <Eyebrow>{t("pricing.eyebrow")}</Eyebrow>
            <SectionTitle>{t("pricing.title")}</SectionTitle>
            <p
              className="mt-4 max-w-xl text-[1rem] leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              {t("pricing.body", { players: free.maxPlayers })}
            </p>

            {/* Le choix de la devise est pose juste au dessus du montant, pas
                dans l'entete : c'est au moment de lire un prix qu'on se demande
                dans quelle monnaie il est, et une bascule situee ailleurs sur
                la page n'est jamais trouvee.

                Le dirham reste la devise de facturation et le premier bouton.
                L'euro et le dollar ne sont la que pour situer l'ordre de
                grandeur, ce que demande tout visiteur hors du Maroc avant de
                juger un tarif. */}
            <div className="mt-7">
              <CurrencySwitcher current={currency} locale={priceLocale} size="sm" />
            </div>

            {/* Deux lignes separees par un filet, pas deux cartes a comparer.
                Il n'y a rien a comparer ici : on annonce un point de depart
                gratuit et un ordre de grandeur au dela, pour que le visiteur se
                situe avant de creer un compte. */}
            <dl className="mt-9">
              <hr className="rule" />
              <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1 py-6">
                <dt
                  className="display-sm w-full sm:w-40 shrink-0"
                  style={{ fontSize: "1.5rem", color: "var(--accent)" }}
                >
                  {t("pricing.freeName")}
                </dt>
                <dd className="text-[0.9375rem]" style={{ color: "var(--text-secondary)" }}>
                  {t("pricing.freeLine", { players: free.maxPlayers, teams: free.maxTeams })}
                </dd>
              </div>
              <hr className="rule" />
              <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1 py-6">
                <dt className="display-sm w-full sm:w-40 shrink-0" style={{ fontSize: "1.5rem" }}>
                  {t("pricing.paidName")}
                </dt>
                <dd className="text-[0.9375rem]" style={{ color: "var(--text-secondary)" }}>
                  {starter === null
                    ? t("pricing.note")
                    : t("pricing.paidLine", {
                        price: formatPrice(starter, currency, priceLocale),
                      })}
                </dd>
              </div>
              <hr className="rule" />
            </dl>

            <p className="text-[0.8125rem] pt-4" style={{ color: "var(--text-muted)" }}>
              {t("pricing.note")}
            </p>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Questions                                                         */}
        {/* ---------------------------------------------------------------- */}
        <section id="questions" className="mx-auto max-w-3xl px-5 py-16 anchor-offset">
          <Eyebrow>{t("faq.eyebrow")}</Eyebrow>
          <SectionTitle>{t("faq.title")}</SectionTitle>

          {/* `details` natif : il fonctionne sans script, il est annonce
              correctement par les lecteurs d'ecran, et il ne coute pas une
              ligne de JavaScript sur un telephone d'entree de gamme. */}
          <div className="mt-9">
            {faq.map((item) => (
              <details
                key={item.q}
                className="reveal group py-4"
                style={{ borderTop: "1px solid var(--border-subtle)" }}
              >
                <summary
                  className="flex items-center justify-between gap-4 cursor-pointer list-none text-[1rem] font-semibold leading-snug"
                  style={{ minHeight: "2.75rem" }}
                >
                  {item.q}
                  <span
                    aria-hidden="true"
                    className="shrink-0 transition-transform duration-200 group-open:rotate-45"
                    style={{ color: "var(--accent)", fontSize: "1.375rem", lineHeight: 1 }}
                  >
                    +
                  </span>
                </summary>
                <p
                  className="mt-2 pb-2 text-[0.9375rem] leading-relaxed"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {item.a}
                </p>
              </details>
            ))}
            <hr className="rule" />
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Respiration avant l'appel final                                   */}
        {/* ---------------------------------------------------------------- */}
        {/* Quatre sections de texte s'enchainaient sans une seule image :
            science, tarifs, questions, puis l'appel. C'est le plus long
            passage de la page, et il tombe au moment ou le visiteur doit
            decider. Une bande large remet le produit sous les yeux juste avant
            qu'on le lui demande. */}
        <section className="mx-auto max-w-6xl px-5 pb-14">
          <Shot
            base="lp-outil"
            widths={[640, 960, 1440]}
            sizes="(min-width: 1024px) 1088px, calc(100vw - 2.5rem)"
            alt={t("product.altOutil")}
            frame="aspect-[16/10] sm:aspect-[21/9]"
            objectPosition="center 45%"
          />
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Appel final                                                       */}
        {/* ---------------------------------------------------------------- */}
        <section className="mx-auto max-w-6xl px-5 pb-16">
          <div
            className="reveal p-7 sm:p-12"
            style={{
              background: "var(--surface-panel)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-panel)",
            }}
          >
            <h2
              className="display-sm max-w-2xl"
              style={{ fontSize: "clamp(1.5rem, 5.5vw, 2.5rem)" }}
            >
              {t("final.title")}
            </h2>
            <p
              className="mt-4 max-w-lg text-[1rem] leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              {t("final.body")}
            </p>
            <div className="mt-7">
              <a href="#compte" className="btn btn-primary btn-lg w-full sm:w-auto">
                {t("hero.cta")}
                <ArrowRight size={16} aria-hidden="true" className="rtl:rotate-180" />
              </a>
              <p className="text-[0.875rem] mt-3" style={{ color: "var(--text-muted)" }}>
                {t("hero.reassurance", { players: free.maxPlayers })}
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* ------------------------------------------------------------------ */}
      {/* Pied de page                                                        */}
      {/* ------------------------------------------------------------------ */}
      <footer style={{ borderTop: "1px solid var(--border-subtle)" }}>
        {/* La marge basse degage la barre d'appel a l'action, qui recouvre
            sinon les derniers liens sur telephone. */}
        <div className="mx-auto max-w-6xl px-5 py-10 pb-28 lg:pb-10">
          <div className="grid sm:grid-cols-3 gap-8">
            <div>
              <Wordmark name={CONTACT.brand} size="sm" />
              <p
                className="text-[0.8125rem] leading-relaxed mt-3 max-w-xs"
                style={{ color: "var(--text-muted)" }}
              >
                {t("footer.tagline")}
              </p>
            </div>

            <nav aria-label={t("footer.legal")}>
              <p
                className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] mb-2"
                style={{ color: "var(--text-muted)" }}
              >
                {t("footer.legal")}
              </p>
              {/* `inline-flex` et non `block` : le trait du survol doit suivre
                  la largeur du mot, pas celle de la colonne. La hauteur porte la
                  cible tactile. */}
              <ul>
                {legalLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="link-quiet cursor-pointer text-[0.875rem] inline-flex items-center"
                      style={{ minHeight: "2.75rem" }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div>
              <p
                className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] mb-2"
                style={{ color: "var(--text-muted)" }}
              >
                {t("footer.contact")}
              </p>
              <ul>
                <li>
                  <a
                    href={mailtoSales(t("hero.cta"))}
                    dir="ltr"
                    style={{ minHeight: "2.75rem" }}
                    className="link-quiet cursor-pointer text-[0.875rem] inline-flex items-center gap-2"
                  >
                    <Mail size={14} aria-hidden="true" />
                    {CONTACT.sales}
                  </a>
                </li>
                {whatsapp ? (
                  <li>
                    <a
                      href={whatsapp}
                      style={{ minHeight: "2.75rem" }}
                      className="link-quiet cursor-pointer text-[0.875rem] inline-flex items-center gap-2"
                    >
                      <MessageCircle size={14} aria-hidden="true" />
                      WhatsApp
                    </a>
                  </li>
                ) : null}
              </ul>
            </div>
          </div>

          <hr className="rule my-7" />
          <p className="text-[0.75rem]" style={{ color: "var(--text-muted)" }}>
            © {new Date().getFullYear()} {CONTACT.brand}. {t("footer.rights")}
          </p>
        </div>
      </footer>

      <StickyCta targetId="compte" watchId="compte" label={t("hero.cta")} />

      {/* `raised` parce que la barre ci dessus occupe le bas de l'ecran sur
          telephone : sans cela le bouton se poserait par dessus l'inscription,
          qui est l'action principale de la page. */}
      <WhatsAppButton label={t("contact.whatsapp")} message={t("hero.cta")} raised />
    </div>
  );
}
