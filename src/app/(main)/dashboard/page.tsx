import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Users, Sparkles } from "lucide-react";
import { DashboardClient } from "./dashboard-client";
import {
  getUser,
  getUserProfile,
  getTreeNode,
  getUserAnswerCount,
  getActiveQuestionsCount,
  getClaimedNodesCount,
} from "@/lib/supabase/cached";

// Progress ring component
function ProgressRing({
  progress,
  size = 100,
  strokeWidth = 8,
}: {
  progress: number;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--color-gold-light)"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--color-gold)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="transition-all duration-1000 ease-out"
      />
    </svg>
  );
}

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
    getUserAnswerCount(user.id),
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
    <DashboardClient avatarUrl={profile.avatar_url}>
    <div className="min-h-screen bg-cream pb-24">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-burgundy to-burgundy-light px-6 pb-16 pt-8 text-ivory">
        <p className="text-sm font-medium text-gold-light">{getGreeting()}</p>
        <h1 className="mt-1 font-display text-3xl font-bold">{firstName}</h1>
        <p className="mt-1 text-sm text-ivory/70">{generationLabel}</p>
      </div>

      {/* Progress Card - Overlapping Hero */}
      <div className="-mt-10 px-4">
        <div className="rounded-2xl bg-ivory p-6 shadow-lg">
          <div className="flex items-center gap-6">
            {/* Progress Ring */}
            <div className="relative flex-shrink-0">
              <ProgressRing progress={progress} size={100} strokeWidth={8} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-burgundy">{progress}%</span>
              </div>
            </div>

            {/* Progress Text */}
            <div className="flex-1">
              <h2 className="font-display text-lg font-semibold text-text-primary">
                Your Stories
              </h2>
              <p className="mt-1 text-sm text-text-secondary">
                {answered} of {total} questions answered
              </p>
              {remaining > 0 ? (
                <p className="mt-2 text-xs text-gold">
                  {remaining} more to complete your story
                </p>
              ) : (
                <p className="mt-2 flex items-center gap-1 text-xs text-success">
                  <Sparkles className="h-3 w-3" />
                  All done! Thank you!
                </p>
              )}
            </div>
          </div>

          {/* CTA Button */}
          {remaining > 0 && (
            <Link
              href="/questions"
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-burgundy py-3.5 font-semibold text-ivory transition-all hover:bg-burgundy-light active:scale-[0.98]"
            >
              Continue Sharing
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 px-4">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-secondary">
          Explore
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {/* Family Tree */}
          <Link href="/tree" className="group">
            <div className="rounded-xl border border-gold/20 bg-ivory p-4 transition-all hover:border-gold hover:shadow-md">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gold-light">
                <Users className="h-5 w-5 text-burgundy" />
              </div>
              <h4 className="font-display font-semibold text-text-primary">Family Tree</h4>
              <p className="mt-0.5 text-xs text-text-secondary">
                {joined} of 37 joined
              </p>
            </div>
          </Link>

          {/* Your Profile */}
          <Link href={`/profile/${profile.tree_node_id}`} className="group">
            <div className="rounded-xl border border-gold/20 bg-ivory p-4 transition-all hover:border-gold hover:shadow-md">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gold-light">
                <span className="text-lg font-bold text-burgundy">
                  {firstName.charAt(0)}
                </span>
              </div>
              <h4 className="font-display font-semibold text-text-primary">Your Profile</h4>
              <p className="mt-0.5 text-xs text-text-secondary">View your page</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Encouragement */}
      <div className="mt-8 px-4 text-center">
        <p className="text-sm text-text-secondary">
          Every story you share becomes part of our family&apos;s history
        </p>
      </div>
    </div>
    </DashboardClient>
  );
}
