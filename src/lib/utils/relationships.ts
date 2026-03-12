import type { RelationshipType, Gender } from "@/types";

/**
 * Given a relationship type and the gender of the "from" person,
 * returns the inverse relationship type.
 *
 * Example:
 *   getInverse("daughter", "male") → "father"  (Michael is Kemi's father)
 *   getInverse("daughter", "female") → "mother" (Racheal is Kemi's mother)
 *   getInverse("wife", "male") → "husband"
 */
export function getInverse(
  type: RelationshipType,
  fromGender: Gender
): RelationshipType {
  switch (type) {
    case "wife":
      return "husband";
    case "husband":
      return "wife";
    case "son":
      return fromGender === "female" ? "mother" : "father";
    case "daughter":
      return fromGender === "female" ? "mother" : "father";
    case "father":
      return fromGender === "female" ? "daughter" : "son";
    case "mother":
      return fromGender === "female" ? "daughter" : "son";
    case "brother":
      return fromGender === "female" ? "sister" : "brother";
    case "sister":
      return fromGender === "female" ? "sister" : "brother";
    case "uncle":
      return fromGender === "female" ? "niece" : "nephew";
    case "aunt":
      return fromGender === "female" ? "niece" : "nephew";
    case "nephew":
      return fromGender === "female" ? "aunt" : "uncle";
    case "niece":
      return fromGender === "female" ? "aunt" : "uncle";
    case "cousin":
      return "cousin";
    default:
      return type;
  }
}

/**
 * Returns all valid relationship types grouped by category.
 * Used by the UI to show relationship options.
 */
export function getRelationshipOptions(): {
  label: string;
  types: { value: RelationshipType; label: string }[];
}[] {
  return [
    {
      label: "Spouse",
      types: [
        { value: "wife", label: "Wife" },
        { value: "husband", label: "Husband" },
      ],
    },
    {
      label: "Children",
      types: [
        { value: "son", label: "Son" },
        { value: "daughter", label: "Daughter" },
      ],
    },
    {
      label: "Parents",
      types: [
        { value: "father", label: "Father" },
        { value: "mother", label: "Mother" },
      ],
    },
    {
      label: "Siblings",
      types: [
        { value: "brother", label: "Brother" },
        { value: "sister", label: "Sister" },
      ],
    },
    {
      label: "Extended Family",
      types: [
        { value: "uncle", label: "Uncle" },
        { value: "aunt", label: "Aunt" },
        { value: "nephew", label: "Nephew" },
        { value: "niece", label: "Niece" },
        { value: "cousin", label: "Cousin" },
      ],
    },
  ];
}

/**
 * Returns a human-readable label for a relationship.
 * "Michael is Kemi's father" → getRelationshipLabel("father") → "Father"
 */
export function getRelationshipLabel(type: RelationshipType): string {
  const labels: Record<RelationshipType, string> = {
    wife: "Wife",
    husband: "Husband",
    son: "Son",
    daughter: "Daughter",
    father: "Father",
    mother: "Mother",
    brother: "Brother",
    sister: "Sister",
    uncle: "Uncle",
    aunt: "Aunt",
    nephew: "Nephew",
    niece: "Niece",
    cousin: "Cousin",
  };
  return labels[type] || type;
}

/**
 * Determines if a relationship type implies a parent-child hierarchy.
 * Used to sync parent_node_id on family_tree_nodes.
 */
export function isParentChildRelation(type: RelationshipType): boolean {
  return ["son", "daughter", "father", "mother"].includes(type);
}

/**
 * Determines if a relationship type implies a spouse link.
 * Used to sync spouse_node_id on family_tree_nodes.
 */
export function isSpouseRelation(type: RelationshipType): boolean {
  return ["wife", "husband"].includes(type);
}

/**
 * Given a relationship, determine which node is the parent and which is the child.
 * Returns null if the relationship is not parent-child.
 *
 * "Kemi is Michael's daughter" → from=Kemi, to=Michael, type="daughter"
 *   → parentId=Michael, childId=Kemi
 *
 * "Michael is Kemi's father" → from=Michael, to=Kemi, type="father"
 *   → parentId=Michael, childId=Kemi
 */
export function resolveParentChild(
  fromNodeId: string,
  toNodeId: string,
  type: RelationshipType
): { parentId: string; childId: string } | null {
  switch (type) {
    case "son":
    case "daughter":
      // "from" is the child of "to"
      return { parentId: toNodeId, childId: fromNodeId };
    case "father":
    case "mother":
      // "from" is the parent of "to"
      return { parentId: fromNodeId, childId: toNodeId };
    default:
      return null;
  }
}

/**
 * Given a relationship, determine if it's a spouse link.
 * Returns the two spouse IDs or null.
 */
export function resolveSpouse(
  fromNodeId: string,
  toNodeId: string,
  type: RelationshipType
): { spouseA: string; spouseB: string } | null {
  if (type === "wife" || type === "husband") {
    return { spouseA: fromNodeId, spouseB: toNodeId };
  }
  return null;
}
