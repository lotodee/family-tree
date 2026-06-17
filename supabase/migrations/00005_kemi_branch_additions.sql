-- ============================================================
-- SEED: BRANCH b1 ADDITIONS (demo data — all fictional)
-- Adds Grandchild A's spouse and their child (a great-grandchild)
-- ============================================================

-- GENERATION 2: Spouse for Grandchild A
INSERT INTO family_tree_nodes (id, display_name, full_name, gender, generation, parent_node_id, branch, node_type, is_claimed, is_deceased)
VALUES
  ('00000000-0000-0000-0000-000000000105', 'Spouse Seven', 'Spouse Seven Roe', 'male', 2, NULL, 'b1', 'spouse', FALSE, FALSE);

-- GENERATION 3: Great-grandchild (Grandchild A & Spouse Seven's son)
INSERT INTO family_tree_nodes (id, display_name, full_name, gender, generation, parent_node_id, branch, node_type, is_claimed, is_deceased)
VALUES
  ('00000000-0000-0000-0000-000000000106', 'Great-grandchild A', 'A2 Roe', 'male', 3, '00000000-0000-0000-0000-000000000101', 'b1', 'biological', FALSE, FALSE);

-- Update Grandchild A with married name and spouse link
UPDATE family_tree_nodes
SET full_name = 'A Roe',
    spouse_node_id = '00000000-0000-0000-0000-000000000105'
WHERE id = '00000000-0000-0000-0000-000000000101';

-- Link Spouse Seven back to Grandchild A (bidirectional)
UPDATE family_tree_nodes
SET spouse_node_id = '00000000-0000-0000-0000-000000000101'
WHERE id = '00000000-0000-0000-0000-000000000105';
