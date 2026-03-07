"use client";

import { useState, useTransition, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    if (!token) {
      setError("Missing reset token. Please use the link from your email.");
      return;
    }

    startTransition(async () => {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      if (res.ok) {
        router.push("/login?reset=1");
      } else {
        const data = await res.json();
        setError(
          data.error ?? "Something went wrong. Please try again."
        );
      }
    });
  };

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <p className="text-red-600 text-sm">
          This reset link is invalid or has expired.
        </p>
        <Link
          href="/forgot-password"
          className="text-sm text-blue-600 hover:underline"
        >
          Request a new reset link
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="New Password"
        id="password"
        type="password"
        autoComplete="new-password"
        required
        minLength={8}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Input
        label="Confirm New Password"
        id="confirm"
        type="password"
        autoComplete="new-password"
        required
        minLength={8}
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
      />

      {error && (
        <div className="text-sm text-red-600 bg-red-50 rounded-md p-3 border border-red-200">
          <p>{error}</p>
          {error.toLowerCase().includes("invalid") && (
            <Link
              href="/forgot-password"
              className="text-blue-600 hover:underline block mt-1"
            >
              Request a new reset link
            </Link>
          )}
        </div>
      )}

      <Button
        type="submit"
        className="w-full"
        loading={isPending}
        size="lg"
      >
        Set New Password
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            The Lightning Doctor LLC Employee Portal
          </h1>
          <p className="mt-2 text-gray-600 text-sm">Set New Password</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <Suspense fallback={<p className="text-sm text-gray-500">Loading…</p>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
