-- ============================================================
-- RESET: Clear answers and unclaim nodes (except the demo owner)
-- ============================================================

-- 1. Delete all answers (self and about others)
DELETE FROM answers;

-- 2. Reset claimed status for everyone EXCEPT the demo owner profile
UPDATE family_tree_nodes
SET is_claimed = false, claimed_by = null
WHERE id NOT IN (
  SELECT tree_node_id FROM profiles WHERE email = 'demo.owner@example.com'
);
