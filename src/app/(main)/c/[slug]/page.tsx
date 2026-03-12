import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { HomeClient } from "./home-client";

export default async function CelebrationHome({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch celebration
  const { data: celebration } = await supabase
    .from("celebrations")
    .select("id")
    .eq("slug", slug)
    .single();

  if (!celebration) return null; // layout handles 404

  // Fetch counts for display
  const [membershipsRes, nodesRes] = await Promise.all([
    supabaseAdmin
      .from("memberships")
      .select("id", { count: "exact", head: true })
      .eq("celebration_id", celebration.id),
    supabaseAdmin
      .from("family_tree_nodes")
      .select("id", { count: "exact", head: true })
      .eq("celebration_id", celebration.id),
  ]);

  const memberCount = membershipsRes.count || 0;
  const treeNodeCount = nodesRes.count || 0;

  return <HomeClient memberCount={memberCount} treeNodeCount={treeNodeCount} />;
}
