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

    // Fetch recent videos (visible ones)
    const { data: videos } = await supabaseAdmin
      .from("videos")
      .select("id, title, duration_secs, file_path, created_at, uploader_id")
      .eq("celebration_id", celebrationId)
      .eq("is_visible", true)
      .order("created_at", { ascending: false })
      .limit(10);

    // Fetch recent letters (visible ones)
    const { data: letters } = await supabaseAdmin
      .from("letters")
      .select("id, title, body, created_at, author_id")
      .eq("celebration_id", celebrationId)
      .eq("is_visible", true)
      .order("created_at", { ascending: false })
      .limit(10);

    // Collect all user IDs for profile lookup
    const userIds = new Set<string>();
    videos?.forEach(v => userIds.add(v.uploader_id));
    letters?.forEach(l => userIds.add(l.author_id));

    // Fetch profiles for all users
    const { data: profiles } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name")
      .in("id", Array.from(userIds));

    const profileMap = new Map(profiles?.map(p => [p.id, p.full_name]) || []);

    // Merge and sort by created_at descending
    type TributeItem = {
      id: string;
      type: "video" | "letter";
      title: string | null;
      authorName: string;
      createdAt: string;
      filePath?: string;
      durationSecs?: number;
      bodyPreview?: string;
    };

    const tributes: TributeItem[] = [];

    if (videos) {
      for (const v of videos) {
        tributes.push({
          id: v.id,
          type: "video",
          title: v.title,
          authorName: profileMap.get(v.uploader_id) || "Family member",
          createdAt: v.created_at,
          filePath: v.file_path,
          durationSecs: v.duration_secs,
        });
      }
    }

    if (letters) {
      for (const l of letters) {
        tributes.push({
          id: l.id,
          type: "letter",
          title: l.title,
          authorName: profileMap.get(l.author_id) || "Family member",
          createdAt: l.created_at,
          bodyPreview: l.body?.slice(0, 120) || null,
        });
      }
    }

    // Sort newest first, take top 10
    tributes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const recent = tributes.slice(0, 10);

    return NextResponse.json({ tributes: recent });
  } catch (error) {
    console.error("GET /api/tributes/recent:", error);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
