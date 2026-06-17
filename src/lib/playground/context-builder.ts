import type { FamilyDataCache, AnswerWithRelations } from "./prefetch";
import type { FamilyTreeNode } from "@/types";

/**
 * Client-side context builder.
 * Mirrors the server-side buildContextForSubject but uses the pre-fetched cache.
 * NO DATABASE CALLS - instant context building from memory.
 */
export function buildContextFromCache(
  cache: FamilyDataCache,
  subjectNodeId: string
): string {
  console.log("\x1b[33m[TEMP] ⚡ Building context from cache for:", subjectNodeId, "\x1b[0m");

  const node = cache.nodesById.get(subjectNodeId);
  if (!node) {
    console.log("\x1b[31m[TEMP] ❌ Node not found in cache:", subjectNodeId, "\x1b[0m");
    return "(Unknown family member)";
  }

  // 1. Get parent info
  let parentInfo = "";
  if (node.parent_node_id) {
    const parent = cache.nodesById.get(node.parent_node_id);
    if (parent) {
      const genderLabel = node.gender === "female" ? "Daughter" : "Son";
      parentInfo = `${genderLabel} of ${parent.display_name}`;

      // Get other parent (spouse of parent)
      if (parent.spouse_node_id) {
        const otherParent = cache.nodesById.get(parent.spouse_node_id);
        if (otherParent) {
          parentInfo += ` and ${otherParent.display_name}`;
        }
      }
    }
  }

  // 2. Get spouse info
  let spouseInfo = "";
  if (node.spouse_node_id) {
    const spouse = cache.nodesById.get(node.spouse_node_id);
    if (spouse) {
      spouseInfo = spouse.is_deceased
        ? `Married to Late ${spouse.display_name}`
        : `Married to ${spouse.display_name}`;
    }
  }

  // 3. Get siblings (same parent_node_id, different ID, biological only)
  const siblings = cache.nodes.filter(
    (n) =>
      n.parent_node_id === node.parent_node_id &&
      n.id !== subjectNodeId &&
      n.node_type === "biological" &&
      node.parent_node_id !== null
  );

  // 4. Get children (where parent_node_id is this node OR this node's spouse)
  const childParentIds = [subjectNodeId];
  if (node.spouse_node_id) childParentIds.push(node.spouse_node_id);

  const children = cache.nodes.filter(
    (n) =>
      n.parent_node_id !== null &&
      childParentIds.includes(n.parent_node_id) &&
      n.node_type === "biological"
  );

  // 5. Get self-answers (where respondent answered about themselves)
  const selfAnswers = cache.answers.filter(
    (a) =>
      a.subject_id === subjectNodeId &&
      a.respondent_id === node.claimed_by &&
      a.is_confirmed &&
      a.answer_text
  );

  // 6. Get what others said about this person
  const aboutThem = cache.answers.filter(
    (a) =>
      a.subject_id === subjectNodeId &&
      a.respondent_id !== node.claimed_by &&
      a.is_confirmed &&
      a.answer_text
  );

  // 7. Assemble the context document
  const generationLabel =
    node.generation === 0
      ? "Patriarch/Matriarch"
      : node.generation === 1
        ? "Child of Grandpa Michael"
        : "Grandchild of Grandpa Michael";

  let context = `=== FAMILY PROFILE: ${node.display_name} ===\n`;
  context += `Position: ${generationLabel}.`;
  if (node.branch) {
    context += ` ${node.branch.charAt(0).toUpperCase() + node.branch.slice(1)}'s branch.`;
  }
  context += `\n`;

  if (parentInfo) context += `${parentInfo}.\n`;
  if (spouseInfo) context += `${spouseInfo}.\n`;
  if (siblings.length > 0) {
    context += `Siblings: ${siblings.map((s) => s.display_name).join(", ")}.\n`;
  }
  if (children.length > 0) {
    context += `Children: ${children.map((c) => c.display_name).join(", ")}.\n`;
  }
  if (node.is_deceased) {
    context += `Note: This person is deceased. Please be respectful.\n`;
  }
  context += `\n`;

  if (selfAnswers.length > 0) {
    context += `--- What ${node.display_name} says about themselves ---\n`;
    for (const sa of selfAnswers) {
      context += `Q: ${sa.question_text}\nA: ${sa.answer_text}\n\n`;
    }
  }

  if (aboutThem.length > 0) {
    context += `--- What the family says about ${node.display_name} ---\n`;
    for (const at of aboutThem) {
      context += `[${at.respondent_name}] was asked: "${at.question_text}"\n`;
      context += `They said: "${at.answer_text}"\n\n`;
    }
  }

  const hasData = selfAnswers.length > 0 || aboutThem.length > 0;

  if (!hasData) {
    context += `(No answers have been collected about ${node.display_name} yet. You can still talk about their position in the family tree but cannot reference personal stories.)\n`;
  }

  console.log(
    "\x1b[32m[TEMP] ✅ Context built:",
    JSON.stringify({
      name: node.display_name,
      selfAnswers: selfAnswers.length,
      aboutThem: aboutThem.length,
      contextLength: context.length,
    }),
    "\x1b[0m"
  );

  return context;
}

