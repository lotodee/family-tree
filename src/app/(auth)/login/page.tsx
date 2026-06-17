"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError("Invalid email or password. Please try again.");
      setIsLoading(false);
      return;
    }

    router.push("/dashboard");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="animate-fade-in-up rounded-2xl border border-[var(--color-gold-light)] bg-[var(--color-ivory)] p-8 shadow-lg">
          <h1 className="mb-2 text-center font-[family-name:var(--font-playfair)] text-3xl font-bold text-[var(--color-burgundy)]">
            Welcome Back
          </h1>
          <p className="mb-8 text-center font-[family-name:var(--font-dm-sans)] text-[var(--color-text-secondary)]">
            Enter your email and password to continue
          </p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block font-[family-name:var(--font-dm-sans)] text-sm font-medium text-[var(--color-text-secondary)]"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
                autoComplete="email"
                required
                className="w-full rounded-lg border border-[var(--color-gold-light)] bg-white px-4 py-4 text-[var(--color-text-primary)] focus:border-[var(--color-gold)] focus:outline-none"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block font-[family-name:var(--font-dm-sans)] text-sm font-medium text-[var(--color-text-secondary)]"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  className="w-full rounded-lg border border-[var(--color-gold-light)] bg-white px-4 py-4 pr-12 text-[var(--color-text-primary)] focus:border-[var(--color-gold)] focus:outline-none"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-center text-sm text-[var(--color-error)]">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full rounded-full bg-[var(--color-gold)] py-4 font-[family-name:var(--font-dm-sans)] text-lg font-semibold text-[var(--color-text-primary)] transition-all hover:bg-[var(--color-gold-light)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Logging in...
                </span>
              ) : (
                "Log In"
              )}
            </button>
          </form>

          <p className="mt-6 text-center font-[family-name:var(--font-dm-sans)] text-sm text-[var(--color-text-secondary)]">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-[var(--color-burgundy)] underline underline-offset-2"
            >
              Join here &rarr;
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
