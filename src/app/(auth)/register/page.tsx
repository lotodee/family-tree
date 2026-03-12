"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";

const registerSchema = z
  .object({
    fullName: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof registerSchema>;
type FormErrors = Partial<Record<keyof FormData, string>>;

// Security: only allow relative paths starting with /
function getSafeRedirect(redirect: string | null): string {
  if (!redirect) return "/dashboard";
  if (!redirect.startsWith("/")) return "/dashboard";
  if (redirect.startsWith("//")) return "/dashboard";
  return redirect;
}

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const redirectTo = searchParams.get("redirect");
  const inviteCode = searchParams.get("code");

  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async () => {
    // Validate form
    const result = registerSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: FormErrors = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof FormData;
        fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          const loginLink = redirectTo ? `/login?redirect=${encodeURIComponent(redirectTo)}` : "/login";
          toast.error(
            <div>
              {data.error}{" "}
              <Link href={loginLink} className="underline">
                Log in here
              </Link>
            </div>
          );
        } else {
          toast.error(data.error || "Registration failed. Please try again.");
        }
        setIsLoading(false);
        return;
      }

      // Sign in the user
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (signInError) {
        toast.error("Account created! Please log in with your credentials.");
        router.push(redirectTo ? `/login?redirect=${encodeURIComponent(redirectTo)}` : "/login");
        return;
      }

      toast.success("Welcome! Your account has been created.");
      router.push(getSafeRedirect(redirectTo));
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="animate-fade-in-up p-8">
      <h1 className="mb-2 text-center font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--color-burgundy)]">
        Create your account
      </h1>
      <p className="mb-4 text-center text-[var(--color-text-secondary)]">
        Join to create or participate in celebrations
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
          Create an account to join the celebration.
          <br />
          You'll be added automatically after signing up.
        </div>
      )}

      <div className="space-y-5">
        <Input
          label="Full name"
          type="text"
          value={formData.fullName}
          onChange={(e) => handleChange("fullName", e.target.value)}
          error={errors.fullName}
          autoComplete="name"
          placeholder="Enter your full name"
        />

        <Input
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => handleChange("email", e.target.value)}
          error={errors.email}
          autoComplete="email"
          placeholder="you@example.com"
        />

        <Input
          label="Password"
          type="password"
          value={formData.password}
          onChange={(e) => handleChange("password", e.target.value)}
          error={errors.password}
          autoComplete="new-password"
          placeholder="At least 6 characters"
          showPasswordToggle
        />

        <Input
          label="Confirm password"
          type="password"
          value={formData.confirmPassword}
          onChange={(e) => handleChange("confirmPassword", e.target.value)}
          error={errors.confirmPassword}
          autoComplete="new-password"
          placeholder="Confirm your password"
          showPasswordToggle
        />

        <Button
          onClick={handleSubmit}
          isLoading={isLoading}
          fullWidth
          size="lg"
          disabled={
            !formData.fullName ||
            !formData.email ||
            !formData.password ||
            !formData.confirmPassword
          }
        >
          Create Account
        </Button>
      </div>

      <p className="mt-6 text-center text-sm text-[var(--color-text-secondary)]">
        Already have an account?{" "}
        <Link
          href={
            redirectTo
              ? `/login?redirect=${encodeURIComponent(redirectTo)}${inviteCode ? `&code=${inviteCode}` : ""}`
              : "/login"
          }
          className="font-medium text-[var(--color-burgundy)] underline underline-offset-2"
        >
          Log in here
        </Link>
      </p>
    </Card>
  );
}

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-[420px]">
        <Suspense fallback={<Loading centered text="Loading..." />}>
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  );
}
