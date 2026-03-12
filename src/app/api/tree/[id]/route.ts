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

    const { data: existing } = await supabaseAdmin
      .from("family_tree_nodes")
      .select("celebration_id")
      .eq("id", id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { data: membership } = await supabase
      .from("memberships")
      .select("can_add_to_tree")
      .eq("user_id", user.id)
      .eq("celebration_id", existing.celebration_id)
      .single();

    if (!membership?.can_add_to_tree) {
      return NextResponse.json({ error: "No permission" }, { status: 403 });
    }

    const updates: Record<string, unknown> = {};
    if (body.displayName !== undefined)
      updates.display_name = body.displayName.trim();
    if (body.fullName !== undefined)
      updates.full_name = body.fullName?.trim() || null;
    if (body.gender !== undefined) updates.gender = body.gender;
    if (body.isDeceased !== undefined) updates.is_deceased = body.isDeceased;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
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
  } catch (error) {
    console.error("PUT /api/tree/[id]:", error);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
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

    const { data: node } = await supabaseAdmin
      .from("family_tree_nodes")
      .select("celebration_id, spouse_node_id")
      .eq("id", id)
      .single();

    if (!node) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { data: membership } = await supabase
      .from("memberships")
      .select("can_add_to_tree")
      .eq("user_id", user.id)
      .eq("celebration_id", node.celebration_id)
      .single();

    if (!membership?.can_add_to_tree) {
      return NextResponse.json({ error: "No permission" }, { status: 403 });
    }

    // Unlink spouse cached field
    if (node.spouse_node_id) {
      await supabaseAdmin
        .from("family_tree_nodes")
        .update({ spouse_node_id: null })
        .eq("id", node.spouse_node_id);
    }

    // Also unlink any nodes referencing this as spouse
    await supabaseAdmin
      .from("family_tree_nodes")
      .update({ spouse_node_id: null })
      .eq("spouse_node_id", id);

    // Relationships are auto-deleted via ON DELETE CASCADE
    // Children's parent_node_id is set to NULL via ON DELETE SET NULL

    const { error } = await supabaseAdmin
      .from("family_tree_nodes")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: "Failed to remove" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/tree/[id]:", error);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
