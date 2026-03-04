-- ============================================================
-- SEED: FAMILY TREE NODES
-- ============================================================

-- GENERATION 0: Grandpa and Grandma (root)
INSERT INTO family_tree_nodes (id, display_name, full_name, gender, generation, parent_node_id, branch, node_type)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Grandpa Michael', 'Michael Ademiluyi', 'male', 0, NULL, NULL, 'biological'),
  ('00000000-0000-0000-0000-000000000002', 'Grandma Racheal', 'Racheal Ademiluyi', 'female', 0, NULL, NULL, 'spouse');

-- Link spouses
UPDATE family_tree_nodes SET spouse_node_id = '00000000-0000-0000-0000-000000000002' WHERE id = '00000000-0000-0000-0000-000000000001';
UPDATE family_tree_nodes SET spouse_node_id = '00000000-0000-0000-0000-000000000001' WHERE id = '00000000-0000-0000-0000-000000000002';

-- GENERATION 1: Children of Michael (8 total)
INSERT INTO family_tree_nodes (id, display_name, full_name, gender, generation, parent_node_id, branch, node_type)
VALUES
  ('00000000-0000-0000-0000-000000000010', 'Kemi', 'Kemi Ademiluyi', 'female', 1, '00000000-0000-0000-0000-000000000001', 'kemi', 'biological'),
  ('00000000-0000-0000-0000-000000000020', 'Sola', 'Sola Ademiluyi', 'female', 1, '00000000-0000-0000-0000-000000000001', 'sola', 'biological'),
  ('00000000-0000-0000-0000-000000000030', 'Bunmi', 'Bunmi Ademiluyi', 'female', 1, '00000000-0000-0000-0000-000000000001', 'bunmi', 'biological'),
  ('00000000-0000-0000-0000-000000000040', 'Wale', 'Wale Ademiluyi', 'male', 1, '00000000-0000-0000-0000-000000000001', 'wale', 'biological'),
  ('00000000-0000-0000-0000-000000000050', 'Ronke', 'Ronke Ademiluyi', 'female', 1, '00000000-0000-0000-0000-000000000001', 'ronke', 'biological'),
  ('00000000-0000-0000-0000-000000000060', 'Lanre', 'Lanre Ademiluyi', 'male', 1, '00000000-0000-0000-0000-000000000001', 'lanre', 'biological'),
  ('00000000-0000-0000-0000-000000000070', 'Akeem', 'Akeem Ademiluyi', 'male', 1, '00000000-0000-0000-0000-000000000001', 'akeem', 'biological'),
  ('00000000-0000-0000-0000-000000000080', 'Leke', 'Leke Ademiluyi', 'male', 1, '00000000-0000-0000-0000-000000000001', 'leke', 'biological');

-- GENERATION 1: Spouses (6 total)
INSERT INTO family_tree_nodes (id, display_name, full_name, gender, generation, parent_node_id, branch, node_type)
VALUES
  ('00000000-0000-0000-0000-000000000011', 'Deji Loto', 'Deji Loto', 'male', 1, NULL, 'kemi', 'spouse'),
  ('00000000-0000-0000-0000-000000000021', 'Anthony Aralepo', 'Anthony Aralepo', 'male', 1, NULL, 'sola', 'spouse'),
  ('00000000-0000-0000-0000-000000000031', 'Deji Ogunlola', 'Deji Ogunlola', 'male', 1, NULL, 'bunmi', 'spouse'),
  ('00000000-0000-0000-0000-000000000041', 'Toyin', 'Toyin Ademiluyi', 'female', 1, NULL, 'wale', 'spouse'),
  ('00000000-0000-0000-0000-000000000051', 'John Wealth', 'John Wealth', 'male', 1, NULL, 'ronke', 'spouse'),
  ('00000000-0000-0000-0000-000000000061', 'Shayo', 'Shayo Ademiluyi', 'female', 1, NULL, 'lanre', 'spouse');

-- Mark Deji Ogunlola as deceased
UPDATE family_tree_nodes SET is_deceased = TRUE WHERE id = '00000000-0000-0000-0000-000000000031';

