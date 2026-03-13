import { supabaseAdmin } from "@/lib/supabase/admin";
import type { RelationshipType, Gender } from "@/types";

/**
 * After a new relationship is created, this function examines ALL existing
 * relationships for the celebration and infers any transitive relationships
 * that logically follow.
 *
 * It runs in a loop: apply rules → check for new inferences → repeat
 * until no new relationships are found (fixed-point).
 *
 * Example:
 *   Existing: A is B's son
 *   New:      C is A's sister
 *   Inferred: C is B's daughter, B is C's father
 *
 * Call this AFTER the explicit relationship (forward + inverse) has been
 * inserted into the database.
 */
export async function inferRelationships(celebrationId: string): Promise<void> {
  // Fetch all nodes and relationships for this celebration
  const { data: nodes } = await supabaseAdmin
    .from("family_tree_nodes")
    .select("id, gender")
    .eq("celebration_id", celebrationId);

  if (!nodes || nodes.length === 0) return;

  const genderMap = new Map<string, Gender>(
    nodes.map((n) => [n.id, (n.gender || "unknown") as Gender])
  );

  let maxIterations = 10; // Safety limit to prevent infinite loops
  let newRelationshipsCreated = true;

  while (newRelationshipsCreated && maxIterations > 0) {
    maxIterations--;
    newRelationshipsCreated = false;

    // Fetch current relationships
    const { data: rels } = await supabaseAdmin
      .from("family_relationships")
      .select("from_node_id, to_node_id, relationship_type")
      .eq("celebration_id", celebrationId);

    if (!rels) break;

    // Build a lookup: fromId → [{ toId, type }]
    const relMap = new Map<string, { toId: string; type: string }[]>();
    for (const r of rels) {
      const existing = relMap.get(r.from_node_id) || [];
      existing.push({ toId: r.to_node_id, type: r.relationship_type });
      relMap.set(r.from_node_id, existing);
    }

    // Build a set of existing relationship keys for fast duplicate checking
    const existingKeys = new Set<string>(
      rels.map((r) => `${r.from_node_id}|${r.to_node_id}|${r.relationship_type}`)
    );

    // Collect new relationships to create
    const toCreate: { from: string; to: string; type: RelationshipType }[] = [];

    function addIfNew(from: string, to: string, type: RelationshipType) {
      if (from === to) return; // no self-relationships
      const key = `${from}|${to}|${type}`;
      if (existingKeys.has(key)) return; // already exists
      // Check if we already queued this one
      if (toCreate.some((r) => r.from === from && r.to === to && r.type === type)) return;
      toCreate.push({ from, to, type });
    }

    function getRelationsFrom(nodeId: string): { toId: string; type: string }[] {
      return relMap.get(nodeId) || [];
    }

    function isChild(type: string): boolean {
      return type === "son" || type === "daughter";
    }

    function isParent(type: string): boolean {
      return type === "father" || type === "mother";
    }

    function isSibling(type: string): boolean {
      return type === "brother" || type === "sister";
    }

    function isSpouse(type: string): boolean {
      return type === "wife" || type === "husband";
    }

    function childTypeForGender(gender: Gender): RelationshipType {
      return gender === "female" ? "daughter" : "son";
    }

    function parentTypeForGender(gender: Gender): RelationshipType {
      return gender === "female" ? "mother" : "father";
    }

    function siblingTypeForGender(gender: Gender): RelationshipType {
      return gender === "female" ? "sister" : "brother";
    }

    function uncleAuntTypeForGender(gender: Gender): RelationshipType {
      return gender === "female" ? "aunt" : "uncle";
    }

    function nephewNieceTypeForGender(gender: Gender): RelationshipType {
      return gender === "female" ? "niece" : "nephew";
    }

    // ── RULE 1: Sibling inherits parentage ────────────────────────
    // If X is Y's child, and Z is X's sibling → Z is also Y's child
    for (const r of rels) {
      if (!isChild(r.relationship_type)) continue;
      // Convention: from=A, to=B, type=son → "B is A's son" → A is parent, B is child
      const parent = r.from_node_id;    // A (the parent)
      const child = r.to_node_id;       // B (the child)

      // Find child's siblings
      const childRels = getRelationsFrom(child);
      for (const cr of childRels) {
        if (!isSibling(cr.type)) continue;
        const sibling = cr.toId;        // C (child's sibling)
        const siblingGender = genderMap.get(sibling) || "unknown";
        const parentGender = genderMap.get(parent) || "unknown";

        // Sibling is also parent's child: from=parent, to=sibling, type=son/daughter
        addIfNew(parent, sibling, childTypeForGender(siblingGender));
        // Parent is also sibling's parent: from=sibling, to=parent, type=father/mother
        addIfNew(sibling, parent, parentTypeForGender(parentGender));
      }
    }

    // ── RULE 2: Parent's sibling becomes uncle/aunt ───────────────
    // If X is Y's parent, and Z is X's sibling → Z is Y's uncle/aunt
    for (const r of rels) {
      if (!isParent(r.relationship_type)) continue;
      // Convention: from=B, to=A, type=father → "A is B's father" → A is parent, B is child
      const child = r.from_node_id;     // B (the child — they're saying "A is my father")
      const parent = r.to_node_id;      // A (the parent)

      // Find parent's siblings
      const parentRels = getRelationsFrom(parent);
      for (const pr of parentRels) {
        if (!isSibling(pr.type)) continue;
        const parentSibling = pr.toId;  // D (parent's sibling)
        const psGender = genderMap.get(parentSibling) || "unknown";
        const childGender = genderMap.get(child) || "unknown";

        // parentSibling is child's uncle/aunt: from=child, to=parentSibling, type=uncle/aunt
        addIfNew(child, parentSibling, uncleAuntTypeForGender(psGender));
        // child is parentSibling's nephew/niece: from=parentSibling, to=child, type=nephew/niece
        addIfNew(parentSibling, child, nephewNieceTypeForGender(childGender));
      }
    }

    // ── RULE 3: Spouse shares children ────────────────────────────
    // If X is Y's spouse, and Z is X's child → Z is also Y's child
    for (const r of rels) {
      if (!isSpouse(r.relationship_type)) continue;
      // r says: from_node's spouse is to_node
      const person = r.from_node_id;    // X
      const spouse = r.to_node_id;      // Y

      // Find person's children
      const personRels = getRelationsFrom(person);
      for (const pr of personRels) {
        if (pr.type !== "son" && pr.type !== "daughter") continue;
        // pr says: person has a child
        // Wait — the direction matters. If from=person, to=child, type="son"
        // that means "child is person's son" → person is looking at child as their son
        // So the child is pr.toId
        const childId = pr.toId;
        const spouseGender = genderMap.get(spouse) || "unknown";

        // Actually let's be more precise about the direction:
        // The existing rel says: from=X, to=childId, type="son"
        // This means "X says childId is their son" → X looks at child
        // So spouse (Y) should also look at child the same way:
        addIfNew(spouse, childId, pr.type as RelationshipType);
        // And child should look at spouse as a parent:
        addIfNew(childId, spouse, parentTypeForGender(spouseGender));
      }
    }

    // ── RULE 4: Siblings' children are cousins ────────────────────
    // If X and Y are siblings, X has child A, Y has child B → A and B are cousins
    for (const r of rels) {
      if (!isSibling(r.relationship_type)) continue;
      const siblingA = r.from_node_id;
      const siblingB = r.to_node_id;

      const aRels = getRelationsFrom(siblingA);
      const bRels = getRelationsFrom(siblingB);

      const aChildren = aRels
        .filter((ar) => ar.type === "son" || ar.type === "daughter")
        .map((ar) => ar.toId);

      const bChildren = bRels
        .filter((br) => br.type === "son" || br.type === "daughter")
        .map((br) => br.toId);

      for (const ac of aChildren) {
        for (const bc of bChildren) {
          if (ac === bc) continue; // same person
          addIfNew(ac, bc, "cousin");
          addIfNew(bc, ac, "cousin");
        }
      }
    }

    // ── RULE 5: Sibling's child becomes nephew/niece ──────────────
    // If X is Y's sibling, and Z is Y's child → Z is X's nephew/niece
    for (const r of rels) {
      if (!isSibling(r.relationship_type)) continue;
      const personA = r.from_node_id;
      const personB = r.to_node_id;     // personA's sibling

      // Find personB's children (from=personB, to=child, type=son/daughter)
      const bRels = getRelationsFrom(personB);
      for (const br of bRels) {
        if (br.type !== "son" && br.type !== "daughter") continue;
        const childOfB = br.toId;
        const childGender = genderMap.get(childOfB) || "unknown";
        const personAGender = genderMap.get(personA) || "unknown";

        // personA is childOfB's uncle/aunt: from=childOfB, to=personA, type=uncle/aunt
        addIfNew(childOfB, personA, uncleAuntTypeForGender(personAGender));
        // childOfB is personA's nephew/niece: from=personA, to=childOfB, type=nephew/niece
        addIfNew(personA, childOfB, nephewNieceTypeForGender(childGender));
      }
    }

    // ── RULE 6: Children of the same parent are siblings ──────────
    // If A is X's child and B is X's child, and A ≠ B → A and B are siblings
    // (This catches cases where two children are added to the same parent
    //  but never explicitly marked as siblings of each other)
    // Build parent→children map from BOTH directions
    const parentToChildren = new Map<string, Set<string>>();
    for (const r of rels) {
      // Direction 1: from=child, to=parent, type=father/mother
      if (r.relationship_type === "father" || r.relationship_type === "mother") {
        const child = r.from_node_id;
        const parent = r.to_node_id;
        const set = parentToChildren.get(parent) || new Set();
        set.add(child);
        parentToChildren.set(parent, set);
      }
      // Direction 2: from=parent, to=child, type=son/daughter
      if (r.relationship_type === "son" || r.relationship_type === "daughter") {
        const parent = r.from_node_id;
        const child = r.to_node_id;
        const set = parentToChildren.get(parent) || new Set();
        set.add(child);
        parentToChildren.set(parent, set);
      }
    }

    for (const [, childrenSet] of parentToChildren) {
      const children = Array.from(childrenSet);
      for (let i = 0; i < children.length; i++) {
        for (let j = i + 1; j < children.length; j++) {
          const a = children[i];
          const b = children[j];
          const aGender = genderMap.get(a) || "unknown";
          const bGender = genderMap.get(b) || "unknown";

          addIfNew(a, b, siblingTypeForGender(aGender));
          addIfNew(b, a, siblingTypeForGender(bGender));
        }
      }
    }

    // ── Batch insert all new relationships ────────────────────────
    if (toCreate.length > 0) {
      const rows = toCreate.map((r) => ({
        celebration_id: celebrationId,
        from_node_id: r.from,
        to_node_id: r.to,
        relationship_type: r.type,
      }));

      // Use upsert to avoid duplicate key errors if any race condition
      const { error } = await supabaseAdmin
        .from("family_relationships")
        .upsert(rows, {
          onConflict: "from_node_id,to_node_id,relationship_type",
          ignoreDuplicates: true,
        });

      if (error) {
        console.error("Inference insert error:", error);
        break;
      }

      newRelationshipsCreated = true;

      // Sync cached fields (parent_node_id, spouse_node_id) for newly inferred relationships
      await syncCachedFields(celebrationId);
    }
  }
}

