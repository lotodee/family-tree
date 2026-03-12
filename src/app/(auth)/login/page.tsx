"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";

// Security: only allow relative paths starting with /
function getSafeRedirect(redirect: string | null): string {
  if (!redirect) return "/dashboard";
  if (!redirect.startsWith("/")) return "/dashboard";
  if (redirect.startsWith("//")) return "/dashboard";
  return redirect;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const emailRef = useRef<HTMLInputElement>(null);
  const redirectTo = searchParams.get("redirect");
  const inviteCode = searchParams.get("code");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Auto-focus email on mount
  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  const handleLogin = async () => {
    setError("");
    setIsLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError("Invalid email or password");
      setIsLoading(false);
      return;
    }

    router.push(getSafeRedirect(redirectTo));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && email && password && !isLoading) {
      handleLogin();
    }
  };

  return (
    <Card className="animate-fade-in-up p-8">
      <h1 className="mb-2 text-center font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--color-burgundy)]">
        Welcome back
      </h1>
      <p className="mb-4 text-center text-[var(--color-text-secondary)]">
        Enter your email and password to continue
      </p>

      {inviteCode && (
        <div
          className="mb-6 p-3 rounded-lg text-sm text-center"
          style={{
            backgroundColor: "var(--color-gold-light)",
            color: "var(--color-text-primary)",
            border: "1px solid var(--color-gold)",
          }}
        >
          Sign in to join the celebration.
          <br />
          You'll be added automatically after logging in.
        </div>
      )}

      <div className="space-y-5" onKeyDown={handleKeyDown}>
        <Input
          ref={emailRef}
          label="Email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError("");
          }}
          autoComplete="email"
          placeholder="you@example.com"
        />

        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError("");
          }}
          autoComplete="current-password"
          placeholder="Enter your password"
          showPasswordToggle
        />

        {error && (
          <p className="text-center text-sm text-[var(--color-error)]">
            {error}
          </p>
        )}

        <Button
          onClick={handleLogin}
          isLoading={isLoading}
          fullWidth
          size="lg"
          disabled={!email || !password}
        >
          Log In
        </Button>
      </div>

      <p className="mt-6 text-center text-sm text-[var(--color-text-secondary)]">
        Don&apos;t have an account?{" "}
        <Link
          href={
            redirectTo
              ? `/register?redirect=${encodeURIComponent(redirectTo)}${inviteCode ? `&code=${inviteCode}` : ""}`
              : "/register"
          }
          className="font-medium text-[var(--color-burgundy)] underline underline-offset-2"
        >
          Sign up here
        </Link>
      </p>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-[420px]">
        <Suspense fallback={<Loading centered text="Loading..." />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
