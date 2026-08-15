import { AppShell, coachNavigation } from "@/components/shell/app-shell";
import { requireUser } from "@/lib/auth";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return (
    <AppShell user={user} sections={coachNavigation(user)}>
      {children}
    </AppShell>
  );
}
