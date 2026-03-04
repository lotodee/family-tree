"use client";

import Link from "next/link";

interface TopNavProps {
  displayName: string;
  treeNodeId?: string;
}

export function TopNav({ displayName, treeNodeId }: TopNavProps) {
  // Get initials for avatar
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <nav className="sticky top-0 z-50 border-b border-[var(--color-gold-light)] bg-[var(--color-cream)]">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo / App Name */}
        <Link
          href="/dashboard"
          className="font-[family-name:var(--font-playfair)] text-lg font-semibold text-[var(--color-gold)]"
        >
          Ademiluyi 100
        </Link>

        {/* User Avatar */}
        <Link
          href={treeNodeId ? `/profile/${treeNodeId}` : "/dashboard"}
          className="flex items-center gap-2"
        >
          <span className="hidden font-[family-name:var(--font-dm-sans)] text-sm text-[var(--color-text-secondary)] sm:block">
            {displayName}
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-gold)] text-xs font-semibold text-[var(--color-text-primary)]">
            {initials}
          </div>
        </Link>
      </div>
    </nav>
  );
}
