-- ============================================================
-- 1. ADD HONOREE TO CELEBRATIONS
-- ============================================================

ALTER TABLE celebrations
ADD COLUMN IF NOT EXISTS honoree_node_id UUID REFERENCES family_tree_nodes(id) ON DELETE SET NULL;

-- ============================================================
-- 2. CREATE RELATIONSHIP TYPE
-- ============================================================

-- We use TEXT instead of an enum so we can add relationship types
-- later without a migration. The application layer validates the values.

-- ============================================================
-- 3. CREATE FAMILY RELATIONSHIPS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS family_relationships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  celebration_id UUID REFERENCES celebrations(id) ON DELETE CASCADE NOT NULL,
  from_node_id UUID REFERENCES family_tree_nodes(id) ON DELETE CASCADE NOT NULL,
  to_node_id UUID REFERENCES family_tree_nodes(id) ON DELETE CASCADE NOT NULL,
  relationship_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- One relationship type per pair of people
  UNIQUE(from_node_id, to_node_id, relationship_type)
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_relationships_celebration ON family_relationships(celebration_id);
CREATE INDEX IF NOT EXISTS idx_relationships_from ON family_relationships(from_node_id);
CREATE INDEX IF NOT EXISTS idx_relationships_to ON family_relationships(to_node_id);

-- ============================================================
-- 4. AUTO-UPDATE TRIGGER FOR updated_at
-- ============================================================

-- The update_updated_at_column function already exists from schema.sql
-- Just add the trigger for the new table

CREATE TRIGGER update_family_relationships_updated_at
  BEFORE UPDATE ON family_relationships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 5. ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE family_relationships ENABLE ROW LEVEL SECURITY;

-- Members can view relationships in their celebrations
CREATE POLICY "Members can view relationships in their celebrations"
  ON family_relationships FOR SELECT
  TO authenticated
  USING (
    celebration_id IN (
      SELECT celebration_id FROM memberships WHERE user_id = auth.uid()
    )
  );

-- Members with tree permission can add relationships
CREATE POLICY "Members with permission can add relationships"
  ON family_relationships FOR INSERT
  TO authenticated
  WITH CHECK (
    celebration_id IN (
      SELECT celebration_id FROM memberships
      WHERE user_id = auth.uid() AND can_add_to_tree = TRUE
    )
  );

-- Members with tree permission can delete relationships
CREATE POLICY "Members with permission can delete relationships"
  ON family_relationships FOR DELETE
  TO authenticated
  USING (
    celebration_id IN (
      SELECT celebration_id FROM memberships
      WHERE user_id = auth.uid() AND can_add_to_tree = TRUE
    )
  );

-- Members with tree permission can update relationships
CREATE POLICY "Members with permission can update relationships"
  ON family_relationships FOR UPDATE
  TO authenticated
  USING (
    celebration_id IN (
      SELECT celebration_id FROM memberships
      WHERE user_id = auth.uid() AND can_add_to_tree = TRUE
    )
  )
  WITH CHECK (
    celebration_id IN (
      SELECT celebration_id FROM memberships
      WHERE user_id = auth.uid() AND can_add_to_tree = TRUE
    )
  );

-- Service role full access
CREATE POLICY "Service role full access to relationships"
  ON family_relationships FOR ALL
  TO service_role
  USING (TRUE)
  WITH CHECK (TRUE);

-- ============================================================
-- 6. ADD TO REALTIME
-- ============================================================

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE family_relationships;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
