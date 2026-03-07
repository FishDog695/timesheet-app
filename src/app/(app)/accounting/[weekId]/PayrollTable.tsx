"use client";

import { calculateEmployeePayroll, PayrollResult } from "@/lib/payroll";
import { formatWeekRange } from "@/lib/date-utils";

interface Employee {
  id: string;
  name: string;
  hourlyRate: number;
  driveRate: number;
  perDiemRate: number;
}

type DayEntry = { regularHours: number; driveHours: number; perDiem: boolean };
type EntriesMap = Record<string, DayEntry[]>;

interface PayrollTableProps {
  weekId: string;
  employees: Employee[];
  entriesMap: EntriesMap;
}

function fmt$(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function fmtHrs(n: number): string {
  return n % 1 === 0 ? n.toFixed(0) : n.toFixed(2);
}

interface RowData {
  employee: Employee;
  result: PayrollResult;
}

export function PayrollTable({ weekId, employees, entriesMap }: PayrollTableProps) {
  // Build rows — only include employees who worked at least one hour
  const rows: RowData[] = employees
    .map((emp) => {
      const entries = entriesMap[emp.id] ?? [];
      const result = calculateEmployeePayroll(entries, {
        hourlyRate: emp.hourlyRate,
        driveRate: emp.driveRate,
        perDiemRate: emp.perDiemRate,
      });
      return { employee: emp, result };
    })
    .filter((row) => row.result.totalHours > 0);

  // Column totals
  const totals = rows.reduce(
    (acc, { result: r }) => ({
      totalRegHours: acc.totalRegHours + r.totalRegHours,
      totalDriveHours: acc.totalDriveHours + r.totalDriveHours,
      totalHours: acc.totalHours + r.totalHours,
      overtimeHours: acc.overtimeHours + r.overtimeHours,
      regularPay: acc.regularPay + r.regularPay,
      drivePay: acc.drivePay + r.drivePay,
      overtimePay: acc.overtimePay + r.overtimePay,
      perDiemDays: acc.perDiemDays + r.perDiemDays,
      perDiemTotal: acc.perDiemTotal + r.perDiemTotal,
      totalGrossPay: acc.totalGrossPay + r.totalGrossPay,
    }),
    {
      totalRegHours: 0,
      totalDriveHours: 0,
      totalHours: 0,
      overtimeHours: 0,
      regularPay: 0,
      drivePay: 0,
      overtimePay: 0,
      perDiemDays: 0,
      perDiemTotal: 0,
      totalGrossPay: 0,
    }
  );

  const weekLabel = formatWeekRange(weekId);

  return (
    <div className="space-y-3">
      {/* Print-only header */}
      <div className="hidden print:block mb-4">
        <h1 className="text-xl font-bold text-gray-900">
          The Lightning Doctor LLC — Payroll Report
        </h1>
        <p className="text-sm text-gray-600">Week of {weekLabel}</p>
      </div>

      {rows.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <p className="text-gray-500 text-sm">No hours recorded for this week.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
          <table className="min-w-full text-sm divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">
                  Employee
                </th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700 whitespace-nowrap">
                  Reg Hrs
                </th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700 whitespace-nowrap">
                  Drive Hrs
                </th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700 whitespace-nowrap">
                  Total Hrs
                </th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700 whitespace-nowrap">
                  OT Hrs
                </th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700 whitespace-nowrap">
                  Reg Pay
                </th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700 whitespace-nowrap">
                  Drive Pay
                </th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700 whitespace-nowrap">
                  OT Pay
                </th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700 whitespace-nowrap">
                  Per Diem Days
                </th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700 whitespace-nowrap">
                  Per Diem
                </th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700 whitespace-nowrap bg-blue-50">
                  Gross Pay
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map(({ employee, result: r }) => (
                <tr key={employee.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                    {employee.name}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700 tabular-nums">
                    {fmtHrs(r.totalRegHours)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700 tabular-nums">
                    {fmtHrs(r.totalDriveHours)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700 tabular-nums font-medium">
                    {fmtHrs(r.totalHours)}
                  </td>
                  <td className={`px-4 py-3 text-right tabular-nums ${r.overtimeHours > 0 ? "text-orange-600 font-medium" : "text-gray-400"}`}>
                    {r.overtimeHours > 0 ? fmtHrs(r.overtimeHours) : "—"}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700 tabular-nums">
                    {fmt$(r.regularPay)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700 tabular-nums">
                    {fmt$(r.drivePay)}
                  </td>
                  <td className={`px-4 py-3 text-right tabular-nums ${r.overtimePay > 0 ? "text-orange-600 font-medium" : "text-gray-400"}`}>
                    {r.overtimePay > 0 ? fmt$(r.overtimePay) : "—"}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700 tabular-nums">
                    {r.perDiemDays}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700 tabular-nums">
                    {fmt$(r.perDiemTotal)}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-gray-900 tabular-nums bg-blue-50 whitespace-nowrap">
                    {fmt$(r.totalGrossPay)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-100 border-t-2 border-gray-300">
              <tr>
                <td className="px-4 py-3 font-bold text-gray-900">
                  Totals
                </td>
                <td className="px-4 py-3 text-right font-bold text-gray-900 tabular-nums">
                  {fmtHrs(totals.totalRegHours)}
                </td>
                <td className="px-4 py-3 text-right font-bold text-gray-900 tabular-nums">
                  {fmtHrs(totals.totalDriveHours)}
                </td>
                <td className="px-4 py-3 text-right font-bold text-gray-900 tabular-nums">
                  {fmtHrs(totals.totalHours)}
                </td>
                <td className="px-4 py-3 text-right font-bold text-orange-600 tabular-nums">
                  {totals.overtimeHours > 0 ? fmtHrs(totals.overtimeHours) : "—"}
                </td>
                <td className="px-4 py-3 text-right font-bold text-gray-900 tabular-nums">
                  {fmt$(totals.regularPay)}
                </td>
                <td className="px-4 py-3 text-right font-bold text-gray-900 tabular-nums">
                  {fmt$(totals.drivePay)}
                </td>
                <td className="px-4 py-3 text-right font-bold text-orange-600 tabular-nums">
                  {totals.overtimePay > 0 ? fmt$(totals.overtimePay) : "—"}
                </td>
                <td className="px-4 py-3 text-right font-bold text-gray-900 tabular-nums">
                  {totals.perDiemDays}
                </td>
                <td className="px-4 py-3 text-right font-bold text-gray-900 tabular-nums">
                  {fmt$(totals.perDiemTotal)}
                </td>
                <td className="px-4 py-3 text-right font-bold text-gray-900 tabular-nums bg-blue-100 whitespace-nowrap">
                  {fmt$(totals.totalGrossPay)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
