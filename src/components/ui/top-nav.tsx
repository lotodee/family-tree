"use client";

import Link from "next/link";
import { FamilyLogo } from "@/components/ui/family-logo";
import { ProfileDropdown } from "@/components/ui/profile-dropdown";

interface TopNavProps {
  displayName: string;
  avatarUrl?: string | null;
}

export function TopNav({ displayName, avatarUrl }: TopNavProps) {
  return (
    <nav className="sticky top-0 z-50 border-b border-[var(--color-gold-light)] bg-[var(--color-cream)]">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-3">
          <FamilyLogo showTagline={false} size="sm" />
          <span className="hidden font-[family-name:var(--font-playfair)] text-lg font-semibold text-[var(--color-burgundy)] sm:block">
            Celebrate
          </span>
        </Link>

        {/* Profile Dropdown */}
        <ProfileDropdown displayName={displayName} avatarPath={avatarUrl || null} />
      </div>
    </nav>
  );
}
