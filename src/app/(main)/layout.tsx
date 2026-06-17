import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TopNav } from "@/components/ui/top-nav";
import { BottomNav } from "@/components/ui/bottom-nav";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch profile with tree node
  const { data: profile } = await supabase
    .from("profiles")
    .select("*, tree_node:tree_node_id(display_name)")
    .eq("id", user.id)
    .single();

  const displayName =
    profile?.tree_node?.display_name ||
    profile?.full_name ||
    "Family Member";

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-cream)]">
      <TopNav displayName={displayName} avatarUrl={profile?.avatar_url} />
      <main className="flex-1 pb-20 md:pb-0">{children}</main>
      <BottomNav />
    </div>
  );
}
