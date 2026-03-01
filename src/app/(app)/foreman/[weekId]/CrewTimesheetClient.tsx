"use client";

import { format } from "date-fns";
import { TimesheetGrid } from "@/components/timesheet/TimesheetGrid";
import { MobileEmployeeCard } from "@/components/timesheet/MobileEmployeeCard";
import { Button } from "@/components/ui/Button";
import { useState, useTransition } from "react";

interface DayEntry {
  regularHours: number;
  driveHours: number;
  perDiem: boolean;
}

interface Employee {
  id: string;
  name: string;
}

interface CrewTimesheetClientProps {
  weekId: string;
  weekDays: string[];
  employees: Employee[];
  initialEntries: Record<string, DayEntry[]>;
  isClosed: boolean;
  canEdit: boolean;
  saveApiPath: string;
}

export function CrewTimesheetClient({
  weekId,
  weekDays,
  employees,
  initialEntries,
  isClosed,
  canEdit,
  saveApiPath,
}: CrewTimesheetClientProps) {
  const parsedDays = weekDays.map((d) => new Date(d));
  const [entries, setEntries] = useState(initialEntries);
  const [isPending, startTransition] = useTransition();
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSave = async (
    updatedEntries: Record<string, DayEntry[]>
  ) => {
    const flat = employees.flatMap((emp) =>
      parsedDays.map((day, i) => ({
        userId: emp.id,
        date: format(day, "yyyy-MM-dd"),
        regularHours: updatedEntries[emp.id]?.[i]?.regularHours ?? 0,
        driveHours: updatedEntries[emp.id]?.[i]?.driveHours ?? 0,
      }))
    );

    const res = await fetch(saveApiPath, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entries: flat }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error ?? "Save failed");
    }
  };

  return (
    <>
      {/* Desktop table */}
      <div className="hidden sm:block">
        <TimesheetGrid
          weekId={weekId}
          employees={employees}
          initialEntries={initialEntries}
          readOnly={!canEdit}
          onSave={canEdit ? handleSave : undefined}
          saveLabel="Save Crew Hours"
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
            dayEntries={entries[emp.id] ?? []}
            readOnly={!canEdit}
          />
        ))}
      </div>
    </>
  );
}
