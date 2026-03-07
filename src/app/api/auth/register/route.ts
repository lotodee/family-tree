import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { generatePassword } from "@/lib/utils/password-gen";
import { sendPasswordEmail } from "@/lib/email/send-password";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nodeId, email, age, fullName, relationshipType, fatherName, motherName } =
      body;

    // Validate required fields
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    if (!age || typeof age !== "number" || age < 1 || age > 120) {
      return NextResponse.json({ error: "Valid age is required" }, { status: 400 });
    }

    // Check if email is already registered
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const emailExists = existingUsers?.users?.some((u) => u.email === email);
    if (emailExists) {
      return NextResponse.json(
        { error: "This email is already registered. Try logging in instead." },
        { status: 409 }
      );
    }

    let node = null;
    let resolvedFullName = fullName;
    let resolvedRelType = relationshipType;
    let resolvedFather = fatherName;
    let resolvedMother = motherName;

    if (nodeId) {
      // FLOW A: User selected an existing node

      // 1. Fetch the node and verify it's unclaimed
      const { data: fetchedNode, error: nodeError } = await supabaseAdmin
        .from("family_tree_nodes")
        .select("*")
        .eq("id", nodeId)
        .single();

      if (nodeError || !fetchedNode) {
        return NextResponse.json({ error: "Node not found" }, { status: 404 });
      }
      if (fetchedNode.is_claimed) {
        return NextResponse.json(
          { error: "This name has already been claimed" },
          { status: 409 }
        );
      }

      node = fetchedNode;
      resolvedFullName = node.full_name || node.display_name;

      // Determine relationship type from generation
      if (node.generation === 0) {
        resolvedRelType = node.gender === "male" ? "patriarch" : "matriarch";
      } else if (node.generation === 1) {
        resolvedRelType = node.node_type === "spouse" ? "spouse" : "child";
      } else if (node.generation === 2) {
        resolvedRelType = "grandchild";
      }

      // Resolve parent names
      if (node.parent_node_id) {
        const { data: parentNode } = await supabaseAdmin
          .from("family_tree_nodes")
          .select("*, spouse:spouse_node_id(*)")
          .eq("id", node.parent_node_id)
          .single();

        if (parentNode) {
          if (parentNode.gender === "female") {
            resolvedMother = parentNode.display_name;
            resolvedFather = parentNode.spouse?.display_name || null;
          } else {
            resolvedFather = parentNode.display_name;
            resolvedMother = parentNode.spouse?.display_name || null;
          }
        }
      }
    }

    // 2. Generate password
    const password = generatePassword();

    // 3. Create Supabase Auth user
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Skip email verification
      });

    if (authError || !authData.user) {
      console.error("Auth error:", authError);
      return NextResponse.json(
        { error: "Failed to create account. Please try again." },
        { status: 500 }
      );
    }

    const userId = authData.user.id;

    // 4. Create profile FIRST (without tree_node_id to avoid circular dependency)
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: userId,
        full_name: resolvedFullName,
        email,
        age,
        relationship_type: resolvedRelType,
        father_name: resolvedFather,
        mother_name: resolvedMother,
        tree_node_id: null, // Will update after claiming/creating node
      });

    if (profileError) {
      console.error("Profile error:", profileError);
      // Rollback: delete the auth user
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return NextResponse.json(
        { error: "Failed to create profile" },
        { status: 500 }
      );
    }

    // 5. Handle node: claim existing or create new
    let treeNodeId: string;

    if (nodeId && node) {
      // Claim the existing node
      treeNodeId = nodeId;

      const { error: claimError } = await supabaseAdmin
        .from("family_tree_nodes")
        .update({ is_claimed: true, claimed_by: userId })
        .eq("id", nodeId);

      if (claimError) {
        console.error("Claim error:", claimError);
        // Rollback: delete profile and auth user
        await supabaseAdmin.from("profiles").delete().eq("id", userId);
        await supabaseAdmin.auth.admin.deleteUser(userId);
        return NextResponse.json(
          { error: "Failed to claim node" },
          { status: 500 }
        );
      }
    } else {
      // FLOW B: Create a new node for someone not on the list
      // Try to find parent by matching father/mother name
      let parentNodeId: string | null = null;

      if (resolvedFather) {
        const { data: fatherMatch } = await supabaseAdmin
          .from("family_tree_nodes")
          .select("id")
          .ilike("display_name", resolvedFather)
          .eq("node_type", "biological")
          .limit(1)
          .single();
        if (fatherMatch) parentNodeId = fatherMatch.id;
      }

      if (!parentNodeId && resolvedMother) {
        const { data: motherMatch } = await supabaseAdmin
          .from("family_tree_nodes")
          .select("id")
          .ilike("display_name", resolvedMother)
          .eq("node_type", "biological")
          .limit(1)
          .single();
        if (motherMatch) parentNodeId = motherMatch.id;
      }

      // Determine generation from relationship type
      let generation = 2; // default grandchild
      if (resolvedRelType === "child" || resolvedRelType === "spouse")
        generation = 1;

      // Determine branch from parent
      let branch: string | null = null;
      if (parentNodeId) {
        const { data: parentForBranch } = await supabaseAdmin
          .from("family_tree_nodes")
          .select("branch")
          .eq("id", parentNodeId)
          .single();
        if (parentForBranch) branch = parentForBranch.branch;
      }

      const { data: newNode, error: newNodeError } = await supabaseAdmin
        .from("family_tree_nodes")
        .insert({
          display_name: resolvedFullName,
          full_name: resolvedFullName,
          gender: "unknown",
          generation,
          parent_node_id: parentNodeId,
          branch,
          is_claimed: true,
          claimed_by: userId,
          node_type: "biological",
        })
        .select()
        .single();

      if (newNodeError || !newNode) {
        console.error("New node error:", newNodeError);
        // Rollback
        await supabaseAdmin.from("profiles").delete().eq("id", userId);
        await supabaseAdmin.auth.admin.deleteUser(userId);
        return NextResponse.json(
          { error: "Failed to create tree node" },
          { status: 500 }
        );
      }

      treeNodeId = newNode.id;
    }

    // 6. Update profile with tree_node_id
    const { error: updateProfileError } = await supabaseAdmin
      .from("profiles")
      .update({ tree_node_id: treeNodeId })
      .eq("id", userId);

    if (updateProfileError) {
      console.error("Profile update error:", updateProfileError);
      // Non-fatal: profile exists, just missing tree_node_id link
    }

    // 7. Send password email (fire-and-forget — does not block registration)
    sendPasswordEmail({
      to: email,
      name: resolvedFullName,
      password,
    }).catch((error) => {
      console.warn("Password email failed to send:", error);
    });

    return NextResponse.json({
      success: true,
      password,
      fullName: resolvedFullName,
      userId,
      treeNodeId,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
