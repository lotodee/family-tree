import { cache } from "react";
import { createClient } from "./server";

/**
 * Cached version of getUser - deduplicates calls within the same request
 * React's cache() ensures this only runs once per request even if called multiple times
 */
export const getUser = cache(async () => {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
});

/**
 * Cached version of getting user profile
 */
export const getUserProfile = cache(async (userId: string) => {
  const supabase = await createClient();
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  return { profile, error };
});

/**
 * Cached version of getting tree node
 */
export const getTreeNode = cache(async (nodeId: string) => {
  const supabase = await createClient();
  const { data: node, error } = await supabase
    .from("family_tree_nodes")
    .select("*")
    .eq("id", nodeId)
    .single();
  return { node, error };
});

/**
 * Cached version of getting all tree nodes
 */
export const getAllTreeNodes = cache(async () => {
  const supabase = await createClient();
  const { data: nodes, error } = await supabase
    .from("family_tree_nodes")
    .select("*")
    .order("generation", { ascending: true });
  return { nodes, error };
});

/**
 * Cached version of getting all tree nodes with profile avatars
 */
export const getAllTreeNodesWithProfiles = cache(async () => {
  const supabase = await createClient();
  const { data: nodes, error } = await supabase
    .from("family_tree_nodes")
    .select("*, profile:claimed_by(avatar_url)")
    .order("generation", { ascending: true });
  return { nodes, error };
});

/**
 * Cached version of getting user's memberships with celebration data
 */
export const getUserMemberships = cache(async (userId: string) => {
  const supabase = await createClient();
  const { data: memberships, error } = await supabase
    .from("memberships")
    .select("*, celebration:celebrations(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return { memberships, error };
});

/**
 * Cached version of getting member count for a celebration
 */
export const getCelebrationMemberCount = cache(async (celebrationId: string) => {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("memberships")
    .select("*", { count: "exact", head: true })
    .eq("celebration_id", celebrationId);
  return { count: count || 0, error };
});
