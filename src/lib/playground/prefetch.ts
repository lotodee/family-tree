import type { FamilyTreeNode, Question } from "@/types";

// ============================================================
// TYPES
// ============================================================

export interface AnswerWithRelations {
  id: string;
  respondent_id: string;
  respondent_name: string;
  subject_id: string;
  question_id: string;
  question_text: string;
  question_category: string;
  question_type: string;
  answer_text: string | null;
  voice_url: string | null;
  raw_transcription: string | null;
  input_method: string;
  is_confirmed: boolean;
}

export interface FamilyDataCache {
  nodes: FamilyTreeNode[];
  answers: AnswerWithRelations[];
  questions: Question[];
  nodesByName: Map<string, FamilyTreeNode>;
  nodesById: Map<string, FamilyTreeNode>;
  allFamilyNames: string[];
  lastFetched: number;
}

// ============================================================
// FETCH FUNCTION
// ============================================================

/**
 * Fetch ALL family data upfront and cache client-side.
 * This eliminates per-prompt database queries.
 */
export async function fetchAllFamilyData(): Promise<FamilyDataCache> {
  console.log("\x1b[36m[TEMP] 📥 Fetching all family data...\x1b[0m");

  const response = await fetch("/api/playground/prefetch");

  if (!response.ok) {
    console.log("\x1b[31m[TEMP] ❌ Prefetch failed: HTTP", response.status, "\x1b[0m");
    throw new Error("Failed to prefetch family data");
  }

  const { nodes, answers, questions } = await response.json();

  // Build lookup maps for fast access
  const nodesByName = new Map<string, FamilyTreeNode>();
  const nodesById = new Map<string, FamilyTreeNode>();

  for (const node of nodes as FamilyTreeNode[]) {
    nodesById.set(node.id, node);

    // Map by display_name (lowercase for case-insensitive matching)
    nodesByName.set(node.display_name.toLowerCase(), node);

    // Also map by full_name if different
    if (node.full_name && node.full_name.toLowerCase() !== node.display_name.toLowerCase()) {
      nodesByName.set(node.full_name.toLowerCase(), node);
    }
  }

  // Extract all known family names (for the fast LLM prompt)
  const allFamilyNames = (nodes as FamilyTreeNode[]).map((n) => n.display_name);

  console.log(
    "\x1b[32m[TEMP] ✅ Prefetch complete:",
    JSON.stringify({
      nodes: nodes.length,
      answers: answers.length,
      questions: questions.length,
      familyNames: allFamilyNames.length,
    }),
    "\x1b[0m"
  );

  return {
    nodes,
    answers,
    questions,
    nodesByName,
    nodesById,
    allFamilyNames,
    lastFetched: Date.now(),
  };
}
