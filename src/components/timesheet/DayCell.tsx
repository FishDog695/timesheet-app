"use client";

interface DayCellEntry {
  regularHours: number;
  driveHours: number;
}

interface DayCellProps {
  entry: DayCellEntry;
  onChange: (field: "regularHours" | "driveHours", value: number) => void;
  readOnly?: boolean;
}

export function DayCell({ entry, onChange, readOnly = false }: DayCellProps) {
  const handleChange = (
    field: "regularHours" | "driveHours",
    raw: string
  ) => {
    const value = parseFloat(raw);
    if (!isNaN(value) && value >= 0 && value <= 24) {
      onChange(field, value);
    } else if (raw === "" || raw === ".") {
      onChange(field, 0);
    }
  };

  const inputClass =
    "w-14 text-center text-sm rounded border-gray-300 focus:border-blue-500 focus:ring-blue-500 py-1 px-1 disabled:bg-gray-100 disabled:text-gray-400";

  return (
    <div className="flex flex-col gap-0.5 items-center">
      <input
        type="number"
        inputMode="decimal"
        min="0"
        max="24"
        step="0.25"
        value={entry.regularHours || ""}
        placeholder="0"
        disabled={readOnly}
        onChange={(e) => handleChange("regularHours", e.target.value)}
        className={inputClass}
        aria-label="Regular hours"
      />
      <input
        type="number"
        inputMode="decimal"
        min="0"
        max="24"
        step="0.25"
        value={entry.driveHours || ""}
        placeholder="0"
        disabled={readOnly}
        onChange={(e) => handleChange("driveHours", e.target.value)}
        className={`${inputClass} text-blue-700`}
        aria-label="Drive hours"
      />
    </div>
  );
}
