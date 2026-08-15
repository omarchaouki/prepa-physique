import { Suspense } from "react";
import { KeyRound, User } from "lucide-react";

import { requireUser, type CurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ROLE_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { PageHeader, Panel, PanelHeader } from "@/components/ui/primitives";
import { Skeleton } from "@/components/ui/skeleton";
import { ChangePasswordForm } from "./change-password-form";

export const dynamic = "force-dynamic";

async function AccountDetails({ user }: { user: CurrentUser }) {
  const [record, teams] = await Promise.all([
    prisma.user.findUnique({
      where: { id: user.id },
      select: { createdAt: true, lastLoginAt: true, jobTitle: true },
    }),
    prisma.teamMember.findMany({
      where: { userId: user.id },
      include: { team: { select: { name: true, category: true } } },
    }),
  ]);

  return (
    <>
      <dl className="space-y-2.5 text-sm">
        {[
          ["Nom", user.name],
          ["Adresse email", user.email],
          ["Role", ROLE_LABELS[user.role].fr],
          ["Fonction", record?.jobTitle ?? "non renseignee"],
          ["Organisation", user.organizationName ?? "aucune (compte proprietaire)"],
          ["Compte cree le", record?.createdAt ? formatDate(record.createdAt) : "—"],
          [
            "Derniere connexion",
            record?.lastLoginAt ? formatDate(record.lastLoginAt) : "premiere connexion",
          ],
        ].map(([label, value]) => (
          <div
            key={label}
            className="flex justify-between gap-4 py-1.5"
            style={{ borderBottom: "1px solid var(--border-subtle)" }}
          >
            <dt style={{ color: "var(--text-muted)" }}>{label}</dt>
            <dd className="text-right font-medium">{value}</dd>
          </div>
        ))}
      </dl>

      {teams.length > 0 ? (
        <div className="mt-4">
          <p className="text-[0.8125rem] font-medium mb-1.5">Equipes rattachees</p>
          <ul className="space-y-1 text-[0.8125rem]" style={{ color: "var(--text-secondary)" }}>
            {teams.map((membership) => (
              <li key={membership.id} className="flex justify-between gap-3">
                <span>
                  {membership.team.name} · {membership.team.category}
                </span>
                <span style={{ color: "var(--text-muted)" }}>
                  {membership.accessLevel === "MANAGE" ? "gestion" : "lecture"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </>
  );
}

export default async function SettingsPage() {
  const user = await requireUser();

  return (
    <>
      <PageHeader title="Parametres" description="Votre compte et vos acces." />

      <div className="grid lg:grid-cols-2 gap-4">
        <Panel>
          <PanelHeader title="Compte" icon={<User size={16} />} />
          <Suspense
            fallback={
              <div className="space-y-3">
                {Array.from({ length: 7 }).map((_, index) => (
                  <div key={index} className="flex justify-between gap-4 py-1.5">
                    <Skeleton className="h-3.5 w-32" />
                    <Skeleton className="h-3.5 w-40" />
                  </div>
                ))}
              </div>
            }
          >
            <AccountDetails user={user} />
          </Suspense>
        </Panel>

        <Panel>
          <PanelHeader
            title="Mot de passe"
            subtitle="Le changer deconnecte toutes vos autres sessions"
            icon={<KeyRound size={16} />}
          />
          <ChangePasswordForm />
        </Panel>
      </div>
    </>
  );
}
