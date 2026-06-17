-- ============================================================
-- SEED: FAMILY TREE NODES (demo data — all fictional)
-- ============================================================

-- GENERATION 0: Grandparents (root)
INSERT INTO family_tree_nodes (id, display_name, full_name, gender, generation, parent_node_id, branch, node_type)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Grandpa', 'John Doe', 'male', 0, NULL, NULL, 'biological'),
  ('00000000-0000-0000-0000-000000000002', 'Grandma', 'Jane Doe', 'female', 0, NULL, NULL, 'spouse');

-- Link spouses
UPDATE family_tree_nodes SET spouse_node_id = '00000000-0000-0000-0000-000000000002' WHERE id = '00000000-0000-0000-0000-000000000001';
UPDATE family_tree_nodes SET spouse_node_id = '00000000-0000-0000-0000-000000000001' WHERE id = '00000000-0000-0000-0000-000000000002';

-- GENERATION 1: Children (8 total)
INSERT INTO family_tree_nodes (id, display_name, full_name, gender, generation, parent_node_id, branch, node_type)
VALUES
  ('00000000-0000-0000-0000-000000000010', 'Member One', 'One Doe', 'female', 1, '00000000-0000-0000-0000-000000000001', 'b1', 'biological'),
  ('00000000-0000-0000-0000-000000000020', 'Member Two', 'Two Doe', 'female', 1, '00000000-0000-0000-0000-000000000001', 'b2', 'biological'),
  ('00000000-0000-0000-0000-000000000030', 'Member Three', 'Three Doe', 'female', 1, '00000000-0000-0000-0000-000000000001', 'b3', 'biological'),
  ('00000000-0000-0000-0000-000000000040', 'Member Four', 'Four Doe', 'male', 1, '00000000-0000-0000-0000-000000000001', 'b4', 'biological'),
  ('00000000-0000-0000-0000-000000000050', 'Member Five', 'Five Doe', 'female', 1, '00000000-0000-0000-0000-000000000001', 'b5', 'biological'),
  ('00000000-0000-0000-0000-000000000060', 'Member Six', 'Six Doe', 'male', 1, '00000000-0000-0000-0000-000000000001', 'b6', 'biological'),
  ('00000000-0000-0000-0000-000000000070', 'Member Seven', 'Seven Doe', 'male', 1, '00000000-0000-0000-0000-000000000001', 'b7', 'biological'),
  ('00000000-0000-0000-0000-000000000080', 'Member Eight', 'Eight Doe', 'male', 1, '00000000-0000-0000-0000-000000000001', 'b8', 'biological');

-- GENERATION 1: Spouses (6 total)
INSERT INTO family_tree_nodes (id, display_name, full_name, gender, generation, parent_node_id, branch, node_type)
VALUES
  ('00000000-0000-0000-0000-000000000011', 'Spouse One', 'Spouse One Roe', 'male', 1, NULL, 'b1', 'spouse'),
  ('00000000-0000-0000-0000-000000000021', 'Spouse Two', 'Spouse Two Roe', 'male', 1, NULL, 'b2', 'spouse'),
  ('00000000-0000-0000-0000-000000000031', 'Spouse Three', 'Spouse Three Roe', 'male', 1, NULL, 'b3', 'spouse'),
  ('00000000-0000-0000-0000-000000000041', 'Spouse Four', 'Spouse Four Roe', 'female', 1, NULL, 'b4', 'spouse'),
  ('00000000-0000-0000-0000-000000000051', 'Spouse Five', 'Spouse Five Roe', 'male', 1, NULL, 'b5', 'spouse'),
  ('00000000-0000-0000-0000-000000000061', 'Spouse Six', 'Spouse Six Roe', 'female', 1, NULL, 'b6', 'spouse');

-- Mark Spouse Three as deceased
UPDATE family_tree_nodes SET is_deceased = TRUE WHERE id = '00000000-0000-0000-0000-000000000031';

-- Link all spouses bidirectionally
UPDATE family_tree_nodes SET spouse_node_id = '00000000-0000-0000-0000-000000000011' WHERE id = '00000000-0000-0000-0000-000000000010';
UPDATE family_tree_nodes SET spouse_node_id = '00000000-0000-0000-0000-000000000010' WHERE id = '00000000-0000-0000-0000-000000000011';
UPDATE family_tree_nodes SET spouse_node_id = '00000000-0000-0000-0000-000000000021' WHERE id = '00000000-0000-0000-0000-000000000020';
UPDATE family_tree_nodes SET spouse_node_id = '00000000-0000-0000-0000-000000000020' WHERE id = '00000000-0000-0000-0000-000000000021';
UPDATE family_tree_nodes SET spouse_node_id = '00000000-0000-0000-0000-000000000031' WHERE id = '00000000-0000-0000-0000-000000000030';
UPDATE family_tree_nodes SET spouse_node_id = '00000000-0000-0000-0000-000000000030' WHERE id = '00000000-0000-0000-0000-000000000031';
UPDATE family_tree_nodes SET spouse_node_id = '00000000-0000-0000-0000-000000000041' WHERE id = '00000000-0000-0000-0000-000000000040';
UPDATE family_tree_nodes SET spouse_node_id = '00000000-0000-0000-0000-000000000040' WHERE id = '00000000-0000-0000-0000-000000000041';
UPDATE family_tree_nodes SET spouse_node_id = '00000000-0000-0000-0000-000000000051' WHERE id = '00000000-0000-0000-0000-000000000050';
UPDATE family_tree_nodes SET spouse_node_id = '00000000-0000-0000-0000-000000000050' WHERE id = '00000000-0000-0000-0000-000000000051';
UPDATE family_tree_nodes SET spouse_node_id = '00000000-0000-0000-0000-000000000061' WHERE id = '00000000-0000-0000-0000-000000000060';
UPDATE family_tree_nodes SET spouse_node_id = '00000000-0000-0000-0000-000000000060' WHERE id = '00000000-0000-0000-0000-000000000061';

