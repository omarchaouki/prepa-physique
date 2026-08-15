import { Suspense } from "react";
import { Eye, Power, UserPlus } from "lucide-react";

import { requireOwner, type CurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { toggleUserAction } from "@/app/actions/admin";
import { impersonateAction } from "@/app/actions/auth";
import { ROLES, ROLE_LABELS, type Role } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { Alert, Badge, PageHeader, Panel, PanelHeader } from "@/components/ui/primitives";
import { Skeleton, SkeletonTable } from "@/components/ui/skeleton";
import { CreateUserForm, ResetPasswordForm } from "./forms";

export const dynamic = "force-dynamic";

async function UsersTable() {
  const users = await prisma.user.findMany({
    include: {
      organization: { select: { name: true, isActive: true } },
      _count: { select: { memberships: true } },
    },
    orderBy: [{ role: "asc" }, { name: "asc" }],
  });

  return (
    <>
      <PanelHeader title={`${users.length} comptes`} subtitle="Classes par role puis par nom" />
      <div className="scroll-x">
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col" style={{ minWidth: "13rem" }}>Utilisateur</th>
              <th scope="col">Role</th>
              <th scope="col">Club</th>
              <th scope="col">Equipes</th>
              <th scope="col">Derniere connexion</th>
              <th scope="col">Statut</th>
              <th scope="col">Actions</th>
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
                    {ROLE_LABELS[user.role as Role]?.fr ?? user.role}
                  </Badge>
                </td>
                <td style={{ color: "var(--text-secondary)" }}>{user.organization?.name ?? "—"}</td>
                <td className="tabular">{user._count.memberships}</td>
                <td style={{ color: "var(--text-muted)" }}>
                  {user.lastLoginAt ? formatDate(user.lastLoginAt) : "jamais"}
                </td>
                <td>
                  <Badge tone={user.isActive ? "success" : "danger"}>
                    {user.isActive ? "Actif" : "Desactive"}
                  </Badge>
                  {user.mustChangePw ? (
                    <span
                      className="block text-[0.6875rem] mt-0.5"
                      style={{ color: "var(--warning)" }}
                    >
                      mot de passe provisoire
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
                          title={user.isActive ? "Desactiver le compte" : "Reactiver le compte"}
                          aria-label={user.isActive ? "Desactiver le compte" : "Reactiver le compte"}
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
                          title="Consulter l'application avec ce compte"
                          aria-label="Consulter l'application avec ce compte"
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
          L'icone en forme d'oeil ouvre l'application avec le compte du client, pour diagnostiquer un
          probleme. L'action est enregistree dans le journal d'audit et un bandeau reste visible
          pendant toute la session. Vous ne voyez jamais son mot de passe.
        </Alert>
      </div>
    </>
  );
}

async function FormsSection({ owner }: { owner: CurrentUser }) {
  const [organizations, users] = await Promise.all([
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
          title="Nouvel acces"
          subtitle="Le compte devra changer son mot de passe"
          icon={<UserPlus size={16} />}
        />
        <CreateUserForm
          organizations={organizations}
          roles={ROLES.filter((r) => r !== "OWNER").map((r) => ({
            value: r,
            label: ROLE_LABELS[r].fr,
          }))}
        />
      </Panel>

      <Panel>
        <PanelHeader
          title="Reinitialiser un mot de passe"
          subtitle="Toutes ses sessions seront fermees"
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
  const owner = await requireOwner();

  return (
    <>
      <PageHeader
        title="Utilisateurs"
        description="Tous les comptes de la plateforme, tous clubs confondus."
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
