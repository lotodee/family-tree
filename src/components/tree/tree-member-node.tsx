"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap/config";
import { NODE_DIAMETER } from "@/lib/utils/tree-layout";
import type { PositionedMember } from "@/lib/utils/tree-layout";

interface Props {
  member: PositionedMember;
  index: number;
  isSelected: boolean;
  onSelect: (nodeId: string) => void;
}

export function TreeMemberNode({ member, index, isSelected, onSelect }: Props) {
  const nodeRef = useRef<HTMLDivElement>(null);

  const { node, x, y, isHonoree, isClaimed, isDeceased } = member;

  // Initials
  const initials = node.display_name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Entrance animation
  useGSAP(() => {
    gsap.fromTo(
      nodeRef.current,
      {
        opacity: 0,
        scale: 0,
      },
      {
        opacity: isDeceased ? 0.6 : 1,
        scale: 1,
        duration: 0.5,
        delay: 0.5 + index * 0.03,
        ease: "back.out(1.7)",
      }
    );
  });

  // Hover animation
  const { contextSafe } = useGSAP({ scope: nodeRef });

  const onEnter = contextSafe(() => {
    gsap.to(nodeRef.current, {
      scale: 1.12,
      duration: 0.2,
      ease: "power2.out",
      overwrite: "auto",
    });
  });

  const onLeave = contextSafe(() => {
    gsap.to(nodeRef.current, {
      scale: 1,
      duration: 0.25,
      ease: "power2.out",
      overwrite: "auto",
    });
  });

  // Circle sizes
  const size = isHonoree ? NODE_DIAMETER + 12 : NODE_DIAMETER;
  const halfSize = size / 2;

  // Colors based on state
  const bgColor = isClaimed
    ? "var(--color-gold)"
    : "rgba(196, 151, 59, 0.15)";

  const textColor = isClaimed
    ? "var(--color-ivory)"
    : "var(--color-gold-light)";

  const borderStyle = isClaimed
    ? `3px solid ${isHonoree ? "var(--color-burgundy)" : "var(--color-gold)"}`
    : "2px dashed var(--color-gold-light)";

  return (
    <div
      ref={nodeRef}
      className="absolute flex flex-col items-center cursor-pointer select-none"
      style={{
        left: x - halfSize,
        top: y - halfSize,
        width: size,
        zIndex: isSelected ? 10 : 2,
        opacity: 0, // GSAP animates this in
      }}
      onClick={() => onSelect(node.id)}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {/* Photo/Initials circle */}
      <div
        className="rounded-full flex items-center justify-center font-bold relative"
        style={{
          width: size,
          height: size,
          backgroundColor: bgColor,
          border: borderStyle,
          color: textColor,
          fontSize: isHonoree ? "1rem" : "0.8rem",
          boxShadow: isSelected
            ? "0 0 0 3px var(--color-gold), 0 4px 16px rgba(196,151,59,0.3)"
            : isClaimed
            ? "0 2px 8px rgba(0,0,0,0.1)"
            : "none",
        }}
      >
        {initials}

        {/* Honoree star badge */}
        {isHonoree && (
          <div
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs"
            style={{
              backgroundColor: "var(--color-burgundy)",
              color: "var(--color-ivory)",
              fontSize: "0.6rem",
            }}
          >
            ★
          </div>
        )}

        {/* Deceased indicator */}
        {isDeceased && (
          <div
            className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: "var(--color-cream)",
              border: "1px solid var(--color-gold-light)",
              fontSize: "0.5rem",
              color: "var(--color-text-secondary)",
            }}
          >
            †
          </div>
        )}
      </div>

      {/* Name label */}
      <span
        className="mt-1 text-center leading-tight truncate w-full"
        style={{
          fontSize: "0.65rem",
          fontWeight: isClaimed ? 600 : 400,
          color: isClaimed ? "var(--color-text-primary)" : "var(--color-text-secondary)",
          maxWidth: size + 20,
          fontFamily: "var(--font-body)",
        }}
      >
        {node.display_name}
      </span>
    </div>
  );
}
