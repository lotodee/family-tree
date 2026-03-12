import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { displayName, fullName, gender, isDeceased, branch } = body;

    // Fetch the node to get its celebration_id
    const { data: existingNode } = await supabaseAdmin
      .from("family_tree_nodes")
      .select("celebration_id")
      .eq("id", id)
      .single();

    if (!existingNode) {
      return NextResponse.json({ error: "Node not found" }, { status: 404 });
    }

    // Verify membership with permission
    const { data: membership } = await supabase
      .from("memberships")
      .select("can_add_to_tree")
      .eq("user_id", user.id)
      .eq("celebration_id", existingNode.celebration_id)
      .single();

    if (!membership?.can_add_to_tree) {
      return NextResponse.json(
        { error: "No permission to edit the tree" },
        { status: 403 }
      );
    }

    // Build update object — only include fields that were sent
    const updates: Record<string, unknown> = {};
    if (displayName !== undefined) updates.display_name = displayName.trim();
    if (fullName !== undefined) updates.full_name = fullName?.trim() || null;
    if (gender !== undefined) updates.gender = gender;
    if (isDeceased !== undefined) updates.is_deceased = isDeceased;
    if (branch !== undefined) updates.branch = branch;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    const { data: node, error } = await supabaseAdmin
      .from("family_tree_nodes")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: "Failed to update" }, { status: 500 });
    }

    return NextResponse.json({ node });
  } catch {
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch node
    const { data: node } = await supabaseAdmin
      .from("family_tree_nodes")
      .select("celebration_id, spouse_node_id")
      .eq("id", id)
      .single();

    if (!node) {
      return NextResponse.json({ error: "Node not found" }, { status: 404 });
    }

    // Verify permission
    const { data: membership } = await supabase
      .from("memberships")
      .select("can_add_to_tree")
      .eq("user_id", user.id)
      .eq("celebration_id", node.celebration_id)
      .single();

    if (!membership?.can_add_to_tree) {
      return NextResponse.json({ error: "No permission" }, { status: 403 });
    }

    // If this node has a spouse, unlink the spouse's reference to this node
    if (node.spouse_node_id) {
      await supabaseAdmin
        .from("family_tree_nodes")
        .update({ spouse_node_id: null })
        .eq("id", node.spouse_node_id);
    }

    // Also unlink any nodes that reference this node as their spouse
    await supabaseAdmin
      .from("family_tree_nodes")
      .update({ spouse_node_id: null })
      .eq("spouse_node_id", id);

    // Delete the node
    // Children's parent_node_id will be set to NULL (ON DELETE SET NULL)
    const { error } = await supabaseAdmin
      .from("family_tree_nodes")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json(
        { error: "Failed to remove" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
