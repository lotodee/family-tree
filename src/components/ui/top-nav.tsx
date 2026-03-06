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
        {/* Logo + Celebration */}
        <Link href="/dashboard" className="flex items-center gap-3">
          <FamilyLogo showTagline={false} size="sm" />
          <div className="hidden border-l border-gold/30 pl-3 sm:block">
            <p className="text-xs font-semibold text-burgundy">Grandpa&apos;s Century</p>
            <p className="text-[10px] text-text-secondary">Celebrating 100 years of love &amp; legacy</p>
          </div>
        </Link>

        {/* Profile Dropdown */}
        <ProfileDropdown displayName={displayName} avatarPath={avatarUrl || null} />
      </div>
    </nav>
  );
}
