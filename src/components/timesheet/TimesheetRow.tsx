"use client";

import { DayCell } from "./DayCell";

interface DayEntry {
  regularHours: number;
  driveHours: number;
  perDiem: boolean;
}

interface TimesheetRowProps {
  employeeId: string;
  employeeName: string;
  dayEntries: DayEntry[];
  onChange: (
    employeeId: string,
    dayIndex: number,
    field: "regularHours" | "driveHours",
    value: number
  ) => void;
  readOnly?: boolean;
}

export function TimesheetRow({
  employeeId,
  employeeName,
  dayEntries,
  onChange,
  readOnly = false,
}: TimesheetRowProps) {
  const totalReg = dayEntries.reduce((sum, e) => sum + (e.regularHours || 0), 0);
  const totalDrive = dayEntries.reduce((sum, e) => sum + (e.driveHours || 0), 0);
  const perDiemDays = dayEntries.filter(
    (e) => (e.regularHours || 0) + (e.driveHours || 0) > 0
  ).length;

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <td className="sticky left-0 bg-white hover:bg-gray-50 px-3 py-2 whitespace-nowrap z-10 transition-colors">
        <span className="text-sm font-medium text-gray-900">{employeeName}</span>
      </td>
      {dayEntries.map((entry, dayIndex) => (
        <td key={dayIndex} className="px-1 py-1">
          <DayCell
            entry={entry}
            onChange={(field, value) => onChange(employeeId, dayIndex, field, value)}
            readOnly={readOnly}
          />
        </td>
      ))}
      <td className="px-3 py-2 text-center">
        <div className="flex flex-col items-center">
          <span className="text-sm font-semibold text-gray-900">
            {totalReg.toFixed(2)}
          </span>
          <span className="text-xs text-blue-600">{totalDrive.toFixed(2)}</span>
          <span className="text-xs text-gray-400">
            {(totalReg + totalDrive).toFixed(2)}
          </span>
        </div>
      </td>
      <td className="px-3 py-2 text-center">
        <span className="text-sm text-gray-700">{perDiemDays}</span>
      </td>
    </tr>
  );
}
