import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentWeekId, formatWeekRange } from "@/lib/date-utils";
import { WeekManagementClient } from "./WeekManagementClient";

export default async function WeeksPage() {
  const session = await auth();
  if (!session) redirect("/login");

  if (session.user.role !== "ADMINISTRATOR") {
    redirect("/");
  }

  const weeks = await prisma.week.findMany({
    orderBy: { id: "desc" },
    take: 26,
  });

  const currentWeekId = getCurrentWeekId();

  // Ensure current week appears even if not in DB
  const weekIds = new Set(weeks.map((w) => w.id));
  const displayWeeks = weekIds.has(currentWeekId)
    ? weeks
    : [{ id: currentWeekId, isClosed: false, closedAt: null, closedById: null, createdAt: new Date(), updatedAt: new Date() }, ...weeks];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <a href="/admin" className="text-blue-600 hover:text-blue-800 text-sm">
          ← Back to Users
        </a>
      </div>
      <div>
        <h1 className="text-xl font-bold text-gray-900">Week Management</h1>
        <p className="text-sm text-gray-600">Close or reopen work weeks</p>
      </div>

      <WeekManagementClient
        weeks={displayWeeks.map((w) => ({
          id: w.id,
          isClosed: w.isClosed,
          label: formatWeekRange(w.id),
          isCurrentWeek: w.id === currentWeekId,
        }))}
      />
    </div>
  );
}
