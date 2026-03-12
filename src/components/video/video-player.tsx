"use client";

import { useState, useEffect } from "react";
import { getSignedVideoUrl } from "@/lib/utils/video";

interface VideoPlayerProps {
  /** Supabase Storage path — component will create a signed URL */
  filePath?: string;
  /** Direct URL (e.g., blob URL from recording preview) — used as-is */
  directUrl?: string;
  /** If true, start playing immediately */
  autoPlay?: boolean;
  /** Additional CSS classes on the container */
  className?: string;
}

export function VideoPlayer({ filePath, directUrl, autoPlay = false, className = "" }: VideoPlayerProps) {
  const [url, setUrl] = useState<string | null>(directUrl || null);
  const [isLoading, setIsLoading] = useState(!directUrl);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (directUrl) {
      setUrl(directUrl);
      setIsLoading(false);
      return;
    }

    if (!filePath) {
      setIsLoading(false);
      setHasError(true);
      return;
    }

    let cancelled = false;

    async function loadUrl() {
      const signedUrl = await getSignedVideoUrl(filePath!);
      if (cancelled) return;
      if (signedUrl) {
        setUrl(signedUrl);
      } else {
        setHasError(true);
      }
      setIsLoading(false);
    }

    loadUrl();
    return () => { cancelled = true; };
  }, [filePath, directUrl]);

  if (isLoading) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg aspect-video ${className}`}
        style={{ backgroundColor: "rgba(0,0,0,0.05)" }}
      >
        <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
          Loading video...
        </span>
      </div>
    );
  }

  if (hasError || !url) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg aspect-video ${className}`}
        style={{ backgroundColor: "rgba(0,0,0,0.05)" }}
      >
        <span className="text-sm" style={{ color: "var(--color-error)" }}>
          Could not load video
        </span>
      </div>
    );
  }

  return (
    <video
      src={url}
      controls
      autoPlay={autoPlay}
      playsInline
      className={`rounded-lg ${className}`}
      style={{
        width: "100%",
        aspectRatio: "16 / 9",
        objectFit: "contain",
        backgroundColor: "#000",
      }}
    >
      Your browser does not support video playback.
    </video>
  );
}
