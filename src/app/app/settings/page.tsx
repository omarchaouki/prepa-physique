import { Suspense } from "react";
import { IdCard, KeyRound, Languages, User } from "lucide-react";

import { requireUser, type CurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ROLE_LABELS } from "@/lib/constants";
import { getLocale, getLocaleTag, getT } from "@/lib/i18n/server";
import { formatDate } from "@/lib/utils";
import { PageHeader, Panel, PanelHeader } from "@/components/ui/primitives";
import { Skeleton } from "@/components/ui/skeleton";
import { LanguageChoice } from "@/components/shell/language-switcher";
import { ChangePasswordForm } from "./change-password-form";
import { ProfileForm } from "./profile-form";

export const dynamic = "force-dynamic";

async function AccountDetails({ user }: { user: CurrentUser }) {
  const [record, teams, t, locale, tag] = await Promise.all([
    prisma.user.findUnique({
      where: { id: user.id },
      select: { createdAt: true, lastLoginAt: true, jobTitle: true, phone: true },
    }),
    prisma.teamMember.findMany({
      where: { userId: user.id },
      include: { team: { select: { name: true, category: true } } },
    }),
    getT(),
    getLocale(),
    getLocaleTag(),
  ]);

  return (
    <>
      <dl className="space-y-2.5 text-sm">
        {[
          [t("common.name"), user.name],
          [t("login.email"), user.email],
          [t("settings.role"), ROLE_LABELS[user.role][locale]],
          [t("settings.jobTitle"), record?.jobTitle ?? t("settings.jobTitleNone")],
          [t("settings.phone"), record?.phone ?? t("settings.phoneNone")],
          [t("settings.organization"), user.organizationName ?? t("settings.organizationNone")],
          [t("settings.createdAt"), record?.createdAt ? formatDate(record.createdAt, tag) : "—"],
          [
            t("settings.lastLogin"),
            record?.lastLoginAt ? formatDate(record.lastLoginAt, tag) : t("settings.firstLogin"),
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
          <p className="text-[0.8125rem] font-medium mb-1.5">{t("settings.teams")}</p>
          <ul className="space-y-1 text-[0.8125rem]" style={{ color: "var(--text-secondary)" }}>
            {teams.map((membership) => (
              <li key={membership.id} className="flex justify-between gap-3">
                <span>
                  {membership.team.name} · {membership.team.category}
                </span>
                <span style={{ color: "var(--text-muted)" }}>
                  {membership.accessLevel === "MANAGE"
                    ? t("settings.accessManage")
                    : t("settings.accessView")}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </>
  );
}

/**
 * Valeurs initiales du formulaire de coordonnees.
 *
 * Lecture separee de `AccountDetails`, dans sa propre frontiere Suspense : les
 * deux panneaux sont cote a cote, et une seule requete lente ne doit pas
 * retarder l'autre.
 */
async function ProfileFields({ userId, name }: { userId: string; name: string }) {
  const record = await prisma.user.findUnique({
    where: { id: userId },
    select: { phone: true, jobTitle: true },
  });

  return <ProfileForm name={name} phone={record?.phone ?? null} jobTitle={record?.jobTitle ?? null} />;
}

export default async function SettingsPage() {
  const [user, t, locale] = await Promise.all([requireUser(), getT(), getLocale()]);

  return (
    <>
      <PageHeader title={t("settings.title")} description={t("settings.subtitle")} />

      <div className="grid lg:grid-cols-2 gap-4">
        <Panel>
          <PanelHeader title={t("settings.account")} icon={<User size={16} />} />
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

        <div className="space-y-4">
          <Panel>
            <PanelHeader
              title={t("settings.language")}
              subtitle={t("settings.languageSubtitle")}
              icon={<Languages size={16} />}
            />
            <LanguageChoice current={locale} />
          </Panel>

          <Panel>
            <PanelHeader
              title={t("settings.profile")}
              subtitle={t("settings.profileSubtitle")}
              icon={<IdCard size={16} />}
            />
            <Suspense fallback={<Skeleton className="h-56 w-full" />}>
              <ProfileFields userId={user.id} name={user.name} />
            </Suspense>
          </Panel>

          <Panel>
            <PanelHeader
              title={t("settings.password")}
              subtitle={t("settings.passwordSubtitle")}
              icon={<KeyRound size={16} />}
            />
            <ChangePasswordForm />
          </Panel>
        </div>
      </div>
    </>
  );
}
