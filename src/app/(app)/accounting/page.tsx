import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentWeekId, formatWeekRange } from "@/lib/date-utils";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export default async function AccountingPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const { role } = session.user;
  if (role !== "ACCOUNTING" && role !== "ADMINISTRATOR") {
    redirect("/");
  }

  const currentWeekId = getCurrentWeekId();

  // Get recent weeks
  const weeks = await prisma.week.findMany({
    orderBy: { id: "desc" },
    take: 12,
  });

  // If no weeks in DB yet, show a placeholder for the current week
  const displayWeeks =
    weeks.length === 0
      ? [{ id: currentWeekId, isClosed: false }]
      : weeks;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Accounting</h1>
        <p className="text-sm text-gray-600">View and manage weekly timesheets</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Current Week</h2>
          <Link href={`/accounting/${currentWeekId}`}>
            <Button size="sm">Open</Button>
          </Link>
        </div>
        <p className="text-sm text-gray-600">{formatWeekRange(currentWeekId)}</p>
      </div>

      {displayWeeks.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b">
            <h2 className="font-semibold text-gray-900">Week History</h2>
          </div>
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Week</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {displayWeeks.map((week) => (
                <tr key={week.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-900">
                    {formatWeekRange(week.id)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={week.isClosed ? "danger" : "success"}>
                      {week.isClosed ? "Closed" : "Open"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/accounting/${week.id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
