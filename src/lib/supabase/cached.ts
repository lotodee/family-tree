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
 * Cached version of getting user's answer count
 */
export const getUserAnswerCount = cache(async (userId: string) => {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("answers")
    .select("*", { count: "exact", head: true })
    .eq("respondent_id", userId)
    .eq("is_confirmed", true);
  return { count, error };
});

/**
 * Cached version of getting active questions count
 */
export const getActiveQuestionsCount = cache(async (type?: "self" | "about_other") => {
  const supabase = await createClient();
  let query = supabase
    .from("questions")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true);

  if (type) {
    query = query.eq("type", type);
  }

  const { count, error } = await query;
  return { count, error };
});

/**
 * Cached version of getting claimed nodes count
 */
export const getClaimedNodesCount = cache(async () => {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("family_tree_nodes")
    .select("*", { count: "exact", head: true })
    .eq("is_claimed", true);
  return { count, error };
});
