"use client";

import { useMemo } from "react";
import type { FamilyTreeNode } from "@/types";
import { computeTreeLayout } from "@/lib/utils/tree-layout";
import { OrganogramCanvas } from "./organogram-canvas";
import { SvgConnectors } from "./svg-connectors";
import { OrganogramNode } from "./organogram-node";

interface FamilyOrganogramProps {
  nodes: FamilyTreeNode[];
  currentUserNodeId: string | null;
}

/**
 * Main organogram component that assembles the layout, canvas, connectors, and nodes.
 */
export function FamilyOrganogram({ nodes, currentUserNodeId }: FamilyOrganogramProps) {
  // Compute layout from nodes
  const layout = useMemo(() => computeTreeLayout(nodes), [nodes]);

  if (nodes.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-text-secondary">No family members found</p>
      </div>
    );
  }

  return (
    <OrganogramCanvas treeWidth={layout.totalWidth} treeHeight={layout.totalHeight}>
      {/* SVG connectors layer */}
      <SvgConnectors
        connections={layout.connections}
        width={layout.totalWidth}
        height={layout.totalHeight}
      />

      {/* Node cards layer */}
      {layout.positionedNodes.map((node, index) => (
        <OrganogramNode
          key={node.id}
          node={node}
          index={index}
          isCurrentUser={node.id === currentUserNodeId}
        />
      ))}
    </OrganogramCanvas>
  );
}
