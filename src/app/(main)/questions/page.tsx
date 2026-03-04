import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { QuestionsPageClient } from "./questions-client";

export default async function QuestionsPage() {
  const supabase = await createClient();

  // Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch profile with tree node
  const { data: profile } = await supabase
    .from("profiles")
    .select("*, tree_node:tree_node_id(*)")
    .eq("id", user.id)
    .single();

  if (!profile || !profile.tree_node_id) redirect("/register");

  // Fetch questions
  const { data: questions } = await supabase
    .from("questions")
    .select("*")
    .eq("is_active", true)
    .order("type", { ascending: true })
    .order("display_order", { ascending: true });

  // Fetch user's existing answers
  const { data: existingAnswers } = await supabase
    .from("answers")
    .select("*")
    .eq("respondent_id", user.id);

  // Fetch all tree nodes for subject picker
  const { data: treeNodes } = await supabase
    .from("family_tree_nodes")
    .select("*")
    .order("generation", { ascending: true })
    .order("branch", { ascending: true })
    .order("display_name", { ascending: true });

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
