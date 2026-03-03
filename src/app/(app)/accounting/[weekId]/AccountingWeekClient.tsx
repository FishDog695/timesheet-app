"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { TimesheetGrid } from "@/components/timesheet/TimesheetGrid";
import { MobileEmployeeCard } from "@/components/timesheet/MobileEmployeeCard";
import { Button } from "@/components/ui/Button";
import { DAY_LABELS } from "@/lib/date-utils";

interface DayEntry {
  regularHours: number;
  driveHours: number;
  perDiem: boolean;
}

interface Employee {
  id: string;
  name: string;
}

interface AccountingWeekClientProps {
  weekId: string;
  weekDays: string[];
  employees: Employee[];
  initialEntries: Record<string, DayEntry[]>;
  isClosed: boolean;
}

export function AccountingWeekClient({
  weekId,
  weekDays,
  employees,
  initialEntries,
  isClosed,
}: AccountingWeekClientProps) {
  const router = useRouter();
  const parsedDays = weekDays.map((d) => new Date(d));
  const [isTogglingClose, startToggle] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);

  const handleSave = async (entries: Record<string, DayEntry[]>) => {
    const flat = employees.flatMap((emp) =>
      parsedDays.map((day, i) => ({
        userId: emp.id,
        date: format(day, "yyyy-MM-dd"),
        regularHours: entries[emp.id]?.[i]?.regularHours ?? 0,
        driveHours: entries[emp.id]?.[i]?.driveHours ?? 0,
      }))
    );

    const res = await fetch(`/api/weeks/${weekId}/entries`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entries: flat }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error ?? "Save failed");
    }
  };

  const handleExport = (entries: Record<string, DayEntry[]>) => {
    const headers = ["Employee"];
    parsedDays.forEach((day, i) => {
      const label = `${DAY_LABELS[i]} ${format(day, "M/d")}`;
      headers.push(`${label} Reg`, `${label} Drive`);
    });
    headers.push("Total Reg", "Total Drive", "Per Diem Days");

    const rows = employees.map((emp) => {
      const empEntries = entries[emp.id] ?? [];
      const row: (string | number)[] = [emp.name];
      let totalReg = 0, totalDrive = 0, perDiemDays = 0;
      empEntries.forEach((entry) => {
        row.push(entry.regularHours, entry.driveHours);
        totalReg += entry.regularHours;
        totalDrive += entry.driveHours;
        if ((entry.regularHours + entry.driveHours) > 0) perDiemDays++;
      });
      row.push(totalReg, totalDrive, perDiemDays);
      return row;
    });

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `timesheet-${weekId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleToggleClose = () => {
    setActionError(null);
    startToggle(async () => {
      try {
        const res = await fetch(`/api/weeks/${weekId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isClosed: !isClosed }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error ?? "Action failed");
        }

        router.refresh();
      } catch (err) {
        setActionError(err instanceof Error ? err.message : "Action failed");
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Close/Open week action */}
      <div className="flex items-center gap-4">
        <Button
          variant={isClosed ? "secondary" : "danger"}
          onClick={handleToggleClose}
          loading={isTogglingClose}
        >
          {isClosed ? "Reopen Week" : "Close Week"}
        </Button>
        {actionError && (
          <span className="text-sm text-red-600">{actionError}</span>
        )}
        {!isClosed && (
          <span className="text-sm text-gray-500">
            Closing prevents employees and foremen from editing hours.
          </span>
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block">
        <TimesheetGrid
          weekId={weekId}
          employees={employees}
          initialEntries={initialEntries}
          readOnly={false}
          onSave={handleSave}
          saveLabel="Save Timesheet"
          onExport={handleExport}
        />
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden space-y-3">
        {employees.map((emp) => (
          <MobileEmployeeCard
            key={emp.id}
            employeeId={emp.id}
            employeeName={emp.name}
            weekDays={parsedDays}
            dayEntries={initialEntries[emp.id] ?? []}
            readOnly={false}
          />
        ))}
      </div>
    </div>
  );
}
