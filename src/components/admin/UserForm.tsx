"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import type { Role } from "@/types";

interface UserFormValues {
  name: string;
  email: string;
  password?: string;
  role: Role;
  isActive: boolean;
  hourlyRate: number;
  driveRate: number;
  perDiemRate: number;
}

interface UserFormProps {
  userId?: string;
  initialValues?: Partial<UserFormValues>;
  mode: "create" | "edit";
  canEditRole?: boolean;
  canEditRates?: boolean;
  canDeactivate?: boolean;
}

const roleOptions = [
  { value: "EMPLOYEE", label: "Employee" },
  { value: "FOREMAN", label: "Foreman" },
  { value: "ACCOUNTING", label: "Accounting" },
  { value: "ADMINISTRATOR", label: "Administrator" },
];

export function UserForm({
  userId,
  initialValues = {},
  mode,
  canEditRole = true,
  canEditRates = true,
  canDeactivate = false,
}: UserFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [values, setValues] = useState<UserFormValues>({
    name: initialValues.name ?? "",
    email: initialValues.email ?? "",
    password: "",
    role: initialValues.role ?? "EMPLOYEE",
    isActive: initialValues.isActive ?? true,
    hourlyRate: initialValues.hourlyRate ?? 0,
    driveRate: initialValues.driveRate ?? 0,
    perDiemRate: initialValues.perDiemRate ?? 0,
  });

  const set = (field: keyof UserFormValues, value: unknown) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        const payload: Record<string, unknown> = {
          name: values.name,
          email: values.email,
          role: values.role,
          isActive: values.isActive,
          hourlyRate: values.hourlyRate,
          driveRate: values.driveRate,
          perDiemRate: values.perDiemRate,
        };

        if (mode === "create") {
          payload.password = values.password;
        } else if (values.password) {
          payload.password = values.password;
        }

        const url =
          mode === "create" ? "/api/users" : `/api/users/${userId}`;
        const method = mode === "create" ? "POST" : "PATCH";

        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error ?? "Request failed");
        }

        router.push("/admin");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      }
    });
  };

  const handleDelete = () => {
    if (!userId) return;
    if (!confirm("Deactivate this user? They will no longer be able to log in.")) return;

    startTransition(async () => {
      try {
        const res = await fetch(`/api/users/${userId}`, { method: "DELETE" });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error ?? "Delete failed");
        }
        router.push("/admin");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
      <div className="grid grid-cols-1 gap-4">
        <Input
          label="Full Name"
          id="name"
          value={values.name}
          onChange={(e) => set("name", e.target.value)}
          required
        />
        <Input
          label="Email"
          id="email"
          type="email"
          value={values.email}
          onChange={(e) => set("email", e.target.value)}
          required
        />
        <Input
          label={mode === "create" ? "Password" : "New Password (leave blank to keep current)"}
          id="password"
          type="password"
          value={values.password}
          onChange={(e) => set("password", e.target.value)}
          required={mode === "create"}
          minLength={8}
          placeholder={mode === "edit" ? "Leave blank to keep current" : undefined}
        />
      </div>

      {canEditRole && (
        <Select
          label="Role"
          id="role"
          value={values.role}
          onChange={(e) => set("role", e.target.value as Role)}
          options={roleOptions}
        />
      )}

      {canEditRates && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 border-b pb-1">
            Pay Rates
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Hourly Rate ($)"
              id="hourlyRate"
              type="number"
              min="0"
              step="0.01"
              value={values.hourlyRate}
              onChange={(e) => set("hourlyRate", parseFloat(e.target.value) || 0)}
            />
            <Input
              label="Drive Rate ($)"
              id="driveRate"
              type="number"
              min="0"
              step="0.01"
              value={values.driveRate}
              onChange={(e) => set("driveRate", parseFloat(e.target.value) || 0)}
            />
            <Input
              label="Per Diem ($)"
              id="perDiemRate"
              type="number"
              min="0"
              step="0.01"
              value={values.perDiemRate}
              onChange={(e) => set("perDiemRate", parseFloat(e.target.value) || 0)}
            />
          </div>
        </div>
      )}

      {mode === "edit" && (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isActive"
            checked={values.isActive}
            onChange={(e) => set("isActive", e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="isActive" className="text-sm text-gray-700">
            Active (uncheck to deactivate user)
          </label>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" loading={isPending}>
          {mode === "create" ? "Create User" : "Save Changes"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.back()}
          disabled={isPending}
        >
          Cancel
        </Button>
        {canDeactivate && mode === "edit" && (
          <Button
            type="button"
            variant="danger"
            onClick={handleDelete}
            disabled={isPending}
            className="ml-auto"
          >
            Deactivate
          </Button>
        )}
      </div>
    </form>
  );
}
