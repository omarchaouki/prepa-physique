"use client";

import { LogOut, Undo2 } from "lucide-react";
import { logoutAction, stopImpersonationAction } from "@/app/actions/auth";

export function LogoutButton({ label }: { label: string }) {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className="grid place-items-center size-7 rounded-md cursor-pointer transition-colors"
        style={{ color: "var(--text-muted)" }}
        aria-label={label}
        title={label}
      >
        <LogOut size={15} aria-hidden="true" />
      </button>
    </form>
  );
}

export function StopImpersonationBar({
  ownerEmail,
  message,
  traced,
  back,
}: {
  ownerEmail: string;
  message: string;
  traced: string;
  back: string;
}) {
  return (
    <div
      className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 text-sm"
      style={{ background: "var(--warning-soft)", color: "var(--warning)" }}
      role="status"
    >
      <span>
        {message} ({ownerEmail}). {traced}
      </span>
      <form action={stopImpersonationAction}>
        <button
          type="submit"
          className="btn btn-secondary"
          style={{ minHeight: "2rem", padding: "0.25rem 0.75rem" }}
        >
          <Undo2 size={14} aria-hidden="true" />
          {back}
        </button>
      </form>
    </div>
  );
}
