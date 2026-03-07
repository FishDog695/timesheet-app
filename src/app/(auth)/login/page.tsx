"use client";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const resetSuccess = searchParams.get("reset") === "1";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password.");
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    });
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel — Detroit skyline photo */}
      <div className="hidden lg:block lg:w-1/2 xl:w-3/5 relative overflow-hidden">
        <Image
          src="/images/detroit-skyline.jpg"
          alt="Detroit skyline at night"
          fill
          className="object-cover object-center"
          priority
          quality={90}
        />
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/50" />
        {/* Bottom caption */}
        <div className="absolute bottom-8 left-8 right-8">
          <p className="text-white/80 text-base font-light">
            Energy efficient commercial lighting and refrigeration retrofit services
          </p>
        </div>
        {/* Top brand mark on image */}
        <div className="absolute top-8 left-8">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            <span className="text-white font-bold text-lg tracking-tight">
              The Lightning Doctor LLC
            </span>
          </div>
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="w-full lg:w-1/2 xl:w-2/5 flex flex-col items-center justify-center bg-white px-8 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile-only header (hidden on desktop where left panel shows branding) */}
          <div className="lg:hidden text-center mb-8">
            <span className="text-3xl">⚡</span>
            <h1 className="text-2xl font-bold text-gray-900 mt-2">
              The Lightning Doctor LLC
            </h1>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Employee Portal</h2>
            <p className="mt-1 text-gray-500 text-sm">Sign in to your account</p>
          </div>

          {resetSuccess && (
            <div className="mb-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md p-3 text-center">
              Password reset successfully. You can now sign in with your new password.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email address"
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="Password"
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-md p-3 border border-red-200">
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="w-full"
              loading={isPending}
              size="lg"
            >
              Sign in
            </Button>
            <div className="text-sm text-center">
              <Link href="/forgot-password" className="text-blue-600 hover:underline">
                Forgot your password?
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
