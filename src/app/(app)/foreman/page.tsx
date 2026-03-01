import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getCurrentWeekId, formatWeekRange } from "@/lib/date-utils";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default async function ForemanPage() {
  const session = await auth();
  if (!session) redirect("/login");

  if (session.user.role !== "FOREMAN" && session.user.role !== "ADMINISTRATOR") {
    redirect("/");
  }

  const weekId = getCurrentWeekId();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Crew Timesheets</h1>
        <p className="text-sm text-gray-600">Select a week to view and edit crew hours</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700">Current Week</h2>
        <p className="text-gray-600">{formatWeekRange(weekId)}</p>
        <Link href={`/foreman/${weekId}`}>
          <Button>View Current Week</Button>
        </Link>
      </div>
    </div>
  );
}
