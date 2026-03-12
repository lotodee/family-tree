"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { COLORS } from "@/lib/config/design";

export default function CelebrationError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Celebration error:", error);
  }, [error]);

  return (
    <div
      className="flex min-h-screen items-center justify-center p-8"
      style={{ backgroundColor: COLORS.cream }}
    >
      <div className="max-w-md text-center">
        <h1
          className="mb-2 text-2xl font-bold"
          style={{
            fontFamily: "var(--font-display)",
            color: COLORS.textPrimary,
          }}
        >
          Something went wrong
        </h1>
        <p className="mb-6" style={{ color: COLORS.textSecondary }}>
          We couldn&apos;t load this celebration. This might be a temporary
          network issue.
        </p>
        <div className="flex gap-3 justify-center">
          <Button variant="secondary" onClick={() => window.location.href = "/dashboard"}>
            Back to Dashboard
          </Button>
          <Button onClick={reset}>
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
}
