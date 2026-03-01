import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { getCurrentWeekId, formatWeekRange } from "@/lib/date-utils";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const weekId = getCurrentWeekId();
  const weekLabel = formatWeekRange(weekId);

  return (
    <AppShell
      userRole={session.user.role}
      userName={session.user.name ?? session.user.email ?? "User"}
      weekLabel={weekLabel}
    >
      {children}
    </AppShell>
  );
}
