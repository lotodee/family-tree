"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap/config";

/**
 * Decorative botanical tree silhouette for the family tree page background.
 * Renders a large gold-tinted tree with low opacity and blur.
 * Uses GSAP for slow fade-in animation.
 */
export function TreeBackground() {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.from(ref.current, {
        opacity: 0,
        duration: 2.5,
        ease: "power1.inOut",
      });
    },
    { scope: ref }
  );

  return (
    <div
      ref={ref}
      className="pointer-events-none absolute inset-0 flex items-end justify-center overflow-hidden"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 400 600"
        className="h-[70vh] w-auto max-w-none"
        style={{
          filter: "blur(4px)",
          opacity: 0.035,
        }}
        fill="#C4973B"
      >
        {/* Tree trunk */}
        <path d="M190 600 L190 380 Q185 350 175 320 L175 280 Q180 250 190 220 L190 180 Q195 160 200 150 Q205 160 210 180 L210 220 Q220 250 225 280 L225 320 Q215 350 210 380 L210 600 Z" />

        {/* Left root */}
        <path d="M190 600 Q160 580 120 590 Q140 570 170 560 Q180 550 190 540" />

        {/* Right root */}
        <path d="M210 600 Q240 580 280 590 Q260 570 230 560 Q220 550 210 540" />

        {/* Main canopy - large organic blob */}
        <ellipse cx="200" cy="180" rx="150" ry="140" />

        {/* Left branch cluster */}
        <ellipse cx="100" cy="200" rx="70" ry="60" />
        <ellipse cx="60" cy="160" rx="50" ry="45" />
        <ellipse cx="80" cy="100" rx="55" ry="50" />

        {/* Right branch cluster */}
        <ellipse cx="300" cy="200" rx="70" ry="60" />
        <ellipse cx="340" cy="160" rx="50" ry="45" />
        <ellipse cx="320" cy="100" rx="55" ry="50" />

        {/* Top clusters */}
        <ellipse cx="150" cy="80" rx="60" ry="55" />
        <ellipse cx="250" cy="80" rx="60" ry="55" />
        <ellipse cx="200" cy="50" rx="70" ry="50" />
      </svg>
    </div>
  );
}
