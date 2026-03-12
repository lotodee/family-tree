"use client";

import { useState, useEffect } from "react";
import { useCelebration } from "@/lib/contexts/celebration-context";
import { GalleryGrid } from "@/components/gallery/gallery-grid";
import { VideoModal } from "@/components/gallery/video-modal";
import { LetterModal } from "@/components/gallery/letter-modal";
import type { GalleryItem } from "@/app/api/gallery/route";

type FilterType = "all" | "video" | "letter";

export function GalleryClient() {
  const { celebration } = useCelebration();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [filter, setFilter] = useState<FilterType>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  useEffect(() => {
    async function fetchGallery() {
      try {
        const res = await fetch(`/api/gallery?celebrationId=${celebration.id}`);
        if (res.ok) {
          const data = await res.json();
          setItems(data.items);
        }
      } catch {
        // Silent
      } finally {
        setIsLoading(false);
      }
    }
    fetchGallery();
  }, [celebration.id]);

  const filtered = filter === "all" ? items : items.filter((i) => i.type === filter);

  const videoCount = items.filter((i) => i.type === "video").length;
  const letterCount = items.filter((i) => i.type === "letter").length;

  return (
    <div className="px-6 py-6">
      {/* Heading */}
      <h1
        className="text-xl font-bold mb-1"
        style={{
          fontFamily: "var(--font-display)",
          color: "var(--color-text-primary)",
        }}
      >
        Gallery
      </h1>
      <p className="text-sm mb-6" style={{ color: "var(--color-text-secondary)" }}>
        {items.length} {items.length === 1 ? "message" : "messages"} from the family
      </p>

      {/* Filter bar */}
      <div className="flex gap-2 mb-6">
        {([
          { key: "all" as FilterType, label: `All (${items.length})` },
          { key: "video" as FilterType, label: `Videos (${videoCount})` },
          { key: "letter" as FilterType, label: `Letters (${letterCount})` },
        ]).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              backgroundColor: filter === key ? "var(--color-gold)" : "transparent",
              color: filter === key ? "var(--color-text-primary)" : "var(--color-text-secondary)",
              border: filter === key ? "none" : "1px solid var(--color-gold-light)",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="rounded-xl aspect-[4/5] animate-pulse"
              style={{ backgroundColor: "var(--color-gold-light)", opacity: 0.2 }}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && items.length === 0 && (
        <div className="text-center py-16">
          <p className="text-base mb-2" style={{ color: "var(--color-text-primary)" }}>
            No messages yet
          </p>
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            Be the first to share a video or letter for the celebration.
          </p>
        </div>
      )}

      {/* Gallery grid */}
      {!isLoading && filtered.length > 0 && (
        <GalleryGrid items={filtered} onItemClick={setSelectedItem} />
      )}

      {/* No results for current filter */}
      {!isLoading && items.length > 0 && filtered.length === 0 && (
        <p className="text-center py-8 text-sm" style={{ color: "var(--color-text-secondary)" }}>
          No {filter === "video" ? "videos" : "letters"} yet.
        </p>
      )}

      {/* Modals */}
      {selectedItem?.type === "video" && (
        <VideoModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}
      {selectedItem?.type === "letter" && (
        <LetterModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}
    </div>
  );
}
