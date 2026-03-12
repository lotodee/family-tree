import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { ROLE_DEFAULTS } from "@/lib/config/roles";
import { randomBytes } from "crypto";
import type { MembershipRole } from "@/types";

function generateInviteCode(): string {
  return randomBytes(8).toString("hex"); // 16-char hex string, URL-safe
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

    const {
      celebrationId,
      role,
      videoLimitSecs,
      canInvite,
      canAddToTree,
      canDelete,
      targetNodeId,
    } = await request.json();

    if (!celebrationId || !role) {
      return NextResponse.json(
        { error: "celebrationId and role are required" },
        { status: 400 }
      );
    }

    // Validate role - cannot invite as owner
    const validRoles: MembershipRole[] = ["admin", "member", "viewer"];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Cannot invite as owner." },
        { status: 400 }
      );
    }

    // Verify the inviter's membership and can_invite permission
    const { data: membership } = await supabase
      .from("memberships")
      .select("id, role, can_invite")
      .eq("user_id", user.id)
      .eq("celebration_id", celebrationId)
      .single();

    if (!membership) {
      return NextResponse.json({ error: "Not a member" }, { status: 403 });
    }
    if (!membership.can_invite) {
      return NextResponse.json(
        { error: "You don't have permission to invite people" },
        { status: 403 }
      );
    }

    // Prevent privilege escalation:
    // A member can't invite someone with MORE permissions than themselves
    // An admin can't grant can_delete (only owner has that)
    if (role === "admin" && membership.role !== "owner") {
      return NextResponse.json(
        { error: "Only the owner can invite admins" },
        { status: 403 }
      );
    }

    // Use provided values or fall back to role defaults
    const defaults = ROLE_DEFAULTS[role as MembershipRole];
    const inviteData = {
      celebration_id: celebrationId,
      created_by: membership.id,
      role,
      video_limit_secs: videoLimitSecs ?? defaults.video_limit_secs,
      can_invite: canInvite ?? defaults.can_invite,
      can_add_to_tree: canAddToTree ?? defaults.can_add_to_tree,
      can_delete: canDelete ?? defaults.can_delete,
      code: generateInviteCode(),
      target_node_id: targetNodeId || null,
    };

    // Prevent granting can_delete to non-owners
    if (inviteData.can_delete && membership.role !== "owner") {
      inviteData.can_delete = false;
    }

    const { data: invitation, error } = await supabaseAdmin
      .from("invitations")
      .insert(inviteData)
      .select()
      .single();

    if (error) {
      console.error("Create invitation error:", error);
      return NextResponse.json(
        { error: "Failed to create invitation" },
        { status: 500 }
      );
    }

    return NextResponse.json({ invitation });
  } catch (error) {
    console.error("POST /api/invitations error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

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
      .select("id, role")
      .eq("user_id", user.id)
      .eq("celebration_id", celebrationId)
      .single();

    if (!membership) {
      return NextResponse.json({ error: "Not a member" }, { status: 403 });
    }

    // Owner sees all invitations. Others see only their own.
    let query = supabaseAdmin
      .from("invitations")
      .select("*, target_node:target_node_id(display_name)")
      .eq("celebration_id", celebrationId)
      .order("created_at", { ascending: false });

    if (membership.role !== "owner") {
      query = query.eq("created_by", membership.id);
    }

    const { data: invitations, error } = await query;

    if (error) {
      console.error("Fetch invitations error:", error);
      return NextResponse.json(
        { error: "Failed to fetch invitations" },
        { status: 500 }
      );
    }

    return NextResponse.json({ invitations: invitations || [] });
  } catch (error) {
    console.error("GET /api/invitations error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
