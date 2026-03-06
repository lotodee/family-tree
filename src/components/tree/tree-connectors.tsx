"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap/config";
import type { ConnectorLine } from "@/types";

interface TreeConnectorsProps {
  connectors: ConnectorLine[];
  width: number;
  height: number;
}

/**
 * Renders all connector lines as animated SVG paths with GSAP draw-in effect.
 * Lines draw from left-to-right, creating a cascading reveal effect.
 */
export function TreeConnectors({
  connectors,
  width,
  height,
}: TreeConnectorsProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  // Sort connectors by x1 for left-to-right animation
  const sortedConnectors = [...connectors].sort((a, b) => a.x1 - b.x1);

  useGSAP(
    () => {
      const paths = svgRef.current?.querySelectorAll<SVGPathElement>(".tree-line");
      if (!paths || paths.length === 0) return;

      // Build a master timeline for the entire draw sequence
      const tl = gsap.timeline();

      paths.forEach((path, i) => {
        const len = path.getTotalLength();
        const isCouple = path.dataset.type === "couple";

        // Immediately hide (dashoffset = full length = invisible)
        gsap.set(path, {
          strokeDasharray: len,
          strokeDashoffset: len,
          opacity: 0,
        });

        // Add to timeline: draw in + fade in
        tl.to(
          path,
          {
            strokeDashoffset: 0,
            opacity: isCouple ? 0.5 : 1,
            duration: 0.6,
            ease: "power1.out",
          },
          i * 0.025 // stagger position on the timeline
        );
      });
    },
    { scope: svgRef }
  );

  return (
    <svg
      ref={svgRef}
      className="pointer-events-none absolute left-0 top-0"
      style={{ width, height, zIndex: 1 }}
      aria-hidden="true"
    >
      {sortedConnectors.map((conn) => {
        const isCouple = conn.type === "couple";
        const strokeWidth = isCouple ? 1.5 : 2;
        const strokeDasharray = isCouple ? "4 3" : "none";

        // Build path string
        const d = `M ${conn.x1} ${conn.y1} L ${conn.x2} ${conn.y2}`;

        return (
          <path
            key={conn.id}
            className="tree-line"
            data-type={conn.type}
            d={d}
            stroke="var(--color-gold)"
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            strokeLinecap="round"
            fill="none"
          />
        );
      })}
    </svg>
  );
}
