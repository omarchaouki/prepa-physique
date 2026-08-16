"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, UserPlus } from "lucide-react";

import { addTeamMemberAction } from "@/app/actions/squad";
import type { ActionState } from "@/app/actions/auth";
import { useT } from "@/lib/i18n/client";

function SubmitButton() {
  const t = useT();
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-secondary shrink-0" disabled={pending}>
      {pending ? (
        <Loader2 size={15} className="animate-spin" aria-hidden="true" />
      ) : (
        <UserPlus size={15} aria-hidden="true" />
      )}
      {t("manage.addStaff")}
    </button>
  );
}

export function AddStaffForm({
  teamId,
  users,
}: {
  teamId: string;
  users: Array<{ id: string; name: string; email: string }>;
}) {
  const t = useT();
  const [state, formAction] = useActionState<ActionState, FormData>(addTeamMemberAction, {});

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="teamId" value={teamId} />

      {state.error ? (
        <div
          className="rounded-lg px-3 py-2 text-[0.8125rem]"
          style={{ background: "var(--danger-soft)", color: "var(--danger)" }}
          role="alert"
        >
          {state.error}
        </div>
      ) : null}
      {state.success ? (
        <div
          className="rounded-lg px-3 py-2 text-[0.8125rem]"
          style={{ background: "var(--success-soft)", color: "var(--success)" }}
          role="status"
        >
          {state.success}
        </div>
      ) : null}

      <div className="flex flex-wrap items-end gap-2">
        <div className="flex-1 min-w-[10rem]">
          <label className="label" htmlFor="staff-user">
            {t("admin.user")}
          </label>
          <select id="staff-user" name="userId" required className="field cursor-pointer">
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} · {user.email}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="staff-access">
            {t("manage.accessLevel")}
          </label>
          <select
            id="staff-access"
            name="accessLevel"
            defaultValue="MANAGE"
            className="field cursor-pointer"
            style={{ width: "auto" }}
          >
            <option value="MANAGE">{t("settings.accessManage")}</option>
            <option value="VIEW">{t("settings.accessView")}</option>
          </select>
        </div>
        <SubmitButton />
      </div>
    </form>
  );
}
