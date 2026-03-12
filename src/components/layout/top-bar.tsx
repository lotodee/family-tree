"use client";

export function TopBar() {
  // Only show on mobile (md:hidden)
  return (
    <header
      className="md:hidden sticky top-0 z-40 flex items-center justify-center h-14 border-b"
      style={{
        backgroundColor: "var(--color-cream)",
        borderColor: "var(--color-gold-light)",
      }}
    >
      <span
        className="text-sm font-bold"
        style={{
          fontFamily: "var(--font-display)",
          color: "var(--color-burgundy)",
        }}
      >
        Celebrate Together
      </span>
    </header>
  );
}
