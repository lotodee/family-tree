"use client";

import { COLORS } from "@/lib/config/design";

interface LoadingProps {
  /** Size of the spinner */
  size?: "sm" | "md" | "lg";
  /** Optional text to display below spinner */
  text?: string;
  /** Center in parent container */
  centered?: boolean;
}

const sizeMap = {
  sm: 20,
  md: 32,
  lg: 48,
};

/**
 * Gold spinner loading indicator.
 * Uses design constants for consistent styling.
 */
export function Loading({ size = "md", text, centered = false }: LoadingProps) {
  const spinnerSize = sizeMap[size];

  const Wrapper = centered ? CenteredWrapper : "div";

  return (
    <Wrapper>
      <div className="flex flex-col items-center gap-3">
        <svg
          className="animate-spin"
          width={spinnerSize}
          height={spinnerSize}
          viewBox="0 0 24 24"
          fill="none"
          style={{ color: COLORS.gold }}
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.25"
          />
          <path
            d="M12 2a10 10 0 0 1 10 10"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>

        {text && (
          <p
            className="text-sm"
            style={{ color: COLORS.textSecondary }}
          >
            {text}
          </p>
        )}
      </div>
    </Wrapper>
  );
}

function CenteredWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      {children}
    </div>
  );
}

export default Loading;
