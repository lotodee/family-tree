import type { MembershipRole } from "@/types";

export interface RoleConfig {
  role: MembershipRole;
  label: string;
  description: string;
  video_limit_secs: number;
  can_invite: boolean;
  can_add_to_tree: boolean;
  can_delete: boolean;
}

export const ROLE_DEFAULTS: Record<MembershipRole, RoleConfig> = {
  owner: {
    role: "owner",
    label: "Owner",
    description: "Full control over the celebration.",
    video_limit_secs: 600,
    can_invite: true,
    can_add_to_tree: true,
    can_delete: true,
  },
  admin: {
    role: "admin",
    label: "Immediate Family",
    description: "Can invite people and manage the family tree.",
    video_limit_secs: 600,
    can_invite: true,
    can_add_to_tree: true,
    can_delete: false,
  },
  member: {
    role: "member",
    label: "Family Member",
    description: "Can record videos and invite others.",
    video_limit_secs: 300,
    can_invite: true,
    can_add_to_tree: false,
    can_delete: false,
  },
  viewer: {
    role: "viewer",
    label: "Guest",
    description: "Can record a short video message.",
    video_limit_secs: 60,
    can_invite: false,
    can_add_to_tree: false,
    can_delete: false,
  },
} as const;

/**
 * Formats seconds into a human-readable duration.
 * 600 → "10 minutes", 300 → "5 minutes", 60 → "1 minute"
 */
export function formatVideoLimit(secs: number): string {
  const mins = Math.floor(secs / 60);
  if (mins === 1) return "1 minute";
  return `${mins} minutes`;
}

/**
 * Get the color for a role badge
 */
export function getRoleBadgeColor(role: MembershipRole): string {
  switch (role) {
    case "owner":
      return "bg-[var(--color-burgundy)] text-white";
    case "admin":
      return "bg-[var(--color-gold)] text-[var(--color-text-primary)]";
    case "member":
      return "bg-[var(--color-gold-light)] text-[var(--color-text-primary)]";
    case "viewer":
      return "bg-[var(--color-ivory)] text-[var(--color-text-secondary)] border border-[var(--color-gold-light)]";
  }
}
