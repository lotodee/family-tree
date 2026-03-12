"use client";

import { useEffect } from "react";
import type { GalleryItem } from "@/app/api/gallery/route";

interface Props {
  item: GalleryItem;
  onClose: () => void;
}

export function LetterModal({ item, onClose }: Props) {
  // Close on Escape key
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl max-h-[80vh] overflow-y-auto rounded-2xl"
        style={{
          backgroundColor: "var(--color-cream)",
          border: "1px solid var(--color-gold-light)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="sticky top-0 flex items-center justify-between px-6 py-4 border-b"
          style={{
            backgroundColor: "var(--color-cream)",
            borderColor: "var(--color-gold-light)",
          }}
        >
          <div>
            <p
              className="text-lg font-bold"
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--color-text-primary)",
              }}
            >
              {item.title || "A letter"}
            </p>
            <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
              By {item.authorName} · {new Date(item.createdAt).toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-sm px-3 py-1 rounded"
            style={{ color: "var(--color-text-secondary)" }}
          >
            ✕
          </button>
        </div>

        {/* Letter body */}
        <div className="px-6 py-6">
          <p
            className="text-base leading-relaxed whitespace-pre-wrap"
            style={{
              color: "var(--color-text-primary)",
              fontFamily: "var(--font-body)",
              lineHeight: 1.8,
            }}
          >
            {item.body}
          </p>
        </div>
      </div>
    </div>
  );
}
