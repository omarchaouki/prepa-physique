"use client";

import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";

import { useT } from "@/lib/i18n/client";

type Theme = "light" | "dark" | "system";

const STORAGE_KEY = "pp-theme";

export interface ThemeLabels {
  group: string;
  light: string;
  dark: string;
  system: string;
}

/**
 * Bascule de theme, sans dependance a un dictionnaire.
 *
 * ---------------------------------------------------------------------------
 * Les trois etats, et pourquoi il en faut trois
 * ---------------------------------------------------------------------------
 *
 * « Systeme » n'est pas un troisieme theme, c'est l'absence de choix : rien
 * n'est ecrit, et la page suit `prefers-color-scheme`, donc l'appareil. Un
 * simple interrupteur a deux positions forcerait un choix des la premiere
 * visite et empecherait de revenir a ce comportement, qui est pourtant le bon
 * defaut : un telephone en mode sombre le soir doit afficher une page sombre
 * sans que personne n'ait rien reglee.
 *
 * L'etat vit dans `localStorage` et non dans un cookie : il n'interesse que le
 * navigateur, le serveur n'a rien a en faire, et un cookie ferait varier la
 * reponse rendue donc casserait la mise en cache des pages publiques.
 *
 * ---------------------------------------------------------------------------
 * Pourquoi ce composant est separe de `ThemeToggle`
 * ---------------------------------------------------------------------------
 *
 * La page publicitaire a son propre dictionnaire, en trois langues, et n'est
 * pas enveloppee par `LocaleProvider`. Un composant qui appellerait `useT()`
 * y planterait au montage. Les libelles arrivent donc en propriete, et
 * `ThemeToggle` n'est plus que la version qui va les chercher pour les surfaces
 * qui ont le fournisseur.
 */
export function ThemeSwitch({
  labels,
  compact = false,
}: {
  labels: ThemeLabels;
  compact?: boolean;
}) {
  const [theme, setTheme] = useState<Theme>("system");

  // La lecture se fait apres le montage, jamais au rendu : le serveur ne
  // connait pas `localStorage`, et lire au rendu produirait une difference
  // entre le balisage serveur et le premier rendu client. Le clignotement, lui,
  // est deja evite par le script synchrone de layout.tsx, qui pose l'attribut
  // avant la premiere peinture.
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "dark" || stored === "light") setTheme(stored);
  }, []);

  const apply = (next: Theme) => {
    setTheme(next);
    if (next === "system") {
      localStorage.removeItem(STORAGE_KEY);
      document.documentElement.removeAttribute("data-theme");
    } else {
      localStorage.setItem(STORAGE_KEY, next);
      document.documentElement.setAttribute("data-theme", next);
    }
  };

  const options: Array<{ value: Theme; icon: typeof Sun; label: string }> = [
    { value: "light", icon: Sun, label: labels.light },
    { value: "dark", icon: Moon, label: labels.dark },
    { value: "system", icon: Monitor, label: labels.system },
  ];

  return (
    <div
      className="inline-flex rounded-lg p-0.5 gap-0.5"
      style={{ background: "var(--surface-sunken)" }}
      role="group"
      aria-label={labels.group}
    >
      {options.map((option) => {
        const Icon = option.icon;
        const active = theme === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => apply(option.value)}
            aria-label={option.label}
            aria-pressed={active}
            title={option.label}
            className="grid place-items-center rounded-md cursor-pointer transition-colors"
            style={{
              width: compact ? "1.75rem" : "2rem",
              height: compact ? "1.75rem" : "2rem",
              background: active ? "var(--surface-panel)" : "transparent",
              color: active ? "var(--text-primary)" : "var(--text-muted)",
              boxShadow: active ? "var(--shadow-panel)" : "none",
            }}
          >
            <Icon size={compact ? 14 : 15} aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}

/** Version pour les surfaces enveloppees par `LocaleProvider`. */
export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const t = useT();

  return (
    <ThemeSwitch
      compact={compact}
      labels={{
        group: t("settings.theme"),
        light: t("settings.themeLight"),
        dark: t("settings.themeDark"),
        system: t("settings.themeSystem"),
      }}
    />
  );
}
