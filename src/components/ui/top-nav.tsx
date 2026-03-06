"use client";

import Link from "next/link";
import { FamilyLogo } from "@/components/ui/family-logo";
import { Avatar } from "@/components/ui/avatar";

interface TopNavProps {
  displayName: string;
  treeNodeId?: string;
  avatarUrl?: string | null;
}

export function TopNav({ displayName, treeNodeId, avatarUrl }: TopNavProps) {
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

        {/* User Avatar */}
        <Link
          href={treeNodeId ? `/profile/${treeNodeId}` : "/dashboard"}
          className="flex items-center gap-2"
        >
          <span className="hidden font-[family-name:var(--font-dm-sans)] text-sm text-[var(--color-text-secondary)] sm:block">
            {displayName}
          </span>
          <Avatar avatarPath={avatarUrl || null} name={displayName} size={32} />
        </Link>
      </div>
    </nav>
  );
}
