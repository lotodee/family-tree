import { supabaseAdmin } from "@/lib/supabase/admin";

interface SubjectContext {
  name: string;
  contextText: string;
  hasData: boolean;
}

/**
 * Builds a rich text context for one family member.
 * This context is injected into every Gemini prompt about this person.
 */
export async function buildContextForSubject(
  subjectNodeId: string
): Promise<SubjectContext> {
  // 1. Fetch the tree node
  const { data: node } = await supabaseAdmin
    .from("family_tree_nodes")
    .select("*")
    .eq("id", subjectNodeId)
    .single();

  if (!node) {
    return { name: "Unknown", contextText: "", hasData: false };
  }

  // 2. Fetch parent info
  let parentInfo = "";
  if (node.parent_node_id) {
    const { data: parent } = await supabaseAdmin
      .from("family_tree_nodes")
      .select("display_name, gender, spouse_node_id")
      .eq("id", node.parent_node_id)
      .single();

    if (parent) {
      parentInfo = `${node.gender === "female" ? "Daughter" : "Son"} of ${parent.display_name}`;

      // Get other parent (spouse)
      if (parent.spouse_node_id) {
        const { data: otherParent } = await supabaseAdmin
          .from("family_tree_nodes")
          .select("display_name")
          .eq("id", parent.spouse_node_id)
          .single();
        if (otherParent) {
          parentInfo += ` and ${otherParent.display_name}`;
        }
      }
    }
  }

  // 3. Fetch spouse info
  let spouseInfo = "";
  if (node.spouse_node_id) {
    const { data: spouse } = await supabaseAdmin
      .from("family_tree_nodes")
      .select("display_name, is_deceased")
      .eq("id", node.spouse_node_id)
      .single();
    if (spouse) {
      spouseInfo = spouse.is_deceased
        ? `Married to Late ${spouse.display_name}`
        : `Married to ${spouse.display_name}`;
    }
  }

  // 4. Fetch siblings (same parent_node_id, different ID, biological only)
  let siblings: string[] = [];
  if (node.parent_node_id) {
    const { data: siblingNodes } = await supabaseAdmin
      .from("family_tree_nodes")
      .select("display_name")
      .eq("parent_node_id", node.parent_node_id)
      .eq("node_type", "biological")
      .neq("id", subjectNodeId);
    siblings = siblingNodes?.map((s) => s.display_name) || [];
  }

  // 5. Fetch children (nodes where parent_node_id = this node OR parent_node_id = this node's spouse)
  const childQueries = [
    supabaseAdmin
      .from("family_tree_nodes")
      .select("display_name")
      .eq("parent_node_id", subjectNodeId)
      .eq("node_type", "biological"),
  ];
  if (node.spouse_node_id) {
    childQueries.push(
      supabaseAdmin
        .from("family_tree_nodes")
        .select("display_name")
        .eq("parent_node_id", node.spouse_node_id)
        .eq("node_type", "biological")
    );
  }
  const childResults = await Promise.all(childQueries);
  const childNames = new Set<string>();
  childResults.forEach((r) =>
    r.data?.forEach((c) => childNames.add(c.display_name))
  );
  const children = Array.from(childNames);

  // 6. Fetch self-answers (where the person answered about themselves)
  let selfAnswers: { question: string; answer: string; category: string }[] =
    [];
  if (node.claimed_by) {
    const { data } = await supabaseAdmin
      .from("answers")
      .select("answer_text, question:question_id(text, category)")
      .eq("respondent_id", node.claimed_by)
      .eq("subject_id", subjectNodeId)
      .eq("is_confirmed", true)
      .order("created_at", { ascending: true });

    if (data) {
      selfAnswers = (data as any[])
        .filter((a) => a.answer_text && a.question)
        .map((a) => ({
          question: a.question.text,
          answer: a.answer_text,
          category: a.question.category,
        }));
    }
  }

  // 7. Fetch what others said about this person
  const { data: othersAnswers } = await supabaseAdmin
    .from("answers")
    .select(
      "answer_text, respondent:respondent_id(full_name), question:question_id(text, category)"
    )
    .eq("subject_id", subjectNodeId)
    .eq("is_confirmed", true)
    .neq("respondent_id", node.claimed_by || "impossible-id");

  const aboutThem = ((othersAnswers || []) as any[])
    .filter((a) => a.answer_text && a.respondent && a.question)
    .map((a) => ({
      question: a.question.text,
      answer: a.answer_text,
      from: a.respondent.full_name,
      category: a.question.category,
    }));

  // 8. Assemble the context document
  const generationLabel =
    node.generation === 0
      ? "Patriarch/Matriarch"
      : node.generation === 1
        ? "Child of Grandpa Michael"
        : "Grandchild of Grandpa Michael";

  let context = `=== FAMILY PROFILE: ${node.display_name} ===\n`;
  context += `Position: ${generationLabel}. ${node.branch ? `${node.branch.charAt(0).toUpperCase() + node.branch.slice(1)}'s branch.` : ""}\n`;
  if (parentInfo) context += `${parentInfo}.\n`;
  if (spouseInfo) context += `${spouseInfo}.\n`;
  if (siblings.length > 0) context += `Siblings: ${siblings.join(", ")}.\n`;
  if (children.length > 0) context += `Children: ${children.join(", ")}.\n`;
  if (node.is_deceased)
    context += `Note: This person is deceased. Please be respectful.\n`;
  context += `\n`;

  if (selfAnswers.length > 0) {
    context += `--- What ${node.display_name} says about themselves ---\n`;
    for (const sa of selfAnswers) {
      context += `Q: ${sa.question}\nA: ${sa.answer}\n\n`;
    }
  }

  if (aboutThem.length > 0) {
    context += `--- What the family says about ${node.display_name} ---\n`;
    for (const at of aboutThem) {
      context += `[${at.from}] was asked: "${at.question}"\n`;
      context += `They said: "${at.answer}"\n\n`;
    }
  }

  const hasData = selfAnswers.length > 0 || aboutThem.length > 0;

  if (!hasData) {
    context += `(No answers have been collected about ${node.display_name} yet. You can still talk about their position in the family tree but cannot reference personal stories.)\n`;
  }

  return {
    name: node.display_name,
    contextText: context,
    hasData,
  };
}

