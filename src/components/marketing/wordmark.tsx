import { Activity } from "lucide-react";

/**
 * Marque de l'application.
 *
 * Le meme signe que l'icone Android et que l'entete de connexion : la ligne de
 * pouls sur le bleu de la marque. Regroupe ici pour que la page d'accueil,
 * l'ecran de connexion et l'ecran de demarrage ne divergent pas.
 */
export function Wordmark({
  name,
  size = "md",
  subtitle,
}: {
  name: string;
  size?: "sm" | "md" | "lg";
  subtitle?: string;
}) {
  const box = size === "lg" ? "size-11" : size === "sm" ? "size-8" : "size-9";
  const glyph = size === "lg" ? 24 : size === "sm" ? 17 : 19;
  const text = size === "lg" ? "text-xl" : size === "sm" ? "text-[0.9375rem]" : "text-lg";

  return (
    <span className="inline-flex items-center gap-2.5">
      <span
        className={`grid place-items-center rounded-lg shrink-0 ${box}`}
        style={{ background: "var(--accent)", color: "var(--accent-text)" }}
      >
        <Activity size={glyph} strokeWidth={2.2} aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className={`block font-semibold tracking-tight leading-tight ${text}`}>{name}</span>
        {subtitle ? (
          <span
            className="block text-[0.6875rem] uppercase tracking-wider leading-tight"
            style={{ color: "var(--text-muted)" }}
          >
            {subtitle}
          </span>
        ) : null}
      </span>
    </span>
  );
}
