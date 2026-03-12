import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    const { data: invitation } = await supabaseAdmin
      .from("invitations")
      .select(
        `
        id, code, role, is_used, expires_at, target_node_id, created_by,
        celebration:celebration_id(name, description, event_date, slug, is_active),
        target_node:target_node_id(display_name)
      `
      )
      .eq("code", code)
      .single();

    if (!invitation) {
      return NextResponse.json({ error: "Invite not found" }, { status: 404 });
    }

    // Fetch inviter information separately (join through memberships to profiles)
    let inviterName = "A family member";

    // Get the membership that created this invite
    const { data: creatorMembership } = await supabaseAdmin
      .from("memberships")
      .select("user_id")
      .eq("id", invitation.created_by)
      .single();

    if (creatorMembership?.user_id) {
      // Get the profile for that user
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("full_name")
        .eq("id", creatorMembership.user_id)
        .single();

      if (profile?.full_name) {
        inviterName = profile.full_name;
      }
    }

    // Don't reveal sensitive data — return only what the landing page needs
    const celebration = invitation.celebration as unknown as {
      name: string;
      description: string | null;
      event_date: string | null;
      slug: string;
      is_active: boolean;
    } | null;

    const targetNode = invitation.target_node as unknown as {
      display_name: string;
    } | null;

    return NextResponse.json({
      valid:
        !invitation.is_used &&
        celebration?.is_active &&
        (!invitation.expires_at ||
          new Date(invitation.expires_at) > new Date()),
      isUsed: invitation.is_used,
      isExpired: invitation.expires_at
        ? new Date(invitation.expires_at) < new Date()
        : false,
      celebration: {
        name: celebration?.name,
        description: celebration?.description,
        eventDate: celebration?.event_date,
        slug: celebration?.slug,
      },
      invitedBy: inviterName,
      role: invitation.role,
      targetNodeName: targetNode?.display_name || null,
    });
  } catch (error) {
    console.error("GET /api/invitations/[code] error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