-- Link all spouses bidirectionally
UPDATE family_tree_nodes SET spouse_node_id = '00000000-0000-0000-0000-000000000011' WHERE id = '00000000-0000-0000-0000-000000000010'; -- Kemi <-> Deji Loto
UPDATE family_tree_nodes SET spouse_node_id = '00000000-0000-0000-0000-000000000010' WHERE id = '00000000-0000-0000-0000-000000000011';
UPDATE family_tree_nodes SET spouse_node_id = '00000000-0000-0000-0000-000000000021' WHERE id = '00000000-0000-0000-0000-000000000020'; -- Sola <-> Anthony
UPDATE family_tree_nodes SET spouse_node_id = '00000000-0000-0000-0000-000000000020' WHERE id = '00000000-0000-0000-0000-000000000021';
UPDATE family_tree_nodes SET spouse_node_id = '00000000-0000-0000-0000-000000000031' WHERE id = '00000000-0000-0000-0000-000000000030'; -- Bunmi <-> Late Deji
UPDATE family_tree_nodes SET spouse_node_id = '00000000-0000-0000-0000-000000000030' WHERE id = '00000000-0000-0000-0000-000000000031';
UPDATE family_tree_nodes SET spouse_node_id = '00000000-0000-0000-0000-000000000041' WHERE id = '00000000-0000-0000-0000-000000000040'; -- Wale <-> Toyin
UPDATE family_tree_nodes SET spouse_node_id = '00000000-0000-0000-0000-000000000040' WHERE id = '00000000-0000-0000-0000-000000000041';
UPDATE family_tree_nodes SET spouse_node_id = '00000000-0000-0000-0000-000000000051' WHERE id = '00000000-0000-0000-0000-000000000050'; -- Ronke <-> John
UPDATE family_tree_nodes SET spouse_node_id = '00000000-0000-0000-0000-000000000050' WHERE id = '00000000-0000-0000-0000-000000000051';
UPDATE family_tree_nodes SET spouse_node_id = '00000000-0000-0000-0000-000000000061' WHERE id = '00000000-0000-0000-0000-000000000060'; -- Lanre <-> Shayo
UPDATE family_tree_nodes SET spouse_node_id = '00000000-0000-0000-0000-000000000060' WHERE id = '00000000-0000-0000-0000-000000000061';

-- GENERATION 2: Grandchildren (19 total)

-- Kemi & Deji Loto's children (parent: Kemi) - 4 children
INSERT INTO family_tree_nodes (id, display_name, full_name, gender, generation, parent_node_id, branch, node_type)
VALUES
  ('00000000-0000-0000-0000-000000000101', 'Yinka', 'Yinka Loto', 'female', 2, '00000000-0000-0000-0000-000000000010', 'kemi', 'biological'),
  ('00000000-0000-0000-0000-000000000102', 'Olamide', 'Olamide Loto', 'female', 2, '00000000-0000-0000-0000-000000000010', 'kemi', 'biological'),
  ('00000000-0000-0000-0000-000000000103', 'Dotun', 'Dotun Loto', 'male', 2, '00000000-0000-0000-0000-000000000010', 'kemi', 'biological'),
  ('00000000-0000-0000-0000-000000000104', 'Irewole', 'Irewole Loto', 'male', 2, '00000000-0000-0000-0000-000000000010', 'kemi', 'biological');

-- Sola & Anthony Aralepo's children (parent: Sola) - 3 children
INSERT INTO family_tree_nodes (id, display_name, full_name, gender, generation, parent_node_id, branch, node_type)
VALUES
  ('00000000-0000-0000-0000-000000000201', 'Praise', 'Praise Aralepo', 'female', 2, '00000000-0000-0000-0000-000000000020', 'sola', 'biological'),
  ('00000000-0000-0000-0000-000000000202', 'Promise', 'Promise Aralepo', 'male', 2, '00000000-0000-0000-0000-000000000020', 'sola', 'biological'),
  ('00000000-0000-0000-0000-000000000203', 'Purpose', 'Purpose Aralepo', 'male', 2, '00000000-0000-0000-0000-000000000020', 'sola', 'biological');

-- Bunmi & Late Deji Ogunlola's children (parent: Bunmi) - 5 children
INSERT INTO family_tree_nodes (id, display_name, full_name, gender, generation, parent_node_id, branch, node_type)
VALUES
  ('00000000-0000-0000-0000-000000000301', 'Dami', 'Dami Ogunlola', 'male', 2, '00000000-0000-0000-0000-000000000030', 'bunmi', 'biological'),
  ('00000000-0000-0000-0000-000000000302', 'Lolade', 'Lolade Ogunlola', 'female', 2, '00000000-0000-0000-0000-000000000030', 'bunmi', 'biological'),
  ('00000000-0000-0000-0000-000000000303', 'Busola', 'Busola Ogunlola', 'female', 2, '00000000-0000-0000-0000-000000000030', 'bunmi', 'biological'),
  ('00000000-0000-0000-0000-000000000304', 'Kenny', 'Kenny Ogunlola', 'male', 2, '00000000-0000-0000-0000-000000000030', 'bunmi', 'biological'),
  ('00000000-0000-0000-0000-000000000305', 'Taiwo', 'Taiwo Ogunlola', 'male', 2, '00000000-0000-0000-0000-000000000030', 'bunmi', 'biological');

