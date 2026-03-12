import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const ALLOWED_BASE_TYPES = ["video/webm", "video/mp4", "video/quicktime"];

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const celebrationId = formData.get("celebrationId") as string | null;
    const durationSecsRaw = formData.get("durationSecs") as string | null;
    const title = formData.get("title") as string | null;
    const treeNodeId = formData.get("treeNodeId") as string | null;

    // ── Validate inputs ──────────────────────────────────
    if (!file) {
      return NextResponse.json({ error: "No video file provided" }, { status: 400 });
    }
    if (!celebrationId) {
      return NextResponse.json({ error: "celebrationId is required" }, { status: 400 });
    }
    const durationSecs = parseInt(durationSecsRaw || "0", 10);
    if (isNaN(durationSecs) || durationSecs <= 0) {
      return NextResponse.json({ error: "Invalid duration" }, { status: 400 });
    }

    // Validate file type — strip codec info (e.g., "video/webm;codecs=vp9" → "video/webm")
    const baseType = file.type.split(";")[0].trim();
    if (!ALLOWED_BASE_TYPES.includes(baseType)) {
      return NextResponse.json(
        { error: "Invalid file type. Only webm and mp4 videos are accepted." },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 100MB." },
        { status: 400 }
      );
    }

    // ── Verify membership + duration limit ───────────────
    const { data: membership } = await supabase
      .from("memberships")
      .select("id, video_limit_secs")
      .eq("user_id", user.id)
      .eq("celebration_id", celebrationId)
      .single();

    if (!membership) {
      return NextResponse.json({ error: "Not a member of this celebration" }, { status: 403 });
    }

    // Allow 2 second grace period for recording stop delay
    if (durationSecs > membership.video_limit_secs + 2) {
      const limitMins = Math.floor(membership.video_limit_secs / 60);
      return NextResponse.json(
        { error: `Video exceeds your ${limitMins} minute recording limit` },
        { status: 400 }
      );
    }

    // ── Upload to Supabase Storage ───────────────────────
    const ext = baseType.includes("mp4") || baseType.includes("quicktime") ? "mp4" : "webm";
    const timestamp = Date.now();
    const filePath = `${celebrationId}/${user.id}/${timestamp}.${ext}`;

    const fileBuffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabaseAdmin.storage
      .from("videos")
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json({ error: "Failed to upload video" }, { status: 500 });
    }

    // ── Create videos table row ──────────────────────────
    const { data: video, error: dbError } = await supabaseAdmin
      .from("videos")
      .insert({
        celebration_id: celebrationId,
        uploader_id: user.id,
        membership_id: membership.id,
        tree_node_id: treeNodeId || null,
        file_path: filePath,
        duration_secs: durationSecs,
        file_size_bytes: file.size,
        mime_type: file.type,
        title: title?.trim() || null,
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database insert error:", dbError);
      // Rollback: delete the uploaded file
      await supabaseAdmin.storage.from("videos").remove([filePath]);
      return NextResponse.json({ error: "Failed to save video record" }, { status: 500 });
    }

    return NextResponse.json({ video });
  } catch (error) {
    console.error("POST /api/videos/upload:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}
