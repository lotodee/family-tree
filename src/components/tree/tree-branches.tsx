"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap/config";
import type { BranchCurve } from "@/lib/utils/tree-layout";

interface Props {
  branches: BranchCurve[];
  width: number;
  height: number;
}

export function TreeBranches({ branches, width, height }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);

  // Sort by fromX so the draw animation cascades left-to-right
  const sorted = [...branches].sort((a, b) => a.fromX - b.fromX);

  useGSAP(() => {
    if (!svgRef.current) return;

    const paths = svgRef.current.querySelectorAll<SVGPathElement>(".tree-branch");

    paths.forEach((path, i) => {
      const length = path.getTotalLength();

      // Hide initially
      gsap.set(path, {
        strokeDasharray: length,
        strokeDashoffset: length,
        opacity: 0,
      });

      // Draw in with stagger
      gsap.to(path, {
        strokeDashoffset: 0,
        opacity: 1,
        duration: 0.8,
        delay: i * 0.04,
        ease: "power1.out",
      });
    });
  }, { scope: svgRef });

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      className="absolute top-0 left-0 pointer-events-none"
      style={{ zIndex: 1 }}
    >
      {sorted.map((b) => {
        // Build a bezier curve path for organic feel
        // Control points offset horizontally to create a natural curve
        const midX = (b.fromX + b.toX) / 2;

        let d: string;
        if (b.type === "couple") {
          // Couple connectors are short straight vertical lines
          d = `M ${b.fromX} ${b.fromY} L ${b.toX} ${b.toY}`;
        } else {
          // Branch connectors use cubic bezier for organic curves
          // The control points pull the curve horizontally, creating
          // a smooth S-curve that looks like a tree branch
          d = `M ${b.fromX} ${b.fromY} C ${midX} ${b.fromY}, ${midX} ${b.toY}, ${b.toX} ${b.toY}`;
        }

        const isCouple = b.type === "couple";

        // Color: trunk/branches are warm brown-gold, couple lines are lighter
        const strokeColor = isCouple
          ? "var(--color-gold-light)"
          : b.type === "trunk"
          ? "#8B7355"      // warm brown for thick trunk
          : b.type === "branch"
          ? "#A0885A"      // medium brown-gold for branches
          : "#C4973B";     // gold for twigs

        return (
          <path
            key={b.id}
            className="tree-branch"
            d={d}
            stroke={strokeColor}
            strokeWidth={b.thickness}
            strokeLinecap="round"
            strokeDasharray={isCouple ? "3 3" : "none"}
            fill="none"
          />
        );
      })}
    </svg>
  );
}