-- Wale & Toyin's children (parent: Wale) - 3 children
INSERT INTO family_tree_nodes (id, display_name, full_name, gender, generation, parent_node_id, branch, node_type)
VALUES
  ('00000000-0000-0000-0000-000000000401', 'Lily', 'Lily Ademiluyi', 'female', 2, '00000000-0000-0000-0000-000000000040', 'wale', 'biological'),
  ('00000000-0000-0000-0000-000000000402', 'Olive', 'Olive Ademiluyi', 'female', 2, '00000000-0000-0000-0000-000000000040', 'wale', 'biological'),
  ('00000000-0000-0000-0000-000000000403', 'Ark', 'Ark Ademiluyi', 'male', 2, '00000000-0000-0000-0000-000000000040', 'wale', 'biological');

-- Ronke & John Wealth's children (parent: Ronke) - 3 children
INSERT INTO family_tree_nodes (id, display_name, full_name, gender, generation, parent_node_id, branch, node_type)
VALUES
  ('00000000-0000-0000-0000-000000000501', 'Tofunmi', 'Tofunmi Wealth', 'male', 2, '00000000-0000-0000-0000-000000000050', 'ronke', 'biological'),
  ('00000000-0000-0000-0000-000000000502', 'Toni', 'Toni Wealth', 'female', 2, '00000000-0000-0000-0000-000000000050', 'ronke', 'biological'),
  ('00000000-0000-0000-0000-000000000503', 'Tamilore', 'Tamilore Wealth', 'female', 2, '00000000-0000-0000-0000-000000000050', 'ronke', 'biological');

-- Lanre & Shayo's children (parent: Lanre) - 1 child
INSERT INTO family_tree_nodes (id, display_name, full_name, gender, generation, parent_node_id, branch, node_type)
VALUES
  ('00000000-0000-0000-0000-000000000601', 'Adunmi', 'Adunmi Ademiluyi', 'female', 2, '00000000-0000-0000-0000-000000000060', 'lanre', 'biological');

-- ============================================================
-- SEED: QUESTIONS
-- ============================================================

-- Self questions (10)
INSERT INTO questions (text, type, category, display_order) VALUES
  ('What is your happiest memory with Grandpa?', 'self', 'memories', 1),
  ('What is something Grandpa taught you that you still carry with you today?', 'self', 'heartfelt', 2),
  ('Describe yourself in a way that would make everyone in the family laugh.', 'self', 'funny', 3),
  ('What is one thing about you that most of the family probably doesn''t know?', 'self', 'personality', 4),
  ('If you could relive one family gathering, which one would it be and why?', 'self', 'memories', 5),
  ('What is the most Nigerian thing about you?', 'self', 'funny', 6),
  ('What does family mean to you in one honest paragraph?', 'self', 'heartfelt', 7),
  ('What is your biggest dream right now?', 'self', 'personality', 8),
  ('What would you want Grandpa to know about how he has shaped your life?', 'self', 'heartfelt', 9),
  ('If the family made a movie about your life, what would the title be and why?', 'self', 'funny', 10);

-- About-others questions (10)
INSERT INTO questions (text, type, category, display_order) VALUES
  ('What is the first word that comes to mind when you think of this person?', 'about_other', 'personality', 1),
  ('What is your funniest memory with this person?', 'about_other', 'funny', 2),
  ('How would you describe this person to a stranger?', 'about_other', 'personality', 3),
  ('What is something this person does that nobody else in the family does?', 'about_other', 'personality', 4),
  ('What is the kindest thing this person has ever done for you or someone you know?', 'about_other', 'heartfelt', 5),
  ('If this person were a character in a movie, who would they be and why?', 'about_other', 'funny', 6),
  ('What do you think this person''s superpower is?', 'about_other', 'funny', 7),
  ('What is one thing you admire about this person?', 'about_other', 'heartfelt', 8),
  ('What would this person be famous for if the whole world knew them?', 'about_other', 'personality', 9),
  ('In one sentence, why is this person important to the family?', 'about_other', 'heartfelt', 10);
