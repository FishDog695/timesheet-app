import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  getCurrentWeekId,
  getWeekDays,
  formatWeekRange,
} from "@/lib/date-utils";
import { Badge } from "@/components/ui/Badge";
import { format } from "date-fns";
import { TimesheetPageClient } from "./TimesheetPageClient";

export default async function TimesheetPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const weekId = getCurrentWeekId();
  const weekDays = getWeekDays(weekId);
  const userId = session.user.id;

  // Check week status
  const week = await prisma.week.findUnique({ where: { id: weekId } });
  const isClosed = week?.isClosed ?? false;

  // Load existing entries
  const existingEntries = await prisma.timeEntry.findMany({
    where: { weekId, userId },
    orderBy: { date: "asc" },
  });

  // Build day entries array
  const dayEntries = weekDays.map((day) => {
    const dateStr = format(day, "yyyy-MM-dd");
    const entry = existingEntries.find(
      (e) => format(e.date, "yyyy-MM-dd") === dateStr
    );
    return {
      regularHours: Number(entry?.regularHours ?? 0),
      driveHours: Number(entry?.driveHours ?? 0),
      perDiem: entry?.perDiem ?? false,
    };
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-xl font-bold text-gray-900">My Timesheet</h1>
          <p className="text-sm text-gray-600">{formatWeekRange(weekId)}</p>
        </div>
        {isClosed && <Badge variant="danger">Week Closed</Badge>}
      </div>

      <TimesheetPageClient
        weekId={weekId}
        weekDays={weekDays.map((d) => d.toISOString())}
        userId={userId}
        userName={session.user.name ?? "Me"}
        dayEntries={dayEntries}
        isClosed={isClosed}
      />

      {isClosed && (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-3">
          This week has been closed by payroll. Contact your manager to make
          changes.
        </p>
      )}
    </div>
  );
}
