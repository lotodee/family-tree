"use client";

import type { GalleryItem } from "@/app/api/gallery/route";

interface Props {
  item: GalleryItem;
  onClick: () => void;
}

export function LetterCard({ item, onClick }: Props) {
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
      {/* Letter preview */}
      <div className="w-full aspect-video flex flex-col items-start p-4" style={{ backgroundColor: "rgba(196,151,59,0.04)" }}>
        {item.title && (
          <p
            className="text-sm font-semibold mb-1"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-text-primary)",
            }}
          >
            {item.title}
          </p>
        )}
        <p
          className="text-xs leading-relaxed"
          style={{
            color: "var(--color-text-secondary)",
            display: "-webkit-box",
            WebkitLineClamp: 4,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {item.body || ""}
        </p>
      </div>

      {/* Info */}
      <div className="px-3 py-3">
        <p
          className="text-sm font-medium truncate mb-0.5"
          style={{ color: "var(--color-text-primary)" }}
        >
          {item.title || "Letter"}
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
