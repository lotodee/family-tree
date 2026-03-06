"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { gsap, useGSAP } from "@/lib/gsap/config";
import type { FamilyTreeNode } from "@/types";
import { NODE_WIDTH, NODE_HEIGHT } from "@/lib/utils/horizontal-tree-layout";
import { Avatar } from "@/components/ui/avatar";

interface TreeNodeCardProps {
  node: FamilyTreeNode;
  x: number;
  y: number;
  index: number;
  isCurrentUser: boolean;
  avatarUrl: string | null;
}

/**
 * Get generation label for display.
 */
function getGenerationLabel(generation: number, nodeType: string): string {
  if (generation === 0) return "Patriarch / Matriarch";
  if (nodeType === "spouse") return "Spouse";
  if (generation === 1) return "Child";
  if (generation === 2) return "Grandchild";
  if (generation === 3) return "Great-Grandchild";
  return "Family";
}

/**
 * Tree node card (150x64px) representing a family member.
 * Three states: claimed, unclaimed, deceased.
 * Current user gets "YOU" badge.
 * Uses GSAP for entrance animation and hover/tap interactions.
 */
export function TreeNodeCard({
  node,
  x,
  y,
  index,
  isCurrentUser,
  avatarUrl,
}: TreeNodeCardProps) {
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);

  const isClaimed = node.is_claimed;
  const isDeceased = node.is_deceased;

  // GSAP entrance animation
  const { contextSafe } = useGSAP(
    () => {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, scale: 0.8, x: -10 },
        {
          opacity: isDeceased ? 0.7 : 1,
          scale: 1,
          x: 0,
          duration: 0.45,
          delay: 0.35 + index * 0.02,
          ease: "back.out(1.4)",
        }
      );
    },
    { scope: cardRef }
  );

  // Hover animations (claimed only)
  const handleMouseEnter = contextSafe(() => {
    if (!isClaimed || isDeceased) return;
    gsap.to(cardRef.current, {
      scale: 1.05,
      boxShadow: "0 8px 24px rgba(196, 151, 59, 0.3)",
      duration: 0.2,
      ease: "power2.out",
      overwrite: "auto",
    });
  });

  const handleMouseLeave = contextSafe(() => {
    if (!isClaimed || isDeceased) return;
    gsap.to(cardRef.current, {
      scale: 1,
      boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
      duration: 0.25,
      ease: "power2.out",
      overwrite: "auto",
    });
  });

  // Tap/press animations
  const handlePointerDown = contextSafe(() => {
    if (!isClaimed || isDeceased) return;
    gsap.to(cardRef.current, {
      scale: 0.96,
      duration: 0.08,
      overwrite: "auto",
    });
  });

  const handlePointerUp = contextSafe(() => {
    if (!isClaimed || isDeceased) return;
    gsap.to(cardRef.current, {
      scale: 1,
      duration: 0.12,
      overwrite: "auto",
    });
  });

  const handleClick = () => {
    if (isClaimed && node.claimed_by) {
      router.push(`/profile/${node.claimed_by}`);
    } else if (!isClaimed && !isDeceased) {
      toast(`${node.display_name} hasn't joined yet`, {
        description: "They'll appear here once they register!",
        duration: 3000,
      });
    }
  };

  const generationLabel = getGenerationLabel(node.generation, node.node_type);

  // Build className based on state
  const baseClass = "absolute flex items-center gap-3 rounded-lg px-3 cursor-pointer select-none";
  const stateClass = isDeceased
    ? "border-[1.5px] border-text-secondary/30 bg-cream/50"
    : isClaimed
      ? "border-[1.5px] border-gold bg-ivory"
      : "border-[1.5px] border-dashed border-gold/40 bg-transparent";

  return (
    <div
      ref={cardRef}
      data-node-id={node.id}
      className={`${baseClass} ${stateClass}`}
      style={{
        left: x,
        top: y,
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
        zIndex: 2,
        opacity: 0, // hidden initially — GSAP animates in
        willChange: "transform, opacity, box-shadow",
        boxShadow: isClaimed ? "0 2px 8px rgba(0,0,0,0.07)" : "none",
      }}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* Avatar circle (32px) */}
      {avatarUrl && isClaimed ? (
        <Avatar avatarPath={avatarUrl} name={node.display_name} size={32} className="shrink-0" />
      ) : (
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
            isDeceased
              ? "border border-text-secondary/30 bg-transparent text-text-secondary"
              : isClaimed
                ? "bg-gold text-cream"
                : "border border-gold/40 bg-transparent text-gold/60"
          }`}
        >
          {node.display_name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)}
        </div>
      )}

      {/* Name and generation label */}
      <div className="min-w-0 flex-1">
        <div
          className={`truncate text-sm font-bold leading-tight ${
            isDeceased ? "text-text-secondary" : "text-text-primary"
          }`}
        >
          {node.display_name}
          {isDeceased && " †"}
        </div>
        <div className="truncate text-xs text-text-secondary">
          {isDeceased ? "In loving memory" : isClaimed ? generationLabel : "Not yet joined"}
        </div>
      </div>

      {/* YOU badge for current user */}
      {isCurrentUser && (
        <div className="absolute -right-1 -top-1 rounded-full bg-burgundy px-1.5 py-0.5 text-[10px] font-bold uppercase text-ivory shadow-sm">
          You
        </div>
      )}
    </div>
  );
}
