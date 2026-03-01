import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { UserTable } from "@/components/admin/UserTable";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import type { Role } from "@/types";

export default async function AdminPage() {
  const session = await auth();
  if (!session) redirect("/login");

  if (session.user.role !== "ADMINISTRATOR") {
    redirect("/");
  }

  const users = await prisma.user.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      hourlyRate: true,
      driveRate: true,
      perDiemRate: true,
    },
  });

  const serialized = users.map((u) => ({
    ...u,
    role: u.role as Role,
    hourlyRate: u.hourlyRate.toString(),
    driveRate: u.driveRate.toString(),
    perDiemRate: u.perDiemRate.toString(),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold text-gray-900">User Management</h1>
        <div className="flex gap-2">
          <Link href="/admin/weeks">
            <Button variant="secondary" size="sm">
              Manage Weeks
            </Button>
          </Link>
          <Link href="/admin/users/new">
            <Button size="sm">Add User</Button>
          </Link>
        </div>
      </div>

      <UserTable users={serialized} showRates />
    </div>
  );
}
