import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { celebrationId, title, body, treeNodeId } = await request.json();

    if (!celebrationId) {
      return NextResponse.json({ error: "celebrationId is required" }, { status: 400 });
    }
    if (!body?.trim()) {
      return NextResponse.json({ error: "Letter body cannot be empty" }, { status: 400 });
    }
    if (body.trim().length < 10) {
      return NextResponse.json({ error: "Letter must be at least 10 characters" }, { status: 400 });
    }
    if (body.trim().length > 10000) {
      return NextResponse.json({ error: "Letter cannot exceed 10,000 characters" }, { status: 400 });
    }

    // Verify membership
    const { data: membership } = await supabase
      .from("memberships")
      .select("id, tree_node_id")
      .eq("user_id", user.id)
      .eq("celebration_id", celebrationId)
      .single();

    if (!membership) {
      return NextResponse.json({ error: "Not a member of this celebration" }, { status: 403 });
    }

    const { data: letter, error } = await supabaseAdmin
      .from("letters")
      .insert({
        celebration_id: celebrationId,
        author_id: user.id,
        membership_id: membership.id,
        tree_node_id: treeNodeId || membership.tree_node_id || null,
        title: title?.trim() || null,
        body: body.trim(),
      })
      .select()
      .single();

    if (error) {
      console.error("Create letter error:", error);
      return NextResponse.json({ error: "Failed to save letter" }, { status: 500 });
    }

    return NextResponse.json({ letter });
  } catch (error) {
    console.error("POST /api/letters:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const celebrationId = new URL(request.url).searchParams.get("celebrationId");
    if (!celebrationId) {
      return NextResponse.json({ error: "celebrationId required" }, { status: 400 });
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

    const { data: letters, error } = await supabaseAdmin
      .from("letters")
      .select("*")
      .eq("celebration_id", celebrationId)
      .eq("author_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch letters error:", error);
      return NextResponse.json({ error: "Failed to fetch letters" }, { status: 500 });
    }

    return NextResponse.json({ letters: letters || [] });
  } catch (error) {
    console.error("GET /api/letters:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const letterId = new URL(request.url).searchParams.get("id");
    if (!letterId) {
      return NextResponse.json({ error: "Letter id required" }, { status: 400 });
    }

    const { data: letter } = await supabaseAdmin
      .from("letters")
      .select("id, author_id")
      .eq("id", letterId)
      .single();

    if (!letter) {
      return NextResponse.json({ error: "Letter not found" }, { status: 404 });
    }
    if (letter.author_id !== user.id) {
      return NextResponse.json({ error: "You can only delete your own letters" }, { status: 403 });
    }

    const { error } = await supabaseAdmin
      .from("letters")
      .delete()
      .eq("id", letterId);

    if (error) {
      return NextResponse.json({ error: "Failed to delete letter" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/letters:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}
