"use client";

import { VideoCard } from "./video-card";
import { LetterCard } from "./letter-card";
import type { GalleryItem } from "@/app/api/gallery/route";

interface Props {
  items: GalleryItem[];
  onItemClick: (item: GalleryItem) => void;
}

export function GalleryGrid({ items, onItemClick }: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {items.map((item) =>
        item.type === "video" ? (
          <VideoCard key={item.id} item={item} onClick={() => onItemClick(item)} />
        ) : (
          <LetterCard key={item.id} item={item} onClick={() => onItemClick(item)} />
        )
      )}
    </div>
  );
}
