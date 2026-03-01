import {
  startOfWeek,
  format,
  addDays,
  isValid,
  parseISO,
  isSameWeek,
} from "date-fns";

/**
 * Get the Sunday that starts the week containing `date`.
 */
export function getSundayOfWeek(date: Date): Date {
  return startOfWeek(date, { weekStartsOn: 0 });
}

/**
 * Get the week ID (Sunday ISO date string "YYYY-MM-DD") for a given date.
 */
export function getWeekId(date: Date): string {
  return format(getSundayOfWeek(date), "yyyy-MM-dd");
}

/**
 * Get the current week's ID (Sunday of the current calendar week).
 */
export function getCurrentWeekId(): string {
  return getWeekId(new Date());
}

/**
 * Given a weekId (Sunday ISO date), return an array of 7 Date objects Sun–Sat.
 */
export function getWeekDays(weekId: string): Date[] {
  const sunday = parseISO(weekId);
  return Array.from({ length: 7 }, (_, i) => addDays(sunday, i));
}

/**
 * Validate that a weekId is a properly-formatted Sunday ISO date.
 */
export function isValidWeekId(weekId: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(weekId)) return false;
  const date = parseISO(weekId);
  if (!isValid(date)) return false;
  // Must be a Sunday (day 0)
  return date.getDay() === 0;
}

/**
 * Check if a weekId is the current calendar week.
 */
export function isCurrentWeek(weekId: string): boolean {
  if (!isValidWeekId(weekId)) return false;
  return isSameWeek(parseISO(weekId), new Date(), { weekStartsOn: 0 });
}

/**
 * Format a weekId for display: "Mar 2 – Mar 8, 2025"
 */
export function formatWeekRange(weekId: string): string {
  const days = getWeekDays(weekId);
  const start = days[0];
  const end = days[6];
  const startStr = format(start, "MMM d");
  const endStr =
    start.getFullYear() === end.getFullYear()
      ? format(end, "MMM d, yyyy")
      : format(end, "MMM d, yyyy");
  return `${startStr} – ${endStr}`;
}

export const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
