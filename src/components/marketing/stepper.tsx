"use client";

import { Check } from "lucide-react";

/**
 * Indicateur d'etapes.
 *
 * Il repond a la question que se pose quelqu'un devant un formulaire decoupe :
 * combien de temps ca va me prendre. Sans reponse, une premiere page courte est
 * lue comme le debut d'un tunnel sans fin, et beaucoup abandonnent la.
 *
 * Trois details qui comptent :
 *
 * . Les etapes deja franchies sont cliquables, les suivantes ne le sont pas. On
 *   peut revenir corriger sans perdre sa saisie, mais pas sauter une etape dont
 *   les champs sont obligatoires.
 * . La position est annoncee a la voix par un texte discret, parce qu'une suite
 *   de ronds numerotes ne veut rien dire pour un lecteur d'ecran.
 * . Le trait de progression se remplit par une transformation, jamais par un
 *   changement de largeur : cela evite un recalcul de mise en page a chaque
 *   image de l'animation.
 *
 * `surface` n'est pas un detail cosmetique. Chaque etape peint un rectangle
 * derriere son rond pour interrompre le rail, qui traverse sinon la rangee de
 * part en part et depasse a gauche du premier rond comme a droite du dernier.
 * Ce rectangle doit porter exactement la couleur du fond sur lequel
 * l'indicateur est pose, sinon il se voit. C'est ce qui arrivait sur la page
 * d'atterrissage : le formulaire y est sur un panneau blanc, l'indicateur
 * peignait le gris de la page, et chaque etape trainait sa plaque grise.
 */
export function Stepper({
  steps,
  current,
  onGoTo,
  positionLabel,
  surface = "var(--surface-page)",
}: {
  steps: string[];
  /** Index de l'etape en cours, a partir de zero. */
  current: number;
  onGoTo?: (index: number) => void;
  /** Gabarit du type « Etape {current} sur {total} », pour la voix. */
  positionLabel: string;
  /**
   * Fond sur lequel l'indicateur est pose, pour l'interruption du rail.
   *
   * Par defaut celui de la page, qui vaut pour /inscription. La page
   * d'atterrissage pose son formulaire sur un panneau et doit passer
   * `var(--surface-panel)`.
   */
  surface?: string;
}) {
  const progress = steps.length > 1 ? current / (steps.length - 1) : 1;

  return (
    <nav aria-label={positionLabel} className="mb-8">
      <p className="sr-only" aria-live="polite">
        {positionLabel
          .replace("{current}", String(current + 1))
          .replace("{total}", String(steps.length))}
      </p>

      <ol className="relative flex items-start justify-between">
        {/* Rail, puis progression par dessus. Les deux sont decoratifs. */}
        <span
          aria-hidden="true"
          className="absolute left-0 right-0"
          style={{
            top: "1.125rem",
            height: 2,
            background: "var(--border-subtle)",
          }}
        />
        <span
          aria-hidden="true"
          className="absolute left-0 right-0 stepper-fill"
          style={{
            top: "1.125rem",
            height: 2,
            background: "var(--accent)",
            transform: `scaleX(${progress})`,
            transition: "transform 320ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        />

        {steps.map((step, index) => {
          const done = index < current;
          const active = index === current;
          const reachable = index < current && Boolean(onGoTo);

          const circle = (
            <>
              <span
                className="grid place-items-center rounded-full shrink-0 tabular"
                style={{
                  width: "2.25rem",
                  height: "2.25rem",
                  fontSize: "0.875rem",
                  fontWeight: 700,
                  background: done || active ? "var(--accent)" : surface,
                  color: done || active ? "var(--accent-text)" : "var(--text-muted)",
                  border: `2px solid ${done || active ? "var(--accent)" : "var(--border-strong)"}`,
                  transition: "background-color 220ms ease-out, border-color 220ms ease-out",
                }}
              >
                {done ? <Check size={16} strokeWidth={3} aria-hidden="true" /> : index + 1}
              </span>
              <span
                className="block text-[0.75rem] mt-2 text-center leading-tight"
                style={{
                  color: active ? "var(--text-primary)" : "var(--text-muted)",
                  fontWeight: active ? 600 : 400,
                  maxWidth: "7rem",
                }}
              >
                {step}
              </span>
            </>
          );

          return (
            <li
              key={step}
              className="relative flex flex-col items-center"
              style={{ background: surface, padding: "0 0.5rem" }}
              aria-current={active ? "step" : undefined}
            >
              {reachable ? (
                <button
                  type="button"
                  onClick={() => onGoTo?.(index)}
                  className="flex flex-col items-center cursor-pointer"
                  // La cible tactile depasse le rond, qui fait 36 px.
                  style={{ minHeight: "3.5rem", minWidth: "3rem" }}
                >
                  {circle}
                </button>
              ) : (
                <span className="flex flex-col items-center">{circle}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
