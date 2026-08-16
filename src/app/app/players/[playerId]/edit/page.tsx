import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft, Trash2, UserCog } from "lucide-react";

import { canAccessTeam, requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { deletePlayerAction } from "@/app/actions/squad";
import { getT } from "@/lib/i18n/server";
import { formatDateInput } from "@/lib/utils";
import { Alert, PageHeader, Panel, PanelHeader } from "@/components/ui/primitives";
import { PlayerForm } from "@/components/manage/player-form";

export const dynamic = "force-dynamic";

export default async function EditPlayerPage({
  params,
}: {
  params: Promise<{ playerId: string }>;
}) {
  const { playerId } = await params;
  const [user, t] = await Promise.all([requireUser(), getT()]);

  const player = await prisma.player.findUnique({
    where: { id: playerId },
    include: { team: { select: { id: true, name: true, organizationId: true } } },
  });
  if (!player) notFound();

  const access = await canAccessTeam(user, player.teamId);
  if (!access.allowed) redirect("/app/teams");
  if (!access.canEdit) redirect(`/app/players/${playerId}`);

  const candidateTeams = await prisma.team.findMany({
    where:
      user.role === "OWNER"
        ? { organizationId: player.team.organizationId }
        : user.role === "CLUB_ADMIN"
          ? { organizationId: user.organizationId ?? "" }
          : { members: { some: { userId: user.id, accessLevel: "MANAGE" } } },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <>
      <PageHeader
        breadcrumb={
          <Link
            href={`/app/players/${playerId}`}
            className="inline-flex items-center gap-1 text-[0.8125rem] cursor-pointer hover:underline"
            style={{ color: "var(--text-muted)" }}
          >
            <ChevronLeft size={14} aria-hidden="true" />
            {player.firstName} {player.lastName}
          </Link>
        }
        title={t("manage.editPlayer")}
        description={player.team.name}
      />

      <div className="grid lg:grid-cols-3 gap-4">
        <Panel className="lg:col-span-2">
          <PanelHeader title={t("manage.editPlayer")} icon={<UserCog size={16} />} />
          <PlayerForm
            mode="edit"
            teams={candidateTeams}
            values={{
              id: player.id,
              teamId: player.teamId,
              firstName: player.firstName,
              lastName: player.lastName,
              birthDate: formatDateInput(player.birthDate),
              sex: player.sex,
              position: player.position,
              secondaryPosition: player.secondaryPosition ?? "",
              dominantFoot: player.dominantFoot,
              jerseyNumber: player.jerseyNumber?.toString() ?? "",
              heightCm: player.heightCm?.toString() ?? "",
              weightKg: player.weightKg?.toString() ?? "",
              status: player.status,
              email: player.email ?? "",
              externalId: player.externalId ?? "",
              notes: player.notes ?? "",
            }}
            extra={
              <Link href={`/app/teams/${player.teamId}/manage`} className="btn btn-secondary">
                {t("common.back")}
              </Link>
            }
          />
        </Panel>

        <Panel>
          <PanelHeader title={t("manage.deletePlayer")} icon={<Trash2 size={16} />} />
          <Alert tone="warning">{t("manage.deletePlayerHint")}</Alert>

          <form
            action={async () => {
              "use server";
              await deletePlayerAction(playerId);
            }}
            className="mt-3"
          >
            <button type="submit" className="btn btn-danger w-full">
              <Trash2 size={15} aria-hidden="true" />
              {t("manage.deletePlayer")}
            </button>
          </form>
        </Panel>
      </div>
    </>
  );
}
