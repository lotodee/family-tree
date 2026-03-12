import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { code } = await request.json();
    if (!code) {
      return NextResponse.json(
        { error: "Invite code required" },
        { status: 400 }
      );
    }

    // Fetch the invitation (using admin client — RLS won't let the user read others' invites)
    const { data: invitation } = await supabaseAdmin
      .from("invitations")
      .select("*, celebration:celebration_id(slug, name, is_active)")
      .eq("code", code)
      .single();

    if (!invitation) {
      return NextResponse.json(
        { error: "Invalid invite link" },
        { status: 404 }
      );
    }

    // Validate the invitation
    if (invitation.is_used) {
      return NextResponse.json(
        { error: "This invite has already been used" },
        { status: 410 }
      );
    }

    if (
      invitation.expires_at &&
      new Date(invitation.expires_at) < new Date()
    ) {
      return NextResponse.json(
        { error: "This invite has expired" },
        { status: 410 }
      );
    }

    if (!invitation.celebration?.is_active) {
      return NextResponse.json(
        { error: "This celebration is no longer active" },
        { status: 410 }
      );
    }

    // Check if user already has a membership in this celebration
    const { data: existingMembership } = await supabaseAdmin
      .from("memberships")
      .select("id")
      .eq("user_id", user.id)
      .eq("celebration_id", invitation.celebration_id)
      .single();

    if (existingMembership) {
      return NextResponse.json(
        {
          error: "You're already a member of this celebration",
          slug: invitation.celebration?.slug,
        },
        { status: 409 }
      );
    }

    // Create the membership
    const { data: membership, error: membershipError } = await supabaseAdmin
      .from("memberships")
      .insert({
        user_id: user.id,
        celebration_id: invitation.celebration_id,
        role: invitation.role,
        video_limit_secs: invitation.video_limit_secs,
        can_invite: invitation.can_invite,
        can_add_to_tree: invitation.can_add_to_tree,
        can_delete: invitation.can_delete,
        tree_node_id: invitation.target_node_id || null,
        invited_by: invitation.created_by,
      })
      .select()
      .single();

    if (membershipError) {
      console.error("Membership creation error:", membershipError);
      return NextResponse.json(
        { error: "Failed to join celebration" },
        { status: 500 }
      );
    }

    // If target_node_id was set, mark that node as claimed
    if (invitation.target_node_id) {
      await supabaseAdmin
        .from("family_tree_nodes")
        .update({
          is_claimed: true,
          claimed_by: user.id,
        })
        .eq("id", invitation.target_node_id);
    }

    // Mark invitation as used
    await supabaseAdmin
      .from("invitations")
      .update({
        is_used: true,
        used_by: user.id,
      })
      .eq("id", invitation.id);

    return NextResponse.json({
      success: true,
      slug: invitation.celebration?.slug,
      celebrationName: invitation.celebration?.name,
      membership,
    });
  } catch (error) {
    console.error("POST /api/invitations/redeem error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
