"use client";

import { useCelebration } from "@/lib/contexts/celebration-context";
import { TributeCTA } from "@/components/celebration/tribute-cta";
import { RecentTributes } from "@/components/celebration/recent-tributes";
import Link from "next/link";

interface Props {
  memberCount: number;
  treeNodeCount: number;
}

export function HomeClient({ memberCount, treeNodeCount }: Props) {
  const { celebration } = useCelebration();

  const eventDate = celebration.event_date
    ? new Date(celebration.event_date).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <div className="px-6 py-6 max-w-lg mx-auto">
      {/* Celebration header */}
      <h1
        className="text-2xl font-bold mb-1"
        style={{
          fontFamily: "var(--font-display)",
          color: "var(--color-text-primary)",
        }}
      >
        {celebration.name}
      </h1>

      {eventDate && (
        <p className="text-sm mb-1" style={{ color: "var(--color-text-secondary)" }}>
          {eventDate}
        </p>
      )}

      <p className="text-sm mb-6" style={{ color: "var(--color-text-secondary)" }}>
        {memberCount} {memberCount === 1 ? "member" : "members"} ·{" "}
        {treeNodeCount} on the family tree
      </p>

      {celebration.description && (
        <p
          className="text-sm mb-8 leading-relaxed"
          style={{
            color: "var(--color-text-secondary)",
            fontStyle: "italic",
          }}
        >
          {celebration.description}
        </p>
      )}

      {/* Primary action — record or write */}
      <TributeCTA />

      {/* Recent tributes */}
      <RecentTributes />

      {/* Quick links */}
      <div className="mt-8 flex flex-col gap-2">
        <Link
          href={`/c/${celebration.slug}/tree`}
          className="flex items-center justify-between px-4 py-3 rounded-lg"
          style={{
            backgroundColor: "var(--color-ivory)",
            border: "1px solid var(--color-gold-light)",
          }}
        >
          <div>
            <span
              className="text-sm font-medium"
              style={{ color: "var(--color-text-primary)" }}
            >
              Family Tree
            </span>
            <span
              className="text-xs ml-2"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {treeNodeCount} people
            </span>
          </div>
          <span style={{ color: "var(--color-text-secondary)" }}>→</span>
        </Link>

        <Link
          href={`/c/${celebration.slug}/gallery`}
          className="flex items-center justify-between px-4 py-3 rounded-lg"
          style={{
            backgroundColor: "var(--color-ivory)",
            border: "1px solid var(--color-gold-light)",
          }}
        >
          <span
            className="text-sm font-medium"
            style={{ color: "var(--color-text-primary)" }}
          >
            Gallery
          </span>
          <span style={{ color: "var(--color-text-secondary)" }}>→</span>
        </Link>
      </div>
    </div>
  );
}
