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

    const celebrationId = new URL(request.url).searchParams.get(
      "celebrationId"
    );
    if (!celebrationId) {
      return NextResponse.json(
        { error: "celebrationId required" },
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
      return NextResponse.json({ error: "Not a member" }, { status: 403 });
    }

    // Fetch nodes and relationships in parallel
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
      nodes: nodesRes.data || [],
      relationships: relsRes.data || [],
    });
  } catch (error) {
    console.error("GET /api/tree:", error);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
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

    const { celebrationId, displayName, gender } = await request.json();

    if (!celebrationId || !displayName?.trim()) {
      return NextResponse.json(
        { error: "celebrationId and displayName required" },
        { status: 400 }
      );
    }

    const { data: membership } = await supabase
      .from("memberships")
      .select("can_add_to_tree")
      .eq("user_id", user.id)
      .eq("celebration_id", celebrationId)
      .single();

    if (!membership?.can_add_to_tree) {
      return NextResponse.json({ error: "No permission" }, { status: 403 });
    }

    const { data: node, error } = await supabaseAdmin
      .from("family_tree_nodes")
      .insert({
        celebration_id: celebrationId,
        display_name: displayName.trim(),
        full_name: displayName.trim(),
        gender: gender || "unknown",
        generation: 0,
        node_type: "biological",
      })
      .select()
      .single();

    if (error) {
      console.error("Create node error:", error);
      return NextResponse.json(
        { error: "Failed to add person" },
        { status: 500 }
      );
    }

    return NextResponse.json({ node });
  } catch (error) {
    console.error("POST /api/tree:", error);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
