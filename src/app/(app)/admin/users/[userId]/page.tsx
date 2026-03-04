import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { UserForm } from "@/components/admin/UserForm";
import { canManageUsers } from "@/lib/permissions";
import type { Role } from "@/types";

interface PageProps {
  params: { userId: string };
}

export default async function EditUserPage({ params }: PageProps) {
  const session = await auth();
  if (!session) redirect("/login");

  if (!canManageUsers(session.user.role as Role)) {
    redirect("/");
  }

  const user = await prisma.user.findUnique({
    where: { id: params.userId },
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

  if (!user) notFound();

  const initialValues = {
    name: user.name,
    email: user.email,
    role: user.role as Role,
    isActive: user.isActive,
    hourlyRate: Number(user.hourlyRate),
    driveRate: Number(user.driveRate),
    perDiemRate: Number(user.perDiemRate),
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Edit User</h1>
        <p className="text-sm text-gray-600">{user.name} — {user.email}</p>
      </div>
      <UserForm
        userId={user.id}
        initialValues={initialValues}
        mode="edit"
        canEditRole
        canEditRates
        canDeactivate={session.user.id !== user.id}
      />
    </div>
  );
}
