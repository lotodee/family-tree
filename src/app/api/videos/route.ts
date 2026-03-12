import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const celebrationId = new URL(request.url).searchParams.get("celebrationId");
    if (!celebrationId) {
      return NextResponse.json({ error: "celebrationId is required" }, { status: 400 });
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

    // Fetch this user's videos for this celebration
    const { data: videos, error } = await supabaseAdmin
      .from("videos")
      .select("*")
      .eq("celebration_id", celebrationId)
      .eq("uploader_id", user.id)
      .eq("is_visible", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch videos error:", error);
      return NextResponse.json({ error: "Failed to fetch videos" }, { status: 500 });
    }

    return NextResponse.json({ videos: videos || [] });
  } catch (error) {
    console.error("GET /api/videos:", error);
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

    const videoId = new URL(request.url).searchParams.get("id");
    if (!videoId) {
      return NextResponse.json({ error: "Video id is required" }, { status: 400 });
    }

    // Fetch the video and verify ownership
    const { data: video } = await supabaseAdmin
      .from("videos")
      .select("id, uploader_id, file_path")
      .eq("id", videoId)
      .single();

    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    if (video.uploader_id !== user.id) {
      return NextResponse.json({ error: "You can only delete your own videos" }, { status: 403 });
    }

    // Delete from Supabase Storage
    const { error: storageError } = await supabaseAdmin.storage
      .from("videos")
      .remove([video.file_path]);

    if (storageError) {
      console.error("Storage delete error:", storageError);
      // Continue to delete the DB row anyway — orphaned storage files are better than orphaned DB rows
    }

    // Delete from database
    const { error: dbError } = await supabaseAdmin
      .from("videos")
      .delete()
      .eq("id", videoId);

    if (dbError) {
      console.error("DB delete error:", dbError);
      return NextResponse.json({ error: "Failed to delete video" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/videos:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}
