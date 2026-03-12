"use client";

import { forwardRef, useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";
import { INPUT, COLORS, RADII } from "@/lib/config/design";

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  /** Label text displayed above the input */
  label?: string;
  /** Error message displayed below the input */
  error?: string;
  /** Show password toggle for password inputs */
  showPasswordToggle?: boolean;
}

/**
 * Styled input component with label, error state, and password toggle.
 * Uses design constants for consistent styling.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      type = "text",
      showPasswordToggle = false,
      className = "",
      style,
      id,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    const isPassword = type === "password";
    const inputType = isPassword && showPassword ? "text" : type;

    const inputStyles: React.CSSProperties = {
      width: "100%",
      height: INPUT.height,
      padding: "0 1rem",
      paddingRight: isPassword && showPasswordToggle ? "3rem" : "1rem",
      fontFamily: "var(--font-body), sans-serif",
      fontSize: "1rem",
      backgroundColor: INPUT.background,
      border: `1px solid ${error ? COLORS.error : INPUT.borderColor}`,
      borderRadius: RADII.lg,
      color: COLORS.textPrimary,
      transition: "border-color 0.2s ease, box-shadow 0.2s ease",
      outline: "none",
      ...style,
    };

    return (
      <div className={`flex flex-col gap-1.5 ${className}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium"
            style={{ color: COLORS.textPrimary }}
          >
            {label}
          </label>
        )}

        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type={inputType}
            className="focus:border-[var(--color-gold)] focus:shadow-[0_0_0_3px_rgba(196,151,59,0.1)]"
            style={inputStyles}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : undefined}
            {...props}
          />

          {isPassword && showPasswordToggle && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-[var(--color-gold-light)]/30 transition-colors"
              style={{ color: COLORS.textSecondary }}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          )}
        </div>

        {error && (
          <p
            id={`${inputId}-error`}
            className="text-sm"
            style={{ color: COLORS.error }}
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
