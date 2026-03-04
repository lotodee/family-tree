import type { FamilyTreeNode, PositionedTreeNode, TreeConnection } from "@/types";

export function computeTreeLayout(
  nodes: FamilyTreeNode[]
): { positionedNodes: PositionedTreeNode[]; connections: TreeConnection[] } {
  // To be implemented with d3-hierarchy
  return { positionedNodes: [], connections: [] };
}
