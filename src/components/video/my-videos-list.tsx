"use client";

import { useState } from "react";
import { VideoPlayer } from "./video-player";
import { formatDuration } from "@/lib/utils/video";
import type { Video } from "@/types";

interface MyVideosListProps {
  videos: Video[];
  onDelete: (videoId: string) => void;
}

export function MyVideosList({ videos, onDelete }: MyVideosListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (videos.length === 0) return null;

  return (
    <div className="mt-8">
      <h3
        className="text-sm font-semibold mb-3"
        style={{ color: "var(--color-text-primary)" }}
      >
        Your recorded videos ({videos.length})
      </h3>

      <div className="flex flex-col gap-3">
        {videos.map((video) => {
          const isExpanded = expandedId === video.id;

          return (
            <div
              key={video.id}
              className="rounded-lg overflow-hidden"
              style={{
                border: "1px solid var(--color-gold-light)",
                backgroundColor: "var(--color-ivory)",
              }}
            >
              {/* Row header — always visible */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : video.id)}
                className="w-full flex items-center justify-between px-4 py-3 text-left"
              >
                <div className="flex flex-col">
                  <span
                    className="text-sm font-medium"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    {video.title || "Untitled video"}
                  </span>
                  <span
                    className="text-xs"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    {formatDuration(video.duration_secs)} · {new Date(video.created_at).toLocaleDateString()}
                  </span>
                </div>
                <span
                  className="text-xs"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {isExpanded ? "▲" : "▶ Play"}
                </span>
              </button>

              {/* Expanded — video player + delete */}
              {isExpanded && (
                <div className="px-4 pb-4">
                  <VideoPlayer filePath={video.file_path} />
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={() => onDelete(video.id)}
                      className="text-xs px-3 py-1.5 rounded"
                      style={{ color: "var(--color-error)" }}
                    >
                      Delete this video
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
