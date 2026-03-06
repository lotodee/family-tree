import type {
  FamilyTreeNode,
  PositionedTreeNode,
  ConnectorLine,
  HorizontalTreeLayout,
} from "@/types";

// Layout constants
export const NODE_WIDTH = 150;
export const NODE_HEIGHT = 64;
export const COUPLE_INTERNAL_GAP = 8;
export const COUPLE_HEIGHT = NODE_HEIGHT * 2 + COUPLE_INTERNAL_GAP;
export const GENERATION_GAP_X = 80;
export const SIBLING_GAP_Y = 16;
export const BRANCH_GAP_Y = 32;
export const PADDING_TOP = 40;
export const PADDING_LEFT = 40;

// Branch ordering for consistent layout
const BRANCH_ORDER = [
  "kemi",
  "sola",
  "bunmi",
  "wale",
  "ronke",
  "lanre",
  "akeem",
  "leke",
];

// Internal structure for building the tree
interface CoupleUnit {
  person: FamilyTreeNode;
  spouse: FamilyTreeNode | null;
  children: CoupleUnit[];
  totalHeight: number;
  // Computed positions
  x?: number;
  y?: number;
}

/**
 * Computes horizontal tree layout for the family organogram.
 * Generations flow left-to-right, branches spread vertically.
 * Couples are stacked vertically (person on top, spouse below).
 */
export function computeHorizontalTreeLayout(
  nodes: FamilyTreeNode[]
): HorizontalTreeLayout {
  if (nodes.length === 0) {
    return { nodes: [], connectors: [], totalWidth: 0, totalHeight: 0 };
  }

  // Build lookup maps
  const nodeMap = new Map<string, FamilyTreeNode>();
  nodes.forEach((n) => nodeMap.set(n.id, n));

  // Build parent-to-children map (only biological children)
  const childrenMap = new Map<string, FamilyTreeNode[]>();
  nodes.forEach((n) => {
    if (n.parent_node_id && n.node_type === "biological") {
      if (!childrenMap.has(n.parent_node_id)) {
        childrenMap.set(n.parent_node_id, []);
      }
      childrenMap.get(n.parent_node_id)!.push(n);
    }
  });

  // Sort children by branch order for consistent layout
  childrenMap.forEach((children, parentId) => {
    children.sort((a, b) => {
      const aIndex = BRANCH_ORDER.indexOf(a.branch || "");
      const bIndex = BRANCH_ORDER.indexOf(b.branch || "");
      if (aIndex === -1 && bIndex === -1) return a.id.localeCompare(b.id);
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });
  });

  // Phase 1: Build nested structure
  const root = buildCoupleUnit(nodes, nodeMap, childrenMap);
  if (!root) {
    return { nodes: [], connectors: [], totalWidth: 0, totalHeight: 0 };
  }

  // Phase 2: Compute heights bottom-up
  computeHeights(root, true);

  // Phase 3: Position top-down, left-to-right
  const positionedNodes: PositionedTreeNode[] = [];
  const connectors: ConnectorLine[] = [];

  positionNodes(
    root,
    PADDING_LEFT,
    PADDING_TOP,
    root.totalHeight,
    true,
    positionedNodes,
    connectors,
    nodeMap
  );

  // Calculate total dimensions
  let totalWidth = 0;
  let totalHeight = 0;
  positionedNodes.forEach((n) => {
    totalWidth = Math.max(totalWidth, n.x + NODE_WIDTH);
    totalHeight = Math.max(totalHeight, n.y + NODE_HEIGHT);
  });

  // Add padding
  totalWidth += PADDING_LEFT;
  totalHeight += PADDING_TOP;

  return { nodes: positionedNodes, connectors, totalWidth, totalHeight };
}

/**
 * Phase 1: Build nested CoupleUnit structure from flat nodes.
 * Starts from patriarch (gen 0, biological, male).
 */
function buildCoupleUnit(
  nodes: FamilyTreeNode[],
  nodeMap: Map<string, FamilyTreeNode>,
  childrenMap: Map<string, FamilyTreeNode[]>
): CoupleUnit | null {
  // Find patriarch (generation 0, biological, male)
  const patriarch = nodes.find(
    (n) => n.generation === 0 && n.node_type === "biological" && n.gender === "male"
  );

  if (!patriarch) {
    // Fallback: find any gen 0 biological node
    const gen0Bio = nodes.find(
      (n) => n.generation === 0 && n.node_type === "biological"
    );
    if (!gen0Bio) return null;
    return buildCoupleUnitRecursive(gen0Bio, nodeMap, childrenMap);
  }

  return buildCoupleUnitRecursive(patriarch, nodeMap, childrenMap);
}

