import { Suspense } from "react";
import { ScrollText } from "lucide-react";

import { requireOwner } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getLocaleTag, getT } from "@/lib/i18n/server";
import { Badge, EmptyState, PageHeader, Panel } from "@/components/ui/primitives";
import { Skeleton, SkeletonTable } from "@/components/ui/skeleton";

export const dynamic = "force-dynamic";

const ACTION_TONE: Record<string, "neutral" | "brand" | "success" | "warning" | "danger"> = {
  LOGIN: "success",
  LOGOUT: "neutral",
  CREATE: "brand",
  UPDATE: "warning",
  DELETE: "danger",
  IMPERSONATE: "danger",
  EXPORT: "neutral",
};

const dateTimeFormat = (tag: string) =>
  new Intl.DateTimeFormat(tag, {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
    minute: "2-digit",
  });

async function AuditContent({ action, page }: { action?: string; page?: string }) {
  const [t, tag] = await Promise.all([getT(), getLocaleTag()]);
  const dateTime = dateTimeFormat(tag);
  const pageSize = 60;
  const currentPage = Math.max(1, Number(page ?? 1) || 1);
  const where = action && action !== "ALL" ? { action } : {};

  const [entries, total, actions] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
      include: { user: { select: { name: true } } },
    }),
    prisma.auditLog.count({ where }),
    prisma.auditLog.groupBy({ by: ["action"], _count: { action: true } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <>
      {/* Filtres par type d'action */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        <a
          href="/admin/audit"
          className="btn cursor-pointer"
          style={{
            background: !action || action === "ALL" ? "var(--accent)" : "var(--surface-panel)",
            color: !action || action === "ALL" ? "var(--accent-text)" : "var(--text-secondary)",
            border: "1px solid var(--border-strong)",
          }}
        >
          {t("admin.auditAll")} ({total})
        </a>
        {actions.map((entry) => (
          <a
            key={entry.action}
            href={`/admin/audit?action=${entry.action}`}
            className="btn cursor-pointer"
            style={{
              background: action === entry.action ? "var(--accent)" : "var(--surface-panel)",
              color: action === entry.action ? "var(--accent-text)" : "var(--text-secondary)",
              border: "1px solid var(--border-strong)",
            }}
          >
            {entry.action} ({entry._count.action})
          </a>
        ))}
      </div>

      <Panel padded={false}>
        {entries.length === 0 ? (
          <EmptyState title={t("admin.auditNone")} icon={<ScrollText size={20} />} />
        ) : (
          <div className="scroll-x">
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">{t("admin.timestamp")}</th>
                  <th scope="col">{t("admin.action")}</th>
                  <th scope="col">{t("admin.author")}</th>
                  <th scope="col">{t("admin.entity")}</th>
                  <th scope="col">{t("admin.detail")}</th>
                  <th scope="col">{t("admin.address")}</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id}>
                    <td className="tabular" style={{ color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
                      {dateTime.format(entry.createdAt)}
                    </td>
                    <td>
                      <Badge tone={ACTION_TONE[entry.action] ?? "neutral"}>{entry.action}</Badge>
                    </td>
                    <td>
                      <span className="block truncate">{entry.user?.name ?? t("admin.deletedAccount")}</span>
                      <span className="block text-[0.75rem]" style={{ color: "var(--text-muted)" }}>
                        {entry.actorEmail}
                      </span>
                    </td>
                    <td style={{ color: "var(--text-secondary)" }}>{entry.entity}</td>
                    <td
                      className="text-[0.75rem] font-mono"
                      style={{ color: "var(--text-muted)", maxWidth: "22rem" }}
                    >
                      <span className="block truncate" title={entry.metaJson ?? ""}>
                        {entry.metaJson ?? "—"}
                      </span>
                    </td>
                    <td className="tabular text-[0.75rem]" style={{ color: "var(--text-muted)" }}>
                      {entry.ip ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {totalPages > 1 ? (
        <nav className="flex items-center justify-between mt-3" aria-label={t("admin.pagination")}>
          <a
            href={`/admin/audit?${action ? `action=${action}&` : ""}page=${currentPage - 1}`}
            className="btn btn-secondary"
            style={{ visibility: currentPage > 1 ? "visible" : "hidden" }}
          >
            {t("admin.previousPage")}
          </a>
          <span className="text-[0.8125rem] tabular" style={{ color: "var(--text-muted)" }}>
            {t("admin.page")} {currentPage} / {totalPages}
          </span>
          <a
            href={`/admin/audit?${action ? `action=${action}&` : ""}page=${currentPage + 1}`}
            className="btn btn-secondary"
            style={{ visibility: currentPage < totalPages ? "visible" : "hidden" }}
          >
            {t("admin.nextPage")}
          </a>
        </nav>
      ) : null}
    </>
  );
}

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string; page?: string }>;
}) {
  const [, t, { action, page }] = await Promise.all([requireOwner(), getT(), searchParams]);

  return (
    <>
      <PageHeader
title={t("admin.audit")}
        description={t("admin.auditSubtitle")}
      />

      {/* La cle relance le squelette quand on change de filtre ou de page. */}
      <Suspense
        key={`${action ?? "all"}-${page ?? "1"}`}
        fallback={
          <>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {[0, 1, 2, 3, 4].map((index) => (
                <Skeleton key={index} className="h-10 w-28 rounded-lg" />
              ))}
            </div>
            <Panel padded={false} className="p-1">
              <SkeletonTable rows={12} columns={6} firstColumnWide={false} />
            </Panel>
          </>
        }
      >
        <AuditContent action={action} page={page} />
      </Suspense>
    </>
  );
}
