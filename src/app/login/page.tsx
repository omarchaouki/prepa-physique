import Link from "next/link";
import { redirect } from "next/navigation";
import { Gauge, ShieldAlert, BarChart3 } from "lucide-react";

import { getCurrentUser } from "@/lib/auth";
import { getLocale, getT } from "@/lib/i18n/server";
import { LocaleProvider } from "@/lib/i18n/client";
import { LanguageSwitcher } from "@/components/shell/language-switcher";
import { Wordmark } from "@/components/marketing/wordmark";
import { CONTACT } from "@/lib/marketing";
import { LoginForm } from "./login-form";

export const metadata = { title: "Connexion | Prepa Physique" };

/**
 * Ecran de connexion.
 *
 * ---------------------------------------------------------------------------
 * Ce que cet ecran doit faire, et ce qu'il ne doit pas faire
 * ---------------------------------------------------------------------------
 *
 * Il s'adresse a quelqu'un qui possede deja un compte. Il n'a donc rien a
 * vendre : deux champs, un bouton, et sortir de la le plus vite possible.
 *
 * La version precedente portait dans sa colonne de gauche un paragraphe de
 * trente cinq mots et quatre phrases techniques a puces rondes. C'etait de
 * l'argumentaire commercial pose devant un client deja convaincu, et cela
 * repoussait le formulaire dans une colonne etroite et grise.
 *
 * La colonne garde donc une image, le nom, un titre et trois groupes nominaux
 * porteurs d'un pictogramme. Elle sert a une chose : dire ou l'on est. Sur
 * telephone elle disparait entierement, l'ecran n'ayant plus la place que pour
 * ce qui compte.
 *
 * ---------------------------------------------------------------------------
 * Pourquoi les classes media
 * ---------------------------------------------------------------------------
 *
 * Le voile, les couleurs de texte sur photographie et le filet sont ceux de la
 * page d'atterrissage, definis une fois dans globals.css. Les reprendre ici
 * evite un second jeu de valeurs a maintenir, et surtout garantit que le
 * contraste du texte blanc sur l'image reste celui qui a ete mesure.
 */
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

  // Les pictogrammes viennent tous de lucide, meme graisse de trait, meme
  // taille : trois icones prises dans trois familles differentes se voient
  // immediatement, et donnent l'impression d'un assemblage.
  const points = [
    { icon: Gauge, label: t("login.pointSpeed") },
    { icon: ShieldAlert, label: t("login.pointRisk") },
    { icon: BarChart3, label: t("login.pointNorms") },
  ];

  return (
    <LocaleProvider locale={locale}>
      <main className="min-h-dvh grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        {/* Colonne de presentation, masquee sur telephone.

            Elle reste dans le document, donc son image y serait telechargee
            pour rien : un navigateur charge les images en `display: none`.
            C'est `loading="lazy"` qui l'en empeche, et c'est la sa vraie
            raison d'etre ici. Une image differee mais jamais visible n'est
            jamais demandee, donc le telephone ne paie pas les cent kilo octets
            d'une colonne qu'il ne verra pas. Sur ordinateur elle est dans le
            premier ecran, donc chargee aussitot. */}
        <section className="hidden lg:block">
          {/* `h-full` et non `absolute inset-0`.

              `.media-panel` est declaree hors couche dans globals.css : son
              `position: relative` gagne contre l'utilitaire `absolute` de
              Tailwind, qui vit dans la couche utilities. Le panneau restait
              donc en flux, sans hauteur, et l'image qu'il contient n'avait plus
              de boite ou se poser. C'est le piege decrit dans CLAUDE.md, et il
              ne se voit qu'au rendu. La hauteur passe donc par `h-full`, une
              propriete que `.media-panel` ne definit pas, et le coin carre par
              un style en ligne, qui l'emporte sur tout. */}
          <div
            className="media-panel h-full flex flex-col justify-between p-10"
            style={{ borderRadius: 0 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- image deja optimisee, voir components/marketing/shot.tsx */}
            <img
              src="/marketing/staff-1080.webp"
              srcSet="/marketing/staff-480.webp 480w, /marketing/staff-720.webp 720w, /marketing/staff-1080.webp 1080w"
              sizes="50vw"
              alt=""
              className="media-panel__image"
              loading="lazy"
              decoding="async"
            />
            <div className="media-panel__scrim" aria-hidden="true" />

            <div className="media-panel__body">
              <Wordmark name={CONTACT.brand} size="md" />
            </div>

            <div className="media-panel__body max-w-md">
              <h1 className="display-sm" style={{ fontSize: "clamp(1.5rem, 2.4vw, 2rem)" }}>
                {t("login.heroTitle")}
              </h1>

              <ul className="mt-8 space-y-4">
                {points.map(({ icon: Icon, label }) => (
                  <li key={label} className="flex items-center gap-3.5">
                    <span
                      className="grid place-items-center size-9 rounded-lg shrink-0"
                      style={{
                        background: "rgba(255, 255, 255, 0.12)",
                        color: "var(--media-accent)",
                      }}
                    >
                      <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
                    </span>
                    <span className="media-lead text-[0.9375rem]">{label}</span>
                  </li>
                ))}
              </ul>
            </div>

            <p className="media-panel__body media-note text-[0.75rem] max-w-md">
              {t("login.heroFooter")}
            </p>
          </div>
        </section>

        {/* Colonne du formulaire. */}
        <section className="flex flex-col p-6 sm:p-10">
          <div className="flex items-center justify-between gap-3">
            <span className="lg:hidden">
              <Wordmark name={CONTACT.brand} size="sm" />
            </span>
            <span className="ms-auto">
              <LanguageSwitcher current={locale} />
            </span>
          </div>

          {/* Le formulaire est centre verticalement dans ce qui reste, plutot
              que colle sous l'entete : sur un ecran d'ordinateur, deux champs
              accroches en haut d'une colonne de huit cents pixels laissent un
              vide qui se lit comme une page mal chargee. */}
          <div className="flex-1 grid place-items-center py-10">
            <div className="w-full max-w-sm">
              <h2
                className="display-sm"
                style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.25rem)" }}
              >
                {t("login.title")}
              </h2>
              <p
                className="text-[0.9375rem] mt-2 mb-8"
                style={{ color: "var(--text-secondary)" }}
              >
                {t("login.subtitle")}
              </p>

              <LoginForm from={from} />

              {/* Un visiteur qui arrive ici depuis une publicite n'a pas encore
                  de compte. Sans ce lien, il repart. */}
              <p
                className="text-[0.875rem] mt-8 pt-6"
                style={{
                  borderTop: "1px solid var(--border-subtle)",
                  color: "var(--text-secondary)",
                }}
              >
                {t("signup.noAccount")}{" "}
                <Link
                  href="/inscription"
                  className="cursor-pointer font-semibold hover:underline"
                  style={{ color: "var(--accent)" }}
                >
                  {t("signup.cta")}
                </Link>
              </p>
            </div>
          </div>
        </section>
      </main>
    </LocaleProvider>
  );
}
