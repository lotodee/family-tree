import { redirect } from "next/navigation";
import { DashboardClient } from "./dashboard-client";
import {
  getUser,
  getUserProfile,
  getTreeNode,
  getUserAnswerCount,
  getActiveQuestionsCount,
  getClaimedNodesCount,
} from "@/lib/supabase/cached";

// Get time-based greeting
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

// Get generation label
function getGenerationLabel(generation: number, nodeType: string): string {
  if (generation === 0) return "Patriarch";
  if (nodeType === "spouse") return "Married into the family";
  if (generation === 1) return "Child of Grandpa";
  if (generation === 2) return "Grandchild";
  if (generation === 3) return "Great-grandchild";
  return "Family member";
}

export default async function DashboardPage() {
  const { user } = await getUser();
  if (!user) redirect("/login");

  const { profile } = await getUserProfile(user.id);
  if (!profile) redirect("/register");

  const [
    { node: treeNode },
    { count: answeredCount },
    { count: totalSelfQuestions },
    { count: claimedCount },
  ] = await Promise.all([
    getTreeNode(profile.tree_node_id!),
    getUserAnswerCount(user.id, profile.tree_node_id!),
    getActiveQuestionsCount("self"),
    getClaimedNodesCount(),
  ]);

  const answered = answeredCount || 0;
  const total = totalSelfQuestions || 10;
  const progress = Math.round((answered / total) * 100);
  const joined = claimedCount || 0;
  const remaining = total - answered;

  const firstName = (treeNode?.display_name || profile.full_name).split(" ")[0];
  const generationLabel = treeNode
    ? getGenerationLabel(treeNode.generation, treeNode.node_type)
    : "";

  return (
    <DashboardClient
      avatarUrl={profile.avatar_url}
      firstName={firstName}
      greeting={getGreeting()}
      generationLabel={generationLabel}
      progress={progress}
      answered={answered}
      total={total}
      remaining={remaining}
      joined={joined}
      profileNodeId={profile.tree_node_id!}
    />
  );
}
