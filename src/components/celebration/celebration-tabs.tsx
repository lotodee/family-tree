"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCelebration } from "@/lib/contexts/celebration-context";

export function CelebrationTabs() {
  const pathname = usePathname();
  const { celebration, membership } = useCelebration();
  const slug = celebration.slug;

  // Hide on focused-mode pages
  const hiddenPaths = [`/c/${slug}/record`, `/c/${slug}/write`];
  if (hiddenPaths.some((p) => pathname.startsWith(p))) {
    return null;
  }

  const canManage =
    membership.role === "owner" ||
    membership.can_add_to_tree ||
    membership.can_invite;

  const tabs = [
    {
      label: "Home",
      href: `/c/${slug}`,
      isActive: pathname === `/c/${slug}`,
    },
    {
      label: "Gallery",
      href: `/c/${slug}/gallery`,
      isActive: pathname.startsWith(`/c/${slug}/gallery`),
    },
    {
      label: "Tree",
      href: `/c/${slug}/tree`,
      isActive: pathname.startsWith(`/c/${slug}/tree`),
    },
  ];

  if (canManage) {
    tabs.push({
      label: "Manage",
      href: `/c/${slug}/manage`,
      isActive: pathname.startsWith(`/c/${slug}/manage`),
    });
  }

  return (
    <div
      className="flex gap-1 px-6 border-b"
      style={{ borderColor: "var(--color-gold-light)" }}
    >
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className="px-4 py-3 text-sm font-medium relative transition-colors"
          style={{
            color: tab.isActive ? "var(--color-gold)" : "var(--color-text-secondary)",
          }}
        >
          {tab.label}
          {tab.isActive && (
            <div
              className="absolute bottom-0 left-0 right-0 h-0.5"
              style={{ backgroundColor: "var(--color-gold)" }}
            />
          )}
        </Link>
      ))}
    </div>
  );
}
