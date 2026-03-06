"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { FamilyTreeNode } from "@/types";
import { NODE_WIDTH, NODE_HEIGHT } from "@/lib/utils/horizontal-tree-layout";

interface TreeNodeCardProps {
  node: FamilyTreeNode;
  x: number;
  y: number;
  index: number;
  isCurrentUser: boolean;
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
 */
export function TreeNodeCard({
  node,
  x,
  y,
  index,
  isCurrentUser,
}: TreeNodeCardProps) {
  const router = useRouter();

  const isClaimed = node.is_claimed;
  const isDeceased = node.is_deceased;

  // Get initials from display name
  const initials = node.display_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

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

  // Determine card styles based on state
  const cardStyles = {
    base: "absolute flex items-center gap-3 rounded-lg px-3 cursor-pointer transition-all",
    claimed: "border-[1.5px] border-gold bg-ivory shadow-sm hover:shadow-md hover:shadow-gold/20",
    unclaimed: "border-[1.5px] border-dashed border-gold/40 bg-transparent hover:bg-ivory/30",
    deceased: "border-[1.5px] border-text-secondary/30 bg-cream/50 opacity-75",
  };

  const stateClass = isDeceased
    ? cardStyles.deceased
    : isClaimed
      ? cardStyles.claimed
      : cardStyles.unclaimed;

  const generationLabel = getGenerationLabel(node.generation, node.node_type);

  return (
    <motion.div
      className={`${cardStyles.base} ${stateClass}`}
      style={{
        left: x,
        top: y,
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
        zIndex: 2,
      }}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: isDeceased ? 0.75 : 1, scale: 1 }}
      transition={{
        duration: 0.35,
        delay: 0.4 + index * 0.025,
        ease: "easeOut",
      }}
      onClick={handleClick}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Initials circle (32px) */}
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
          isDeceased
            ? "border border-text-secondary/30 bg-transparent text-text-secondary"
            : isClaimed
              ? "bg-gold text-cream"
              : "border border-gold/40 bg-transparent text-gold/60"
        }`}
      >
        {initials}
      </div>

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
    </motion.div>
  );
}
