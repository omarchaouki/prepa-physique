"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Activity,
  BarChart3,
  BookOpen,
  Building2,
  ClipboardList,
  LayoutDashboard,
  Menu,
  ScrollText,
  Settings,
  ShieldCheck,
  Users,
  UsersRound,
  X,
} from "lucide-react";

import { ThemeToggle } from "./theme-toggle";
import { useT } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";

const ICONS = {
  dashboard: LayoutDashboard,
  teams: UsersRound,
  players: Users,
  tests: ClipboardList,
  analytics: BarChart3,
  reference: BookOpen,
  settings: Settings,
  organizations: Building2,
  users: Users,
  audit: ScrollText,
  shield: ShieldCheck,
} as const;

export interface NavItem {
  href: string;
  label: string;
  icon: keyof typeof ICONS;
  /** Correspondance exacte plutot que par prefixe, pour les racines de section. */
  exact?: boolean;
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

export function Sidebar({
  sections,
  userName,
  userRole,
  organizationName,
  footer,
}: {
  sections: NavSection[];
  userName: string;
  userRole: string;
  organizationName: string | null;
  footer: React.ReactNode;
}) {
  const t = useT();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // La navigation mobile se referme des que la page change.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const isActive = (item: NavItem) =>
    item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);

  const nav = (
    <nav className="flex-1 overflow-y-auto scroll-y px-3 py-3 space-y-5">
      {sections.map((section, index) => (
        <div key={section.title ?? index}>
          {section.title ? (
            <p
              className="px-2 mb-1.5 text-[0.6875rem] font-semibold uppercase tracking-wider"
              style={{ color: "var(--text-muted)" }}
            >
              {section.title}
            </p>
          ) : null}
          <ul className="space-y-0.5">
            {section.items.map((item) => {
              const Icon = ICONS[item.icon];
              const active = isActive(item);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors cursor-pointer",
                      "min-h-[2.5rem]",
                    )}
                    style={{
                      background: active ? "var(--accent-soft)" : "transparent",
                      color: active ? "var(--accent-soft-text)" : "var(--text-secondary)",
                      fontWeight: active ? 600 : 400,
                    }}
                  >
                    <Icon size={17} strokeWidth={active ? 2.2 : 1.8} aria-hidden="true" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  const brand = (
    <div className="flex items-center gap-2.5 px-4 h-14 shrink-0" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
      <span
        className="grid place-items-center size-8 rounded-lg shrink-0"
        style={{ background: "var(--accent)", color: "var(--accent-text)" }}
      >
        <Activity size={17} strokeWidth={2.2} aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="font-semibold text-sm leading-tight truncate">Prepa Physique</p>
        {organizationName ? (
          <p className="text-[0.6875rem] truncate" style={{ color: "var(--text-muted)" }}>
            {organizationName}
          </p>
        ) : null}
      </div>
    </div>
  );

  const account = (
    <div className="px-3 py-3 space-y-2.5 shrink-0" style={{ borderTop: "1px solid var(--border-subtle)" }}>
      <div className="flex items-center gap-2.5 px-1">
        <span
          className="grid place-items-center size-8 rounded-full text-[0.6875rem] font-semibold shrink-0"
          style={{ background: "var(--surface-sunken)", color: "var(--text-secondary)" }}
          aria-hidden="true"
        >
          {userName.slice(0, 2).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[0.8125rem] font-medium truncate">{userName}</p>
          <p className="text-[0.6875rem] truncate" style={{ color: "var(--text-muted)" }}>
            {userRole}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 px-1">
        <ThemeToggle compact />
        {footer}
      </div>
    </div>
  );

  return (
    <>
      {/* Barre superieure mobile */}
      <header
        className="lg:hidden sticky top-0 z-30 flex items-center gap-2 h-14 px-3"
        style={{
          background: "var(--surface-panel)",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="grid place-items-center size-10 rounded-lg cursor-pointer"
          style={{ color: "var(--text-secondary)" }}
          aria-label={t("nav.open")}
          aria-expanded={open}
        >
          <Menu size={20} aria-hidden="true" />
        </button>
        <span
          className="grid place-items-center size-8 rounded-lg"
          style={{ background: "var(--accent)", color: "var(--accent-text)" }}
        >
          <Activity size={17} strokeWidth={2.2} aria-hidden="true" />
        </span>
        <span className="font-semibold text-sm">Prepa Physique</span>
      </header>

      {/* Tiroir mobile */}
      {open ? (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <button
            type="button"
            className="absolute inset-0 cursor-pointer"
            style={{ background: "rgb(2 6 23 / 0.55)" }}
            onClick={() => setOpen(false)}
            aria-label={t("nav.close")}
          />
          <div
            className="relative flex flex-col w-[17rem] max-w-[85vw] h-full"
            style={{ background: "var(--surface-panel)" }}
            role="dialog"
            aria-modal="true"
            aria-label={t("nav.main")}
          >
            <div className="flex items-center justify-between pr-2" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              <div className="flex-1">{brand}</div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="grid place-items-center size-10 rounded-lg cursor-pointer"
                style={{ color: "var(--text-secondary)" }}
                aria-label={t("nav.close")}
              >
                <X size={19} aria-hidden="true" />
              </button>
            </div>
            {nav}
            {account}
          </div>
        </div>
      ) : null}

      {/* Colonne fixe sur grand ecran */}
      <aside
        className="hidden lg:flex flex-col w-60 shrink-0 h-dvh sticky top-0"
        style={{ background: "var(--surface-panel)", borderRight: "1px solid var(--border-subtle)" }}
      >
        {brand}
        {nav}
        {account}
      </aside>
    </>
  );
}
