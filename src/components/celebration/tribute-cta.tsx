"use client";

import Link from "next/link";
import { useCelebration } from "@/lib/contexts/celebration-context";
import { formatVideoLimit } from "@/lib/config/roles";

export function TributeCTA() {
  const { celebration, membership } = useCelebration();
  const slug = celebration.slug;

  // Find the honoree name from context if available
  // For now, use the celebration name
  const videoLimit = formatVideoLimit(membership.video_limit_secs);

  return (
    <div
      className="rounded-xl p-6"
      style={{
        backgroundColor: "var(--color-ivory)",
        border: "1.5px solid var(--color-gold-light)",
      }}
    >
      <h2
        className="text-lg font-bold mb-1"
        style={{
          fontFamily: "var(--font-display)",
          color: "var(--color-text-primary)",
        }}
      >
        Share your message
      </h2>
      <p
        className="text-sm mb-5"
        style={{ color: "var(--color-text-secondary)" }}
      >
        Record a video ({videoLimit}) or write a letter for the celebration.
      </p>

      <div className="flex gap-3">
        <Link
          href={`/c/${slug}/record`}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-sm font-medium"
          style={{
            backgroundColor: "var(--color-gold)",
            color: "var(--color-text-primary)",
          }}
        >
          <span className="text-base">🎥</span>
          Record Video
        </Link>
        <Link
          href={`/c/${slug}/write`}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-sm font-medium"
          style={{
            border: "1.5px solid var(--color-gold)",
            color: "var(--color-gold)",
          }}
        >
          <span className="text-base">✉️</span>
          Write Letter
        </Link>
      </div>
    </div>
  );
}
