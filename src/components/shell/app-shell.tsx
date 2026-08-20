import type { ReactNode } from "react";

import { ROLE_LABELS } from "@/lib/constants";
import type { CurrentUser } from "@/lib/auth";
import { getLocale, getT } from "@/lib/i18n/server";
import { LocaleProvider } from "@/lib/i18n/client";
import type { Translator } from "@/lib/i18n/dictionary";
import { Sidebar, type NavSection } from "./sidebar";
import { LogoutButton, StopImpersonationBar } from "./logout-button";
import { LanguageSwitcher } from "./language-switcher";
import { OfflineIndicator } from "./offline-indicator";
import { OfflineProvider } from "@/lib/offline/provider";

export const coachNavigation = (user: CurrentUser, t: Translator): NavSection[] => {
  const sections: NavSection[] = [
    {
      items: [
        { href: "/app", label: t("nav.dashboard"), icon: "dashboard", exact: true },
        { href: "/app/teams", label: t("nav.teams"), icon: "teams" },
        { href: "/app/players", label: t("nav.players"), icon: "players" },
      ],
    },
    {
      title: t("nav.evaluation"),
      items: [
        { href: "/app/sessions", label: t("nav.sessions"), icon: "tests" },
        { href: "/app/analytics", label: t("nav.analytics"), icon: "analytics" },
        { href: "/app/reference", label: t("nav.reference"), icon: "reference" },
      ],
    },
    {
      title: t("nav.account"),
      items: [{ href: "/app/settings", label: t("nav.settings"), icon: "settings" }],
    },
  ];

  // L'administrateur de club gere ses equipes et les coordonnees de son club.
  if (user.role === "CLUB_ADMIN") {
    sections[2].items.unshift({
      href: "/app/club",
      label: t("manage.club"),
      icon: "organizations",
    });
  }

  if (user.role === "OWNER" && !user.impersonatedBy) {
    sections.push({
      title: t("nav.owner"),
      items: [{ href: "/admin", label: t("nav.adminPanel"), icon: "shield" }],
    });
  }

  return sections;
};

export const adminNavigation = (t: Translator): NavSection[] => [
  {
    items: [{ href: "/admin", label: t("nav.overview"), icon: "dashboard", exact: true }],
  },
  {
    title: t("nav.management"),
    items: [
      { href: "/admin/organizations", label: t("nav.organizations"), icon: "organizations" },
      { href: "/admin/users", label: t("nav.users"), icon: "users" },
      { href: "/admin/audit", label: t("nav.audit"), icon: "audit" },
      { href: "/admin/tracking", label: t("nav.tracking"), icon: "tracking" },
    ],
  },
  {
    title: t("nav.application"),
    items: [
      { href: "/app", label: t("nav.teamSpace"), icon: "teams" },
      { href: "/app/reference", label: t("nav.reference"), icon: "reference" },
    ],
  },
];

export async function AppShell({
  user,
  sections,
  children,
}: {
  user: CurrentUser;
  sections: NavSection[];
  children: ReactNode;
}) {
  const [locale, t] = await Promise.all([getLocale(), getT()]);

  return (
    <LocaleProvider locale={locale}>
      {/* L'etat reseau et la file d'attente enveloppent toute la zone connectee :
          une saisie commencee sur une page doit continuer de partir apres une
          navigation. */}
      <OfflineProvider>
      {/* Empile la barre mobile au dessus du contenu, puis passe en deux colonnes
          a partir de la taille ou la colonne laterale est affichee. */}
      <div className="min-h-dvh lg:flex">
        <Sidebar
          sections={sections}
          userName={user.name}
          userRole={ROLE_LABELS[user.role][locale]}
          organizationName={user.organizationName}
          footer={
            <div className="flex items-center gap-1">
              <LanguageSwitcher current={locale} />
              <LogoutButton label={t("login.signOutAction")} />
            </div>
          }
        />
        <div className="flex-1 min-w-0 flex flex-col">
          {user.impersonatedBy ? (
            <StopImpersonationBar
              ownerEmail={user.impersonatedBy.email}
              message={t("admin.impersonating")}
              traced={t("admin.impersonatingTraced")}
              back={t("admin.backToMyAccount")}
            />
          ) : null}
          <main className="flex-1 min-w-0 px-4 py-5 sm:px-6 lg:px-7 lg:py-6 max-w-[1600px] w-full">
            {children}
          </main>
        </div>
        <OfflineIndicator />
      </div>
      </OfflineProvider>
    </LocaleProvider>
  );
}
