"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/Button";

interface HeaderProps {
  weekLabel?: string;
  userName: string;
}

export function Header({ weekLabel, userName }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-4">
        {/* Mobile logo */}
        <span className="lg:hidden font-bold text-gray-900 text-lg">
          Timesheet
        </span>
        {weekLabel && (
          <span className="hidden sm:block text-sm text-gray-600">
            Week of {weekLabel}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <span className="hidden sm:block text-sm text-gray-700">{userName}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          Sign out
        </Button>
      </div>
    </header>
  );
}
