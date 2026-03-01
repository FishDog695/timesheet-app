"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface WeekRow {
  id: string;
  isClosed: boolean;
  label: string;
  isCurrentWeek: boolean;
}

export function WeekManagementClient({ weeks }: { weeks: WeekRow[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleToggle = (weekId: string, currentlyClosed: boolean) => {
    setError(null);
    setPendingId(weekId);
    startTransition(async () => {
      try {
        const res = await fetch(`/api/weeks/${weekId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isClosed: !currentlyClosed }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error ?? "Failed");
        }

        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setPendingId(null);
      }
    });
  };

  return (
    <div className="space-y-3">
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
          {error}
        </p>
      )}

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Week</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {weeks.map((week) => (
              <tr
                key={week.id}
                className={`hover:bg-gray-50 ${week.isCurrentWeek ? "bg-blue-50/50" : ""}`}
              >
                <td className="px-4 py-3">
                  <span className="text-gray-900">{week.label}</span>
                  {week.isCurrentWeek && (
                    <span className="ml-2 text-xs text-blue-600 font-medium">
                      (current)
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={week.isClosed ? "danger" : "success"}>
                    {week.isClosed ? "Closed" : "Open"}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <Button
                    variant={week.isClosed ? "secondary" : "danger"}
                    size="sm"
                    loading={pendingId === week.id && isPending}
                    disabled={isPending}
                    onClick={() => handleToggle(week.id, week.isClosed)}
                  >
                    {week.isClosed ? "Reopen" : "Close"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