/**
 * Build context for multiple subjects from cache.
 */
export function buildMultiContextFromCache(
  cache: FamilyDataCache,
  subjectNodeIds: string[]
): string {
  console.log("\x1b[33m[TEMP] ⚡ Building multi-context for:", subjectNodeIds.length, "subjects\x1b[0m");

  return subjectNodeIds
    .map((id) => buildContextFromCache(cache, id))
    .join("\n\n---\n\n");
}

/**
 * Build family summary context from cache.
 * Used when the prompt is about "everyone" or "the whole family."
 */
export function buildFamilySummaryFromCache(cache: FamilyDataCache): string {
  console.log("\x1b[33m[TEMP] ⚡ Building family summary from cache\x1b[0m");

  const biologicalNodes = cache.nodes.filter((n) => n.node_type === "biological");
  const claimedCount = biologicalNodes.filter((n) => n.is_claimed).length;
  const answeredSubjectIds = new Set(cache.answers.map((a) => a.subject_id));

  let context = `=== THE FAMILY ===\n`;
  context += `Patriarch: the family patriarch.\n`;
  context += `Matriarch: the family matriarch.\n`;
  context += `Family size: ${biologicalNodes.length} members across 3 generations.\n`;
  context += `Members who joined: ${claimedCount}. Members with stories: ${answeredSubjectIds.size}.\n\n`;

  // Heartfelt answers (cap at 15)
  const heartfelt = cache.answers
    .filter((a) => a.question_category === "heartfelt" && a.answer_text)
    .slice(0, 15);

  if (heartfelt.length > 0) {
    context += `--- Heartfelt stories from the family ---\n`;
    for (const h of heartfelt) {
      const subject = cache.nodesById.get(h.subject_id);
      context += `About ${subject?.display_name || "a family member"}: `;
      context += `[${h.respondent_name}] said: "${h.answer_text}"\n\n`;
    }
  }

  // Funny answers (cap at 10)
  const funny = cache.answers
    .filter((a) => a.question_category === "funny" && a.answer_text)
    .slice(0, 10);

  if (funny.length > 0) {
    context += `--- Funny moments ---\n`;
    for (const f of funny) {
      const subject = cache.nodesById.get(f.subject_id);
      context += `About ${subject?.display_name || "a family member"}: `;
      context += `[${f.respondent_name}] said: "${f.answer_text}"\n\n`;
    }
  }

  console.log(
    "\x1b[32m[TEMP] ✅ Family summary built:",
    JSON.stringify({
      members: biologicalNodes.length,
      heartfelt: heartfelt.length,
      funny: funny.length,
      contextLength: context.length,
    }),
    "\x1b[0m"
  );

  return context;
}
