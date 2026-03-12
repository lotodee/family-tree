import type { FamilyTreeNode, FamilyRelationship, RelationshipType } from "@/types";

// ─── Constants ────────────────────────────────────────────
export const NODE_DIAMETER = 56;
export const NODE_VERTICAL_GAP = 24;       // vertical space between siblings
export const NODE_HORIZONTAL_GAP = 140;    // horizontal space between generations
export const COUPLE_GAP = 12;              // vertical gap between person and spouse
export const BRANCH_GROUP_GAP = 40;        // extra gap between major branches (honoree's children)
export const PADDING_TOP = 60;
export const PADDING_LEFT = 80;
export const PADDING_RIGHT = 80;
export const PADDING_BOTTOM = 60;
export const NAME_HEIGHT = 24;             // space reserved for the name label below the circle

// ─── Types ────────────────────────────────────────────────

export interface PositionedMember {
  node: FamilyTreeNode;
  x: number;                               // center X of the circle
  y: number;                               // center Y of the circle
  isHonoree: boolean;
  isSpouse: boolean;
  isClaimed: boolean;
  isDeceased: boolean;
  generation: number;                      // computed distance from honoree (0 = honoree)
}

export interface BranchCurve {
  id: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  thickness: number;                       // stroke width — thicker near trunk
  type: "trunk" | "branch" | "twig" | "couple";
}

export interface TreeLayout {
  members: PositionedMember[];
  branches: BranchCurve[];
  totalWidth: number;
  totalHeight: number;
}

// ─── Main layout function ─────────────────────────────────

