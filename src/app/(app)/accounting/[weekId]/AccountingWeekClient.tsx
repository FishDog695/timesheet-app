"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { TimesheetGrid } from "@/components/timesheet/TimesheetGrid";
import { MobileEmployeeCard } from "@/components/timesheet/MobileEmployeeCard";
import { Button } from "@/components/ui/Button";
import { DAY_LABELS } from "@/lib/date-utils";
import { calculateEmployeePayroll } from "@/lib/payroll";
import { PayrollTable } from "./PayrollTable";

interface DayEntry {
  regularHours: number;
  driveHours: number;
  perDiem: boolean;
}

interface Employee {
  id: string;
  name: string;
  hourlyRate: number;
  driveRate: number;
  perDiemRate: number;
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
  const [activeTab, setActiveTab] = useState<"timesheet" | "payroll">("timesheet");

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

  const handleExportTimesheet = (entries: Record<string, DayEntry[]>) => {
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

  const handleExportPayroll = () => {
    const headers = [
      "Employee",
      "Reg Hours", "Drive Hours", "Total Hours", "OT Hours",
      "Hourly Rate", "Drive Rate",
      "Reg Pay", "Drive Pay", "OT Pay",
      "Per Diem Days", "Per Diem Rate", "Per Diem Total",
      "Total Gross Pay",
    ];

    const rows = employees
      .map((emp) => {
        const entries = initialEntries[emp.id] ?? [];
        const r = calculateEmployeePayroll(entries, {
          hourlyRate: emp.hourlyRate,
          driveRate: emp.driveRate,
          perDiemRate: emp.perDiemRate,
        });
        if (r.totalHours === 0) return null;
        return [
          emp.name,
          r.totalRegHours.toFixed(2),
          r.totalDriveHours.toFixed(2),
          r.totalHours.toFixed(2),
          r.overtimeHours.toFixed(2),
          emp.hourlyRate.toFixed(2),
          emp.driveRate.toFixed(2),
          r.regularPay.toFixed(2),
          r.drivePay.toFixed(2),
          r.overtimePay.toFixed(2),
          r.perDiemDays,
          emp.perDiemRate.toFixed(2),
          r.perDiemTotal.toFixed(2),
          r.totalGrossPay.toFixed(2),
        ];
      })
      .filter(Boolean) as (string | number)[][];

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payroll-${weekId}.csv`;
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
      {/* Close/Open week action — hidden when printing */}
      <div className="flex items-center gap-4" data-no-print>
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

      {/* Tab bar — hidden when printing */}
      <div className="flex items-center gap-1 border-b border-gray-200" data-no-print>
        <button
          onClick={() => setActiveTab("timesheet")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "timesheet"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Timesheet
        </button>
        <button
          onClick={() => isClosed && setActiveTab("payroll")}
          disabled={!isClosed}
          title={!isClosed ? "Close the week to generate payroll" : undefined}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "payroll"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          } disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          Payroll
          {!isClosed && (
            <span className="ml-1.5 text-xs text-gray-400">(close week first)</span>
          )}
        </button>
      </div>

      {/* Payroll tab action buttons — hidden when printing */}
      {activeTab === "payroll" && isClosed && (
        <div className="flex items-center gap-3" data-no-print>
          <Button variant="secondary" onClick={handleExportPayroll}>
            Export Payroll CSV
          </Button>
          <Button variant="secondary" onClick={() => window.print()}>
            Print Report
          </Button>
        </div>
      )}

      {/* Timesheet tab */}
      {activeTab === "timesheet" && (
        <>
          {/* Desktop table */}
          <div className="hidden sm:block">
            <TimesheetGrid
              weekId={weekId}
              employees={employees}
              initialEntries={initialEntries}
              readOnly={false}
              onSave={handleSave}
              saveLabel="Save Timesheet"
              onExport={handleExportTimesheet}
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
        </>
      )}

      {/* Payroll tab */}
      {activeTab === "payroll" && isClosed && (
        <PayrollTable
          weekId={weekId}
          employees={employees}
          entriesMap={initialEntries}
        />
      )}
    </div>
  );
}
