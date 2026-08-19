import Link from "next/link";
import { ArrowRight, Check, ClipboardList, Lock, UserPlus, UsersRound } from "lucide-react";

import type { Translator } from "@/lib/i18n/dictionary";

/**
 * Guide de prise en main, affiche a un compte qui n'a encore rien.
 *
 * ---------------------------------------------------------------------------
 * Pourquoi ce composant existe
 * ---------------------------------------------------------------------------
 *
 * Un preparateur qui vient de s'inscrire arrive sur un tableau de bord vide.
 * Il voit des menus, des compteurs a zero, et aucune indication de ce qu'il
 * doit faire en premier. Rien ne lui dit qu'un joueur ne peut exister sans
 * equipe, ni qu'une passation ne sert a rien sans joueurs : il decouvre ces
 * regles en butant dessus, une par une.
 *
 * Les trois etapes sont dans l'ordre ou elles doivent etre faites, et une
 * etape verrouillee dit pourquoi elle l'est plutot que d'etre simplement
 * grisee. « Creez d'abord une equipe » repond a la question, « indisponible »
 * ne repond a rien.
 *
 * Le guide disparait de lui meme des que les trois etapes sont franchies : un
 * bandeau d'accueil qui reste apres la prise en main devient un meuble.
 */

export interface OnboardingState {
  teams: number;
  players: number;
  sessions: number;
  /** Faux pour un role en lecture seule, qui ne peut rien creer. */
  canCreate: boolean;
}

export function shouldShowOnboarding(state: OnboardingState): boolean {
  return state.canCreate && (state.teams === 0 || state.players === 0 || state.sessions === 0);
}

export function Onboarding({
  state,
  t,
  firstTeamId,
}: {
  state: OnboardingState;
  t: Translator;
  /** Cible des raccourcis, quand une equipe existe deja. */
  firstTeamId: string | null;
}) {
  if (!shouldShowOnboarding(state)) return null;

  const steps = [
    {
      key: "team",
      icon: <UsersRound size={17} />,
      title: t("onboarding.step1"),
      body: t("onboarding.step1Body"),
      cta: t("onboarding.step1Cta"),
      href: "/app/teams",
      done: state.teams > 0,
      locked: null as string | null,
    },
    {
      key: "players",
      icon: <UserPlus size={17} />,
      title: t("onboarding.step2"),
      body: t("onboarding.step2Body"),
      cta: t("onboarding.step2Cta"),
      href: firstTeamId ? `/app/teams/${firstTeamId}/manage` : "/app/players",
      done: state.players > 0,
      locked: state.teams === 0 ? t("onboarding.step2Locked") : null,
    },
    {
      key: "session",
      icon: <ClipboardList size={17} />,
      title: t("onboarding.step3"),
      body: t("onboarding.step3Body"),
      cta: t("onboarding.step3Cta"),
      href: "/app/sessions/new",
      done: state.sessions > 0,
      locked: state.players === 0 ? t("onboarding.step3Locked") : null,
    },
  ];

  const done = steps.filter((step) => step.done).length;

  return (
    <section
      className="panel p-5 mb-5"
      style={{ borderColor: "var(--accent)", background: "var(--accent-soft)" }}
      aria-labelledby="onboarding-title"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
        <div>
          <h2 id="onboarding-title" className="font-semibold text-lg tracking-tight">
            {t("onboarding.title")}
          </h2>
          <p className="text-[0.875rem] mt-0.5" style={{ color: "var(--accent-soft-text)" }}>
            {t("onboarding.subtitle")}
          </p>
        </div>
        <p
          className="text-[0.8125rem] font-semibold tabular"
          style={{ color: "var(--accent-soft-text)" }}
        >
          {t("onboarding.progress")
            .replace("{done}", String(done))
            .replace("{total}", String(steps.length))}
        </p>
      </div>

      <ol className="grid md:grid-cols-3 gap-3">
        {steps.map((step, index) => (
          <li
            key={step.key}
            className="p-3.5 flex flex-col"
            style={{
              background: "var(--surface-panel)",
              borderRadius: "var(--radius-panel)",
              // L'etape faite s'efface un peu : le regard doit tomber sur ce
              // qui reste a faire, pas sur ce qui est acquis.
              opacity: step.done ? 0.72 : 1,
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span
                className="grid place-items-center size-7 rounded-full shrink-0 text-[0.75rem] font-semibold tabular"
                style={{
                  background: step.done ? "var(--success-soft)" : "var(--accent)",
                  color: step.done ? "var(--success)" : "var(--accent-text)",
                }}
                aria-hidden="true"
              >
                {step.done ? <Check size={13} strokeWidth={3} /> : index + 1}
              </span>
              <h3 className="font-semibold text-[0.9375rem] leading-snug">{step.title}</h3>
            </div>

            <p
              className="text-[0.8125rem] leading-relaxed mb-3 flex-1"
              style={{ color: "var(--text-secondary)" }}
            >
              {step.body}
            </p>

            {step.done ? (
              <p
                className="inline-flex items-center gap-1.5 text-[0.8125rem] font-medium"
                style={{ color: "var(--success)" }}
              >
                <Check size={14} aria-hidden="true" />
                {t("onboarding.done")}
              </p>
            ) : step.locked ? (
              // Verrouillee, mais on dit pourquoi. Un bouton grise sans
              // explication laisse l'utilisateur cliquer trois fois avant
              // d'abandonner.
              <p
                className="inline-flex items-start gap-1.5 text-[0.8125rem]"
                style={{ color: "var(--text-muted)" }}
              >
                <Lock size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
                {step.locked}
              </p>
            ) : (
              <Link href={step.href} className="btn btn-primary" style={{ alignSelf: "flex-start" }}>
                {step.icon}
                {step.cta}
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
