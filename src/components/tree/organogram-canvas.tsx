"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface OrganogramCanvasProps {
  children: ReactNode;
  treeWidth: number;
  treeHeight: number;
}

/**
 * Simple scrollable canvas for the family organogram.
 * Centers the tree and allows scrolling on overflow.
 * Animates in with a fade and scale effect.
 */
export function OrganogramCanvas({ children, treeWidth, treeHeight }: OrganogramCanvasProps) {
  return (
    <div className="h-full w-full overflow-auto">
      <motion.div
        className="relative mx-auto"
        style={{
          width: Math.max(treeWidth + 48, 320),
          height: treeHeight + 80,
          minWidth: "100%",
          paddingTop: 24,
          paddingBottom: 56,
        }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.8,
          ease: "easeOut",
        }}
      >
        {/* Center the tree content */}
        <div
          className="absolute left-1/2"
          style={{
            transform: "translateX(-50%)",
            width: treeWidth,
            height: treeHeight,
          }}
        >
          {children}
        </div>
      </motion.div>
    </div>
  );
}
