import { Suspense } from "react";
import Link from "next/link";
import { ClipboardList, Plus } from "lucide-react";

import { accessibleTeamIds, requireUser, type CurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getTest } from "@/lib/sports-science/catalog";
import { getLocale, getLocaleTag, getT, pick } from "@/lib/i18n/server";
import { formatDate } from "@/lib/utils";
import { Badge, EmptyState, PageHeader, Panel } from "@/components/ui/primitives";
import { SkeletonTable } from "@/components/ui/skeleton";

export const dynamic = "force-dynamic";

async function SessionsTable({ user }: { user: CurrentUser }) {
  const [ids, t, locale, tag] = await Promise.all([
    accessibleTeamIds(user),
    getT(),
    getLocale(),
    getLocaleTag(),
  ]);

  const sessions = await prisma.testSession.findMany({
    where: ids === "ALL" ? {} : { teamId: { in: ids } },
    orderBy: { date: "desc" },
    include: {
      team: { select: { id: true, name: true, colorHex: true } },
      _count: { select: { results: true } },
    },
  });

  if (sessions.length === 0) {
    return (
      <EmptyState
        title={t("sessions.none")}
        description={t("sessions.noneBody")}
        icon={<ClipboardList size={20} />}
        action={
          <Link href="/app/sessions/new" className="btn btn-primary">
            <Plus size={15} aria-hidden="true" />
            {t("dashboard.createSession")}
          </Link>
        }
      />
    );
  }

  return (
    <div className="scroll-x">
      <table className="data-table">
        <thead>
          <tr>
            <th scope="col">{t("common.date")}</th>
            <th scope="col" style={{ minWidth: "14rem" }}>{t("sessions.session")}</th>
            <th scope="col">{t("players.team")}</th>
            <th scope="col" style={{ minWidth: "16rem" }}>{t("sessions.tests")}</th>
            <th scope="col">{t("sessions.results")}</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((session) => {
            const keys = session.testKeys.split(",").filter(Boolean);
            return (
              <tr key={session.id}>
                <td className="tabular" style={{ color: "var(--text-secondary)" }}>
                  {formatDate(session.date, tag)}
                </td>
                <td>
                  <Link
                    href={`/app/sessions/${session.id}`}
                    className="font-medium cursor-pointer hover:underline"
                  >
                    {session.name}
                  </Link>
                </td>
                <td>
                  <Link
                    href={`/app/teams/${session.team.id}`}
                    className="inline-flex items-center gap-1.5 cursor-pointer hover:underline"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <span
                      className="size-2 rounded-full shrink-0"
                      style={{ background: session.team.colorHex }}
                      aria-hidden="true"
                    />
                    {session.team.name}
                  </Link>
                </td>
                <td>
                  <div className="flex flex-wrap gap-1">
                    {keys.slice(0, 4).map((key) => (
                      <Badge key={key}>{(() => { const d = getTest(key); return d ? pick(d.shortName, locale) : key; })()}</Badge>
                    ))}
                    {keys.length > 4 ? <Badge>+{keys.length - 4}</Badge> : null}
                  </div>
                </td>
                <td className="tabular">{session._count.results}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default async function SessionsPage() {
  const [user, t] = await Promise.all([requireUser(), getT()]);

  return (
    <>
      <PageHeader
        title={t("sessions.title")}
        description={t("sessions.subtitle")}
        action={
          <Link href="/app/sessions/new" className="btn btn-primary">
            <Plus size={15} aria-hidden="true" />
            {t("dashboard.newSession")}
          </Link>
        }
      />
      <Panel padded={false} className="p-1">
        <Suspense fallback={<SkeletonTable rows={8} columns={5} firstColumnWide={false} />}>
          <SessionsTable user={user} />
        </Suspense>
      </Panel>
    </>
  );
}
