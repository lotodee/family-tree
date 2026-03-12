"use client";

import { useState, useEffect } from "react";
import { useCelebration } from "@/lib/contexts/celebration-context";
import { formatDuration } from "@/lib/utils/video";
import Link from "next/link";

interface Tribute {
  id: string;
  type: "video" | "letter";
  title: string | null;
  authorName: string;
  createdAt: string;
  // Video-specific
  filePath?: string;
  durationSecs?: number;
  // Letter-specific
  bodyPreview?: string;
}

export function RecentTributes() {
  const { celebration } = useCelebration();
  const [tributes, setTributes] = useState<Tribute[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchTributes() {
      try {
        const res = await fetch(`/api/tributes/recent?celebrationId=${celebration.id}`);
        if (res.ok) {
          const data = await res.json();
          setTributes(data.tributes);
        }
      } catch {
        // Non-critical — silent fail
      } finally {
        setIsLoading(false);
      }
    }
    fetchTributes();
  }, [celebration.id]);

  if (isLoading) {
    return (
      <div className="mt-8">
        <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--color-text-primary)" }}>
          Recent tributes
        </h3>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex-shrink-0 w-44 h-32 rounded-lg animate-pulse"
              style={{ backgroundColor: "var(--color-gold-light)", opacity: 0.3 }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (tributes.length === 0) {
    return (
      <div className="mt-8">
        <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--color-text-primary)" }}>
          Recent tributes
        </h3>
        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
          No messages yet. Be the first to share!
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
          Recent tributes
        </h3>
        <Link
          href={`/c/${celebration.slug}/gallery`}
          className="text-xs font-medium"
          style={{ color: "var(--color-gold)" }}
        >
          See all →
        </Link>
      </div>

      <div
        className="flex gap-3 overflow-x-auto pb-2"
        style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" as unknown as undefined }}
      >
        {tributes.map((tribute) => (
          <TributeCard key={tribute.id} tribute={tribute} slug={celebration.slug} />
        ))}
      </div>
    </div>
  );
}

function TributeCard({ tribute, slug }: { tribute: Tribute; slug: string }) {
  return (
    <div
      className="flex-shrink-0 w-44 rounded-lg overflow-hidden"
      style={{
        scrollSnapAlign: "start",
        border: "1px solid var(--color-gold-light)",
        backgroundColor: "var(--color-ivory)",
      }}
    >
      {tribute.type === "video" ? (
        <div
          className="w-full h-24 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.05)" }}
        >
          <span className="text-2xl">🎥</span>
        </div>
      ) : (
        <div
          className="w-full h-24 flex items-start p-3"
          style={{ backgroundColor: "rgba(196,151,59,0.05)" }}
        >
          <p
            className="text-xs line-clamp-4"
            style={{
              color: "var(--color-text-secondary)",
              fontStyle: "italic",
            }}
          >
            {tribute.bodyPreview || "A letter..."}
          </p>
        </div>
      )}

      <div className="px-3 py-2">
        <p
          className="text-xs font-medium truncate"
          style={{ color: "var(--color-text-primary)" }}
        >
          {tribute.authorName}
        </p>
        <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
          {tribute.type === "video" && tribute.durationSecs
            ? formatDuration(tribute.durationSecs)
            : tribute.type === "letter"
            ? "Letter"
            : "Video"}
        </p>
      </div>
    </div>
  );
}
