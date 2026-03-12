"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Membership, Celebration } from "@/types";

interface CelebrationItem {
  membership: Membership;
  celebration: Celebration;
}

interface SidebarProps {
  userName: string;
  initialCelebrations: CelebrationItem[];
}

export function Sidebar({ userName, initialCelebrations }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [celebrations] = useState(initialCelebrations);

  // Extract current celebration slug from path if we're in /c/[slug]/*
  const slugMatch = pathname.match(/^\/c\/([^/]+)/);
  const currentSlug = slugMatch ? slugMatch[1] : null;

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <aside
      className="w-64 h-screen flex flex-col border-r overflow-y-auto flex-shrink-0"
      style={{
        backgroundColor: "var(--color-ivory)",
        borderColor: "var(--color-gold-light)",
      }}
    >
      {/* Platform name */}
      <div className="px-5 py-5">
        <Link
          href="/dashboard"
          className="text-lg font-bold"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--color-burgundy)",
          }}
        >
          Celebrate Together
        </Link>
      </div>

      {/* User greeting */}
      <div className="px-5 pb-4">
        <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
          Welcome, {userName}
        </p>
      </div>

      {/* Divider */}
      <div className="mx-5 h-px" style={{ backgroundColor: "var(--color-gold-light)" }} />

      {/* Celebrations list */}
      <div className="flex-1 px-3 py-4">
        <p
          className="px-2 text-xs font-semibold uppercase tracking-wider mb-2"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Your Celebrations
        </p>

        {celebrations.length === 0 && (
          <p className="px-2 text-xs" style={{ color: "var(--color-text-secondary)" }}>
            No celebrations yet.
          </p>
        )}

        <div className="flex flex-col gap-0.5">
          {celebrations.map(({ celebration, membership }) => {
            const isActive = currentSlug === celebration.slug;

            return (
              <Link
                key={celebration.id}
                href={`/c/${celebration.slug}`}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-colors"
                style={{
                  backgroundColor: isActive ? "rgba(196, 151, 59, 0.1)" : "transparent",
                  color: isActive ? "var(--color-gold)" : "var(--color-text-primary)",
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{
                    backgroundColor: isActive ? "var(--color-gold)" : "var(--color-gold-light)",
                  }}
                />
                <span className="truncate">{celebration.name}</span>
                {membership.role === "owner" && (
                  <span
                    className="text-xs ml-auto flex-shrink-0"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    Owner
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Create new celebration */}
        <Link
          href="/create"
          className="flex items-center gap-2 px-3 py-2.5 mt-2 rounded-lg text-sm font-medium"
          style={{ color: "var(--color-gold)" }}
        >
          <span>+</span>
          <span>Create New Celebration</span>
        </Link>
      </div>

      {/* Divider */}
      <div className="mx-5 h-px" style={{ backgroundColor: "var(--color-gold-light)" }} />

      {/* Bottom actions */}
      <div className="px-3 py-4 flex flex-col gap-0.5">
        <Link
          href="/settings"
          className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm"
          style={{
            color: pathname === "/settings" ? "var(--color-gold)" : "var(--color-text-secondary)",
          }}
        >
          Settings
        </Link>

        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-left w-full"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}
