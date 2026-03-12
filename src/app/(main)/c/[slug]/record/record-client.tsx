"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useCelebration } from "@/lib/contexts/celebration-context";
import { useVideoRecorder } from "@/lib/hooks/use-video-recorder";
import { gsap, useGSAP } from "@/lib/gsap/config";
import { formatDuration } from "@/lib/utils/video";
import { formatVideoLimit } from "@/lib/config/roles";
import { VideoPlayer } from "@/components/video/video-player";
import { MyVideosList } from "@/components/video/my-videos-list";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Video } from "@/types";

export function RecordClient() {
  const { celebration, membership } = useCelebration();
  const router = useRouter();
  const [myVideos, setMyVideos] = useState<Video[]>([]);
  const [title, setTitle] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const maxDuration = membership.video_limit_secs;

  const recorder = useVideoRecorder({
    maxDurationSecs: maxDuration,
    onTimeLimitReached: () => {
      toast.info("Time's up! Your recording has been saved.");
    },
  });

  // GSAP: pulse the viewfinder border during recording
  useGSAP(() => {
    if (recorder.state === "recording") {
      gsap.to(".viewfinder-border", {
        borderColor: "rgba(200, 30, 30, 0.4)",
        duration: 0.8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }
    return () => {
      gsap.killTweensOf(".viewfinder-border");
    };
  }, { scope: containerRef, dependencies: [recorder.state] });

  // Fetch user's existing videos on mount
  useEffect(() => {
    async function fetchVideos() {
      try {
        const res = await fetch(`/api/videos?celebrationId=${celebration.id}`);
        if (res.ok) {
          const { videos } = await res.json();
          setMyVideos(videos);
        }
      } catch {
        // Non-critical — silent fail
      }
    }
    fetchVideos();
  }, [celebration.id]);

  // Save the recorded video
  const handleSave = useCallback(async () => {
    if (!recorder.recordedBlob) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      const ext = recorder.recordedBlob.type.includes("mp4") ? "mp4" : "webm";
      formData.append("file", recorder.recordedBlob, `recording.${ext}`);
      formData.append("celebrationId", celebration.id);
      formData.append("durationSecs", recorder.elapsedSecs.toString());
      if (title.trim()) formData.append("title", title.trim());
      if (membership.tree_node_id) formData.append("treeNodeId", membership.tree_node_id);

      const res = await fetch("/api/videos/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Upload failed");
      }

      const { video } = await res.json();

      toast.success("Video saved!");
      setMyVideos((prev) => [video, ...prev]);
      setTitle("");
      recorder.resetRecording();
      recorder.stopCamera();
      // Return to celebration home after a short delay
      setTimeout(() => {
        router.push(`/c/${celebration.slug}`);
      }, 1500);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save video");
    } finally {
      setIsUploading(false);
    }
  }, [recorder, celebration.id, membership.tree_node_id, title]);

  // Delete a video
  const handleDeleteVideo = useCallback(async (videoId: string) => {
    if (!confirm("Delete this video? This can't be undone.")) return;

    try {
      const res = await fetch(`/api/videos?id=${videoId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Video deleted");
      setMyVideos((prev) => prev.filter((v) => v.id !== videoId));
    } catch {
      toast.error("Failed to delete video");
    }
  }, []);

  // ────────────────────────────────────────────────────────
  // RENDER
  // ────────────────────────────────────────────────────────

  const progressPercent = maxDuration > 0 ? (recorder.elapsedSecs / maxDuration) * 100 : 0;

  return (
    <div ref={containerRef} className="min-h-screen p-6 max-w-2xl mx-auto">
      {/* Back link */}
      <Link
        href={`/c/${celebration.slug}`}
        className="text-sm mb-4 inline-block"
        style={{ color: "var(--color-text-secondary)" }}
      >
        ← Back
      </Link>

      {/* Page heading */}
      <h1
        className="text-xl font-bold mb-1"
        style={{ fontFamily: "var(--font-display)", color: "var(--color-text-primary)" }}
      >
        Record a message
      </h1>
      <p className="text-sm mb-6" style={{ color: "var(--color-text-secondary)" }}>
        For {celebration.name} · You have {formatVideoLimit(maxDuration)} to record
      </p>

      {/* ── STATE: idle ──────────────────────────────── */}
      {recorder.state === "idle" && (
        <div className="flex flex-col items-center py-12">
          <button
            onClick={recorder.startCamera}
            className="px-8 py-4 rounded-xl text-base font-medium"
            style={{
              backgroundColor: "var(--color-gold)",
              color: "var(--color-text-primary)",
            }}
          >
            Open Camera
          </button>
          <p className="mt-3 text-xs" style={{ color: "var(--color-text-secondary)" }}>
            You'll be asked to allow camera and microphone access.
          </p>
        </div>
      )}

      {/* ── STATE: requesting ────────────────────────── */}
      {recorder.state === "requesting" && (
        <div className="flex flex-col items-center py-12">
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            Waiting for camera access...
          </p>
        </div>
      )}

      {/* ── STATE: error ─────────────────────────────── */}
      {recorder.state === "error" && (
        <div className="flex flex-col items-center py-12 text-center">
          <p className="text-sm mb-4" style={{ color: "var(--color-error)" }}>
            {recorder.error}
          </p>
          <button
            onClick={recorder.startCamera}
            className="px-6 py-3 rounded-lg text-sm font-medium"
            style={{
              border: "1.5px solid var(--color-gold)",
              color: "var(--color-gold)",
            }}
          >
            Try Again
          </button>
        </div>
      )}

      {/* ── STATE: ready ─────────────────────────────── */}
      {recorder.state === "ready" && (
        <div>
          {/* Viewfinder */}
          <div className="relative rounded-xl overflow-hidden mb-4" style={{ backgroundColor: "#000" }}>
            <video
              ref={recorder.videoRef}
              muted
              playsInline
              className="w-full"
              style={{
                aspectRatio: "16 / 9",
                objectFit: "cover",
                transform: recorder.facingMode === "user" ? "scaleX(-1)" : "none",
              }}
            />

            {/* Camera flip button */}
            {recorder.hasMultipleCameras && (
              <button
                onClick={recorder.toggleCamera}
                className="absolute top-3 right-3 w-10 h-10 flex items-center justify-center rounded-full"
                style={{ backgroundColor: "rgba(0,0,0,0.5)", color: "#fff", fontSize: "1.2rem" }}
                title="Flip camera"
              >
                🔄
              </button>
            )}
          </div>

          {/* Timer */}
          <p className="text-center text-sm mb-4" style={{ color: "var(--color-text-secondary)" }}>
            {formatDuration(maxDuration)} available
          </p>

          {/* Record button */}
          <div className="flex justify-center">
            <button
              onClick={recorder.startRecording}
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: "var(--color-error)",
                boxShadow: "0 0 0 4px var(--color-cream), 0 0 0 6px var(--color-error)",
              }}
              title="Start recording"
            >
              <div className="w-6 h-6 rounded-full" style={{ backgroundColor: "#fff" }} />
            </button>
          </div>
        </div>
      )}

      {/* ── STATE: recording ─────────────────────────── */}
      {recorder.state === "recording" && (
        <div>
          {/* Viewfinder with pulsing border */}
          <div
            className="viewfinder-border relative rounded-xl overflow-hidden mb-4"
            style={{
              border: "3px solid var(--color-error)",
              backgroundColor: "#000",
            }}
          >
            <video
              ref={recorder.videoRef}
              muted
              playsInline
              className="w-full"
              style={{
                aspectRatio: "16 / 9",
                objectFit: "cover",
                transform: recorder.facingMode === "user" ? "scaleX(-1)" : "none",
              }}
            />

            {/* REC indicator */}
            <div
              className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 rounded"
              style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
            >
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "var(--color-error)" }} />
              <span className="text-xs font-medium" style={{ color: "#fff" }}>REC</span>
            </div>
          </div>

          {/* Timer + progress bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span style={{ color: "var(--color-text-primary)" }}>
                {formatDuration(recorder.elapsedSecs)} elapsed
              </span>
              <span style={{ color: "var(--color-text-secondary)" }}>
                {formatDuration(recorder.remainingSecs)} left
              </span>
            </div>
            <div
              className="w-full h-1.5 rounded-full overflow-hidden"
              style={{ backgroundColor: "var(--color-gold-light)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(progressPercent, 100)}%`,
                  backgroundColor: progressPercent > 90 ? "var(--color-error)" : "var(--color-gold)",
                }}
              />
            </div>
          </div>

          {/* Stop button */}
          <div className="flex justify-center">
            <button
              onClick={recorder.stopRecording}
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: "var(--color-error)",
                boxShadow: "0 0 0 4px var(--color-cream), 0 0 0 6px var(--color-error)",
              }}
              title="Stop recording"
            >
              <div className="w-6 h-6 rounded-sm" style={{ backgroundColor: "#fff" }} />
            </button>
          </div>
        </div>
      )}

      {/* ── STATE: stopped (preview) ─────────────────── */}
      {recorder.state === "stopped" && recorder.recordedUrl && (
        <div>
          {/* Preview heading */}
          <h2
            className="text-base font-semibold mb-3"
            style={{ color: "var(--color-text-primary)" }}
          >
            Preview your recording
          </h2>

          {/* Video preview */}
          <div className="rounded-xl overflow-hidden mb-4">
            <VideoPlayer directUrl={recorder.recordedUrl} autoPlay={false} />
          </div>

          {/* Duration */}
          <p className="text-sm mb-4" style={{ color: "var(--color-text-secondary)" }}>
            Duration: {formatDuration(recorder.elapsedSecs)}
          </p>

          {/* Title input */}
          <div className="mb-6">
            <label
              className="block text-sm font-medium mb-1"
              style={{ color: "var(--color-text-primary)" }}
            >
              Title (optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Happy birthday Grandpa!"
              className="w-full px-4 py-3 rounded-lg text-sm outline-none"
              style={{
                border: "1.5px solid var(--color-gold-light)",
                backgroundColor: "var(--color-ivory)",
                color: "var(--color-text-primary)",
              }}
              maxLength={100}
            />
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={isUploading}
              className="flex-1 px-6 py-3 rounded-lg text-sm font-medium disabled:opacity-50"
              style={{
                backgroundColor: "var(--color-gold)",
                color: "var(--color-text-primary)",
              }}
            >
              {isUploading ? "Uploading..." : "Save Video"}
            </button>
            <button
              onClick={recorder.resetRecording}
              disabled={isUploading}
              className="px-6 py-3 rounded-lg text-sm font-medium disabled:opacity-50"
              style={{
                border: "1.5px solid var(--color-gold-light)",
                color: "var(--color-text-primary)",
              }}
            >
              Re-record
            </button>
            <button
              onClick={() => {
                recorder.resetRecording();
                recorder.stopCamera();
              }}
              disabled={isUploading}
              className="px-6 py-3 rounded-lg text-sm font-medium disabled:opacity-50"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Discard
            </button>
          </div>
        </div>
      )}

      {/* ── User's recorded videos ───────────────────── */}
      {(recorder.state === "idle" || recorder.state === "stopped") && (
        <MyVideosList videos={myVideos} onDelete={handleDeleteVideo} />
      )}
    </div>
  );
}
