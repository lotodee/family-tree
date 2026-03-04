import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/cached";
import { QuestionsPageClient } from "./questions-client";

export default async function QuestionsPage() {
  // Auth check (cached - deduped with middleware)
  const { user } = await getUser();
  if (!user) redirect("/login");

  const supabase = await createClient();

  // Run all independent queries in parallel
  const [
    { data: profile },
    { data: questions },
    { data: existingAnswers },
    { data: treeNodes },
  ] = await Promise.all([
    // Fetch profile with tree node
    supabase
      .from("profiles")
      .select("*, tree_node:tree_node_id(*)")
      .eq("id", user.id)
      .single(),
    // Fetch questions
    supabase
      .from("questions")
      .select("*")
      .eq("is_active", true)
      .order("type", { ascending: true })
      .order("display_order", { ascending: true }),
    // Fetch user's existing answers
    supabase
      .from("answers")
      .select("*")
      .eq("respondent_id", user.id),
    // Fetch all tree nodes for subject picker
    supabase
      .from("family_tree_nodes")
      .select("*")
      .order("generation", { ascending: true })
      .order("branch", { ascending: true })
      .order("display_name", { ascending: true }),
  ]);

  if (!profile || !profile.tree_node_id) redirect("/register");

  return (
    <QuestionsPageClient
      userId={user.id}
      profile={profile}
      questions={questions || []}
      existingAnswers={existingAnswers || []}
      treeNodes={treeNodes || []}
    />
  );
}