export function computeTreeLayout(
  nodes: FamilyTreeNode[],
  relationships: FamilyRelationship[],
  honoreeNodeId: string | null
): TreeLayout {
  if (!honoreeNodeId || nodes.length === 0) {
    return { members: [], branches: [], totalWidth: 0, totalHeight: 0 };
  }

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const visited = new Set<string>();

  // Helper: get related nodes by relationship type
  function getRelated(nodeId: string, types: RelationshipType[]): FamilyTreeNode[] {
    return relationships
      .filter((r) => r.from_node_id === nodeId && (types as string[]).includes(r.relationship_type))
      .map((r) => nodeMap.get(r.to_node_id))
      .filter((n): n is FamilyTreeNode => n !== undefined && !visited.has(n.id));
  }

  // ── Phase 1: Build nested structure ─────────────────

  interface FamilyUnit {
    person: FamilyTreeNode;
    spouse: FamilyTreeNode | null;
    children: FamilyUnit[];
    computedGen: number;
  }

  function buildUnit(nodeId: string, gen: number): FamilyUnit | null {
    if (visited.has(nodeId)) return null;
    const node = nodeMap.get(nodeId);
    if (!node) return null;

    visited.add(nodeId);

    // Find spouse
    const spouses = getRelated(nodeId, ["wife", "husband"]);
    const spouse = spouses[0] || null;
    if (spouse) visited.add(spouse.id);

    // Find children (sons + daughters of this person or their spouse)
    const myChildren = getRelated(nodeId, ["son", "daughter"]);
    const spouseChildren = spouse ? getRelated(spouse.id, ["son", "daughter"]) : [];

    const childMap = new Map<string, FamilyTreeNode>();
    [...myChildren, ...spouseChildren].forEach((c) => childMap.set(c.id, c));

    // Find siblings (brother/sister) - they appear at the SAME generation level
    const siblings = getRelated(nodeId, ["brother", "sister"]);

    // Find parents (father/mother) - they appear one generation UP (gen - 1)
    const parents = getRelated(nodeId, ["father", "mother"]);

    // Find extended family
    const unclesAunts = getRelated(nodeId, ["uncle", "aunt"]); // same level as parents
    const nephewsNieces = getRelated(nodeId, ["nephew", "niece"]); // same level as children
    const cousins = getRelated(nodeId, ["cousin"]); // same level as current

    // Build child units (gen + 1)
    const childUnits = Array.from(childMap.values())
      .filter((c) => !visited.has(c.id))
      .map((c) => buildUnit(c.id, gen + 1))
      .filter((u): u is FamilyUnit => u !== null);

    // Build sibling units (same gen) - siblings are essentially peers
    const siblingUnits = siblings
      .filter((s) => !visited.has(s.id))
      .map((s) => buildUnit(s.id, gen))
      .filter((u): u is FamilyUnit => u !== null);

    // Build parent units (gen - 1) - parents go "up" but we show them as branches
    const parentUnits = parents
      .filter((p) => !visited.has(p.id))
      .map((p) => buildUnit(p.id, gen - 1))
      .filter((u): u is FamilyUnit => u !== null);

    // Build extended family units
    const uncleAuntUnits = unclesAunts
      .filter((u) => !visited.has(u.id))
      .map((u) => buildUnit(u.id, gen - 1))
      .filter((u): u is FamilyUnit => u !== null);

    const nephewNieceUnits = nephewsNieces
      .filter((n) => !visited.has(n.id))
      .map((n) => buildUnit(n.id, gen + 1))
      .filter((u): u is FamilyUnit => u !== null);

    const cousinUnits = cousins
      .filter((c) => !visited.has(c.id))
      .map((c) => buildUnit(c.id, gen))
      .filter((u): u is FamilyUnit => u !== null);

    // Combine all branches - for visual display, they all appear as "children" branches
    // The generation number differentiates their visual position
    const allBranches = [
      ...parentUnits,
      ...uncleAuntUnits,
      ...siblingUnits,
      ...cousinUnits,
      ...childUnits,
      ...nephewNieceUnits,
    ];

    return { person: node, spouse, children: allBranches, computedGen: gen };
  }

  const root = buildUnit(honoreeNodeId, 0);
  if (!root) {
    return { members: [], branches: [], totalWidth: 0, totalHeight: 0 };
  }

  // ── Phase 2: Compute heights bottom-up ──────────────

  function computeHeight(unit: FamilyUnit): number {
    const ownHeight = spouse_exists(unit)
      ? NODE_DIAMETER + COUPLE_GAP + NODE_DIAMETER + NAME_HEIGHT
      : NODE_DIAMETER + NAME_HEIGHT;

    if (unit.children.length === 0) return ownHeight;

    const isRoot = unit.computedGen === 0;
    const gap = isRoot ? BRANCH_GROUP_GAP : NODE_VERTICAL_GAP;

    const childrenHeight = unit.children.reduce(
      (sum, child) => sum + computeHeight(child),
      0
    ) + (unit.children.length - 1) * gap;

    return Math.max(ownHeight, childrenHeight);
  }

  function spouse_exists(unit: FamilyUnit): boolean {
    return unit.spouse !== null;
  }

  const totalTreeHeight = computeHeight(root);

  // ── Phase 3: Position top-down, left-to-right ───────

  const members: PositionedMember[] = [];
  const branches: BranchCurve[] = [];

  function positionUnit(
    unit: FamilyUnit,
    x: number,
    yStart: number,
    yEnd: number,
    branchThickness: number
  ) {
    const centerY = (yStart + yEnd) / 2;
    const hasSpouse = unit.spouse !== null;

    // Position the person
    const personY = hasSpouse
      ? centerY - (COUPLE_GAP / 2) - (NODE_DIAMETER / 2)
      : centerY;

    members.push({
      node: unit.person,
      x,
      y: personY,
      isHonoree: unit.computedGen === 0,
      isSpouse: false,
      isClaimed: unit.person.is_claimed,
      isDeceased: unit.person.is_deceased,
      generation: unit.computedGen,
    });

    // Position spouse below
    if (unit.spouse) {
      const spouseY = centerY + (COUPLE_GAP / 2) + (NODE_DIAMETER / 2);

      members.push({
        node: unit.spouse,
        x,
        y: spouseY,
        isHonoree: false,
        isSpouse: true,
        isClaimed: unit.spouse.is_claimed,
        isDeceased: unit.spouse.is_deceased,
        generation: unit.computedGen,
      });

      // Couple connector (short vertical line between them)
      branches.push({
        id: `couple-${unit.person.id}-${unit.spouse.id}`,
        fromX: x,
        fromY: personY + NODE_DIAMETER / 2,
        toX: x,
        toY: spouseY - NODE_DIAMETER / 2,
        thickness: 1.5,
        type: "couple",
      });
    }

    // Position children
    if (unit.children.length === 0) return;

    const childX = x + NODE_HORIZONTAL_GAP;
    const isRoot = unit.computedGen === 0;
    const gap = isRoot ? BRANCH_GROUP_GAP : NODE_VERTICAL_GAP;

    // Compute total children height
    const childHeights = unit.children.map((c) => computeHeight(c));
    const totalChildrenHeight =
      childHeights.reduce((a, b) => a + b, 0) +
      (unit.children.length - 1) * gap;

    // Center children vertically around the parent
    let childYStart = centerY - totalChildrenHeight / 2;

    for (let i = 0; i < unit.children.length; i++) {
      const childHeight = childHeights[i];
      const childYEnd = childYStart + childHeight;
      const childCenterY = (childYStart + childYEnd) / 2;

      // Branch from parent to child
      const nextThickness = Math.max(1.5, branchThickness * 0.7);

      branches.push({
        id: `branch-${unit.person.id}-${unit.children[i].person.id}`,
        fromX: x + NODE_DIAMETER / 2,
        fromY: centerY,
        toX: childX - NODE_DIAMETER / 2,
        toY: childCenterY,
        thickness: nextThickness,
        type: unit.computedGen === 0 ? "trunk" : unit.computedGen === 1 ? "branch" : "twig",
      });

      positionUnit(unit.children[i], childX, childYStart, childYEnd, nextThickness);

      childYStart = childYEnd + gap;
    }
  }

  positionUnit(root, PADDING_LEFT, PADDING_TOP, PADDING_TOP + totalTreeHeight, 4);

  // Compute total dimensions
  let maxX = 0;
  let maxY = 0;
  for (const m of members) {
    maxX = Math.max(maxX, m.x + NODE_DIAMETER / 2 + 60); // extra space for name
    maxY = Math.max(maxY, m.y + NODE_DIAMETER / 2 + NAME_HEIGHT);
  }

  return {
    members,
    branches,
    totalWidth: maxX + PADDING_RIGHT,
    totalHeight: maxY + PADDING_BOTTOM,
  };
}
