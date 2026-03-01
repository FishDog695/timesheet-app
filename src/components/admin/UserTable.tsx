"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import type { Role } from "@/types";

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  hourlyRate: string | number;
  driveRate: string | number;
  perDiemRate: string | number;
}

interface UserTableProps {
  users: User[];
  showRates?: boolean;
}

const roleColors: Record<Role, "default" | "info" | "warning" | "danger" | "success"> = {
  ADMINISTRATOR: "danger",
  FOREMAN: "warning",
  EMPLOYEE: "default",
  ACCOUNTING: "info",
};

export function UserTable({ users, showRates = false }: UserTableProps) {
  if (users.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No users found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Name</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Email</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Role</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
            {showRates && (
              <>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">Hourly</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">Drive</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">Per Diem</th>
              </>
            )}
            <th className="px-4 py-3 text-right font-semibold text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 font-medium text-gray-900">{user.name}</td>
              <td className="px-4 py-3 text-gray-600">{user.email}</td>
              <td className="px-4 py-3">
                <Badge variant={roleColors[user.role]}>{user.role}</Badge>
              </td>
              <td className="px-4 py-3">
                <Badge variant={user.isActive ? "success" : "danger"}>
                  {user.isActive ? "Active" : "Inactive"}
                </Badge>
              </td>
              {showRates && (
                <>
                  <td className="px-4 py-3 text-right text-gray-700">
                    ${Number(user.hourlyRate).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700">
                    ${Number(user.driveRate).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700">
                    ${Number(user.perDiemRate).toFixed(2)}
                  </td>
                </>
              )}
              <td className="px-4 py-3 text-right">
                <Link
                  href={`/admin/users/${user.id}`}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Edit
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
