import { redirect } from "next/navigation";
import { getUser, getUserProfile, getAllTreeNodes } from "@/lib/supabase/cached";
import { TreeRealtimeWrapper } from "./tree-realtime-wrapper";
import type { FamilyTreeNode } from "@/types";

export default async function TreePage() {
  // Get authenticated user
  const { user } = await getUser();
  if (!user) redirect("/login");

  // Get user profile to find their tree_node_id
  const { profile } = await getUserProfile(user.id);
  if (!profile) redirect("/register");

  // Fetch all tree nodes
  const { nodes, error } = await getAllTreeNodes();

  if (error || !nodes) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <p className="text-text-secondary">Failed to load family tree</p>
      </div>
    );
  }

  // Cast to FamilyTreeNode type
  const typedNodes = nodes as FamilyTreeNode[];

  return (
    <TreeRealtimeWrapper
      initialNodes={typedNodes}
      currentUserNodeId={profile.tree_node_id}
    />
  );
}
