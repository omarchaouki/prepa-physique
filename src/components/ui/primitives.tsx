import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Panneau
// ---------------------------------------------------------------------------

export function Panel({
  children,
  className,
  padded = true,
}: {
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return <div className={cn("panel", padded && "p-4", className)}>{children}</div>;
}

export function PanelHeader({
  title,
  subtitle,
  action,
  icon,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 mb-3">
      <div className="flex items-start gap-2.5 min-w-0">
        {icon ? (
          <span
            className="shrink-0 mt-0.5 grid place-items-center size-8 rounded-lg"
            style={{ background: "var(--accent-soft)", color: "var(--accent-soft-text)" }}
            aria-hidden="true"
          >
            {icon}
          </span>
        ) : null}
        <div className="min-w-0">
          <h2 className="text-[0.9375rem] font-semibold leading-tight truncate">{title}</h2>
          {subtitle ? (
            <p className="text-[0.8125rem] mt-0.5" style={{ color: "var(--text-muted)" }}>
              {subtitle}
            </p>
          ) : null}
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Indicateur chiffre
// ---------------------------------------------------------------------------

export function StatCard({
  label,
  value,
  unit,
  hint,
  trend,
  tone = "neutral",
  icon,
}: {
  label: string;
  value: string | number;
  unit?: string;
  hint?: string;
  trend?: { value: number; goodWhenPositive?: boolean };
  tone?: "neutral" | "positive" | "warning" | "danger";
  icon?: ReactNode;
}) {
  const toneColor =
    tone === "positive"
      ? "var(--success)"
      : tone === "warning"
        ? "var(--warning)"
        : tone === "danger"
          ? "var(--danger)"
          : "var(--text-primary)";

  const trendGood = trend
    ? (trend.goodWhenPositive ?? true)
      ? trend.value > 0
      : trend.value < 0
    : false;

  return (
    <div className="panel p-3.5">
      <div className="flex items-start justify-between gap-2">
        <p
          className="text-[0.75rem] font-medium uppercase tracking-wide"
          style={{ color: "var(--text-muted)" }}
        >
          {label}
        </p>
        {icon ? (
          <span style={{ color: "var(--text-muted)" }} aria-hidden="true">
            {icon}
          </span>
        ) : null}
      </div>
      <div className="mt-1.5 flex items-baseline gap-1">
        <span className="text-2xl font-semibold tabular leading-none" style={{ color: toneColor }}>
          {value}
        </span>
        {unit ? (
          <span className="text-sm" style={{ color: "var(--text-muted)" }}>
            {unit}
          </span>
        ) : null}
      </div>
      <div className="mt-1.5 flex items-center gap-2 min-h-[1.125rem]">
        {trend && trend.value !== 0 ? (
          <span
            className="text-[0.75rem] font-medium tabular"
            style={{ color: trendGood ? "var(--success)" : "var(--danger)" }}
          >
            {trend.value > 0 ? "+" : ""}
            {trend.value.toFixed(1)}%
          </span>
        ) : null}
        {hint ? (
          <span className="text-[0.75rem] truncate" style={{ color: "var(--text-muted)" }}>
            {hint}
          </span>
        ) : null}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Etiquette
// ---------------------------------------------------------------------------

type BadgeTone = "neutral" | "brand" | "success" | "warning" | "danger" | "info";

const BADGE_STYLES: Record<BadgeTone, { background: string; color: string }> = {
  neutral: { background: "var(--surface-sunken)", color: "var(--text-secondary)" },
  brand: { background: "var(--accent-soft)", color: "var(--accent-soft-text)" },
  success: { background: "var(--success-soft)", color: "var(--success)" },
  warning: { background: "var(--warning-soft)", color: "var(--warning)" },
  danger: { background: "var(--danger-soft)", color: "var(--danger)" },
  info: { background: "var(--info-soft)", color: "var(--accent-soft-text)" },
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <span className={cn("badge", className)} style={BADGE_STYLES[tone]}>
      {children}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Barre de percentile
// ---------------------------------------------------------------------------

export function PercentileBar({
  percentile,
  showScale = false,
}: {
  percentile: number;
  showScale?: boolean;
}) {
  const color =
    percentile < 15
      ? "var(--danger)"
      : percentile < 35
        ? "var(--warning)"
        : percentile < 65
          ? "var(--text-secondary)"
          : percentile < 85
            ? "var(--accent)"
            : "var(--success)";

  return (
    <div className="flex items-center gap-2 min-w-[7rem]">
      <div
        className="relative h-1.5 flex-1 rounded-full overflow-hidden"
        style={{ background: "var(--surface-sunken)" }}
        role="img"
        aria-label={`Percentile ${percentile} sur 100`}
      >
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ width: `${Math.max(3, percentile)}%`, background: color }}
        />
        {showScale ? (
          <div
            className="absolute inset-y-0"
            style={{ left: "50%", width: "1px", background: "var(--border-strong)" }}
          />
        ) : null}
      </div>
      <span className="text-[0.75rem] font-medium tabular w-6 text-right" style={{ color }}>
        {percentile}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Etat vide
// ---------------------------------------------------------------------------

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-10 px-4">
      {icon ? (
        <span
          className="grid place-items-center size-11 rounded-full mb-3"
          style={{ background: "var(--surface-sunken)", color: "var(--text-muted)" }}
          aria-hidden="true"
        >
          {icon}
        </span>
      ) : null}
      <p className="font-medium">{title}</p>
      {description ? (
        <p className="text-sm mt-1 max-w-md" style={{ color: "var(--text-muted)" }}>
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Entete de page
// ---------------------------------------------------------------------------

export function PageHeader({
  title,
  description,
  action,
  breadcrumb,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  breadcrumb?: ReactNode;
}) {
  return (
    <header className="mb-5">
      {breadcrumb ? <div className="mb-2">{breadcrumb}</div> : null}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
          {description ? (
            <p className="text-sm mt-1 max-w-2xl" style={{ color: "var(--text-secondary)" }}>
              {description}
            </p>
          ) : null}
        </div>
        {action ? <div className="shrink-0 flex items-center gap-2">{action}</div> : null}
      </div>
    </header>
  );
}

// ---------------------------------------------------------------------------
// Message d'alerte
// ---------------------------------------------------------------------------

export function Alert({
  tone = "warning",
  title,
  children,
}: {
  tone?: "warning" | "danger" | "info" | "success";
  title?: string;
  children: ReactNode;
}) {
  const map = {
    warning: { bg: "var(--warning-soft)", fg: "var(--warning)" },
    danger: { bg: "var(--danger-soft)", fg: "var(--danger)" },
    info: { bg: "var(--info-soft)", fg: "var(--accent-soft-text)" },
    success: { bg: "var(--success-soft)", fg: "var(--success)" },
  }[tone];

  return (
    <div
      className="rounded-lg px-3 py-2.5 text-sm"
      style={{ background: map.bg, color: map.fg }}
      role={tone === "danger" ? "alert" : "status"}
    >
      {title ? <p className="font-semibold mb-0.5">{title}</p> : null}
      <div className="leading-relaxed">{children}</div>
    </div>
  );
}
