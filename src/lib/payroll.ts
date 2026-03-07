export interface PayrollResult {
  totalRegHours: number;
  totalDriveHours: number;
  totalHours: number;
  regularPay: number;
  drivePay: number;
  payBeforeOT: number;
  overtimeHours: number;
  blendedRate: number;
  overtimeRate: number;
  overtimePay: number;
  perDiemDays: number;
  perDiemTotal: number;
  totalGrossPay: number;
}

/**
 * Calculates weekly gross pay for one employee using the FLSA blended-rate
 * overtime method — matching the Lightning Doctor Excel payroll spreadsheet.
 *
 * Formula:
 *   regularPay    = totalRegHours × hourlyRate
 *   drivePay      = totalDriveHours × driveRate
 *   payBeforeOT   = regularPay + drivePay
 *   totalHours    = totalRegHours + totalDriveHours
 *   overtimeHours = MAX(0, totalHours − 40)
 *   blendedRate   = payBeforeOT / totalHours  (0 if no hours)
 *   overtimeRate  = blendedRate × 0.5         (FLSA half-time supplement)
 *   overtimePay   = overtimeHours × overtimeRate
 *   perDiemDays   = days where regularHours + driveHours > 0
 *   perDiemTotal  = perDiemDays × perDiemRate
 *   totalGrossPay = payBeforeOT + overtimePay + perDiemTotal
 */
export function calculateEmployeePayroll(
  entries: { regularHours: number; driveHours: number }[],
  rates: { hourlyRate: number; driveRate: number; perDiemRate: number }
): PayrollResult {
  const { hourlyRate, driveRate, perDiemRate } = rates;

  // Weekly hour totals
  const totalRegHours = entries.reduce((sum, e) => sum + (e.regularHours ?? 0), 0);
  const totalDriveHours = entries.reduce((sum, e) => sum + (e.driveHours ?? 0), 0);
  const totalHours = totalRegHours + totalDriveHours;

  // Base pay (before overtime)
  const regularPay = totalRegHours * hourlyRate;
  const drivePay = totalDriveHours * driveRate;
  const payBeforeOT = regularPay + drivePay;

  // FLSA blended-rate overtime
  const overtimeHours = Math.max(0, totalHours - 40);
  const blendedRate = totalHours > 0 ? payBeforeOT / totalHours : 0;
  const overtimeRate = blendedRate * 0.5;
  const overtimePay = overtimeHours * overtimeRate;

  // Per diem — flat rate for each day any hours were worked
  const perDiemDays = entries.filter(
    (e) => (e.regularHours ?? 0) + (e.driveHours ?? 0) > 0
  ).length;
  const perDiemTotal = perDiemDays * perDiemRate;

  // Total gross pay
  const totalGrossPay = payBeforeOT + overtimePay + perDiemTotal;

  return {
    totalRegHours,
    totalDriveHours,
    totalHours,
    regularPay,
    drivePay,
    payBeforeOT,
    overtimeHours,
    blendedRate,
    overtimeRate,
    overtimePay,
    perDiemDays,
    perDiemTotal,
    totalGrossPay,
  };
}
