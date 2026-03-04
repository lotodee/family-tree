-- Allow anonymous users to view tree nodes for registration
-- This is needed because users are not authenticated when they first visit /register
CREATE POLICY "Anon can view tree nodes"
  ON family_tree_nodes FOR SELECT
  TO anon
  USING (TRUE);
