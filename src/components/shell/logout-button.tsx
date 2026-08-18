"use client";

import { useTransition } from "react";
import { LogOut, Undo2 } from "lucide-react";
import { logoutAction, stopImpersonationAction } from "@/app/actions/auth";
import { useOffline } from "@/lib/offline/provider";
import { clearOnLogout } from "@/lib/offline/store";

/**
 * Deconnexion.
 *
 * Avant de partir, on tente d'envoyer ce qui reste en file puis on efface les
 * traces locales : les pages en cache et les brouillons contiennent des mesures
 * de joueurs. Voir `clearOnLogout` pour ce qui est volontairement conserve.
 */
export function LogoutButton({ label }: { label: string }) {
  const { flush } = useOffline();
  const [pending, startTransition] = useTransition();

  const signOut = () => {
    startTransition(async () => {
      try {
        await flush();
      } catch {
        // Une file qui ne part pas ne doit pas empecher de se deconnecter.
      }
      await clearOnLogout();
      await logoutAction();
    });
  };

  return (
    <button
      type="button"
      onClick={signOut}
      disabled={pending}
      className="grid place-items-center size-7 rounded-md cursor-pointer transition-colors disabled:opacity-50"
      style={{ color: "var(--text-muted)" }}
      aria-label={label}
      title={label}
    >
      <LogOut size={15} aria-hidden="true" />
    </button>
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
