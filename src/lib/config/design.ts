// ============================================================
// COLORS — match CSS variables in globals.css
// These are for use in JS/TS (e.g., inline styles, GSAP tweens).
// For Tailwind/CSS, use the CSS variables directly.
// ============================================================

export const COLORS = {
  gold: "#C4973B",
  goldLight: "#E8D5A3",
  burgundy: "#6B1D2A",
  burgundyLight: "#8B3A4A",
  cream: "#FFF8F0",
  ivory: "#FFFDF7",
  textPrimary: "#2D1810",
  textSecondary: "#6B5B4E",
  success: "#2D6A4F",
  error: "#C1292E",
  white: "#FFFFFF",
} as const;

// ============================================================
// TYPOGRAPHY
// ============================================================

export const FONTS = {
  display: "var(--font-display), serif", // Playfair Display
  body: "var(--font-body), sans-serif", // DM Sans
} as const;

export const FONT_SIZES = {
  xs: "0.75rem", // 12px
  sm: "0.875rem", // 14px
  base: "1rem", // 16px
  lg: "1.125rem", // 18px
  xl: "1.25rem", // 20px
  "2xl": "1.5rem", // 24px
  "3xl": "1.875rem", // 30px
  "4xl": "2.25rem", // 36px
  "5xl": "3rem", // 48px
} as const;

// ============================================================
// SPACING — consistent padding/margin/gaps
// ============================================================

export const SPACING = {
  xs: "0.25rem", // 4px
  sm: "0.5rem", // 8px
  md: "1rem", // 16px
  lg: "1.5rem", // 24px
  xl: "2rem", // 32px
  "2xl": "3rem", // 48px
  "3xl": "4rem", // 64px
} as const;

// ============================================================
// BORDERS & RADII
// ============================================================

export const RADII = {
  sm: "0.375rem", // 6px
  md: "0.5rem", // 8px
  lg: "0.75rem", // 12px
  xl: "1rem", // 16px
  "2xl": "1.5rem", // 24px
  full: "9999px",
} as const;

// ============================================================
// SHADOWS
// ============================================================

export const SHADOWS = {
  sm: "0 1px 3px rgba(0, 0, 0, 0.06)",
  md: "0 4px 12px rgba(0, 0, 0, 0.08)",
  lg: "0 8px 24px rgba(0, 0, 0, 0.12)",
  gold: "0 4px 16px rgba(196, 151, 59, 0.2)",
  goldIntense: "0 8px 32px rgba(196, 151, 59, 0.3)",
} as const;

// ============================================================
// COMPONENT-LEVEL TOKENS — for consistent UI elements
// ============================================================

export const BUTTON = {
  height: {
    sm: "36px",
    md: "44px",
    lg: "52px",
  },
  minTapTarget: "44px", // WCAG minimum tap target
} as const;

export const INPUT = {
  height: "48px",
  borderColor: COLORS.goldLight,
  focusBorderColor: COLORS.gold,
  background: COLORS.white,
  placeholderColor: COLORS.textSecondary,
} as const;

export const CARD = {
  background: COLORS.ivory,
  border: `1px solid ${COLORS.goldLight}`,
  borderRadius: RADII.xl,
  padding: SPACING.lg,
  shadow: SHADOWS.sm,
  hoverShadow: SHADOWS.gold,
} as const;

// ============================================================
// BREAKPOINTS
// ============================================================

export const BREAKPOINTS = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
} as const;

// ============================================================
// Z-INDEX SCALE — prevent z-index wars
// ============================================================

export const Z_INDEX = {
  base: 0,
  card: 1,
  sticky: 10,
  dropdown: 50,
  modal: 100,
  toast: 200,
} as const;
