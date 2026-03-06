"use client";

import { motion } from "framer-motion";
import type { ConnectorLine } from "@/types";

interface TreeConnectorsProps {
  connectors: ConnectorLine[];
  width: number;
  height: number;
}

/**
 * Renders all connector lines as animated SVG paths.
 * Bracket-style connectors for horizontal tree layout.
 */
export function TreeConnectors({
  connectors,
  width,
  height,
}: TreeConnectorsProps) {
  // Sort connectors by x1 for left-to-right animation
  const sortedConnectors = [...connectors].sort((a, b) => a.x1 - b.x1);

  return (
    <svg
      className="pointer-events-none absolute left-0 top-0"
      style={{ width, height, zIndex: 1 }}
      aria-hidden="true"
    >
      {sortedConnectors.map((conn, i) => {
        const isCouple = conn.type === "couple";
        const strokeWidth = isCouple ? 1.5 : 2;
        const strokeDasharray = isCouple ? "4 3" : undefined;
        const finalOpacity = isCouple ? 0.6 : 1;

        // Build path string
        const d = `M ${conn.x1} ${conn.y1} L ${conn.x2} ${conn.y2}`;

        return (
          <motion.path
            key={conn.id}
            d={d}
            stroke="var(--color-gold)"
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            fill="none"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: finalOpacity }}
            transition={{
              duration: 0.8,
              delay: i * 0.02,
              ease: "easeOut",
            }}
          />
        );
      })}
    </svg>
  );
}
