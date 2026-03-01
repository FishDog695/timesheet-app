import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { MobileNav } from "./MobileNav";
import type { Role } from "@/types";

interface AppShellProps {
  children: React.ReactNode;
  userRole: Role;
  userName: string;
  weekLabel?: string;
}

export function AppShell({
  children,
  userRole,
  userName,
  weekLabel,
}: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar userRole={userRole} userName={userName} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header weekLabel={weekLabel} userName={userName} />
        <main className="flex-1 p-4 lg:p-6 pb-20 lg:pb-6">{children}</main>
      </div>

      <MobileNav userRole={userRole} />
    </div>
  );
}
