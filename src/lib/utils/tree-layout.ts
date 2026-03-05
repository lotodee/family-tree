import type { FamilyTreeNode, PositionedTreeNode, TreeConnection } from "@/types";

// Layout constants
const NODE_WIDTH = 130;
const NODE_HEIGHT = 56;
const SPOUSE_GAP = 12;
const SIBLING_GAP = 40;
const GENERATION_GAP = 120;
const BRANCH_GAP = 64;

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
}

/**
 * Computes tree layout for the family organogram.
 * Positions nodes generation by generation, grouping by branch.
 * No centering pass to avoid overlaps - just clean left-to-right layout.
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
    if (n.parent_node_id && n.node_type === "biological") {
      if (!childrenMap.has(n.parent_node_id)) {
        childrenMap.set(n.parent_node_id, []);
      }
      childrenMap.get(n.parent_node_id)!.push(n.id);
    }
  });

  // Track positioned nodes
  const positioned = new Map<string, NodeWithPosition>();

  // Get branch order based on seed data (children of patriarch)
  const getBranchOrder = (): string[] => {
    const gen1 = generations.get(1) || [];
    const biologicalChildren = gen1
      .filter((n) => n.node_type === "biological")
      .sort((a, b) => a.id.localeCompare(b.id)); // Sort by ID for consistent order
    return biologicalChildren.map((n) => n.branch || "unknown");
  };

  const branchOrder = getBranchOrder();

  // Position generation 0 (grandparents)
  const positionGen0 = (): number => {
    const gen0 = generations.get(0) || [];
    const patriarch = gen0.find((n) => n.node_type === "biological" && n.gender === "male");
    const matriarch = gen0.find((n) => n.node_type === "spouse" || n.gender === "female");

    let x = 0;
    const y = 0;

    if (patriarch) {
      positioned.set(patriarch.id, { node: patriarch, x, y });
      x += NODE_WIDTH;

      if (matriarch) {
        x += SPOUSE_GAP;
        positioned.set(matriarch.id, { node: matriarch, x, y });
        x += NODE_WIDTH;
      }
    }

    return x;
  };

  // Position a generation (1, 2, 3, etc.)
  const positionGeneration = (gen: number): number => {
    const genNodes = generations.get(gen) || [];
    const y = gen * GENERATION_GAP;

    // Group by branch
    const branchGroups = new Map<string, FamilyTreeNode[]>();
    genNodes.forEach((n) => {
      const branch = n.branch || "unknown";
      if (!branchGroups.has(branch)) branchGroups.set(branch, []);
      branchGroups.get(branch)!.push(n);
    });

    // Sort branches by predefined order
    const sortedBranches = Array.from(branchGroups.keys()).sort((a, b) => {
      const aIdx = branchOrder.indexOf(a);
      const bIdx = branchOrder.indexOf(b);
      if (aIdx === -1 && bIdx === -1) return a.localeCompare(b);
      if (aIdx === -1) return 1;
      if (bIdx === -1) return -1;
      return aIdx - bIdx;
    });

    let currentX = 0;

    sortedBranches.forEach((branch, branchIdx) => {
      const branchNodes = branchGroups.get(branch)!;

      // Separate biological members and spouses
      const biological = branchNodes.filter((n) => n.node_type === "biological");
      const spouses = branchNodes.filter((n) => n.node_type === "spouse");

      // Sort biological by ID for consistent order
      biological.sort((a, b) => a.id.localeCompare(b.id));

      // Position each biological member with their spouse
      biological.forEach((bio, idx) => {
        if (idx > 0) currentX += SIBLING_GAP;

        positioned.set(bio.id, { node: bio, x: currentX, y });
        currentX += NODE_WIDTH;

        // Position spouse next to them
        const spouse = spouses.find(
          (s) => s.spouse_node_id === bio.id || bio.spouse_node_id === s.id
        );
        if (spouse && !positioned.has(spouse.id)) {
          currentX += SPOUSE_GAP;
          positioned.set(spouse.id, { node: spouse, x: currentX, y });
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

  // Position all generations
  let maxWidth = positionGen0();

  genKeys.slice(1).forEach((gen) => {
    const width = positionGeneration(gen);
    maxWidth = Math.max(maxWidth, width);
  });

  // Center gen0 above the rest
  const gen0Width =
    (generations.get(0) || []).length * NODE_WIDTH +
    ((generations.get(0) || []).length - 1) * SPOUSE_GAP;
  const gen0Offset = (maxWidth - gen0Width) / 2;

  // Apply offset to gen0
  (generations.get(0) || []).forEach((n) => {
    const pos = positioned.get(n.id);
    if (pos) {
      positioned.set(n.id, { ...pos, x: pos.x + gen0Offset });
    }
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

    // Spouse connection (only from male to avoid duplicates)
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

  // Build final positioned nodes
  const positionedNodes: PositionedTreeNode[] = [];
  positioned.forEach((pos, id) => {
    positionedNodes.push({
      ...pos.node,
      x: pos.x,
      y: pos.y,
      children_ids: childrenMap.get(id) || [],
    });
  });

  const totalHeight = (maxGen + 1) * GENERATION_GAP + NODE_HEIGHT;

  return {
    positionedNodes,
    connections,
    totalWidth: maxWidth,
    totalHeight,
  };
}

// Export constants for use in components
export { NODE_WIDTH, NODE_HEIGHT, GENERATION_GAP };
