import { Suspense } from "react";
import { Eye, Power, UserPlus } from "lucide-react";

import { requireOwner, type CurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { toggleUserAction } from "@/app/actions/admin";
import { impersonateAction } from "@/app/actions/auth";
import { ROLES, ROLE_LABELS, type Role } from "@/lib/constants";
import { getLocale, getLocaleTag, getT } from "@/lib/i18n/server";
import { formatDate } from "@/lib/utils";
import { Alert, Badge, PageHeader, Panel, PanelHeader } from "@/components/ui/primitives";
import { Skeleton, SkeletonTable } from "@/components/ui/skeleton";
import { CreateUserForm, ResetPasswordForm } from "./forms";

export const dynamic = "force-dynamic";

async function UsersTable() {
  const [t, locale, tag] = await Promise.all([getT(), getLocale(), getLocaleTag()]);
  const users = await prisma.user.findMany({
    include: {
      organization: { select: { name: true, isActive: true } },
      _count: { select: { memberships: true } },
    },
    orderBy: [{ role: "asc" }, { name: "asc" }],
  });

  return (
    <>
      <PanelHeader
        title={`${users.length} ${t("admin.accounts")}`}
        subtitle={t("admin.accountsSubtitle")}
      />
      <div className="scroll-x">
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col" style={{ minWidth: "13rem" }}>{t("admin.user")}</th>
              <th scope="col">{t("settings.role")}</th>
              <th scope="col">{t("admin.club")}</th>
              <th scope="col">{t("admin.teams")}</th>
              <th scope="col">{t("admin.lastLogin")}</th>
              <th scope="col">{t("common.status")}</th>
              <th scope="col">{t("common.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>
                  <span className="block font-medium truncate">{user.name}</span>
                  <span className="block text-[0.75rem]" style={{ color: "var(--text-muted)" }}>
                    {user.email}
                  </span>
                </td>
                <td>
                  <Badge tone={user.role === "OWNER" ? "brand" : "neutral"}>
                    {ROLE_LABELS[user.role as Role]?.[locale] ?? user.role}
                  </Badge>
                </td>
                <td style={{ color: "var(--text-secondary)" }}>{user.organization?.name ?? "—"}</td>
                <td className="tabular">{user._count.memberships}</td>
                <td style={{ color: "var(--text-muted)" }}>
                  {user.lastLoginAt ? formatDate(user.lastLoginAt, tag) : t("common.never")}
                </td>
                <td>
                  <Badge tone={user.isActive ? "success" : "danger"}>
                    {user.isActive ? t("admin.active") : t("admin.disabled")}
                  </Badge>
                  {user.mustChangePw ? (
                    <span
                      className="block text-[0.6875rem] mt-0.5"
                      style={{ color: "var(--warning)" }}
                    >
                      {t("admin.temporaryPassword")}
                    </span>
                  ) : null}
                </td>
                <td>
                  {user.role === "OWNER" ? (
                    <span style={{ color: "var(--text-muted)" }}>—</span>
                  ) : (
                    <div className="flex items-center gap-1">
                      <form
                        action={async () => {
                          "use server";
                          await toggleUserAction(user.id);
                        }}
                      >
                        <button
                          type="submit"
                          className="btn btn-ghost"
                          style={{ minHeight: "2rem", padding: "0.25rem 0.5rem" }}
                          title={user.isActive ? t("admin.disableAccount") : t("admin.enableAccount")}
                          aria-label={user.isActive ? t("admin.disableAccount") : t("admin.enableAccount")}
                        >
                          <Power size={14} aria-hidden="true" />
                        </button>
                      </form>

                      <form
                        action={async () => {
                          "use server";
                          await impersonateAction(user.id);
                        }}
                      >
                        <button
                          type="submit"
                          className="btn btn-ghost"
                          style={{ minHeight: "2rem", padding: "0.25rem 0.5rem" }}
                          title={t("admin.impersonate")}
                          aria-label={t("admin.impersonate")}
                          disabled={!user.isActive}
                        >
                          <Eye size={14} aria-hidden="true" />
                        </button>
                      </form>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3">
        <Alert tone="info">
          {t("admin.impersonateNote")}
        </Alert>
      </div>
    </>
  );
}

async function FormsSection({ owner }: { owner: CurrentUser }) {
  const [t, locale, organizations, users] = await Promise.all([
    getT(),
    getLocale(),
    prisma.organization.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.user.findMany({
      where: { id: { not: owner.id } },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <>
      <Panel>
        <PanelHeader
title={t("admin.newAccess")}
          subtitle={t("admin.newAccessSubtitle")}
          icon={<UserPlus size={16} />}
        />
        <CreateUserForm
          organizations={organizations}
          roles={ROLES.filter((r) => r !== "OWNER").map((r) => ({
            value: r,
            label: ROLE_LABELS[r][locale],
          }))}
        />
      </Panel>

      <Panel>
        <PanelHeader
title={t("admin.resetPassword")}
          subtitle={t("admin.resetPasswordSubtitle")}
        />
        <ResetPasswordForm
          users={users.map((u) => ({ id: u.id, label: `${u.name} · ${u.email}` }))}
        />
      </Panel>
    </>
  );
}

function FormsSkeleton() {
  return (
    <>
      {[0, 1].map((panel) => (
        <Panel key={panel}>
          <Skeleton className="h-4 w-40 mb-1.5" />
          <Skeleton className="h-3 w-52 mb-4" />
          <div className="space-y-3">
            {[0, 1, 2, 3].map((index) => (
              <div key={index}>
                <Skeleton className="h-3 w-24 mb-1.5" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            ))}
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        </Panel>
      ))}
    </>
  );
}

export default async function UsersPage() {
  const [owner, t] = await Promise.all([requireOwner(), getT()]);

  return (
    <>
      <PageHeader
title={t("admin.users")}
        description={t("admin.usersSubtitle")}
      />

      <div className="grid lg:grid-cols-3 gap-4">
        <Panel padded={false} className="lg:col-span-2 p-4">
          <Suspense
            fallback={
              <>
                <Skeleton className="h-4 w-32 mb-1.5" />
                <Skeleton className="h-3 w-48 mb-4" />
                <SkeletonTable rows={6} columns={7} firstColumnWide={false} />
              </>
            }
          >
            <UsersTable />
          </Suspense>
        </Panel>

        <div className="space-y-4">
          <Suspense fallback={<FormsSkeleton />}>
            <FormsSection owner={owner} />
          </Suspense>
        </div>
      </div>
    </>
  );
}
