"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      // Always show success to prevent email enumeration
      setSubmitted(true);
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            The Lightning Doctor LLC Employee Portal
          </h1>
          <p className="mt-2 text-gray-600 text-sm">Password Reset</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          {submitted ? (
            <div className="text-center space-y-4">
              <div className="text-green-600 text-4xl">✓</div>
              <p className="text-gray-700 text-sm">
                If that email address is registered, you&apos;ll receive a
                password reset link shortly.
              </p>
              <p className="text-gray-500 text-sm">
                Check your inbox and follow the link in the email.
              </p>
              <Link
                href="/login"
                className="block text-sm text-blue-600 hover:underline mt-4"
              >
                Back to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-sm text-gray-600">
                Enter your email address and we&apos;ll send you a link to reset
                your password.
              </p>
              <Input
                label="Email address"
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button
                type="submit"
                className="w-full"
                loading={isPending}
                size="lg"
              >
                Send Reset Link
              </Button>
              <div className="text-sm text-center">
                <Link href="/login" className="text-blue-600 hover:underline">
                  Back to sign in
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
