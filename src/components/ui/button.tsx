"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { BUTTON, COLORS, RADII, SHADOWS } from "@/lib/config/design";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button style variant */
  variant?: Variant;
  /** Button size */
  size?: Size;
  /** Show loading spinner and disable button */
  isLoading?: boolean;
  /** Make button full width */
  fullWidth?: boolean;
}

/**
 * Production-grade button component with variants, sizes, and loading state.
 * Uses design constants for consistent styling.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      isLoading = false,
      fullWidth = false,
      disabled,
      className = "",
      style,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    const baseStyles: React.CSSProperties = {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "0.5rem",
      fontFamily: "var(--font-body), sans-serif",
      fontWeight: 500,
      borderRadius: RADII.lg,
      transition: "all 0.2s ease",
      cursor: isDisabled ? "not-allowed" : "pointer",
      opacity: isDisabled ? 0.6 : 1,
      width: fullWidth ? "100%" : "auto",
      height: BUTTON.height[size],
      padding: size === "sm" ? "0 1rem" : size === "md" ? "0 1.5rem" : "0 2rem",
      fontSize: size === "sm" ? "0.875rem" : "1rem",
      ...style,
    };

    const variantStyles: Record<Variant, React.CSSProperties> = {
      primary: {
        backgroundColor: COLORS.gold,
        color: COLORS.textPrimary,
        border: "none",
        boxShadow: SHADOWS.sm,
      },
      secondary: {
        backgroundColor: "transparent",
        color: COLORS.gold,
        border: `2px solid ${COLORS.gold}`,
      },
      ghost: {
        backgroundColor: "transparent",
        color: COLORS.textSecondary,
        border: "none",
      },
      danger: {
        backgroundColor: COLORS.error,
        color: COLORS.white,
        border: "none",
      },
    };

    const combinedStyles: React.CSSProperties = {
      ...baseStyles,
      ...variantStyles[variant],
    };

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={`hover:opacity-90 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)] ${className}`}
        style={combinedStyles}
        {...props}
      >
        {isLoading && <Spinner variant={variant} />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

/** Loading spinner that matches button text color */
function Spinner({ variant }: { variant: Variant }) {
  const color =
    variant === "primary"
      ? COLORS.textPrimary
      : variant === "danger"
        ? COLORS.white
        : variant === "secondary"
          ? COLORS.gold
          : COLORS.textSecondary;

  return (
    <svg
      className="animate-spin"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      style={{ color }}
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
  );
}

export default Button;
