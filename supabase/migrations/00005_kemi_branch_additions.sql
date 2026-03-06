-- ============================================================
-- SEED: KEMI BRANCH ADDITIONS
-- Adds Yinka's husband (Lanre Dada) and their son (Damilare)
-- ============================================================

-- GENERATION 2: Spouse for Yinka (Kemi's daughter)
INSERT INTO family_tree_nodes (id, display_name, full_name, gender, generation, parent_node_id, branch, node_type, is_claimed, is_deceased)
VALUES
  ('00000000-0000-0000-0000-000000000105', 'Lanre Dada', 'Lanre Dada', 'male', 2, NULL, 'kemi', 'spouse', FALSE, FALSE);

-- GENERATION 3: Great-grandchild (Yinka & Lanre's son)
INSERT INTO family_tree_nodes (id, display_name, full_name, gender, generation, parent_node_id, branch, node_type, is_claimed, is_deceased)
VALUES
  ('00000000-0000-0000-0000-000000000106', 'Damilare', 'Damilare Dada', 'male', 3, '00000000-0000-0000-0000-000000000101', 'kemi', 'biological', FALSE, FALSE);

-- Update Yinka with married name and spouse link
UPDATE family_tree_nodes
SET full_name = 'Yinka Dada',
    spouse_node_id = '00000000-0000-0000-0000-000000000105'
WHERE id = '00000000-0000-0000-0000-000000000101';

-- Link Lanre Dada back to Yinka (bidirectional)
UPDATE family_tree_nodes
SET spouse_node_id = '00000000-0000-0000-0000-000000000101'
WHERE id = '00000000-0000-0000-0000-000000000105';
