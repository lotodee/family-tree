import { redirect } from "next/navigation";
import Link from "next/link";
import { MessageSquare, GitBranch, User } from "lucide-react";
import { LogoutButton } from "@/components/ui/logout-button";
import {
  getUser,
  getUserProfile,
  getTreeNode,
  getUserAnswerCount,
  getActiveQuestionsCount,
  getClaimedNodesCount,
} from "@/lib/supabase/cached";

export default async function DashboardPage() {
  // Get user (cached - deduped with middleware)
  const { user } = await getUser();
  if (!user) redirect("/login");

  // Fetch profile (cached)
  const { profile } = await getUserProfile(user.id);
  if (!profile) redirect("/register");

  // Run all independent queries in parallel for speed
  const [
    { node: treeNode },
    { count: answeredCount },
    { count: totalSelfQuestions },
    { count: claimedCount },
  ] = await Promise.all([
    getTreeNode(profile.tree_node_id!),
    getUserAnswerCount(user.id),
    getActiveQuestionsCount("self"),
    getClaimedNodesCount(),
  ]);

  // Format relationship subtitle
  const getRelationshipSubtitle = () => {
    const parts = [];
    if (treeNode?.generation === 2) {
      parts.push("Grandchild of Grandpa Michael");
    } else if (treeNode?.generation === 1) {
      if (treeNode.node_type === "spouse") {
        parts.push("Married into the family");
      } else {
        parts.push("Child of Grandpa Michael");
      }
    } else if (treeNode?.generation === 0) {
      parts.push("Family Patriarch");
    }

    if (treeNode?.branch) {
      parts.push(
        `${treeNode.branch.charAt(0).toUpperCase() + treeNode.branch.slice(1)}'s Family`
      );
    }

    return parts.join(" • ");
  };

  return (
    <div className="px-6 py-8">
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-[var(--color-burgundy)]">
          Welcome, {treeNode?.display_name || profile.full_name}!
        </h1>
        <p className="mt-1 font-[family-name:var(--font-dm-sans)] text-[var(--color-text-secondary)]">
          {getRelationshipSubtitle()}
        </p>
      </div>

      {/* Action Cards */}
      <div className="space-y-4">
        {/* Share Your Stories Card */}
        <Link href="/questions" className="block">
          <div className="group rounded-xl border-l-4 border-l-[var(--color-gold)] bg-[var(--color-ivory)] p-5 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-[var(--color-gold-light)] p-3">
                <MessageSquare className="h-6 w-6 text-[var(--color-burgundy)]" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h2 className="font-[family-name:var(--font-playfair)] text-xl font-semibold text-[var(--color-text-primary)]">
                    Share Your Stories
                  </h2>
                  <span className="rounded-full bg-[var(--color-gold)] px-3 py-1 text-xs font-semibold text-[var(--color-text-primary)]">
                    {answeredCount || 0} / {totalSelfQuestions || 10} answered
                  </span>
                </div>
                <p className="mt-1 font-[family-name:var(--font-dm-sans)] text-sm text-[var(--color-text-secondary)]">
                  Answer questions about yourself and your family
                </p>
              </div>
            </div>
          </div>
        </Link>

        {/* View Family Tree Card */}
        <Link href="/tree" className="block">
          <div className="group rounded-xl border-l-4 border-l-[var(--color-gold)] bg-[var(--color-ivory)] p-5 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-[var(--color-gold-light)] p-3">
                <GitBranch className="h-6 w-6 text-[var(--color-burgundy)]" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h2 className="font-[family-name:var(--font-playfair)] text-xl font-semibold text-[var(--color-text-primary)]">
                    View Family Tree
                  </h2>
                  <span className="rounded-full bg-[var(--color-gold)] px-3 py-1 text-xs font-semibold text-[var(--color-text-primary)]">
                    {claimedCount || 0} of 35 joined
                  </span>
                </div>
                <p className="mt-1 font-[family-name:var(--font-dm-sans)] text-sm text-[var(--color-text-secondary)]">
                  See who&apos;s joined and explore the family
                </p>
              </div>
            </div>
          </div>
        </Link>

        {/* Your Profile Card */}
        <Link href={`/profile/${profile.tree_node_id}`} className="block">
          <div className="group rounded-xl border-l-4 border-l-[var(--color-gold)] bg-[var(--color-ivory)] p-5 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-[var(--color-gold-light)] p-3">
                <User className="h-6 w-6 text-[var(--color-burgundy)]" />
              </div>
              <div className="flex-1">
                <h2 className="font-[family-name:var(--font-playfair)] text-xl font-semibold text-[var(--color-text-primary)]">
                  Your Profile
                </h2>
                <p className="mt-1 font-[family-name:var(--font-dm-sans)] text-sm text-[var(--color-text-secondary)]">
                  See what the family has said about you
                </p>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Logout */}
      <div className="mt-12 text-center">
        <LogoutButton />
      </div>
    </div>
  );
}
