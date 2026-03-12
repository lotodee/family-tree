"use client";

import { useEffect } from "react";
import { VideoPlayer } from "@/components/video/video-player";
import { formatDuration } from "@/lib/utils/video";
import type { GalleryItem } from "@/app/api/gallery/route";

interface Props {
  item: GalleryItem;
  onClose: () => void;
}

export function VideoModal({ item, onClose }: Props) {
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
      style={{ backgroundColor: "rgba(0,0,0,0.85)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <div className="flex justify-end mb-3">
          <button
            onClick={onClose}
            className="text-sm font-medium px-3 py-1 rounded"
            style={{ color: "#fff", backgroundColor: "rgba(255,255,255,0.1)" }}
          >
            ✕ Close
          </button>
        </div>

        {/* Video player */}
        <VideoPlayer filePath={item.filePath} autoPlay />

        {/* Info below video */}
        <div className="mt-4">
          <p className="text-base font-medium" style={{ color: "#fff" }}>
            {item.title || "Video message"}
          </p>
          <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.6)" }}>
            By {item.authorName}
            {item.durationSecs !== undefined && ` · ${formatDuration(item.durationSecs)}`}
          </p>
        </div>
      </div>
    </div>
  );
}
