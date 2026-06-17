import type { FamilyDataCache } from "./prefetch";
import type { FamilyTreeNode } from "@/types";

export interface ResolvedSubjects {
  /** Resolved node IDs */
  nodeIds: string[];
  /** Resolved display names */
  names: string[];
  /** Names that couldn't be matched */
  unmatched: string[];
  /** Resolution mode */
  mode: "specific" | "all" | "none";
}

/**
 * Resolve extracted subject names to tree node IDs using the cache.
 *
 * Priority logic:
 * 1. If dropdown has selections → use those (handled by caller)
 * 2. If extracted names include "ALL" → whole family mode
 * 3. Otherwise → match names to nodes
 *
 * @param cache - The pre-fetched family data cache
 * @param extractedNames - Names from the prompt parser
 * @returns Resolved node IDs and names
 */
export function resolveSubjectNames(
  cache: FamilyDataCache,
  extractedNames: string[]
): ResolvedSubjects {
  console.log("\x1b[33m[TEMP] 🔗 Resolving names:", extractedNames, "\x1b[0m");

  // Handle empty case
  if (!extractedNames || extractedNames.length === 0) {
    console.log("\x1b[33m[TEMP] 📝 No names to resolve, using family summary\x1b[0m");
    return {
      nodeIds: [],
      names: [],
      unmatched: [],
      mode: "none",
    };
  }

  // Handle "ALL" case - whole family mode
  if (extractedNames.some((n) => n.toUpperCase() === "ALL")) {
    console.log("\x1b[35m[TEMP] 👨‍👩‍👧‍👦 ALL detected, using family summary\x1b[0m");
    return {
      nodeIds: [],
      names: ["Everyone"],
      unmatched: [],
      mode: "all",
    };
  }

  // Match names to nodes
  const nodeIds: string[] = [];
  const names: string[] = [];
  const unmatched: string[] = [];

  for (const name of extractedNames) {
    const lowerName = name.toLowerCase().trim();

    // Skip empty names
    if (!lowerName) continue;

    // Try exact match first
    let node = cache.nodesByName.get(lowerName);

    // Try partial match if no exact match
    // Handles: "Aunty Kemi" → "Kemi", "Uncle Wale" → "Wale"
    if (!node) {
      for (const [key, n] of cache.nodesByName) {
        // Check if extracted name contains a family name
        if (lowerName.includes(key)) {
          node = n;
          break;
        }
        // Check if family name contains the extracted name
        if (key.includes(lowerName)) {
          node = n;
          break;
        }
      }
    }

    if (node && !nodeIds.includes(node.id)) {
      nodeIds.push(node.id);
      names.push(node.display_name);
    } else if (!node) {
      unmatched.push(name);
    }
  }

  console.log(
    "\x1b[32m[TEMP] ✅ Resolved:",
    JSON.stringify({
      nodeIds: nodeIds.length,
      names,
      unmatched,
      mode: nodeIds.length > 0 ? "specific" : "none",
    }),
    "\x1b[0m"
  );

  return {
    nodeIds,
    names,
    unmatched,
    mode: nodeIds.length > 0 ? "specific" : "none",
  };
}

/**
 * Resolve dropdown selections to node IDs.
 * Dropdown always takes priority over LLM extraction.
 *
 * @param dropdownNodes - Nodes selected in the dropdown
 * @returns Resolved subjects
 */
export function resolveDropdownSelections(
  dropdownNodes: FamilyTreeNode[]
): ResolvedSubjects {
  if (!dropdownNodes || dropdownNodes.length === 0) {
    return {
      nodeIds: [],
      names: [],
      unmatched: [],
      mode: "none",
    };
  }

  console.log(
    "\x1b[33m[TEMP] 📋 Using dropdown selection:",
    dropdownNodes.map((n) => n.display_name),
    "\x1b[0m"
  );

  return {
    nodeIds: dropdownNodes.map((n) => n.id),
    names: dropdownNodes.map((n) => n.display_name),
    unmatched: [],
    mode: "specific",
  };
}
