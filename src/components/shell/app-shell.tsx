import type { ReactNode } from "react";

import { ROLE_LABELS } from "@/lib/constants";
import type { CurrentUser } from "@/lib/auth";
import { Sidebar, type NavSection } from "./sidebar";
import { LogoutButton, StopImpersonationBar } from "./logout-button";

export const coachNavigation = (user: CurrentUser): NavSection[] => {
  const sections: NavSection[] = [
    {
      items: [
        { href: "/app", label: "Tableau de bord", icon: "dashboard", exact: true },
        { href: "/app/teams", label: "Equipes", icon: "teams" },
        { href: "/app/players", label: "Joueurs", icon: "players" },
      ],
    },
    {
      title: "Evaluation",
      items: [
        { href: "/app/sessions", label: "Passations", icon: "tests" },
        { href: "/app/analytics", label: "Analyses", icon: "analytics" },
        { href: "/app/reference", label: "Referentiel des tests", icon: "reference" },
      ],
    },
    {
      title: "Compte",
      items: [{ href: "/app/settings", label: "Parametres", icon: "settings" }],
    },
  ];

  if (user.role === "OWNER" && !user.impersonatedBy) {
    sections.push({
      title: "Proprietaire",
      items: [{ href: "/admin", label: "Panel administrateur", icon: "shield" }],
    });
  }

  return sections;
};

export const adminNavigation = (): NavSection[] => [
  {
    items: [{ href: "/admin", label: "Vue globale", icon: "dashboard", exact: true }],
  },
  {
    title: "Gestion",
    items: [
      { href: "/admin/organizations", label: "Clubs", icon: "organizations" },
      { href: "/admin/users", label: "Utilisateurs", icon: "users" },
      { href: "/admin/audit", label: "Journal d'audit", icon: "audit" },
    ],
  },
  {
    title: "Application",
    items: [
      { href: "/app", label: "Espace equipes", icon: "teams" },
      { href: "/app/reference", label: "Referentiel des tests", icon: "reference" },
    ],
  },
];

export function AppShell({
  user,
  sections,
  children,
}: {
  user: CurrentUser;
  sections: NavSection[];
  children: ReactNode;
}) {
  return (
    // Empile la barre mobile au dessus du contenu, puis passe en deux colonnes
    // a partir de la taille ou la colonne laterale est affichee.
    <div className="min-h-dvh lg:flex">
      <Sidebar
        sections={sections}
        userName={user.name}
        userRole={ROLE_LABELS[user.role].fr}
        organizationName={user.organizationName}
        footer={<LogoutButton />}
      />
      <div className="flex-1 min-w-0 flex flex-col">
        {user.impersonatedBy ? <StopImpersonationBar ownerEmail={user.impersonatedBy.email} /> : null}
        <main className="flex-1 min-w-0 px-4 py-5 sm:px-6 lg:px-7 lg:py-6 max-w-[1600px] w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
