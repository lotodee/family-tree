"use client";

import { formatDuration } from "@/lib/utils/video";
import type { GalleryItem } from "@/app/api/gallery/route";

interface Props {
  item: GalleryItem;
  onClick: () => void;
}

export function VideoCard({ item, onClick }: Props) {
  const initials = item.authorName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <button
      onClick={onClick}
      className="text-left rounded-xl overflow-hidden transition-shadow hover:shadow-md"
      style={{
        border: "1px solid var(--color-gold-light)",
        backgroundColor: "var(--color-ivory)",
      }}
    >
      {/* Thumbnail area */}
      <div
        className="w-full aspect-video flex items-center justify-center relative"
        style={{ backgroundColor: "rgba(0,0,0,0.06)" }}
      >
        {/* Play icon */}
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{ backgroundColor: "rgba(255,255,255,0.9)" }}
        >
          <span
            className="text-sm ml-0.5"
            style={{ color: "var(--color-text-primary)" }}
          >
            ▶
          </span>
        </div>

        {/* Duration badge */}
        {item.durationSecs !== undefined && (
          <span
            className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded text-xs font-medium"
            style={{ backgroundColor: "rgba(0,0,0,0.6)", color: "#fff" }}
          >
            {formatDuration(item.durationSecs)}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="px-3 py-3">
        <p
          className="text-sm font-medium truncate mb-0.5"
          style={{ color: "var(--color-text-primary)" }}
        >
          {item.title || "Video message"}
        </p>
        <div className="flex items-center gap-2">
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              backgroundColor: "var(--color-gold)",
              color: "var(--color-ivory)",
              fontSize: "0.5rem",
              fontWeight: 700,
            }}
          >
            {initials}
          </div>
          <span className="text-xs truncate" style={{ color: "var(--color-text-secondary)" }}>
            {item.authorName}
          </span>
        </div>
      </div>
    </button>
  );
}
