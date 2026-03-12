"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap/config";
import type { FamilyTreeNode } from "@/types";
import { COLORS } from "@/lib/config/design";

interface TreePreviewProps {
  nodes: FamilyTreeNode[];
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string) => void;
  onAddChild?: (parentId: string) => void;
  onAddSpouse?: (nodeId: string) => void;
}

interface TreeDisplayNode {
  node: FamilyTreeNode;
  spouse: FamilyTreeNode | null;
  children: TreeDisplayNode[];
  depth: number;
}

function buildDisplayTree(nodes: FamilyTreeNode[]): TreeDisplayNode[] {
  // Find root nodes (generation 0, biological)
  const roots = nodes.filter(
    (n) => n.generation === 0 && n.node_type === "biological"
  );

  function buildNode(node: FamilyTreeNode, depth: number): TreeDisplayNode {
    const spouse = node.spouse_node_id
      ? nodes.find((n) => n.id === node.spouse_node_id) || null
      : null;

    const children = nodes
      .filter(
        (n) => n.parent_node_id === node.id && n.node_type === "biological"
      )
      .sort((a, b) => a.display_name.localeCompare(b.display_name))
      .map((child) => buildNode(child, depth + 1));

    return { node, spouse, children, depth };
  }

  return roots.map((root) => buildNode(root, 0));
}

function TreeRow({
  displayNode,
  isLast,
  selectedNodeId,
  onSelectNode,
  onAddChild,
  onAddSpouse,
}: {
  displayNode: TreeDisplayNode;
  isLast: boolean;
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string) => void;
  onAddChild?: (parentId: string) => void;
  onAddSpouse?: (nodeId: string) => void;
}) {
  const { node, spouse, children, depth } = displayNode;
  const isSelected = selectedNodeId === node.id;
  const isSpouseSelected = spouse && selectedNodeId === spouse.id;

  return (
    <>
      <div
        className="tree-row group flex items-center gap-2 py-1.5 px-2 rounded-md cursor-pointer transition-colors"
        style={{
          paddingLeft: `${depth * 24 + 8}px`,
          backgroundColor: isSelected
            ? `${COLORS.goldLight}40`
            : "transparent",
          borderLeft: isSelected ? `3px solid ${COLORS.gold}` : "3px solid transparent",
        }}
        onClick={() => onSelectNode(node.id)}
      >
        {/* Tree connector */}
        {depth > 0 && (
          <span
            className="font-mono text-sm"
            style={{ color: COLORS.textSecondary }}
          >
            {isLast ? "└──" : "├──"}
          </span>
        )}

        {/* Person name */}
        <span
          className="font-medium"
          style={{
            fontFamily: "var(--font-body)",
            color: COLORS.textPrimary,
          }}
        >
          {node.display_name}
          {node.is_deceased && (
            <span style={{ color: COLORS.textSecondary }}> †</span>
          )}
        </span>

        {/* Spouse */}
        {spouse && (
          <>
            <span style={{ color: COLORS.textSecondary }}>──</span>
            <span
              className="cursor-pointer font-medium transition-colors hover:underline"
              style={{
                fontFamily: "var(--font-body)",
                color: isSpouseSelected ? COLORS.gold : COLORS.textPrimary,
              }}
              onClick={(e) => {
                e.stopPropagation();
                onSelectNode(spouse.id);
              }}
            >
              {spouse.display_name}
              {spouse.is_deceased && (
                <span style={{ color: COLORS.textSecondary }}> †</span>
              )}
            </span>
          </>
        )}

        {/* Action buttons on hover */}
        <div className="ml-auto flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onAddChild && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddChild(node.id);
              }}
              className="text-xs px-2 py-0.5 rounded transition-colors"
              style={{
                backgroundColor: `${COLORS.gold}20`,
                color: COLORS.gold,
              }}
            >
              + child
            </button>
          )}
          {onAddSpouse && !spouse && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddSpouse(node.id);
              }}
              className="text-xs px-2 py-0.5 rounded transition-colors"
              style={{
                backgroundColor: `${COLORS.gold}20`,
                color: COLORS.gold,
              }}
            >
              + spouse
            </button>
          )}
        </div>
      </div>

      {/* Render children */}
      {children.map((child, index) => (
        <TreeRow
          key={child.node.id}
          displayNode={child}
          isLast={index === children.length - 1}
          selectedNodeId={selectedNodeId}
          onSelectNode={onSelectNode}
          onAddChild={onAddChild}
          onAddSpouse={onAddSpouse}
        />
      ))}
    </>
  );
}

export function TreePreview({
  nodes,
  selectedNodeId,
  onSelectNode,
  onAddChild,
  onAddSpouse,
}: TreePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prevNodeCount = useRef(nodes.length);

  // Animate new nodes
  useGSAP(
    () => {
      if (nodes.length > prevNodeCount.current) {
        gsap.from(".tree-row:last-child", {
          opacity: 0,
          x: -10,
          duration: 0.3,
          ease: "power2.out",
        });
      }
      prevNodeCount.current = nodes.length;
    },
    { scope: containerRef, dependencies: [nodes.length] }
  );

  const displayTree = buildDisplayTree(nodes);

  // Handle orphan nodes (nodes with no parent that aren't generation 0)
  const orphanNodes = nodes.filter(
    (n) =>
      n.node_type === "biological" &&
      n.generation > 0 &&
      !n.parent_node_id &&
      !displayTree.some((root) => {
        const findNode = (dn: TreeDisplayNode): boolean =>
          dn.node.id === n.id || dn.children.some(findNode);
        return findNode(root);
      })
  );

  return (
    <div
      ref={containerRef}
      className="rounded-lg p-4"
      style={{
        backgroundColor: COLORS.ivory,
        border: `1px solid ${COLORS.goldLight}`,
      }}
    >
      {displayTree.length === 0 && orphanNodes.length === 0 && (
        <p
          className="text-center py-8 text-sm"
          style={{ color: COLORS.textSecondary }}
        >
          No family members yet
        </p>
      )}

      {displayTree.map((rootNode, index) => (
        <TreeRow
          key={rootNode.node.id}
          displayNode={rootNode}
          isLast={index === displayTree.length - 1}
          selectedNodeId={selectedNodeId}
          onSelectNode={onSelectNode}
          onAddChild={onAddChild}
          onAddSpouse={onAddSpouse}
        />
      ))}

      {/* Show orphan nodes separately */}
      {orphanNodes.length > 0 && (
        <div className="mt-4 pt-4 border-t" style={{ borderColor: COLORS.goldLight }}>
          <p className="text-xs mb-2" style={{ color: COLORS.textSecondary }}>
            Unlinked members:
          </p>
          {orphanNodes.map((node) => (
            <div
              key={node.id}
              className="tree-row flex items-center gap-2 py-1.5 px-2 rounded-md cursor-pointer transition-colors"
              style={{
                backgroundColor:
                  selectedNodeId === node.id
                    ? `${COLORS.goldLight}40`
                    : "transparent",
                borderLeft:
                  selectedNodeId === node.id
                    ? `3px solid ${COLORS.gold}`
                    : "3px solid transparent",
              }}
              onClick={() => onSelectNode(node.id)}
            >
              <span
                className="font-medium"
                style={{
                  fontFamily: "var(--font-body)",
                  color: COLORS.textPrimary,
                }}
              >
                {node.display_name}
                {node.is_deceased && (
                  <span style={{ color: COLORS.textSecondary }}> †</span>
                )}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
