import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export interface GalleryItem {
  id: string;
  type: "video" | "letter";
  title: string | null;
  authorId: string;
  authorName: string;
  authorAvatar: string | null;
  createdAt: string;
  // Video fields
  filePath?: string;
  durationSecs?: number;
  mimeType?: string;
  // Letter fields
  body?: string;
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

    // Fetch all visible videos
    const { data: videos } = await supabaseAdmin
      .from("videos")
      .select("id, title, duration_secs, file_path, mime_type, created_at, uploader_id")
      .eq("celebration_id", celebrationId)
      .eq("is_visible", true)
      .order("created_at", { ascending: false });

    // Fetch all visible letters
    const { data: letters } = await supabaseAdmin
      .from("letters")
      .select("id, title, body, created_at, author_id")
      .eq("celebration_id", celebrationId)
      .eq("is_visible", true)
      .order("created_at", { ascending: false });

    // Collect all user IDs for profile lookup
    const userIds = new Set<string>();
    videos?.forEach((v) => userIds.add(v.uploader_id));
    letters?.forEach((l) => userIds.add(l.author_id));

    // Fetch profiles
    const { data: profiles } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, avatar_url")
      .in("id", Array.from(userIds));

    const profileMap = new Map(
      profiles?.map((p) => [p.id, { name: p.full_name, avatar: p.avatar_url }]) || []
    );

    // Build gallery items
    const items: GalleryItem[] = [];

    if (videos) {
      for (const v of videos) {
        const profile = profileMap.get(v.uploader_id);
        items.push({
          id: v.id,
          type: "video",
          title: v.title,
          authorId: v.uploader_id,
          authorName: profile?.name || "Family member",
          authorAvatar: profile?.avatar || null,
          createdAt: v.created_at,
          filePath: v.file_path,
          durationSecs: v.duration_secs,
          mimeType: v.mime_type,
        });
      }
    }

    if (letters) {
      for (const l of letters) {
        const profile = profileMap.get(l.author_id);
        items.push({
          id: l.id,
          type: "letter",
          title: l.title,
          authorId: l.author_id,
          authorName: profile?.name || "Family member",
          authorAvatar: profile?.avatar || null,
          createdAt: l.created_at,
          body: l.body,
        });
      }
    }

    // Sort newest first
    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ items });
  } catch (error) {
    console.error("GET /api/gallery:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}
