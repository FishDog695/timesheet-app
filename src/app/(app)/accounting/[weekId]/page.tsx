import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  isValidWeekId,
  getWeekDays,
  formatWeekRange,
} from "@/lib/date-utils";
import { WeekPicker } from "@/components/timesheet/WeekPicker";
import { Badge } from "@/components/ui/Badge";
import { format } from "date-fns";
import { AccountingWeekClient } from "./AccountingWeekClient";

interface PageProps {
  params: { weekId: string };
}

export default async function AccountingWeekPage({ params }: PageProps) {
  const session = await auth();
  if (!session) redirect("/login");

  const { role } = session.user;
  if (role !== "ACCOUNTING" && role !== "ADMINISTRATOR") {
    redirect("/");
  }

  const { weekId } = params;
  if (!isValidWeekId(weekId)) redirect("/accounting");

  const weekDays = getWeekDays(weekId);

  // Load week status
  const week = await prisma.week.findUnique({ where: { id: weekId } });
  const isClosed = week?.isClosed ?? false;

  // Load all active users
  const employees = await prisma.user.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  // Load all entries for this week
  const entries = await prisma.timeEntry.findMany({
    where: { weekId },
    orderBy: [{ userId: "asc" }, { date: "asc" }],
  });

  // Build entries map
  type DayEntry = { regularHours: number; driveHours: number; perDiem: boolean };
  const entriesMap: Record<string, DayEntry[]> = {};

  for (const emp of employees) {
    entriesMap[emp.id] = weekDays.map((day) => {
      const dateStr = format(day, "yyyy-MM-dd");
      const entry = entries.find(
        (e) => e.userId === emp.id && format(e.date, "yyyy-MM-dd") === dateStr
      );
      return {
        regularHours: Number(entry?.regularHours ?? 0),
        driveHours: Number(entry?.driveHours ?? 0),
        perDiem: entry?.perDiem ?? false,
      };
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Accounting</h1>
          <p className="text-sm text-gray-600">{formatWeekRange(weekId)}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={isClosed ? "danger" : "success"}>
            {isClosed ? "Closed" : "Open"}
          </Badge>
          <WeekPicker weekId={weekId} basePath="/accounting" allowFuture />
        </div>
      </div>

      <AccountingWeekClient
        weekId={weekId}
        weekDays={weekDays.map((d) => d.toISOString())}
        employees={employees}
        initialEntries={entriesMap}
        isClosed={isClosed}
      />
    </div>
  );
}
