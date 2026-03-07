// ============================================================
// ENUMS — must match Supabase enums exactly
// ============================================================

export type Gender = "male" | "female" | "unknown";

export type NodeType = "biological" | "spouse";

export type RelationshipType =
  | "patriarch"
  | "matriarch"
  | "child"
  | "grandchild"
  | "spouse";

export type QuestionType = "self" | "about_other";

export type QuestionCategory =
  | "personality"
  | "memories"
  | "funny"
  | "heartfelt"
  | "general";

export type AnswerStatus = "draft" | "transcribing" | "review" | "confirmed";

export type InputMethod = "text" | "voice";

// ============================================================
// DATABASE ROW TYPES — exact shape of each Supabase table row
// ============================================================

export interface FamilyTreeNode {
  id: string;
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
  status: string | null;
  created_at: string;
}

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  age: number | null;
  relationship_type: RelationshipType;
  father_name: string | null;
  mother_name: string | null;
  tree_node_id: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  category: QuestionCategory;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

export interface Answer {
  id: string;
  respondent_id: string;
  subject_id: string;
  question_id: string;
  answer_text: string | null;
  voice_url: string | null;
  raw_transcription: string | null;
  status: AnswerStatus;
  input_method: InputMethod;
  is_confirmed: boolean;
  created_at: string;
}

export interface LLMSession {
  id: string;
  prompt: string;
  response_text: string | null;
  image_url: string | null;
  subjects: string[];
  created_at: string;
}

// ============================================================
// FORM / INPUT TYPES — used for registration, answering, etc.
// ============================================================

export interface RegisterFormData {
  node_id: string | null;
  email: string;
  full_name: string;
  relationship_type: RelationshipType;
  father_name: string;
  mother_name: string;
}

export interface AnswerFormData {
  subject_id: string;
  question_id: string;
  answer_text: string;
  input_method: InputMethod;
  voice_url?: string;
  raw_transcription?: string;
}

export interface PlaygroundPrompt {
  prompt: string;
  subject_ids: string[];
  template_key?: string;
}

// ============================================================
// COMPUTED / UI TYPES — used by the frontend, not stored in DB
// ============================================================

export interface PositionedTreeNode extends FamilyTreeNode {
  x: number;
  y: number;
  children_ids: string[];
}

export interface TreeConnection {
  from_id: string;
  to_id: string;
  from_x: number;
  from_y: number;
  to_x: number;
  to_y: number;
  type: "parent_child" | "spouse";
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

// Tree node with joined profile data for avatar display
export interface FamilyTreeNodeWithProfile extends FamilyTreeNode {
  profile?: { avatar_url: string | null } | null;
}
