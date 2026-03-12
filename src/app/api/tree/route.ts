import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const celebrationId = searchParams.get("celebrationId");

    if (!celebrationId) {
      return NextResponse.json(
        { error: "celebrationId is required" },
        { status: 400 }
      );
    }

    // Verify membership
    const { data: membership } = await supabase
      .from("memberships")
      .select("id")
      .eq("user_id", user.id)
      .eq("celebration_id", celebrationId)
      .single();

    if (!membership) {
      return NextResponse.json(
        { error: "Not a member of this celebration" },
        { status: 403 }
      );
    }

    // Fetch all nodes for this celebration
    const { data: nodes, error } = await supabaseAdmin
      .from("family_tree_nodes")
      .select("*")
      .eq("celebration_id", celebrationId)
      .order("generation", { ascending: true })
      .order("display_name", { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch tree" },
        { status: 500 }
      );
    }

    return NextResponse.json({ nodes: nodes || [] });
  } catch {
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      celebrationId,
      displayName,
      fullName,
      gender,
      generation,
      parentNodeId,
      spouseNodeId,
      branch,
      nodeType,
      isDeceased,
    } = body;

    // Validate required fields
    if (
      !celebrationId ||
      !displayName ||
      generation === undefined ||
      generation === null
    ) {
      return NextResponse.json(
        { error: "celebrationId, displayName, and generation are required" },
        { status: 400 }
      );
    }

    // Verify membership with can_add_to_tree permission
    const { data: membership } = await supabase
      .from("memberships")
      .select("id, can_add_to_tree")
      .eq("user_id", user.id)
      .eq("celebration_id", celebrationId)
      .single();

    if (!membership) {
      return NextResponse.json({ error: "Not a member" }, { status: 403 });
    }
    if (!membership.can_add_to_tree) {
      return NextResponse.json(
        { error: "You don't have permission to edit the tree" },
        { status: 403 }
      );
    }

    // Create the node
    const { data: node, error } = await supabaseAdmin
      .from("family_tree_nodes")
      .insert({
        celebration_id: celebrationId,
        display_name: displayName.trim(),
        full_name: fullName?.trim() || null,
        gender: gender || "unknown",
        generation,
        parent_node_id: parentNodeId || null,
        spouse_node_id: spouseNodeId || null,
        branch: branch || null,
        node_type: nodeType || "biological",
        is_deceased: isDeceased || false,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to add family member" },
        { status: 500 }
      );
    }

    // If this is a spouse, link the partner back to this node (bidirectional)
    if (spouseNodeId) {
      await supabaseAdmin
        .from("family_tree_nodes")
        .update({ spouse_node_id: node.id })
        .eq("id", spouseNodeId);
    }

    return NextResponse.json({ node });
  } catch {
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
