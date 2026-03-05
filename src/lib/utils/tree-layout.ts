import type { FamilyTreeNode, PositionedTreeNode, TreeConnection } from "@/types";

// Layout constants
const NODE_WIDTH = 130;
const NODE_HEIGHT = 56;
const SPOUSE_GAP = 16;
const SIBLING_GAP = 24;
const GENERATION_GAP = 140;
const BRANCH_GAP = 48;

interface LayoutResult {
  positionedNodes: PositionedTreeNode[];
  connections: TreeConnection[];
  totalWidth: number;
  totalHeight: number;
}

interface NodeWithPosition {
  node: FamilyTreeNode;
  x: number;
  y: number;
  width: number;
}

/**
 * Computes a bottom-up tree layout for the family organogram.
 * Groups nodes by generation, positions couples side-by-side,
 * and centers children below their parents.
 */
export function computeTreeLayout(nodes: FamilyTreeNode[]): LayoutResult {
  if (nodes.length === 0) {
    return { positionedNodes: [], connections: [], totalWidth: 0, totalHeight: 0 };
  }

  // Build lookup maps
  const nodeMap = new Map<string, FamilyTreeNode>();
  nodes.forEach((n) => nodeMap.set(n.id, n));

  // Group nodes by generation
  const generations = new Map<number, FamilyTreeNode[]>();
  nodes.forEach((n) => {
    const gen = n.generation;
    if (!generations.has(gen)) generations.set(gen, []);
    generations.get(gen)!.push(n);
  });

  // Sort generation keys
  const genKeys = Array.from(generations.keys()).sort((a, b) => a - b);
  const maxGen = genKeys[genKeys.length - 1];

  // Build parent-to-children map
  const childrenMap = new Map<string, string[]>();
  nodes.forEach((n) => {
    if (n.parent_node_id) {
      if (!childrenMap.has(n.parent_node_id)) {
        childrenMap.set(n.parent_node_id, []);
      }
      // Only add biological children (not spouses)
      if (n.node_type === "biological") {
        childrenMap.get(n.parent_node_id)!.push(n.id);
      }
    }
  });

  // Track positioned nodes
  const positioned = new Map<string, NodeWithPosition>();

  // Position nodes generation by generation (bottom-up for width calculation)
  // But render top-down for y coordinates
  const positionGeneration = (genIndex: number, startX: number): number => {
    const gen = genKeys[genIndex];
    const genNodes = generations.get(gen) || [];
    const y = gen * GENERATION_GAP;

    if (gen === 0) {
      // Root generation: position patriarch and matriarch as couple
      const biological = genNodes.filter((n) => n.node_type === "biological");
      const spouses = genNodes.filter((n) => n.node_type === "spouse");

      let x = startX;

      // Find the patriarch (male biological at gen 0)
      const patriarch = biological.find((n) => n.gender === "male") || biological[0];
      if (patriarch) {
        positioned.set(patriarch.id, { node: patriarch, x, y, width: NODE_WIDTH });

        // Position spouse next to patriarch
        const spouse = spouses[0] || nodeMap.get(patriarch.spouse_node_id || "");
        if (spouse && !positioned.has(spouse.id)) {
          x += NODE_WIDTH + SPOUSE_GAP;
          positioned.set(spouse.id, { node: spouse, x, y, width: NODE_WIDTH });
        }
      }

      return x + NODE_WIDTH;
    }

    // Group children by branch for gen 1+
    const branchGroups = new Map<string, FamilyTreeNode[]>();
    genNodes.forEach((n) => {
      const branch = n.branch || "unknown";
      if (!branchGroups.has(branch)) branchGroups.set(branch, []);
      branchGroups.get(branch)!.push(n);
    });

    // Sort branches by the display order of the primary member
    const sortedBranches = Array.from(branchGroups.keys()).sort((a, b) => {
      const aNodes = branchGroups.get(a)!;
      const bNodes = branchGroups.get(b)!;
      const aPrimary = aNodes.find((n) => n.node_type === "biological") || aNodes[0];
      const bPrimary = bNodes.find((n) => n.node_type === "biological") || bNodes[0];

      // Sort by parent position if possible, otherwise by id
      const aParentPos = aPrimary?.parent_node_id
        ? positioned.get(aPrimary.parent_node_id)?.x || 0
        : 0;
      const bParentPos = bPrimary?.parent_node_id
        ? positioned.get(bPrimary.parent_node_id)?.x || 0
        : 0;
      return aParentPos - bParentPos;
    });

    let currentX = startX;

    sortedBranches.forEach((branch, branchIdx) => {
      const branchNodes = branchGroups.get(branch)!;

      // Separate biological members and spouses
      const biological = branchNodes.filter((n) => n.node_type === "biological");
      const spouses = branchNodes.filter((n) => n.node_type === "spouse");

      // Position each biological member with their spouse
      biological.forEach((bio, idx) => {
        if (idx > 0) currentX += SIBLING_GAP;

        // Position biological member
        positioned.set(bio.id, { node: bio, x: currentX, y, width: NODE_WIDTH });
        currentX += NODE_WIDTH;

        // Position spouse next to them
        const spouse = spouses.find(
          (s) => s.spouse_node_id === bio.id || bio.spouse_node_id === s.id
        );
        if (spouse && !positioned.has(spouse.id)) {
          currentX += SPOUSE_GAP;
          positioned.set(spouse.id, { node: spouse, x: currentX, y, width: NODE_WIDTH });
          currentX += NODE_WIDTH;
        }
      });

      // Add branch gap after each branch (except last)
      if (branchIdx < sortedBranches.length - 1) {
        currentX += BRANCH_GAP;
      }
    });

    return currentX;
  };

  // First pass: position all generations
  let totalWidth = 0;
  genKeys.forEach((_, idx) => {
    const endX = positionGeneration(idx, 0);
    totalWidth = Math.max(totalWidth, endX);
  });

  // Second pass: center children under parents
  genKeys.slice(1).forEach((gen) => {
    const genNodes = generations.get(gen) || [];

    // Group children by parent
    const parentGroups = new Map<string, FamilyTreeNode[]>();
    genNodes.filter((n) => n.node_type === "biological" && n.parent_node_id).forEach((n) => {
      if (!parentGroups.has(n.parent_node_id!)) {
        parentGroups.set(n.parent_node_id!, []);
      }
      parentGroups.get(n.parent_node_id!)!.push(n);
    });

    parentGroups.forEach((children, parentId) => {
      const parentPos = positioned.get(parentId);
      if (!parentPos) return;

      // Get parent couple center
      const parent = parentPos.node;
      const spousePos = parent.spouse_node_id
        ? positioned.get(parent.spouse_node_id)
        : null;

      const coupleCenter = spousePos
        ? (parentPos.x + spousePos.x + NODE_WIDTH) / 2
        : parentPos.x + NODE_WIDTH / 2;

      // Calculate children block width
      let childrenWidth = 0;
      children.forEach((child, idx) => {
        const childPos = positioned.get(child.id);
        if (!childPos) return;

        // Include spouse width
        const spouseId = child.spouse_node_id;
        const hasSpouse = spouseId && positioned.has(spouseId);

        if (idx > 0) childrenWidth += SIBLING_GAP;
        childrenWidth += NODE_WIDTH;
        if (hasSpouse) childrenWidth += SPOUSE_GAP + NODE_WIDTH;
      });

      // Calculate offset to center children under parent couple
      const childrenCenter = childrenWidth / 2;
      const offset = coupleCenter - childrenCenter;

      // Apply offset to children and their spouses
      let currentOffset = 0;
      children.forEach((child, idx) => {
        const childPos = positioned.get(child.id);
        if (!childPos) return;

        if (idx > 0) currentOffset += SIBLING_GAP;

        const newX = offset + currentOffset;
        positioned.set(child.id, { ...childPos, x: newX });
        currentOffset += NODE_WIDTH;

        // Move spouse too
        if (child.spouse_node_id) {
          const spousePos = positioned.get(child.spouse_node_id);
          if (spousePos) {
            currentOffset += SPOUSE_GAP;
            positioned.set(child.spouse_node_id, { ...spousePos, x: offset + currentOffset });
            currentOffset += NODE_WIDTH;
          }
        }
      });
    });
  });

  // Build connections
  const connections: TreeConnection[] = [];

  positioned.forEach((pos, nodeId) => {
    const node = pos.node;

    // Parent-child connection
    if (node.parent_node_id && node.node_type === "biological") {
      const parentPos = positioned.get(node.parent_node_id);
      if (parentPos) {
        connections.push({
          from_id: node.parent_node_id,
          to_id: nodeId,
          from_x: parentPos.x + NODE_WIDTH / 2,
          from_y: parentPos.y + NODE_HEIGHT,
          to_x: pos.x + NODE_WIDTH / 2,
          to_y: pos.y,
          type: "parent_child",
        });
      }
    }

    // Spouse connection
    if (node.spouse_node_id && node.gender === "male") {
      const spousePos = positioned.get(node.spouse_node_id);
      if (spousePos) {
        connections.push({
          from_id: nodeId,
          to_id: node.spouse_node_id,
          from_x: pos.x + NODE_WIDTH,
          from_y: pos.y + NODE_HEIGHT / 2,
          to_x: spousePos.x,
          to_y: spousePos.y + NODE_HEIGHT / 2,
          type: "spouse",
        });
      }
    }
  });

  // Calculate bounds
  let minX = Infinity;
  let maxX = -Infinity;
  positioned.forEach((pos) => {
    minX = Math.min(minX, pos.x);
    maxX = Math.max(maxX, pos.x + NODE_WIDTH);
  });

  // Normalize positions (shift so minX = 0)
  const offsetX = minX < 0 ? -minX : 0;

  // Build final positioned nodes
  const positionedNodes: PositionedTreeNode[] = [];
  positioned.forEach((pos, id) => {
    positionedNodes.push({
      ...pos.node,
      x: pos.x + offsetX,
      y: pos.y,
      children_ids: childrenMap.get(id) || [],
    });
  });

  // Update connection positions with offset
  connections.forEach((conn) => {
    conn.from_x += offsetX;
    conn.to_x += offsetX;
  });

  // Recalculate total dimensions
  const finalWidth = maxX - minX + offsetX;
  const totalHeight = (maxGen + 1) * GENERATION_GAP;

  return {
    positionedNodes,
    connections,
    totalWidth: finalWidth,
    totalHeight,
  };
}

// Export constants for use in components
export { NODE_WIDTH, NODE_HEIGHT, GENERATION_GAP };
