"use client";

interface DayEntry {
  regularHours: number;
  driveHours: number;
}

interface TotalsRowProps {
  dayEntries: DayEntry[];
  label?: string;
}

export function TotalsRow({ dayEntries, label = "Totals" }: TotalsRowProps) {
  const totalReg = dayEntries.reduce((sum, e) => sum + (e.regularHours || 0), 0);
  const totalDrive = dayEntries.reduce((sum, e) => sum + (e.driveHours || 0), 0);

  return (
    <tr className="bg-gray-50 font-semibold text-sm">
      <td className="sticky left-0 bg-gray-50 px-3 py-2 text-gray-700 whitespace-nowrap z-10">
        {label}
      </td>
      {dayEntries.map((entry, i) => {
        const dayTotal = (entry.regularHours || 0) + (entry.driveHours || 0);
        return (
          <td key={i} className="px-2 py-2 text-center">
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-gray-700">{entry.regularHours.toFixed(2)}</span>
              <span className="text-blue-600">{entry.driveHours.toFixed(2)}</span>
              {dayTotal > 0 && (
                <span className="text-xs text-gray-400">{dayTotal.toFixed(2)}</span>
              )}
            </div>
          </td>
        );
      })}
      <td className="px-3 py-2 text-center">
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-gray-700">{totalReg.toFixed(2)}</span>
          <span className="text-blue-600">{totalDrive.toFixed(2)}</span>
          <span className="text-xs text-gray-500 font-bold">
            {(totalReg + totalDrive).toFixed(2)}
          </span>
        </div>
      </td>
      <td className="px-3 py-2 text-center text-gray-500">
        {dayEntries.filter((e) => (e.regularHours || 0) + (e.driveHours || 0) > 0).length}
      </td>
    </tr>
  );
}
