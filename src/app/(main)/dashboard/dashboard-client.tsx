"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RopeBoard } from "@/components/ui/rope-board";
import { AvatarUploadPrompt } from "@/components/ui/avatar-upload-prompt";

interface DashboardClientProps {
  avatarUrl: string | null;
  children: React.ReactNode;
}

export function DashboardClient({ avatarUrl, children }: DashboardClientProps) {
  const [showUploadBoard, setShowUploadBoard] = useState(false);
  const [hasAvatar, setHasAvatar] = useState(!!avatarUrl);
  const router = useRouter();

  // Show the board after a short delay if no avatar
  useEffect(() => {
    if (!hasAvatar) {
      const timer = setTimeout(() => setShowUploadBoard(true), 800);
      return () => clearTimeout(timer);
    }
  }, [hasAvatar]);

  const handleUploaded = () => {
    setHasAvatar(true);
    setShowUploadBoard(false);
    // Refresh the page to update avatar in header
    router.refresh();
  };

  const handleDismiss = () => {
    setShowUploadBoard(false);
  };

  return (
    <>
      {/* Rope board for image upload */}
      <RopeBoard isOpen={showUploadBoard} onDismiss={handleDismiss}>
        <AvatarUploadPrompt
          onUploaded={handleUploaded}
          onDismiss={handleDismiss}
        />
      </RopeBoard>

      {/* Dashboard content */}
      {children}
    </>
  );
}
