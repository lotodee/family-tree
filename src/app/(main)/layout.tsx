import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { SidebarMobile } from "@/components/layout/sidebar-mobile";
import { TopBar } from "@/components/layout/top-bar";

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

  // Fetch profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Fetch user's celebrations via memberships
  const { data: memberships } = await supabase
    .from("memberships")
    .select("*, celebration:celebrations(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const celebrations = (memberships || []).map((m) => ({
    membership: {
      id: m.id,
      user_id: m.user_id,
      celebration_id: m.celebration_id,
      tree_node_id: m.tree_node_id,
      role: m.role,
      video_limit_secs: m.video_limit_secs,
      can_invite: m.can_invite,
      can_add_to_tree: m.can_add_to_tree,
      can_delete: m.can_delete,
      invited_by: m.invited_by,
      created_at: m.created_at,
      updated_at: m.updated_at,
    },
    celebration: m.celebration,
  }));

  const displayName = profile?.full_name || "User";

  return (
    <div className="flex min-h-screen bg-[var(--color-cream)]">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar userName={displayName} initialCelebrations={celebrations} />
      </div>

      {/* Mobile sidebar (hamburger + slide-out) */}
      <SidebarMobile userName={displayName} celebrations={celebrations} />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile top bar */}
        <TopBar />

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
