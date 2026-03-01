"use client";

import { useRouter } from "next/navigation";
import { format, addWeeks, subWeeks, parseISO } from "date-fns";
import { Button } from "@/components/ui/Button";
import { formatWeekRange } from "@/lib/date-utils";

interface WeekPickerProps {
  weekId: string;
  basePath: string;
  allowFuture?: boolean;
}

export function WeekPicker({
  weekId,
  basePath,
  allowFuture = false,
}: WeekPickerProps) {
  const router = useRouter();
  const currentDate = parseISO(weekId);
  const nextWeekDate = addWeeks(currentDate, 1);
  const nextWeekId = format(nextWeekDate, "yyyy-MM-dd");
  const prevWeekId = format(subWeeks(currentDate, 1), "yyyy-MM-dd");

  const today = new Date();
  const isNextFuture = nextWeekDate > today;

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="secondary"
        size="sm"
        onClick={() => router.push(`${basePath}/${prevWeekId}`)}
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </Button>

      <span className="text-sm font-medium text-gray-700 min-w-[200px] text-center">
        {formatWeekRange(weekId)}
      </span>

      <Button
        variant="secondary"
        size="sm"
        disabled={isNextFuture && !allowFuture}
        onClick={() => router.push(`${basePath}/${nextWeekId}`)}
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Button>
    </div>
  );
}
