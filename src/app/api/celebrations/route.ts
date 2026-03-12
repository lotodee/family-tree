import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { ROLE_DEFAULTS } from "@/lib/config/roles";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, description, event_date, slug } = await request.json();

    // ── Validate inputs ──────────────────────────────────
    if (!name || typeof name !== "string" || name.trim().length < 3) {
      return NextResponse.json(
        { error: "Name must be at least 3 characters" },
        { status: 400 }
      );
    }

    if (!slug || typeof slug !== "string" || slug.length < 3) {
      return NextResponse.json(
        { error: "URL slug must be at least 3 characters" },
        { status: 400 }
      );
    }

    // Validate slug format (lowercase alphanumeric + hyphens)
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json(
        { error: "URL can only contain lowercase letters, numbers, and hyphens" },
        { status: 400 }
      );
    }

    // ── Check slug uniqueness ────────────────────────────
    const { data: existingCelebration } = await supabaseAdmin
      .from("celebrations")
      .select("id")
      .eq("slug", slug)
      .single();

    if (existingCelebration) {
      return NextResponse.json(
        { error: "This URL is already taken" },
        { status: 409 }
      );
    }

    // ── Create celebration ───────────────────────────────
    const { data: celebration, error: celebrationError } = await supabaseAdmin
      .from("celebrations")
      .insert({
        name: name.trim(),
        description: description?.trim() || null,
        event_date: event_date || null,
        slug,
        owner_id: user.id,
        is_active: true,
      })
      .select()
      .single();

    if (celebrationError || !celebration) {
      console.error("Celebration creation error:", celebrationError);
      return NextResponse.json(
        { error: "Failed to create celebration. Please try again." },
        { status: 500 }
      );
    }

    // ── Create owner membership ──────────────────────────
    const ownerDefaults = ROLE_DEFAULTS.owner;

    const { error: membershipError } = await supabaseAdmin
      .from("memberships")
      .insert({
        user_id: user.id,
        celebration_id: celebration.id,
        role: ownerDefaults.role,
        video_limit_secs: ownerDefaults.video_limit_secs,
        can_invite: ownerDefaults.can_invite,
        can_add_to_tree: ownerDefaults.can_add_to_tree,
        can_delete: ownerDefaults.can_delete,
        invited_by: null, // Owner has no inviter
      });

    if (membershipError) {
      console.error("Membership creation error:", membershipError);
      // Rollback: delete the celebration
      await supabaseAdmin.from("celebrations").delete().eq("id", celebration.id);
      return NextResponse.json(
        { error: "Failed to create membership. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      celebration: {
        id: celebration.id,
        slug: celebration.slug,
        name: celebration.name,
      },
    });
  } catch (error) {
    console.error("Create celebration error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
