"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import { TimesheetRow } from "./TimesheetRow";
import { TotalsRow } from "./TotalsRow";
import { Button } from "@/components/ui/Button";
import { DAY_LABELS, getWeekDays } from "@/lib/date-utils";

interface Employee {
  id: string;
  name: string;
}

interface EntryData {
  regularHours: number;
  driveHours: number;
  perDiem: boolean;
}

// entries[userId][dayIndex] = EntryData
type EntriesMap = Record<string, EntryData[]>;

interface TimesheetGridProps {
  weekId: string;
  employees: Employee[];
  initialEntries: EntriesMap;
  readOnly?: boolean;
  onSave?: (entries: EntriesMap) => Promise<void>;
  saveLabel?: string;
}

function buildDefaultEntries(employees: Employee[]): EntriesMap {
  return Object.fromEntries(
    employees.map((emp) => [
      emp.id,
      Array.from({ length: 7 }, () => ({
        regularHours: 0,
        driveHours: 0,
        perDiem: false,
      })),
    ])
  );
}

export function TimesheetGrid({
  weekId,
  employees,
  initialEntries,
  readOnly = false,
  onSave,
  saveLabel = "Save Timesheet",
}: TimesheetGridProps) {
  const weekDays = getWeekDays(weekId);
  const defaultEntries = buildDefaultEntries(employees);

  // Merge initial entries into defaults
  const merged: EntriesMap = { ...defaultEntries };
  for (const [userId, days] of Object.entries(initialEntries)) {
    if (merged[userId]) {
      merged[userId] = days;
    }
  }

  const [entries, setEntries] = useState<EntriesMap>(merged);
  const [isPending, startTransition] = useTransition();
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleChange = (
    userId: string,
    dayIndex: number,
    field: "regularHours" | "driveHours",
    value: number
  ) => {
    setEntries((prev) => {
      const userEntries = [...(prev[userId] ?? [])];
      userEntries[dayIndex] = { ...userEntries[dayIndex], [field]: value };
      // Update perDiem
      const total =
        (field === "regularHours" ? value : userEntries[dayIndex].regularHours) +
        (field === "driveHours" ? value : userEntries[dayIndex].driveHours);
      userEntries[dayIndex].perDiem = total > 0;
      return { ...prev, [userId]: userEntries };
    });
    setSaveSuccess(false);
  };

  const handleSave = () => {
    if (!onSave) return;
    setSaveError(null);
    setSaveSuccess(false);
    startTransition(async () => {
      try {
        await onSave(entries);
        setSaveSuccess(true);
      } catch (err) {
        setSaveError(err instanceof Error ? err.message : "Save failed");
      }
    });
  };

  // Compute column totals
  const columnTotals: EntryData[] = Array.from({ length: 7 }, (_, dayIndex) => ({
    regularHours: employees.reduce(
      (sum, emp) => sum + (entries[emp.id]?.[dayIndex]?.regularHours ?? 0),
      0
    ),
    driveHours: employees.reduce(
      (sum, emp) => sum + (entries[emp.id]?.[dayIndex]?.driveHours ?? 0),
      0
    ),
    perDiem: false,
  }));

  return (
    <div className="space-y-4">
      {/* Scrollable table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="min-w-[900px] w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="sticky left-0 bg-gray-50 px-3 py-3 text-left font-semibold text-gray-700 whitespace-nowrap z-10">
                Employee
              </th>
              {weekDays.map((day, i) => (
                <th
                  key={i}
                  className="px-2 py-3 text-center font-semibold text-gray-700 min-w-[80px]"
                >
                  <div>{DAY_LABELS[i]}</div>
                  <div className="text-xs font-normal text-gray-500">
                    {format(day, "M/d")}
                  </div>
                  <div className="text-xs font-normal text-gray-400 mt-0.5">
                    Reg/Drive
                  </div>
                </th>
              ))}
              <th className="px-3 py-3 text-center font-semibold text-gray-700 whitespace-nowrap">
                Total
                <div className="text-xs font-normal text-gray-400">Reg/Drive/All</div>
              </th>
              <th className="px-3 py-3 text-center font-semibold text-gray-700 whitespace-nowrap">
                Per Diem
                <div className="text-xs font-normal text-gray-400">Days</div>
              </th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <TimesheetRow
                key={emp.id}
                employeeId={emp.id}
                employeeName={emp.name}
                dayEntries={entries[emp.id] ?? defaultEntries[emp.id]}
                onChange={handleChange}
                readOnly={readOnly}
              />
            ))}
            <TotalsRow dayEntries={columnTotals} label="Week Totals" />
          </tbody>
        </table>
      </div>

      {/* Save controls */}
      {!readOnly && onSave && (
        <div className="flex items-center gap-4">
          <Button onClick={handleSave} disabled={isPending} loading={isPending}>
            {saveLabel}
          </Button>
          {saveSuccess && (
            <span className="text-sm text-green-600">Saved successfully!</span>
          )}
          {saveError && (
            <span className="text-sm text-red-600">{saveError}</span>
          )}
        </div>
      )}
    </div>
  );
}
