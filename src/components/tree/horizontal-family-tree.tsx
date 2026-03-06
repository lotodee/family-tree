"use client";

import { useMemo } from "react";
import { computeHorizontalTreeLayout } from "@/lib/utils/horizontal-tree-layout";
import { TreeConnectors } from "./tree-connectors";
import { TreeNodeCard } from "./tree-node-card";
import type { FamilyTreeNodeWithProfile } from "@/types";

interface HorizontalFamilyTreeProps {
  nodes: FamilyTreeNodeWithProfile[];
  currentUserNodeId?: string;
}

/**
 * Horizontal family tree component.
 * Generations flow left-to-right, branches spread vertically.
 * Uses native scrolling instead of pan/zoom canvas.
 */
export function HorizontalFamilyTree({
  nodes,
  currentUserNodeId,
}: HorizontalFamilyTreeProps) {
  const layout = useMemo(() => computeHorizontalTreeLayout(nodes), [nodes]);

  // Create a lookup map for profile data (avatar_url)
  const profileMap = useMemo(() => {
    const map = new Map<string, string | null>();
    nodes.forEach((n) => {
      map.set(n.id, n.profile?.avatar_url || null);
    });
    return map;
  }, [nodes]);

  if (layout.nodes.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-text-secondary">
        No family members found
      </div>
    );
  }

  return (
    <div
      className="relative"
      style={{
        width: layout.totalWidth,
        minHeight: layout.totalHeight,
      }}
    >
      <TreeConnectors
        connectors={layout.connectors}
        width={layout.totalWidth}
        height={layout.totalHeight}
      />
      {layout.nodes.map((pos, i) => (
        <TreeNodeCard
          key={pos.id}
          node={pos}
          x={pos.x}
          y={pos.y}
          index={i}
          isCurrentUser={pos.id === currentUserNodeId}
          avatarUrl={profileMap.get(pos.id) || null}
        />
      ))}
    </div>
  );
}
