// ============================================================
// ENUMS
// ============================================================

export type Gender = "male" | "female" | "unknown";

export type NodeType = "biological" | "spouse";

export type MembershipRole = "owner" | "admin" | "member" | "viewer";

// ============================================================
// DATABASE ROW TYPES
// ============================================================

export interface Celebration {
  id: string;
  name: string;
  description: string | null;
  event_date: string | null;
  owner_id: string | null;
  slug: string;
  cover_image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface FamilyTreeNode {
  id: string;
  celebration_id: string;
  display_name: string;
  full_name: string | null;
  gender: Gender;
  generation: number;
  parent_node_id: string | null;
  spouse_node_id: string | null;
  branch: string | null;
  is_claimed: boolean;
  claimed_by: string | null;
  is_deceased: boolean;
  node_type: NodeType;
  created_at: string;
  updated_at: string;
}

export interface Membership {
  id: string;
  user_id: string;
  celebration_id: string;
  tree_node_id: string | null;
  role: MembershipRole;
  video_limit_secs: number;
  can_invite: boolean;
  can_add_to_tree: boolean;
  can_delete: boolean;
  invited_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Invitation {
  id: string;
  celebration_id: string;
  created_by: string;
  role: MembershipRole;
  video_limit_secs: number;
  can_invite: boolean;
  can_add_to_tree: boolean;
  can_delete: boolean;
  code: string;
  target_node_id: string | null;
  is_used: boolean;
  used_by: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Video {
  id: string;
  celebration_id: string;
  uploader_id: string;
  membership_id: string;
  tree_node_id: string | null;
  file_path: string;
  duration_secs: number;
  file_size_bytes: number | null;
  mime_type: string | null;
  thumbnail_url: string | null;
  title: string | null;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface Letter {
  id: string;
  celebration_id: string;
  author_id: string;
  membership_id: string;
  tree_node_id: string | null;
  title: string | null;
  body: string;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface LLMSession {
  id: string;
  celebration_id: string | null;
  prompt: string;
  response_text: string | null;
  image_url: string | null;
  subjects: string[];
  created_at: string;
  updated_at: string;
}

// ============================================================
// FORM / INPUT TYPES
// ============================================================

export interface CreateCelebrationFormData {
  name: string;
  description: string;
  event_date: string;
  slug: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  full_name: string;
}

export interface CreateInviteFormData {
  role: MembershipRole;
  video_limit_secs: number;
  can_invite: boolean;
  can_add_to_tree: boolean;
  can_delete: boolean;
  target_node_id: string | null;
}

export interface AddTreeNodeFormData {
  display_name: string;
  full_name: string;
  gender: Gender;
  generation: number;
  parent_node_id: string | null;
  spouse_node_id: string | null;
  branch: string | null;
  node_type: NodeType;
  is_deceased: boolean;
}

export interface VideoUploadData {
  celebration_id: string;
  tree_node_id: string | null;
  title: string | null;
  duration_secs: number;
  file_size_bytes: number;
  mime_type: string;
}

export interface LetterFormData {
  celebration_id: string;
  tree_node_id: string | null;
  title: string;
  body: string;
}

// ============================================================
// COMPUTED / UI TYPES
// ============================================================

export interface PositionedTreeNode extends FamilyTreeNode {
  x: number;
  y: number;
}

// Horizontal tree layout types
export interface ConnectorLine {
  id: string;
  type: "couple" | "parent_to_bracket" | "bracket" | "bracket_to_child";
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface HorizontalTreeLayout {
  nodes: PositionedTreeNode[];
  connectors: ConnectorLine[];
  totalWidth: number;
  totalHeight: number;
}

export interface MembershipWithProfile extends Membership {
  profile?: Profile;
  tree_node?: FamilyTreeNode;
}

export interface CelebrationWithMembership extends Celebration {
  membership?: Membership;
}

// Tree node with joined profile data for avatar display
export interface FamilyTreeNodeWithProfile extends FamilyTreeNode {
  profile?: { avatar_url: string | null } | null;
}
