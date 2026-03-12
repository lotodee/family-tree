"use client";

import { useMemo } from "react";
import { COLORS } from "@/lib/config/design";
import type { FamilyTreeNode, FamilyRelationship } from "@/types";

interface DisplayNode {
  node: FamilyTreeNode;
  spouse: FamilyTreeNode | null;
  children: DisplayNode[];
}

interface Props {
  nodes: FamilyTreeNode[];
  relationships: FamilyRelationship[];
  honoreeNodeId: string | null;
  selectedNodeId: string | null;
  onSelectNode: (id: string) => void;
}

export function TreePreview({
  nodes,
  relationships,
  honoreeNodeId,
  selectedNodeId,
  onSelectNode,
}: Props) {
  // Build tree structure from relationships
  const tree = useMemo(() => {
    if (!honoreeNodeId || nodes.length === 0) return null;

    const nodeMap = new Map(nodes.map((n) => [n.id, n]));
    const visited = new Set<string>();

    // Get nodes related to a given node by specific relationship types
    function getRelated(nodeId: string, types: string[]): FamilyTreeNode[] {
      return relationships
        .filter(
          (r) => r.from_node_id === nodeId && types.includes(r.relationship_type)
        )
        .map((r) => nodeMap.get(r.to_node_id))
        .filter(
          (n): n is FamilyTreeNode => n !== undefined && !visited.has(n.id)
        );
    }

    function build(nodeId: string): DisplayNode | null {
      if (visited.has(nodeId)) return null;
      const node = nodeMap.get(nodeId);
      if (!node) return null;

      visited.add(nodeId);

      // Find spouse
      const spouses = getRelated(nodeId, ["wife", "husband"]);
      const spouse = spouses[0] || null;
      if (spouse) visited.add(spouse.id);

      // Find children (sons and daughters of this node OR the spouse)
      const myChildren = getRelated(nodeId, ["son", "daughter"]);
      const spouseChildren = spouse
        ? getRelated(spouse.id, ["son", "daughter"])
        : [];

      // Deduplicate children
      const childMap = new Map<string, FamilyTreeNode>();
      [...myChildren, ...spouseChildren].forEach((c) => childMap.set(c.id, c));

      // Also find parents, siblings, and extended family
      const parents = getRelated(nodeId, ["father", "mother"]);
      const siblings = getRelated(nodeId, ["brother", "sister"]);
      const unclesAunts = getRelated(nodeId, ["uncle", "aunt"]);
      const nephewsNieces = getRelated(nodeId, ["nephew", "niece"]);
      const cousins = getRelated(nodeId, ["cousin"]);

      // Build children recursively
      const childNodes = Array.from(childMap.values())
        .map((c) => build(c.id))
        .filter((n): n is DisplayNode => n !== null);

      // Build parent nodes (going UP from the honoree)
      const parentNodes = parents
        .map((p) => build(p.id))
        .filter((n): n is DisplayNode => n !== null);

      // Build sibling nodes
      const siblingNodes = siblings
        .map((s) => build(s.id))
        .filter((n): n is DisplayNode => n !== null);

      // Build extended family nodes
      const uncleAuntNodes = unclesAunts
        .map((u) => build(u.id))
        .filter((n): n is DisplayNode => n !== null);

      const nephewNieceNodes = nephewsNieces
        .map((n) => build(n.id))
        .filter((n): n is DisplayNode => n !== null);

      const cousinNodes = cousins
        .map((c) => build(c.id))
        .filter((n): n is DisplayNode => n !== null);

      // For the tree preview, combine everything as branches
      const allBranches = [
        ...parentNodes,
        ...uncleAuntNodes,
        ...siblingNodes,
        ...cousinNodes,
        ...childNodes,
        ...nephewNieceNodes,
      ];

      return { node, spouse, children: allBranches };
    }

    return build(honoreeNodeId);
  }, [nodes, relationships, honoreeNodeId]);

  // Render a node row
  function renderNode(
    displayNode: DisplayNode,
    depth: number = 0,
    isLast: boolean = true
  ): React.ReactNode {
    const { node, spouse, children } = displayNode;
    const isSelected = node.id === selectedNodeId;
    const isHonoree = node.id === honoreeNodeId;
    const isSpouseSelected = spouse?.id === selectedNodeId;

    // Indent prefix
    const prefix = depth === 0 ? "" : isLast ? "└── " : "├── ";
    const indent = "    ".repeat(Math.max(0, depth - 1)) + (depth > 0 ? "│   " : "");

    return (
      <div key={node.id}>
        {/* Node row */}
        <div
          className={`flex items-center py-1.5 px-2 rounded cursor-pointer transition-colors ${
            isSelected ? "bg-[var(--color-gold-light)]" : "hover:bg-[var(--color-ivory)]"
          }`}
          style={{
            borderLeft: isHonoree ? `3px solid ${COLORS.gold}` : undefined,
            paddingLeft: isHonoree ? "calc(0.5rem - 3px)" : undefined,
          }}
        >
          <span
            className="text-sm font-mono mr-2"
            style={{ color: COLORS.textSecondary }}
          >
            {depth > 0 && indent}
            {prefix}
          </span>

          {/* Main person */}
          <button
            onClick={() => onSelectNode(node.id)}
            className={`text-sm font-medium ${
              isSelected ? "font-semibold" : ""
            }`}
            style={{ color: COLORS.textPrimary }}
          >
            {node.display_name}
            {node.is_deceased && " †"}
          </button>

          {/* Spouse */}
          {spouse && (
            <>
              <span
                className="mx-2 text-sm"
                style={{ color: COLORS.textSecondary }}
              >
                ──
              </span>
              <button
                onClick={() => onSelectNode(spouse.id)}
                className={`text-sm ${isSpouseSelected ? "font-semibold" : ""}`}
                style={{ color: COLORS.textPrimary }}
              >
                {spouse.display_name}
                {spouse.is_deceased && " †"}
              </button>
            </>
          )}

          {/* Honoree badge */}
          {isHonoree && (
            <span
              className="ml-2 text-xs px-2 py-0.5 rounded"
              style={{
                backgroundColor: COLORS.gold,
                color: "white",
              }}
            >
              ★
            </span>
          )}
        </div>

        {/* Children */}
        {children.map((child, idx) =>
          renderNode(child, depth + 1, idx === children.length - 1)
        )}
      </div>
    );
  }

  if (!tree) {
    return (
      <div
        className="text-center py-8"
        style={{ color: COLORS.textSecondary }}
      >
        No family members yet
      </div>
    );
  }

  return (
    <div
      className="p-4 rounded-lg border"
      style={{
        backgroundColor: COLORS.ivory,
        borderColor: COLORS.goldLight,
      }}
    >
      {renderNode(tree)}
    </div>
  );
}
