"use client";

import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";

import { useT } from "@/lib/i18n/client";

type Theme = "light" | "dark" | "system";

const STORAGE_KEY = "pp-theme";

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const t = useT();
  const [theme, setTheme] = useState<Theme>("system");

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
    { value: "light", icon: Sun, label: t("settings.themeLight") },
    { value: "dark", icon: Moon, label: t("settings.themeDark") },
    { value: "system", icon: Monitor, label: t("settings.themeSystem") },
  ];

  return (
    <div
      className="inline-flex rounded-lg p-0.5 gap-0.5"
      style={{ background: "var(--surface-sunken)" }}
      role="group"
      aria-label={t("settings.theme")}
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
