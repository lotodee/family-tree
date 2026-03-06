import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SettingsClient } from "./settings-client";

export default async function SettingsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*, tree_node:tree_node_id(display_name, branch, generation)")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/register");

  return (
    <SettingsClient
      profile={profile}
      email={user.email || ""}
    />
  );
}
