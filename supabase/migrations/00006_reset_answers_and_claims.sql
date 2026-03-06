-- ============================================================
-- RESET: Clear answers and unclaim nodes (except lolamidotun@gmail.com)
-- ============================================================

-- 1. Delete all answers (self and about others)
DELETE FROM answers;

-- 2. Reset claimed status for everyone EXCEPT lolamidotun@gmail.com
UPDATE family_tree_nodes
SET is_claimed = false, claimed_by = null
WHERE id NOT IN (
  SELECT tree_node_id FROM profiles WHERE email = 'lolamidotun@gmail.com'
);