function buildCoupleUnitRecursive(
  person: FamilyTreeNode,
  nodeMap: Map<string, FamilyTreeNode>,
  childrenMap: Map<string, FamilyTreeNode[]>
): CoupleUnit {
  // Find spouse
  const spouse = person.spouse_node_id
    ? nodeMap.get(person.spouse_node_id) || null
    : null;

  // Find biological children
  const childNodes = childrenMap.get(person.id) || [];

  // Build children recursively
  const children: CoupleUnit[] = childNodes.map((child) =>
    buildCoupleUnitRecursive(child, nodeMap, childrenMap)
  );

  return {
    person,
    spouse,
    children,
    totalHeight: 0,
  };
}

/**
 * Phase 2: Compute heights bottom-up.
 * Each unit's totalHeight is the larger of its own height or children's combined height.
 */
function computeHeights(unit: CoupleUnit, isRootChild: boolean): void {
  // Recursively compute children heights first
  unit.children.forEach((child) => computeHeights(child, false));

  // Self height (couple or single)
  const selfHeight = unit.spouse ? COUPLE_HEIGHT : NODE_HEIGHT;

  if (unit.children.length === 0) {
    unit.totalHeight = selfHeight;
    return;
  }

  // Gap between children depends on depth
  const gap = isRootChild ? BRANCH_GAP_Y : SIBLING_GAP_Y;

  // Children combined height
  const childrenHeight =
    unit.children.reduce((sum, child) => sum + child.totalHeight, 0) +
    (unit.children.length - 1) * gap;

  unit.totalHeight = Math.max(selfHeight, childrenHeight);
}

/**
 * Phase 3: Position nodes top-down, left-to-right.
 * Distributes children vertically within parent's allocated space.
 */
function positionNodes(
  unit: CoupleUnit,
  x: number,
  allocatedTop: number,
  allocatedHeight: number,
  isRootChild: boolean,
  positionedNodes: PositionedTreeNode[],
  connectors: ConnectorLine[],
  nodeMap: Map<string, FamilyTreeNode>
): void {
  // Center the couple/single within allocated space
  const selfHeight = unit.spouse ? COUPLE_HEIGHT : NODE_HEIGHT;
  const centerY = allocatedTop + allocatedHeight / 2;

  // Position person
  const personY = centerY - selfHeight / 2;
  unit.x = x;
  unit.y = personY;

  const personPositioned: PositionedTreeNode = {
    ...unit.person,
    x,
    y: personY,
    children_ids: unit.children.map((c) => c.person.id),
  };
  positionedNodes.push(personPositioned);

  // Position spouse (below person)
  if (unit.spouse) {
    const spouseY = personY + NODE_HEIGHT + COUPLE_INTERNAL_GAP;
    const spousePositioned: PositionedTreeNode = {
      ...unit.spouse,
      x,
      y: spouseY,
      children_ids: [],
    };
    positionedNodes.push(spousePositioned);

    // Couple connector (dashed vertical)
    connectors.push({
      id: `couple-${unit.person.id}-${unit.spouse.id}`,
      type: "couple",
      x1: x + NODE_WIDTH / 2,
      y1: personY + NODE_HEIGHT,
      x2: x + NODE_WIDTH / 2,
      y2: spouseY,
    });
  }

  // Position children
  if (unit.children.length === 0) return;

  const childX = x + NODE_WIDTH + GENERATION_GAP_X;
  const bracketX = x + NODE_WIDTH + GENERATION_GAP_X / 2;
  const gap = isRootChild ? BRANCH_GAP_Y : SIBLING_GAP_Y;

  // Calculate children's positions
  const totalChildrenHeight =
    unit.children.reduce((sum, child) => sum + child.totalHeight, 0) +
    (unit.children.length - 1) * gap;

  // Center children block within allocated height
  let currentY = centerY - totalChildrenHeight / 2;

  // Parent center for connector
  const parentCenterY = centerY;

  // Connector: parent to bracket
  connectors.push({
    id: `p2b-${unit.person.id}`,
    type: "parent_to_bracket",
    x1: x + NODE_WIDTH,
    y1: parentCenterY,
    x2: bracketX,
    y2: parentCenterY,
  });

  // Track first and last child centers for bracket
  const childCenters: number[] = [];

  unit.children.forEach((child, index) => {
    const childCenterY = currentY + child.totalHeight / 2;
    childCenters.push(childCenterY);

    // Position child recursively
    positionNodes(
      child,
      childX,
      currentY,
      child.totalHeight,
      false,
      positionedNodes,
      connectors,
      nodeMap
    );

    // Connector: bracket to child
    connectors.push({
      id: `b2c-${unit.person.id}-${child.person.id}`,
      type: "bracket_to_child",
      x1: bracketX,
      y1: childCenterY,
      x2: childX,
      y2: childCenterY,
    });

    currentY += child.totalHeight + gap;
  });

  // Connector: bracket (vertical line connecting all siblings)
  if (childCenters.length > 1) {
    connectors.push({
      id: `bracket-${unit.person.id}`,
      type: "bracket",
      x1: bracketX,
      y1: childCenters[0],
      x2: bracketX,
      y2: childCenters[childCenters.length - 1],
    });
  }
}
