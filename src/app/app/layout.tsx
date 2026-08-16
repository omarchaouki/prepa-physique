import { AppShell, coachNavigation } from "@/components/shell/app-shell";
import { requireUser } from "@/lib/auth";
import { getT } from "@/lib/i18n/server";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const [user, t] = await Promise.all([requireUser(), getT()]);
  return (
    <AppShell user={user} sections={coachNavigation(user, t)}>
      {children}
    </AppShell>
  );
}