/**
 * Builds context for multiple subjects (for comparison prompts, group prompts).
 */
export async function buildContextForMultipleSubjects(
  subjectNodeIds: string[]
): Promise<string> {
  const contexts = await Promise.all(
    subjectNodeIds.map((id) => buildContextForSubject(id))
  );

  return contexts.map((c) => c.contextText).join("\n\n---\n\n");
}

/**
 * Builds a summary context for the whole family.
 * Used for broad prompts like "tell us about the family's legacy."
 */
export async function buildFamilySummaryContext(): Promise<string> {
  // Fetch all nodes
  const { data: allNodes } = await supabaseAdmin
    .from("family_tree_nodes")
    .select("id, display_name, generation, branch, is_claimed")
    .eq("node_type", "biological")
    .order("generation", { ascending: true });

  // Fetch all confirmed answers
  const { data: allAnswers } = await supabaseAdmin
    .from("answers")
    .select(
      "answer_text, subject_id, respondent:respondent_id(full_name), question:question_id(text, category)"
    )
    .eq("is_confirmed", true);

  let context = `=== THE ADEMILUYI FAMILY ===\n`;
  context += `Patriarch: Michael Ademiluyi, celebrating his 100th birthday.\n`;
  context += `Matriarch: Racheal Ademiluyi.\n`;
  context += `Family size: ${allNodes?.length || 35} members across 3 generations.\n`;
  context += `Members who shared stories: ${new Set(allAnswers?.map((a) => a.subject_id) || []).size} people.\n\n`;

  // Include a selection of the most heartfelt answers across all family members
  const answers = (allAnswers || []) as any[];
  const heartfelt = answers
    .filter((a) => a.question?.category === "heartfelt" && a.answer_text)
    .slice(0, 15); // Cap at 15 to keep context manageable

  if (heartfelt.length > 0) {
    context += `--- Heartfelt stories from the family ---\n`;
    for (const h of heartfelt) {
      const subjectNode = allNodes?.find((n) => n.id === h.subject_id);
      context += `About ${subjectNode?.display_name || "a family member"}: `;
      context += `[${h.respondent?.full_name}] said: "${h.answer_text}"\n\n`;
    }
  }

  // Include funny stories
  const funny = answers
    .filter((a) => a.question?.category === "funny" && a.answer_text)
    .slice(0, 10);

  if (funny.length > 0) {
    context += `--- Funny moments ---\n`;
    for (const f of funny) {
      const subjectNode = allNodes?.find((n) => n.id === f.subject_id);
      context += `About ${subjectNode?.display_name || "a family member"}: `;
      context += `[${f.respondent?.full_name}] said: "${f.answer_text}"\n\n`;
    }
  }

  return context;
}
