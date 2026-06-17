"use client";

import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface AvatarUploadPromptProps {
  onUploaded: (avatarUrl: string) => void;
  onDismiss: () => void;
}

export function AvatarUploadPrompt({
  onUploaded,
  onDismiss,
}: AvatarUploadPromptProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = e.target.files?.[0];
      if (!selected) return;

      // Validate on client side too
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/heic",
      ];
      if (!allowedTypes.includes(selected.type)) {
        toast.error("Please choose a JPEG, PNG, or WebP image");
        return;
      }
      if (selected.size > 5 * 1024 * 1024) {
        toast.error("Image must be under 5MB");
        return;
      }

      setFile(selected);
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(selected);
    },
    []
  );

  const handleUpload = useCallback(async () => {
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await fetch("/api/profile/avatar", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Upload failed");
      }

      const { avatarUrl } = await response.json();
      toast.success("Photo uploaded! Looking great!");
      onUploaded(avatarUrl);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Upload failed. Please try again."
      );
    } finally {
      setIsUploading(false);
    }
  }, [file, onUploaded]);

  return (
    <div className="flex flex-col items-center text-center">
      {/* Header */}
      <h2
        className="mb-1 text-lg font-bold"
        style={{
          fontFamily: "var(--font-display)",
          color: "var(--color-burgundy)",
        }}
      >
        Show your face!
      </h2>
      <p
        className="mb-5 text-sm leading-relaxed"
        style={{ color: "var(--color-text-secondary)" }}
      >
        Upload a photo of yourself — it&apos;ll be part of
        <br />
        <span style={{ color: "var(--color-gold)", fontWeight: 600 }}>
          a special reveal at Grandpa&apos;s celebration!
        </span>
      </p>

      {/* Upload area */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic"
        className="hidden"
        onChange={handleFileSelect}
      />

      {preview ? (
        /* Image preview */
        <div className="relative mb-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="h-32 w-32 overflow-hidden rounded-2xl border-2"
            style={{ borderColor: "var(--color-gold)" }}
          >
            <img
              src={preview}
              alt="Your photo"
              className="h-full w-full object-cover"
            />
          </motion.div>
          <button
            onClick={() => {
              setPreview(null);
              setFile(null);
              if (fileInputRef.current) fileInputRef.current.value = "";
            }}
            className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold"
            style={{
              backgroundColor: "var(--color-burgundy)",
              color: "var(--color-ivory)",
            }}
          >
            X
          </button>
        </div>
      ) : (
        /* Upload dropzone / tap area */
        <button
          onClick={() => fileInputRef.current?.click()}
          className="mb-4 flex h-32 w-32 flex-col items-center justify-center gap-2 rounded-2xl transition-colors"
          style={{
            border: "2px dashed var(--color-gold-light)",
            backgroundColor: "rgba(232, 213, 163, 0.15)",
          }}
        >
          <div
            className="flex h-12 w-12 items-center justify-center rounded-full text-xl"
            style={{
              backgroundColor: "rgba(196, 151, 59, 0.15)",
              color: "var(--color-gold)",
            }}
          >
            +
          </div>
          <span
            className="text-xs font-medium"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Tap to choose
          </span>
        </button>
      )}

      {/* Action buttons */}
      <div className="flex w-full flex-col gap-2">
        {file && (
          <button
            onClick={handleUpload}
            disabled={isUploading}
            className="w-full rounded-xl py-3 text-sm font-semibold transition-opacity disabled:opacity-50"
            style={{
              backgroundColor: "var(--color-gold)",
              color: "var(--color-text-primary)",
            }}
          >
            {isUploading ? "Uploading..." : "Upload My Photo"}
          </button>
        )}

        {!file && (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full rounded-xl py-3 text-sm font-semibold"
            style={{
              backgroundColor: "var(--color-gold)",
              color: "var(--color-text-primary)",
            }}
          >
            Choose a Photo
          </button>
        )}

        <button
          onClick={onDismiss}
          className="w-full py-2 text-sm transition-opacity hover:opacity-70"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}
