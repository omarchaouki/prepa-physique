import { Suspense } from "react";
import Link from "next/link";
import { Activity, Building2, ClipboardList, ScrollText, Users, UsersRound } from "lucide-react";

import { requireOwner } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getLocaleTag, getT } from "@/lib/i18n/server";
import { formatDate } from "@/lib/utils";
import { Badge, PageHeader, Panel, PanelHeader, StatCard } from "@/components/ui/primitives";
import { SkeletonList, SkeletonStats, SkeletonTable } from "@/components/ui/skeleton";

export const dynamic = "force-dynamic";

async function PlatformStats() {
  const t = await getT();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86_400_000);

  const [organizations, activeOrganizations, users, activeUsers, teams, players, sessions, metrics, recentLogins] =
    await Promise.all([
      prisma.organization.count(),
      prisma.organization.count({ where: { isActive: true } }),
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.team.count(),
      prisma.player.count(),
      prisma.testSession.count(),
      prisma.metric.count(),
      prisma.user.count({ where: { lastLoginAt: { gte: thirtyDaysAgo } } }),
    ]);

  return (
    <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <StatCard
label={t("admin.clubs")}
        value={organizations}
hint={`${activeOrganizations} ${t("admin.clubsActive")}`}
        tone={activeOrganizations < organizations ? "warning" : "neutral"}
        icon={<Building2 size={15} />}
      />
      <StatCard
label={t("admin.users")}
        value={users}
hint={`${activeUsers} ${t("admin.usersActive")} · ${recentLogins} ${t("admin.usersRecent")}`}
        icon={<Users size={15} />}
      />
      <StatCard
label={t("admin.teams")}
        value={teams}
hint={`${players} ${t("common.players")}`}
        icon={<UsersRound size={15} />}
      />
      <StatCard
label={t("admin.data")}
        value={metrics.toLocaleString("fr-FR")}
hint={`${sessions} ${t("admin.dataHint")}`}
        icon={<Activity size={15} />}
      />
    </section>
  );
}

async function ClientsTable() {
  const t = await getT();
  const organizations = await prisma.organization.findMany({
    include: {
      _count: { select: { teams: true, users: true } },
      teams: { select: { _count: { select: { players: true, testSessions: true } } } },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return (
    <div className="scroll-x">
      <table className="data-table">
        <thead>
          <tr>
            <th scope="col">{t("admin.club")}</th>
            <th scope="col">{t("admin.plan")}</th>
            <th scope="col">{t("admin.teams")}</th>
            <th scope="col">{t("dashboard.statPlayers")}</th>
            <th scope="col">{t("dashboard.statSessions")}</th>
            <th scope="col">{t("admin.users")}</th>
            <th scope="col">{t("common.status")}</th>
          </tr>
        </thead>
        <tbody>
          {organizations.map((organization) => {
            const playerCount = organization.teams.reduce((a, t) => a + t._count.players, 0);
            const sessionCount = organization.teams.reduce((a, t) => a + t._count.testSessions, 0);
            return (
              <tr key={organization.id}>
                <td className="font-medium">{organization.name}</td>
                <td>
                  <Badge tone="brand">{organization.plan}</Badge>
                </td>
                <td className="tabular">
                  {organization._count.teams}
                  <span style={{ color: "var(--text-muted)" }}> / {organization.maxTeams}</span>
                </td>
                <td className="tabular">
                  {playerCount}
                  <span style={{ color: "var(--text-muted)" }}> / {organization.maxPlayers}</span>
                </td>
                <td className="tabular">{sessionCount}</td>
                <td className="tabular">{organization._count.users}</td>
                <td>
                  <Badge tone={organization.isActive ? "success" : "danger"}>
                    {organization.isActive ? t("admin.active") : t("admin.suspended")}
                  </Badge>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

async function RecentActivity() {
  const [t, tag] = await Promise.all([getT(), getLocaleTag()]);
  const entries = await prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 8 });

  if (entries.length === 0) {
    return (
      <p className="text-sm py-6 text-center" style={{ color: "var(--text-muted)" }}>
        {t("admin.noActivity")}
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {entries.map((entry) => (
        <li key={entry.id} className="text-[0.8125rem]">
          <div className="flex items-start justify-between gap-2">
            <span className="font-medium truncate">{entry.action}</span>
            <span
              className="shrink-0 tabular text-[0.75rem]"
              style={{ color: "var(--text-muted)" }}
            >
              {formatDate(entry.createdAt, tag)}
            </span>
          </div>
          <p className="truncate" style={{ color: "var(--text-muted)" }}>
            {entry.actorEmail} · {entry.entity}
          </p>
        </li>
      ))}
    </ul>
  );
}

export default async function AdminOverviewPage() {
  const [, t] = await Promise.all([requireOwner(), getT()]);

  return (
    <>
      <PageHeader
title={t("admin.title")}
        description={t("admin.subtitle")}
      />

      <div className="mb-4">
        <Suspense fallback={<SkeletonStats />}>
          <PlatformStats />
        </Suspense>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Panel className="lg:col-span-2">
          <PanelHeader
title={t("admin.clientClubs")}
            subtitle={t("admin.clientClubsSubtitle")}
            icon={<Building2 size={16} />}
            action={
              <Link href="/admin/organizations" className="btn btn-ghost">
                {t("admin.manage")}
              </Link>
            }
          />
          <Suspense fallback={<SkeletonTable rows={5} columns={7} firstColumnWide={false} />}>
            <ClientsTable />
          </Suspense>
        </Panel>

        <Panel>
          <PanelHeader
title={t("admin.recentActivity")}
            subtitle={t("admin.recentActivitySubtitle")}
            icon={<ScrollText size={16} />}
            action={
              <Link href="/admin/audit" className="btn btn-ghost">
                {t("common.viewAll")}
              </Link>
            }
          />
          <Suspense fallback={<SkeletonList items={8} avatar={false} />}>
            <RecentActivity />
          </Suspense>
        </Panel>
      </div>

      <Panel className="mt-4">
        <PanelHeader
title={t("admin.quickAccess")}
          subtitle={t("admin.quickAccessSubtitle")}
          icon={<ClipboardList size={16} />}
        />
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            {
              href: "/admin/organizations",
label: t("admin.createClub"),
              description: t("admin.createClubBody"),
            },
            {
              href: "/admin/users",
label: t("admin.createAccess"),
              description: t("admin.createAccessBody"),
            },
            {
              href: "/admin/audit",
label: t("admin.viewAudit"),
              description: t("admin.viewAuditBody"),
            },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="panel-sunken p-3 cursor-pointer transition-colors hover:bg-[var(--surface-hover)]"
            >
              <p className="text-sm font-medium">{item.label}</p>
              <p className="text-[0.8125rem] mt-1" style={{ color: "var(--text-muted)" }}>
                {item.description}
              </p>
            </Link>
          ))}
        </div>
      </Panel>
    </>
  );
}
