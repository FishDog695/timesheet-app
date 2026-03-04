import type { Role } from "@/types";
import { isCurrentWeek } from "./date-utils";

interface CanEditEntriesParams {
  role: Role;
  userId: string;
  targetUserId: string;
  weekIsClosed: boolean;
  weekId: string;
}

export function canEditEntries({
  role,
  userId,
  targetUserId,
  weekIsClosed,
  weekId,
}: CanEditEntriesParams): boolean {
  if (role === "ADMINISTRATOR" || role === "ACCOUNTING") return true;
  if (role === "FOREMAN") return !weekIsClosed;
  if (role === "EMPLOYEE") {
    return (
      !weekIsClosed &&
      targetUserId === userId &&
      isCurrentWeek(weekId)
    );
  }
  return false;
}

export function canCloseWeek(role: Role): boolean {
  return role === "ADMINISTRATOR" || role === "ACCOUNTING";
}

export function canManageUsers(role: Role): boolean {
  return role === "ADMINISTRATOR" || role === "ACCOUNTING";
}

export function canViewRates(role: Role): boolean {
  return role === "ADMINISTRATOR" || role === "ACCOUNTING";
}

export function canEditRates(role: Role): boolean {
  return role === "ADMINISTRATOR" || role === "ACCOUNTING";
}

export function canViewAllEntries(role: Role): boolean {
  return (
    role === "ADMINISTRATOR" ||
    role === "ACCOUNTING" ||
    role === "FOREMAN"
  );
}

export function canManageDocuments(role: Role): boolean {
  return role === "ACCOUNTING" || role === "ADMINISTRATOR";
}
