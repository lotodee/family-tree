import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PlaygroundClient } from "./playground-client";

export default async function PlaygroundPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch all tree nodes for the subject picker
  const { data: treeNodes } = await supabase
    .from("family_tree_nodes")
    .select("*")
    .eq("node_type", "biological")
    .order("generation", { ascending: true })
    .order("branch", { ascending: true });

  // Fetch recent LLM sessions for the history sidebar
  const { data: recentSessions } = await supabase
    .from("llm_sessions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <PlaygroundClient
      treeNodes={treeNodes || []}
      recentSessions={recentSessions || []}
    />
  );
}
