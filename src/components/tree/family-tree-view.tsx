"use client";

import { useMemo, useState, useRef } from "react";
import { computeTreeLayout } from "@/lib/utils/tree-layout";
import { TreeBranches } from "./tree-branches";
import { TreeMemberNode } from "./tree-member-node";
import { getRelationshipLabel } from "@/lib/utils/relationships";
import type { FamilyTreeNode, FamilyRelationship, RelationshipType } from "@/types";

interface Props {
  nodes: FamilyTreeNode[];
  relationships: FamilyRelationship[];
  honoreeNodeId: string | null;
}

export function FamilyTreeView({ nodes, relationships, honoreeNodeId }: Props) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const layout = useMemo(
    () => computeTreeLayout(nodes, relationships, honoreeNodeId),
    [nodes, relationships, honoreeNodeId]
  );

  const selectedNode = selectedNodeId
    ? nodes.find((n) => n.id === selectedNodeId) || null
    : null;

  // Get connections for selected node
  const selectedConnections = selectedNodeId
    ? relationships
        .filter((r) => r.from_node_id === selectedNodeId)
        .map((r) => ({
          type: r.relationship_type as RelationshipType,
          node: nodes.find((n) => n.id === r.to_node_id),
        }))
        .filter((c) => c.node)
    : [];

  function handleSelect(nodeId: string) {
    setSelectedNodeId(nodeId === selectedNodeId ? null : nodeId);
  }

  if (layout.members.length === 0) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
          No family tree to display yet.
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Scrollable tree area */}
      <div
        className="overflow-auto"
        style={{ WebkitOverflowScrolling: "touch" as any }}
      >
        <div
          ref={containerRef}
          className="relative"
          style={{
            width: layout.totalWidth,
            minHeight: layout.totalHeight,
          }}
        >
          {/* SVG branches */}
          <TreeBranches
            branches={layout.branches}
            width={layout.totalWidth}
            height={layout.totalHeight}
          />

          {/* Member nodes */}
          {layout.members.map((member, i) => (
            <TreeMemberNode
              key={member.node.id}
              member={member}
              index={i}
              isSelected={member.node.id === selectedNodeId}
              onSelect={handleSelect}
            />
          ))}
        </div>
      </div>

      {/* Selected member popup — fixed at the bottom */}
      {selectedNode && (
        <div
          className="sticky bottom-0 left-0 right-0 px-4 py-4 border-t"
          style={{
            backgroundColor: "var(--color-ivory)",
            borderColor: "var(--color-gold-light)",
            zIndex: 20,
          }}
        >
          <div className="flex items-start justify-between max-w-lg">
            <div>
              <p
                className="text-base font-bold"
                style={{
                  fontFamily: "var(--font-display)",
                  color: "var(--color-text-primary)",
                }}
              >
                {selectedNode.display_name}
                {selectedNode.is_deceased && (
                  <span className="ml-1 text-xs opacity-50">†</span>
                )}
              </p>

              {/* Connections list */}
              {selectedConnections.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
                  {selectedConnections.map((c) => (
                    <span
                      key={`${c.type}-${c.node!.id}`}
                      className="text-xs"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      {getRelationshipLabel(c.type)}: {c.node!.display_name}
                    </span>
                  ))}
                </div>
              )}

              {/* Status */}
              <p className="text-xs mt-1" style={{ color: "var(--color-text-secondary)" }}>
                {selectedNode.is_claimed ? "Has joined the celebration" : "Not yet joined"}
              </p>
            </div>

            {/* Close button */}
            <button
              onClick={() => setSelectedNodeId(null)}
              className="text-sm px-2 py-1 rounded ml-4"
              style={{ color: "var(--color-text-secondary)" }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Legend */}
      <div
        className="sticky bottom-0 left-0 right-0 flex items-center justify-center gap-6 py-2 text-xs"
        style={{
          color: "var(--color-text-secondary)",
          backgroundColor: "var(--color-cream)",
        }}
      >
        <span className="flex items-center gap-1.5">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: "var(--color-gold)" }}
          />
          Joined
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="w-3 h-3 rounded-full"
            style={{
              backgroundColor: "rgba(196,151,59,0.15)",
              border: "1px dashed var(--color-gold-light)",
            }}
          />
          Not yet joined
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="w-3 h-3 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: "var(--color-burgundy)",
              color: "var(--color-ivory)",
              fontSize: "0.4rem",
            }}
          >
            ★
          </span>
          Being celebrated
        </span>
      </div>
    </div>
  );
}