-- GENERATION 2: Grandchildren (19 total)

-- Branch b1 children (parent: Member One) - 4 children
INSERT INTO family_tree_nodes (id, display_name, full_name, gender, generation, parent_node_id, branch, node_type)
VALUES
  ('00000000-0000-0000-0000-000000000101', 'Grandchild A', 'A Doe', 'female', 2, '00000000-0000-0000-0000-000000000010', 'b1', 'biological'),
  ('00000000-0000-0000-0000-000000000102', 'Grandchild B', 'B Doe', 'female', 2, '00000000-0000-0000-0000-000000000010', 'b1', 'biological'),
  ('00000000-0000-0000-0000-000000000103', 'Grandchild C', 'C Doe', 'male', 2, '00000000-0000-0000-0000-000000000010', 'b1', 'biological'),
  ('00000000-0000-0000-0000-000000000104', 'Grandchild D', 'D Doe', 'male', 2, '00000000-0000-0000-0000-000000000010', 'b1', 'biological');

-- Branch b2 children (parent: Member Two) - 3 children
INSERT INTO family_tree_nodes (id, display_name, full_name, gender, generation, parent_node_id, branch, node_type)
VALUES
  ('00000000-0000-0000-0000-000000000201', 'Grandchild E', 'E Roe', 'female', 2, '00000000-0000-0000-0000-000000000020', 'b2', 'biological'),
  ('00000000-0000-0000-0000-000000000202', 'Grandchild F', 'F Roe', 'male', 2, '00000000-0000-0000-0000-000000000020', 'b2', 'biological'),
  ('00000000-0000-0000-0000-000000000203', 'Grandchild G', 'G Roe', 'male', 2, '00000000-0000-0000-0000-000000000020', 'b2', 'biological');

-- Branch b3 children (parent: Member Three) - 5 children
INSERT INTO family_tree_nodes (id, display_name, full_name, gender, generation, parent_node_id, branch, node_type)
VALUES
  ('00000000-0000-0000-0000-000000000301', 'Grandchild H', 'H Roe', 'male', 2, '00000000-0000-0000-0000-000000000030', 'b3', 'biological'),
  ('00000000-0000-0000-0000-000000000302', 'Grandchild I', 'I Roe', 'female', 2, '00000000-0000-0000-0000-000000000030', 'b3', 'biological'),
  ('00000000-0000-0000-0000-000000000303', 'Grandchild J', 'J Roe', 'female', 2, '00000000-0000-0000-0000-000000000030', 'b3', 'biological'),
  ('00000000-0000-0000-0000-000000000304', 'Grandchild K', 'K Roe', 'male', 2, '00000000-0000-0000-0000-000000000030', 'b3', 'biological'),
  ('00000000-0000-0000-0000-000000000305', 'Grandchild L', 'L Roe', 'male', 2, '00000000-0000-0000-0000-000000000030', 'b3', 'biological');

-- Branch b4 children (parent: Member Four) - 3 children
INSERT INTO family_tree_nodes (id, display_name, full_name, gender, generation, parent_node_id, branch, node_type)
VALUES
  ('00000000-0000-0000-0000-000000000401', 'Grandchild M', 'M Doe', 'female', 2, '00000000-0000-0000-0000-000000000040', 'b4', 'biological'),
  ('00000000-0000-0000-0000-000000000402', 'Grandchild N', 'N Doe', 'female', 2, '00000000-0000-0000-0000-000000000040', 'b4', 'biological'),
  ('00000000-0000-0000-0000-000000000403', 'Grandchild O', 'O Doe', 'male', 2, '00000000-0000-0000-0000-000000000040', 'b4', 'biological');

-- Branch b5 children (parent: Member Five) - 3 children
INSERT INTO family_tree_nodes (id, display_name, full_name, gender, generation, parent_node_id, branch, node_type)
VALUES
  ('00000000-0000-0000-0000-000000000501', 'Grandchild P', 'P Roe', 'male', 2, '00000000-0000-0000-0000-000000000050', 'b5', 'biological'),
  ('00000000-0000-0000-0000-000000000502', 'Grandchild Q', 'Q Roe', 'female', 2, '00000000-0000-0000-0000-000000000050', 'b5', 'biological'),
  ('00000000-0000-0000-0000-000000000503', 'Grandchild R', 'R Roe', 'female', 2, '00000000-0000-0000-0000-000000000050', 'b5', 'biological');

-- Branch b6 children (parent: Member Six) - 1 child
INSERT INTO family_tree_nodes (id, display_name, full_name, gender, generation, parent_node_id, branch, node_type)
VALUES
  ('00000000-0000-0000-0000-000000000601', 'Grandchild S', 'S Doe', 'female', 2, '00000000-0000-0000-0000-000000000060', 'b6', 'biological');

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
  ('What is a tradition you love most about this family?', 'self', 'funny', 6),
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
