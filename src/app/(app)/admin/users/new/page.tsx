import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { UserForm } from "@/components/admin/UserForm";

export default async function NewUserPage() {
  const session = await auth();
  if (!session) redirect("/login");

  if (session.user.role !== "ADMINISTRATOR") {
    redirect("/");
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Create User</h1>
        <p className="text-sm text-gray-600">Add a new employee to the system</p>
      </div>
      <UserForm
        mode="create"
        canEditRole
        canEditRates
      />
    </div>
  );
}
