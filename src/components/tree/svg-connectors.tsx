"use client";

import { motion } from "framer-motion";
import type { TreeConnection } from "@/types";

interface SvgConnectorsProps {
  connections: TreeConnection[];
  width: number;
  height: number;
}

/**
 * Renders animated SVG connector lines between family tree nodes.
 * Parent-child: stepped paths with rounded corners (solid)
 * Spouse: horizontal dashed lines
 */
export function SvgConnectors({ connections, width, height }: SvgConnectorsProps) {
  const cornerRadius = 12;
  const strokeWidth = 2;

  const buildPath = (conn: TreeConnection): string => {
    const { from_x, from_y, to_x, to_y, type } = conn;

    if (type === "spouse") {
      // Simple horizontal line for spouses
      return `M ${from_x} ${from_y} L ${to_x} ${to_y}`;
    }

    // Parent-child: stepped path with rounded corners
    // Goes down from parent, then horizontal, then down to child
    const midY = from_y + (to_y - from_y) / 2;

    if (Math.abs(from_x - to_x) < 1) {
      // Straight vertical line
      return `M ${from_x} ${from_y} L ${to_x} ${to_y}`;
    }

    // Stepped path with rounded corners
    const goingRight = to_x > from_x;
    const hDir = goingRight ? 1 : -1;

    return [
      `M ${from_x} ${from_y}`,
      `L ${from_x} ${midY - cornerRadius}`,
      `Q ${from_x} ${midY} ${from_x + hDir * cornerRadius} ${midY}`,
      `L ${to_x - hDir * cornerRadius} ${midY}`,
      `Q ${to_x} ${midY} ${to_x} ${midY + cornerRadius}`,
      `L ${to_x} ${to_y}`,
    ].join(" ");
  };

  // Sort connections by from_y (top-to-bottom) for staggered animation
  const sortedConnections = [...connections].sort((a, b) => a.from_y - b.from_y);

  return (
    <svg
      className="pointer-events-none absolute left-0 top-0"
      width={width}
      height={height}
      style={{ overflow: "visible" }}
    >
      {sortedConnections.map((conn, index) => {
        const path = buildPath(conn);
        const isSpouse = conn.type === "spouse";

        return (
          <motion.path
            key={`${conn.from_id}-${conn.to_id}`}
            d={path}
            fill="none"
            stroke="var(--color-gold)"
            strokeWidth={strokeWidth}
            strokeDasharray={isSpouse ? "4 4" : undefined}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: isSpouse ? 0.5 : 0.7 }}
            transition={{
              pathLength: {
                duration: 0.6,
                delay: index * 0.03,
                ease: "easeOut",
              },
              opacity: {
                duration: 0.3,
                delay: index * 0.03,
              },
            }}
          />
        );
      })}
    </svg>
  );
}
