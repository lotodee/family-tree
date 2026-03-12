import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  getInverse,
  resolveParentChild,
  resolveSpouse,
} from "@/lib/utils/relationships";
import type { RelationshipType, Gender } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      celebrationId,
      fromNodeId,
      toNodeId,
      relationshipType,
      newPersonName,
      newPersonGender,
    } = await request.json();

    if (!celebrationId || !fromNodeId || !relationshipType) {
      return NextResponse.json(
        { error: "celebrationId, fromNodeId, and relationshipType are required" },
        { status: 400 }
      );
    }

    if (!toNodeId && !newPersonName?.trim()) {
      return NextResponse.json(
        { error: "Provide either toNodeId or newPersonName" },
        { status: 400 }
      );
    }

    // Verify permission
    const { data: membership } = await supabase
      .from("memberships")
      .select("can_add_to_tree")
      .eq("user_id", user.id)
      .eq("celebration_id", celebrationId)
      .single();

    if (!membership?.can_add_to_tree) {
      return NextResponse.json({ error: "No permission" }, { status: 403 });
    }

    // Fetch the "from" node
    const { data: fromNode } = await supabaseAdmin
      .from("family_tree_nodes")
      .select("*")
      .eq("id", fromNodeId)
      .eq("celebration_id", celebrationId)
      .single();

    if (!fromNode) {
      return NextResponse.json(
        { error: "Selected person not found" },
        { status: 404 }
      );
    }

    // Determine the target node — existing or new
    let targetNodeId = toNodeId;
    let createdNode = null;

    if (!toNodeId) {
      const { data: newNode, error: createErr } = await supabaseAdmin
        .from("family_tree_nodes")
        .insert({
          celebration_id: celebrationId,
          display_name: newPersonName.trim(),
          full_name: newPersonName.trim(),
          gender: newPersonGender || "unknown",
          generation: 0,
          node_type: "biological",
        })
        .select()
        .single();

      if (createErr || !newNode) {
        console.error("Create person error:", createErr);
        return NextResponse.json(
          { error: "Failed to create person" },
          { status: 500 }
        );
      }

      targetNodeId = newNode.id;
      createdNode = newNode;
    }

    // Fetch the target node (for gender)
    const { data: toNode } = await supabaseAdmin
      .from("family_tree_nodes")
      .select("*")
      .eq("id", targetNodeId)
      .single();

    if (!toNode) {
      return NextResponse.json(
        { error: "Target person not found" },
        { status: 404 }
      );
    }

    // Check for existing relationship between these two
    const { data: existingRel } = await supabaseAdmin
      .from("family_relationships")
      .select("id")
      .eq("from_node_id", fromNodeId)
      .eq("to_node_id", targetNodeId)
      .eq("relationship_type", relationshipType as string)
      .maybeSingle();

    if (existingRel) {
      // Clean up if we created a new node
      if (createdNode) {
        await supabaseAdmin
          .from("family_tree_nodes")
          .delete()
          .eq("id", createdNode.id);
      }
      return NextResponse.json(
        { error: "This connection already exists" },
        { status: 409 }
      );
    }

    // Compute the inverse
    // The relationship reads: "[toNode] is [fromNode]'s [type]"
    // The inverse reads: "[fromNode] is [toNode]'s [inverseType]"
    const forwardType = relationshipType as RelationshipType;
    const inverseType = getInverse(forwardType, fromNode.gender as Gender);

    // Create both relationship rows
    const { error: relError } = await supabaseAdmin
      .from("family_relationships")
      .insert([
        {
          celebration_id: celebrationId,
          from_node_id: fromNodeId,
          to_node_id: targetNodeId,
          relationship_type: forwardType,
        },
        {
          celebration_id: celebrationId,
          from_node_id: targetNodeId,
          to_node_id: fromNodeId,
          relationship_type: inverseType,
        },
      ]);

    if (relError) {
      console.error("Create relationships error:", relError);
      if (createdNode) {
        await supabaseAdmin
          .from("family_tree_nodes")
          .delete()
          .eq("id", createdNode.id);
      }
      return NextResponse.json(
        { error: "Failed to create connection" },
        { status: 500 }
      );
    }

    // Sync cached fields

    // Parent-child: sync parent_node_id
    const pc = resolveParentChild(fromNodeId, targetNodeId, forwardType);
    if (pc) {
      await supabaseAdmin
        .from("family_tree_nodes")
        .update({ parent_node_id: pc.parentId })
        .eq("id", pc.childId);
    }

    // Spouse: sync spouse_node_id bidirectionally + set node_type
    const sp = resolveSpouse(fromNodeId, targetNodeId, forwardType);
    if (sp) {
      await Promise.all([
        supabaseAdmin
          .from("family_tree_nodes")
          .update({ spouse_node_id: sp.spouseB })
          .eq("id", sp.spouseA),
        supabaseAdmin
          .from("family_tree_nodes")
          .update({ spouse_node_id: sp.spouseA })
          .eq("id", sp.spouseB),
      ]);
      // Mark the new person as a spouse type if they were just created
      if (createdNode) {
        await supabaseAdmin
          .from("family_tree_nodes")
          .update({ node_type: "spouse" })
          .eq("id", createdNode.id);
      }
    }

    // Return the full updated state
    const [updatedNodes, updatedRels] = await Promise.all([
      supabaseAdmin
        .from("family_tree_nodes")
        .select("*")
        .eq("celebration_id", celebrationId)
        .order("created_at"),
      supabaseAdmin
        .from("family_relationships")
        .select("*")
        .eq("celebration_id", celebrationId)
        .order("created_at"),
    ]);

    return NextResponse.json({
      success: true,
      createdNode,
      nodes: updatedNodes.data || [],
      relationships: updatedRels.data || [],
    });
  } catch (error) {
    console.error("POST /api/relationships:", error);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const relId = url.searchParams.get("id");
    if (!relId) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }

    const { data: rel } = await supabaseAdmin
      .from("family_relationships")
      .select("*")
      .eq("id", relId)
      .single();

    if (!rel) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { data: membership } = await supabase
      .from("memberships")
      .select("can_add_to_tree")
      .eq("user_id", user.id)
      .eq("celebration_id", rel.celebration_id)
      .single();

    if (!membership?.can_add_to_tree) {
      return NextResponse.json({ error: "No permission" }, { status: 403 });
    }

    // Fetch from_node gender for inverse computation
    const { data: fromNode } = await supabaseAdmin
      .from("family_tree_nodes")
      .select("gender")
      .eq("id", rel.from_node_id)
      .single();

    const inverseType = getInverse(
      rel.relationship_type as RelationshipType,
      (fromNode?.gender || "unknown") as Gender
    );

    // Delete forward relationship
    await supabaseAdmin.from("family_relationships").delete().eq("id", relId);

    // Delete inverse relationship
    await supabaseAdmin
      .from("family_relationships")
      .delete()
      .eq("from_node_id", rel.to_node_id)
      .eq("to_node_id", rel.from_node_id)
      .eq("relationship_type", inverseType);

    // Unsync cached fields
    const pc = resolveParentChild(
      rel.from_node_id,
      rel.to_node_id,
      rel.relationship_type as RelationshipType
    );
    if (pc) {
      await supabaseAdmin
        .from("family_tree_nodes")
        .update({ parent_node_id: null })
        .eq("id", pc.childId);
    }

    const sp = resolveSpouse(
      rel.from_node_id,
      rel.to_node_id,
      rel.relationship_type as RelationshipType
    );
    if (sp) {
      await Promise.all([
        supabaseAdmin
          .from("family_tree_nodes")
          .update({ spouse_node_id: null })
          .eq("id", sp.spouseA),
        supabaseAdmin
          .from("family_tree_nodes")
          .update({ spouse_node_id: null })
          .eq("id", sp.spouseB),
      ]);
    }

    // Return updated state
    const cId = rel.celebration_id;
    const [updatedNodes, updatedRels] = await Promise.all([
      supabaseAdmin
        .from("family_tree_nodes")
        .select("*")
        .eq("celebration_id", cId)
        .order("created_at"),
      supabaseAdmin
        .from("family_relationships")
        .select("*")
        .eq("celebration_id", cId)
        .order("created_at"),
    ]);

    return NextResponse.json({
      success: true,
      nodes: updatedNodes.data || [],
      relationships: updatedRels.data || [],
    });
  } catch (error) {
    console.error("DELETE /api/relationships:", error);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
