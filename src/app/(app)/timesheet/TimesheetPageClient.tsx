"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import { TimesheetGrid } from "@/components/timesheet/TimesheetGrid";
import { MobileEmployeeCard } from "@/components/timesheet/MobileEmployeeCard";
import { Button } from "@/components/ui/Button";

interface DayEntry {
  regularHours: number;
  driveHours: number;
  perDiem: boolean;
}

interface TimesheetPageClientProps {
  weekId: string;
  weekDays: string[]; // ISO strings
  userId: string;
  userName: string;
  dayEntries: DayEntry[];
  isClosed: boolean;
}

export function TimesheetPageClient({
  weekId,
  weekDays,
  userId,
  userName,
  dayEntries: initialDayEntries,
  isClosed,
}: TimesheetPageClientProps) {
  const parsedDays = weekDays.map((d) => new Date(d));
  const [dayEntries, setDayEntries] = useState(initialDayEntries);

  const handleMobileChange = (
    _userId: string,
    dayIndex: number,
    field: "regularHours" | "driveHours",
    value: number
  ) => {
    setDayEntries((prev) => {
      const updated = [...prev];
      updated[dayIndex] = { ...updated[dayIndex], [field]: value };
      const total =
        (field === "regularHours" ? value : updated[dayIndex].regularHours) +
        (field === "driveHours" ? value : updated[dayIndex].driveHours);
      updated[dayIndex].perDiem = total > 0;
      return updated;
    });
  };

  const handleSave = async (
    entries: Record<string, { regularHours: number; driveHours: number; perDiem: boolean }[]>
  ) => {
    const flat = parsedDays.map((day, i) => ({
      date: format(day, "yyyy-MM-dd"),
      regularHours: entries[userId]?.[i]?.regularHours ?? 0,
      driveHours: entries[userId]?.[i]?.driveHours ?? 0,
    }));

    const res = await fetch("/api/me/entries", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weekId, entries: flat }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error ?? "Save failed");
    }
  };

  const [isPending, startTransition] = useTransition();
  const [mobileSaveError, setMobileSaveError] = useState<string | null>(null);
  const [mobileSaveSuccess, setMobileSaveSuccess] = useState(false);

  const handleMobileSave = () => {
    setMobileSaveError(null);
    setMobileSaveSuccess(false);
    startTransition(async () => {
      try {
        const flat = parsedDays.map((day, i) => ({
          date: format(day, "yyyy-MM-dd"),
          regularHours: dayEntries[i]?.regularHours ?? 0,
          driveHours: dayEntries[i]?.driveHours ?? 0,
        }));
        const res = await fetch("/api/me/entries", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ weekId, entries: flat }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error ?? "Save failed");
        }
        setMobileSaveSuccess(true);
      } catch (err) {
        setMobileSaveError(err instanceof Error ? err.message : "Save failed");
      }
    });
  };

  const entriesMap = { [userId]: dayEntries };
  const employees = [{ id: userId, name: userName }];

  return (
    <>
      {/* Desktop table */}
      <div className="hidden sm:block">
        <TimesheetGrid
          weekId={weekId}
          employees={employees}
          initialEntries={entriesMap}
          readOnly={isClosed}
          saveLabel="Save My Hours"
          onSave={isClosed ? undefined : handleSave}
        />
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden space-y-3">
        <MobileEmployeeCard
          employeeId={userId}
          employeeName={userName}
          weekDays={parsedDays}
          dayEntries={dayEntries}
          onChange={isClosed ? undefined : handleMobileChange}
          readOnly={isClosed}
        />
        {!isClosed && (
          <div className="space-y-2">
            <p className="text-sm text-gray-500 text-center">
              Tap a day to enter hours
            </p>
            <Button
              className="w-full"
              onClick={handleMobileSave}
              loading={isPending}
            >
              Save My Hours
            </Button>
            {mobileSaveSuccess && (
              <p className="text-sm text-green-600 text-center">Saved!</p>
            )}
            {mobileSaveError && (
              <p className="text-sm text-red-600 text-center">{mobileSaveError}</p>
            )}
          </div>
        )}
      </div>
    </>
  );
}
