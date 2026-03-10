"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { Camera, Image } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Avatar } from "@/components/ui/avatar";
import type { Profile } from "@/types";

interface SettingsClientProps {
  profile: Profile & {
    tree_node: { display_name: string; branch: string | null; generation: number } | null;
  };
  email: string;
}

export function SettingsClient({ profile, email }: SettingsClientProps) {
  const [avatarPath, setAvatarPath] = useState(profile.avatar_url);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  const handlePhotoSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = e.target.files?.[0];
      if (!selected) return;

      // Validate
      const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/heic"];
      if (!allowedTypes.includes(selected.type)) {
        toast.error("Please choose a JPEG, PNG, or WebP image");
        return;
      }
      if (selected.size > 5 * 1024 * 1024) {
        toast.error("Image must be under 5MB");
        return;
      }

      setIsUploadingPhoto(true);
      try {
        const formData = new FormData();
        formData.append("avatar", selected);

        const response = await fetch("/api/profile/avatar", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Upload failed");
        }

        const { avatarUrl } = await response.json();
        setAvatarPath(avatarUrl);
        toast.success("Photo updated!");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setIsUploadingPhoto(false);
        // Reset input so selecting the same file triggers onChange
        if (fileInputRef.current) fileInputRef.current.value = "";
        if (cameraInputRef.current) cameraInputRef.current.value = "";
      }
    },
    []
  );

  const handlePasswordChange = useCallback(async () => {
    // Client-side validation
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }
    if (currentPassword === newPassword) {
      toast.error("New password must be different from your current password");
      return;
    }

    setIsChangingPassword(true);
    try {
      const supabase = createClient();

      // First, verify the current password by trying to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: currentPassword,
      });

      if (signInError) {
        toast.error("Current password is incorrect");
        return;
      }

      // Update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        toast.error("Failed to update password. Please try again.");
        return;
      }

      toast.success("Password updated! Remember your new password.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsChangingPassword(false);
    }
  }, [currentPassword, newPassword, confirmPassword, email]);

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      {/* Back link */}
      <Link
        href="/dashboard"
        className="mb-4 inline-flex items-center gap-1 text-sm"
        style={{ color: "var(--color-text-secondary)" }}
      >
        &larr; Back to Dashboard
      </Link>

      {/* Page header */}
      <h1
        className="mb-6 text-xl font-bold"
        style={{ fontFamily: "var(--font-display)", color: "var(--color-burgundy)" }}
      >
        Settings
      </h1>

      {/* ============================================ */}
      {/* SECTION 1: Profile Photo                     */}
      {/* ============================================ */}
      <div
        className="mb-6 rounded-2xl p-6"
        style={{
          backgroundColor: "var(--color-ivory)",
          border: "1px solid var(--color-gold-light)",
        }}
      >
        <h2
          className="mb-4 text-base font-semibold"
          style={{ fontFamily: "var(--font-display)", color: "var(--color-text-primary)" }}
        >
          Your Photo
        </h2>

        <div className="flex items-center gap-5">
          {/* Large avatar */}
          <div className="relative flex-shrink-0">
            <Avatar avatarPath={avatarPath} name={profile.full_name} size={80} />

            {/* Camera overlay button */}
            <button
              onClick={() => cameraInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full shadow-md"
              style={{
                backgroundColor: "var(--color-gold)",
                color: "var(--color-ivory)",
                border: "2px solid var(--color-ivory)",
              }}
            >
              <Camera className="h-4 w-4" />
            </button>
          </div>

          {/* Upload buttons */}
          <div className="flex flex-1 flex-col gap-2">
            <button
              onClick={() => cameraInputRef.current?.click()}
              disabled={isUploadingPhoto}
              className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
              style={{
                backgroundColor: "var(--color-gold)",
                color: "var(--color-text-primary)",
                opacity: isUploadingPhoto ? 0.5 : 1,
              }}
            >
              <Camera className="h-4 w-4" />
              {isUploadingPhoto ? "Uploading..." : "Take New Photo"}
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingPhoto}
              className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
              style={{
                border: "1.5px solid var(--color-gold-light)",
                color: "var(--color-text-primary)",
                opacity: isUploadingPhoto ? 0.5 : 1,
              }}
            >
              <Image className="h-4 w-4" />
              Choose from Gallery
            </button>
          </div>
        </div>

        {/* Hidden file inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic"
          className="hidden"
          onChange={handlePhotoSelect}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handlePhotoSelect}
        />
      </div>

      {/* ============================================ */}
      {/* SECTION 2: Change Password                   */}
      {/* ============================================ */}
      <div
        className="mb-6 rounded-2xl p-6"
        style={{
          backgroundColor: "var(--color-ivory)",
          border: "1px solid var(--color-gold-light)",
        }}
      >
        <h2
          className="mb-1 text-base font-semibold"
          style={{ fontFamily: "var(--font-display)", color: "var(--color-text-primary)" }}
        >
          Change Password
        </h2>
        <p className="mb-4 text-xs" style={{ color: "var(--color-text-secondary)" }}>
          Your login email is <strong>{email}</strong>
        </p>

        <div className="flex flex-col gap-3">
          {/* Current password */}
          <div>
            <label
              className="mb-1 block text-xs font-medium"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Current Password
            </label>
            <input
              type={showPasswords ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter your current password"
              className="w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-colors"
              style={{
                border: "1.5px solid var(--color-gold-light)",
                backgroundColor: "white",
                color: "var(--color-text-primary)",
              }}
              autoComplete="current-password"
            />
          </div>

          {/* New password */}
          <div>
            <label
              className="mb-1 block text-xs font-medium"
              style={{ color: "var(--color-text-secondary)" }}
            >
              New Password
            </label>
            <input
              type={showPasswords ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter a new password"
              className="w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-colors"
              style={{
                border: "1.5px solid var(--color-gold-light)",
                backgroundColor: "white",
                color: "var(--color-text-primary)",
              }}
              autoComplete="new-password"
            />
          </div>

          {/* Confirm new password */}
          <div>
            <label
              className="mb-1 block text-xs font-medium"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Confirm New Password
            </label>
            <input
              type={showPasswords ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              className="w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-colors"
              style={{
                border: "1.5px solid var(--color-gold-light)",
                backgroundColor: "white",
                color: "var(--color-text-primary)",
              }}
              autoComplete="new-password"
            />
          </div>

          {/* Show/hide passwords toggle */}
          <button
            onClick={() => setShowPasswords(!showPasswords)}
            className="self-start py-1 text-xs"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {showPasswords ? "Hide passwords" : "Show passwords"}
          </button>

          {/* Submit button */}
          <button
            onClick={handlePasswordChange}
            disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
            className="w-full rounded-lg py-2.5 text-sm font-medium transition-opacity disabled:opacity-40"
            style={{
              backgroundColor: "var(--color-gold)",
              color: "var(--color-text-primary)",
            }}
          >
            {isChangingPassword ? "Updating..." : "Update Password"}
          </button>
        </div>
      </div>

      {/* ============================================ */}
      {/* SECTION 3: Account Info (read-only)          */}
      {/* ============================================ */}
      <div
        className="rounded-2xl p-6"
        style={{
          backgroundColor: "var(--color-ivory)",
          border: "1px solid var(--color-gold-light)",
        }}
      >
        <h2
          className="mb-3 text-base font-semibold"
          style={{ fontFamily: "var(--font-display)", color: "var(--color-text-primary)" }}
        >
          Account Info
        </h2>
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between">
            <span style={{ color: "var(--color-text-secondary)" }}>Name</span>
            <span style={{ color: "var(--color-text-primary)" }}>{profile.full_name}</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: "var(--color-text-secondary)" }}>Email</span>
            <span style={{ color: "var(--color-text-primary)" }}>{email}</span>
          </div>
          {profile.tree_node && (
            <>
              <div className="flex justify-between">
                <span style={{ color: "var(--color-text-secondary)" }}>Family Branch</span>
                <span style={{ color: "var(--color-text-primary)" }}>
                  {profile.tree_node.branch
                    ? `${profile.tree_node.branch.charAt(0).toUpperCase() + profile.tree_node.branch.slice(1)}'s Family`
                    : "—"}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
