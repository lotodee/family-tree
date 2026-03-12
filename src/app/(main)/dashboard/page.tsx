import { redirect } from "next/navigation";
import { DashboardClient } from "./dashboard-client";
import {
  getUser,
  getUserProfile,
  getUserMemberships,
  getCelebrationMemberCount,
} from "@/lib/supabase/cached";
import type { Celebration, Membership } from "@/types";

// Get time-based greeting
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

// Membership with nested celebration data
interface MembershipWithCelebration extends Membership {
  celebration: Celebration;
}

// Data shape for client component
export interface CelebrationCardData {
  id: string;
  name: string;
  slug: string;
  eventDate: string | null;
  coverImageUrl: string | null;
  role: Membership["role"];
  memberCount: number;
}

export default async function DashboardPage() {
  const { user } = await getUser();
  if (!user) redirect("/login");

  const { profile } = await getUserProfile(user.id);
  if (!profile) redirect("/register");

  // Fetch user's memberships with celebration data
  const { memberships } = await getUserMemberships(user.id);

  // Get member counts for each celebration
  const celebrationCards: CelebrationCardData[] = [];

  if (memberships && memberships.length > 0) {
    for (const membership of memberships as MembershipWithCelebration[]) {
      const { count } = await getCelebrationMemberCount(membership.celebration_id);
      celebrationCards.push({
        id: membership.celebration.id,
        name: membership.celebration.name,
        slug: membership.celebration.slug,
        eventDate: membership.celebration.event_date,
        coverImageUrl: membership.celebration.cover_image_url,
        role: membership.role,
        memberCount: count,
      });
    }
  }

  const firstName = profile.full_name.split(" ")[0];

  return (
    <DashboardClient
      avatarUrl={profile.avatar_url}
      firstName={firstName}
      greeting={getGreeting()}
      celebrations={celebrationCards}
    />
  );
}
