import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * POST /api/relationships/cleanup
 *
 * Deletes ALL relationships for a celebration and resets cached fields.
 * The user will need to re-add connections manually.
 *
 * THIS IS A DESTRUCTIVE OPERATION. Only the celebration owner can do it.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { celebrationId } = await request.json();
    if (!celebrationId) {
      return NextResponse.json(
        { error: "celebrationId required" },
        { status: 400 }
      );
    }

    // Verify owner
    const { data: membership } = await supabase
      .from("memberships")
      .select("role")
      .eq("user_id", user.id)
      .eq("celebration_id", celebrationId)
      .single();

    if (!membership || membership.role !== "owner") {
      return NextResponse.json(
        { error: "Only the owner can cleanup relationships" },
        { status: 403 }
      );
    }

    // Delete ALL relationships for this celebration
    const { error: deleteError } = await supabaseAdmin
      .from("family_relationships")
      .delete()
      .eq("celebration_id", celebrationId);

    if (deleteError) {
      console.error("Cleanup delete error:", deleteError);
      return NextResponse.json({ error: "Failed to cleanup" }, { status: 500 });
    }

    // Reset cached fields on all nodes
    const { error: resetError } = await supabaseAdmin
      .from("family_tree_nodes")
      .update({ parent_node_id: null, spouse_node_id: null })
      .eq("celebration_id", celebrationId);

    if (resetError) {
      console.error("Reset cached fields error:", resetError);
    }

    // Return clean state
    const [nodesRes, relsRes] = await Promise.all([
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
      message:
        "All relationships deleted. Cached fields reset. You need to re-add connections manually.",
      nodes: nodesRes.data || [],
      relationships: relsRes.data || [],
    });
  } catch (error) {
    console.error("POST /api/relationships/cleanup:", error);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
