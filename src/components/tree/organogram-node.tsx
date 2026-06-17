"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { PositionedTreeNode } from "@/types";
import { NODE_WIDTH, NODE_HEIGHT } from "@/lib/utils/tree-layout";

interface OrganogramNodeProps {
  node: PositionedTreeNode;
  index: number;
  isCurrentUser: boolean;
}

/**
 * Compact card (130x56px) representing a family member in the organogram.
 * Three states: claimed, unclaimed, deceased.
 * Current user gets "YOU" badge.
 */
export function OrganogramNode({ node, index, isCurrentUser }: OrganogramNodeProps) {
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
    base: "absolute flex items-center gap-2 rounded-lg px-2 cursor-pointer transition-shadow hover:shadow-md",
    claimed: "border-2 border-gold bg-ivory shadow-sm",
    unclaimed: "border-2 border-dashed border-gold/40 bg-ivory/50",
    deceased: "border border-text-secondary/30 bg-cream/50",
  };

  const stateClass = isDeceased
    ? cardStyles.deceased
    : isClaimed
      ? cardStyles.claimed
      : cardStyles.unclaimed;

  return (
    <motion.div
      className={`${cardStyles.base} ${stateClass}`}
      style={{
        left: node.x,
        top: node.y,
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.5,
        delay: 1.5 + index * 0.06, // Start after connectors animate
        ease: "easeOut",
      }}
      onClick={handleClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Initials circle */}
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
          isDeceased
            ? "bg-text-secondary/20 text-text-secondary"
            : isClaimed
              ? "bg-gold text-ivory"
              : "bg-gold/30 text-text-secondary"
        }`}
      >
        {initials}
      </div>

      {/* Name and status */}
      <div className="min-w-0 flex-1">
        <div
          className={`truncate text-xs font-medium leading-tight ${
            isDeceased ? "text-text-secondary" : "text-text-primary"
          }`}
        >
          {node.display_name}
          {isDeceased && " \u2020"}
        </div>
        <div className="truncate text-[10px] text-text-secondary">
          {isDeceased ? "In loving memory" : isClaimed ? "Member" : "Not joined"}
        </div>
      </div>

      {/* YOU badge for current user */}
      {isCurrentUser && (
        <div className="absolute -right-1 -top-1 rounded-full bg-burgundy px-1.5 py-0.5 text-[8px] font-bold uppercase text-ivory shadow-sm">
          You
        </div>
      )}
    </motion.div>
  );
}