/**
 * Re-syncs parent_node_id and spouse_node_id on family_tree_nodes
 * based on the current state of family_relationships.
 *
 * Called after inference to ensure cached fields are up to date.
 */
async function syncCachedFields(celebrationId: string): Promise<void> {
  const { data: rels } = await supabaseAdmin
    .from("family_relationships")
    .select("from_node_id, to_node_id, relationship_type")
    .eq("celebration_id", celebrationId);

  if (!rels) return;

  // Find parent-child relationships
  // Our convention: from=Michael, to=Kemi, type="daughter" → Kemi is Michael's daughter
  // So Kemi's parent_node_id should be Michael (from_node_id)
  // Also: from=Kemi, to=Michael, type="father" → Michael is Kemi's father
  // So Kemi's parent_node_id should be Michael (to_node_id)
  //
  // Use the "father"/"mother" direction: from=child, to=parent
  // from_node says "to_node is my father/mother"
  // So from_node's parent_node_id = to_node

  for (const r of rels) {
    if (r.relationship_type === "father" || r.relationship_type === "mother") {
      // from_node's parent is to_node
      await supabaseAdmin
        .from("family_tree_nodes")
        .update({ parent_node_id: r.to_node_id })
        .eq("id", r.from_node_id)
        .eq("celebration_id", celebrationId);
    }

    if (r.relationship_type === "wife" || r.relationship_type === "husband") {
      // Bidirectional spouse link
      await supabaseAdmin
        .from("family_tree_nodes")
        .update({ spouse_node_id: r.to_node_id })
        .eq("id", r.from_node_id)
        .eq("celebration_id", celebrationId);
    }
  }
}
