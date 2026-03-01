"use client";

import { useState } from "react";
import { format } from "date-fns";
import { DayEntryModal } from "./DayEntryModal";
import { DAY_LABELS } from "@/lib/date-utils";

interface DayEntry {
  regularHours: number;
  driveHours: number;
  perDiem: boolean;
}

interface MobileEmployeeCardProps {
  employeeId: string;
  employeeName: string;
  weekDays: Date[];
  dayEntries: DayEntry[];
  onChange?: (
    employeeId: string,
    dayIndex: number,
    field: "regularHours" | "driveHours",
    value: number
  ) => void;
  readOnly?: boolean;
}

export function MobileEmployeeCard({
  employeeId,
  employeeName,
  weekDays,
  dayEntries,
  onChange,
  readOnly = false,
}: MobileEmployeeCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const totalReg = dayEntries.reduce((sum, e) => sum + (e.regularHours || 0), 0);
  const totalDrive = dayEntries.reduce((sum, e) => sum + (e.driveHours || 0), 0);
  const perDiemDays = dayEntries.filter(
    (e) => (e.regularHours || 0) + (e.driveHours || 0) > 0
  ).length;

  const handleModalSave = (dayIndex: number, reg: number, drive: number) => {
    if (!onChange) return;
    onChange(employeeId, dayIndex, "regularHours", reg);
    onChange(employeeId, dayIndex, "driveHours", drive);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <button
        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div>
          <p className="font-semibold text-gray-900">{employeeName}</p>
          <p className="text-sm text-gray-500">
            {totalReg.toFixed(1)}h reg + {totalDrive.toFixed(1)}h drive
            {perDiemDays > 0 && ` · ${perDiemDays}d per diem`}
          </p>
        </div>
        <svg
          className={`h-5 w-5 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded day list */}
      {isExpanded && (
        <div className="border-t border-gray-100">
          {weekDays.map((day, dayIndex) => {
            const entry = dayEntries[dayIndex];
            const hasHours =
              (entry?.regularHours || 0) + (entry?.driveHours || 0) > 0;
            return (
              <button
                key={dayIndex}
                className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 ${
                  readOnly ? "cursor-default" : "cursor-pointer"
                }`}
                onClick={() => !readOnly && setSelectedDay(dayIndex)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12">
                    <p className="text-sm font-medium text-gray-700">
                      {DAY_LABELS[dayIndex]}
                    </p>
                    <p className="text-xs text-gray-400">{format(day, "M/d")}</p>
                  </div>
                  {hasHours ? (
                    <div className="flex gap-3 text-sm">
                      <span className="text-gray-700">
                        {(entry?.regularHours || 0).toFixed(2)}h reg
                      </span>
                      {(entry?.driveHours || 0) > 0 && (
                        <span className="text-blue-600">
                          {(entry?.driveHours || 0).toFixed(2)}h drive
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">No hours</span>
                  )}
                </div>
                {!readOnly && (
                  <svg
                    className="h-4 w-4 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Day Entry Modal */}
      {selectedDay !== null && (
        <DayEntryModal
          isOpen={true}
          onClose={() => setSelectedDay(null)}
          date={weekDays[selectedDay]}
          regularHours={dayEntries[selectedDay]?.regularHours || 0}
          driveHours={dayEntries[selectedDay]?.driveHours || 0}
          onSave={(reg, drive) => handleModalSave(selectedDay, reg, drive)}
          readOnly={readOnly}
        />
      )}
    </div>
  );
}
