"use client";

import { forwardRef, type HTMLAttributes } from "react";
import { CARD } from "@/lib/config/design";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Add hover effect with shadow */
  hoverable?: boolean;
  /** Remove default padding */
  noPadding?: boolean;
}

/**
 * Styled card component with consistent background, border, and shadow.
 * Uses design constants for consistent styling.
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    { children, className = "", hoverable = false, noPadding = false, style, ...props },
    ref
  ) => {
    const cardStyles: React.CSSProperties = {
      backgroundColor: CARD.background,
      border: CARD.border,
      borderRadius: CARD.borderRadius,
      padding: noPadding ? 0 : CARD.padding,
      boxShadow: CARD.shadow,
      transition: hoverable ? "box-shadow 0.2s ease, transform 0.2s ease" : undefined,
      ...style,
    };

    const hoverClass = hoverable
      ? "hover:shadow-[0_4px_16px_rgba(196,151,59,0.2)] hover:-translate-y-0.5"
      : "";

    return (
      <div
        ref={ref}
        className={`${hoverClass} ${className}`}
        style={cardStyles}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

export default Card;
