import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { CelebrationProvider } from "@/lib/contexts/celebration-context";
import { CelebrationTabs } from "@/components/celebration/celebration-tabs";
import Link from "next/link";

interface CelebrationLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export default async function CelebrationLayout({
  children,
  params,
}: CelebrationLayoutProps) {
  const { slug } = await params;
  const supabase = await createClient();

  // 1. Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 2. Fetch celebration by slug
  const { data: celebration, error: celebrationError } = await supabase
    .from("celebrations")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  // Only show 404 if we got a "not found" error, not on network failures
  if (celebrationError?.code === "PGRST116" || (!celebration && !celebrationError)) {
    notFound();
  }

  // If there's another error (network), throw to trigger error boundary
  if (celebrationError || !celebration) {
    throw new Error("Failed to load celebration");
  }

  // 3. Fetch user's membership
  const { data: membership } = await supabase
    .from("memberships")
    .select("*")
    .eq("user_id", user.id)
    .eq("celebration_id", celebration.id)
    .single();

  if (!membership) {
    // User is authenticated but not a member of this celebration
    return (
      <div
        className="flex min-h-screen items-center justify-center p-8"
        style={{ backgroundColor: "var(--color-cream)" }}
      >
        <div className="max-w-md text-center">
          <h1
            className="mb-2 text-2xl font-bold"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-text-primary)",
            }}
          >
            Access Denied
          </h1>
          <p className="mb-4" style={{ color: "var(--color-text-secondary)" }}>
            You&apos;re not a member of this celebration. If you have an invite
            link, open it to join.
          </p>
          <Link
            href="/dashboard"
            className="text-sm font-medium"
            style={{ color: "var(--color-gold)" }}
          >
            &larr; Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // 4. Pass data to children via context provider
  return (
    <CelebrationProvider celebration={celebration} membership={membership}>
      <CelebrationTabs />
      <div className="flex-1 overflow-y-auto">{children}</div>
    </CelebrationProvider>
  );
}
