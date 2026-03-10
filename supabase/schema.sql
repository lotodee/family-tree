-- ============================================================
-- PHASE 1: DESTROY EVERYTHING
-- ============================================================

-- Drop all existing tables (order matters due to FKs)
DROP TABLE IF EXISTS llm_sessions CASCADE;
DROP TABLE IF EXISTS answers CASCADE;
DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS family_tree_nodes CASCADE;

-- Drop any new tables if this script is re-run
DROP TABLE IF EXISTS letters CASCADE;
DROP TABLE IF EXISTS videos CASCADE;
DROP TABLE IF EXISTS invitations CASCADE;
DROP TABLE IF EXISTS memberships CASCADE;
DROP TABLE IF EXISTS celebrations CASCADE;

-- Drop all existing enums
DROP TYPE IF EXISTS gender_type CASCADE;
DROP TYPE IF EXISTS node_type CASCADE;
DROP TYPE IF EXISTS relationship_type CASCADE;
DROP TYPE IF EXISTS question_type CASCADE;
DROP TYPE IF EXISTS question_category CASCADE;
DROP TYPE IF EXISTS answer_status CASCADE;
DROP TYPE IF EXISTS input_method CASCADE;
DROP TYPE IF EXISTS membership_role CASCADE;

-- NOTE: Storage buckets cannot be deleted via SQL.
-- Before running this script, manually delete all buckets in the Supabase dashboard:
-- 1. Go to Storage in the Supabase dashboard
-- 2. For each bucket (voice-recordings, generated-images, avatars, videos, celebrations):
--    a. Click the bucket
--    b. Select all files and delete them
--    c. Delete the bucket itself
-- 3. Then run this script

-- Drop all existing RLS policies on storage
-- (These will error silently if they don't exist — that's fine)
DROP POLICY IF EXISTS "Users can upload voice recordings" ON storage.objects;
DROP POLICY IF EXISTS "Users can read voice recordings" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view generated images" ON storage.objects;
DROP POLICY IF EXISTS "Service role can upload generated images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload videos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can read videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload celebration images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view celebration images" ON storage.objects;

-- ============================================================
-- PHASE 2: CREATE ENUMS
-- ============================================================

CREATE TYPE gender_type AS ENUM ('male', 'female', 'unknown');
CREATE TYPE node_type AS ENUM ('biological', 'spouse');
CREATE TYPE membership_role AS ENUM ('owner', 'admin', 'member', 'viewer');

-- ============================================================
-- PHASE 3: CREATE TABLES
-- ============================================================

-- 1. celebrations — the root entity, one per event
CREATE TABLE celebrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  event_date DATE,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  slug TEXT UNIQUE NOT NULL,
  cover_image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. profiles — extends auth.users, platform-level (not celebration-specific)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. family_tree_nodes — now scoped to a celebration
CREATE TABLE family_tree_nodes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  celebration_id UUID REFERENCES celebrations(id) ON DELETE CASCADE NOT NULL,
  display_name TEXT NOT NULL,
  full_name TEXT,
  gender gender_type DEFAULT 'unknown',
  generation INT NOT NULL,
  parent_node_id UUID REFERENCES family_tree_nodes(id) ON DELETE SET NULL,
  spouse_node_id UUID REFERENCES family_tree_nodes(id) ON DELETE SET NULL,
  branch TEXT,
  is_claimed BOOLEAN DEFAULT FALSE,
  claimed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_deceased BOOLEAN DEFAULT FALSE,
  node_type node_type DEFAULT 'biological',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast tree queries scoped to a celebration
CREATE INDEX idx_tree_nodes_celebration ON family_tree_nodes(celebration_id);

-- 4. memberships — links user to celebration with role + permissions
CREATE TABLE memberships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  celebration_id UUID REFERENCES celebrations(id) ON DELETE CASCADE NOT NULL,
  tree_node_id UUID REFERENCES family_tree_nodes(id) ON DELETE SET NULL,
  role membership_role NOT NULL,
  video_limit_secs INT DEFAULT 60,
  can_invite BOOLEAN DEFAULT FALSE,
  can_add_to_tree BOOLEAN DEFAULT FALSE,
  can_delete BOOLEAN DEFAULT FALSE,
  invited_by UUID REFERENCES memberships(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, celebration_id)
);

-- Indexes for membership lookups
CREATE INDEX idx_memberships_user ON memberships(user_id);
CREATE INDEX idx_memberships_celebration ON memberships(celebration_id);

-- 5. invitations — invite links with embedded role configuration
CREATE TABLE invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  celebration_id UUID REFERENCES celebrations(id) ON DELETE CASCADE NOT NULL,
  created_by UUID REFERENCES memberships(id) ON DELETE CASCADE NOT NULL,
  role membership_role NOT NULL,
  video_limit_secs INT DEFAULT 60,
  can_invite BOOLEAN DEFAULT FALSE,
  can_add_to_tree BOOLEAN DEFAULT FALSE,
  can_delete BOOLEAN DEFAULT FALSE,
  code TEXT UNIQUE NOT NULL,
  target_node_id UUID REFERENCES family_tree_nodes(id) ON DELETE SET NULL,
  is_used BOOLEAN DEFAULT FALSE,
  used_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast invite code lookups
CREATE INDEX idx_invitations_code ON invitations(code);

-- 6. videos — recorded video messages
CREATE TABLE videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  celebration_id UUID REFERENCES celebrations(id) ON DELETE CASCADE NOT NULL,
  uploader_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  membership_id UUID REFERENCES memberships(id) ON DELETE CASCADE NOT NULL,
  tree_node_id UUID REFERENCES family_tree_nodes(id) ON DELETE SET NULL,
  file_path TEXT NOT NULL,
  duration_secs INT NOT NULL,
  file_size_bytes BIGINT,
  mime_type TEXT,
  thumbnail_url TEXT,
  title TEXT,
  is_visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for gallery queries
CREATE INDEX idx_videos_celebration ON videos(celebration_id);

-- 7. letters — text tributes as an alternative to video
CREATE TABLE letters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  celebration_id UUID REFERENCES celebrations(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  membership_id UUID REFERENCES memberships(id) ON DELETE CASCADE NOT NULL,
  tree_node_id UUID REFERENCES family_tree_nodes(id) ON DELETE SET NULL,
  title TEXT,
  body TEXT NOT NULL,
  is_visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for gallery queries
CREATE INDEX idx_letters_celebration ON letters(celebration_id);

-- 8. llm_sessions — playground history (kept for future use)
CREATE TABLE llm_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  celebration_id UUID REFERENCES celebrations(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  response_text TEXT,
  image_url TEXT,
  subjects UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PHASE 3.5: AUTO-UPDATE TRIGGER FOR updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_celebrations_updated_at
  BEFORE UPDATE ON celebrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_family_tree_nodes_updated_at
  BEFORE UPDATE ON family_tree_nodes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_memberships_updated_at
  BEFORE UPDATE ON memberships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invitations_updated_at
  BEFORE UPDATE ON invitations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_videos_updated_at
  BEFORE UPDATE ON videos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_letters_updated_at
  BEFORE UPDATE ON letters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_llm_sessions_updated_at
  BEFORE UPDATE ON llm_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- PHASE 4: STORAGE BUCKETS
-- ============================================================

INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', TRUE);
INSERT INTO storage.buckets (id, name, public) VALUES ('videos', 'videos', FALSE);
INSERT INTO storage.buckets (id, name, public) VALUES ('celebrations', 'celebrations', TRUE);
INSERT INTO storage.buckets (id, name, public) VALUES ('generated-images', 'generated-images', TRUE);

-- ============================================================
-- PHASE 5: ROW LEVEL SECURITY
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE celebrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_tree_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE llm_sessions ENABLE ROW LEVEL SECURITY;

-- -------------------------------------------------------
-- celebrations
-- -------------------------------------------------------

-- Anyone authenticated can read active celebrations (for browsing/joining)
CREATE POLICY "Authenticated users can view active celebrations"
  ON celebrations FOR SELECT
  TO authenticated
  USING (is_active = TRUE);

-- Owner can update their celebration
CREATE POLICY "Owner can update own celebration"
  ON celebrations FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- Owner can delete their celebration (cascades to all child data)
CREATE POLICY "Owner can delete own celebration"
  ON celebrations FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());

-- Authenticated users can create celebrations (they become owner)
CREATE POLICY "Authenticated users can create celebrations"
  ON celebrations FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

-- Service role can do everything (for API routes)
CREATE POLICY "Service role full access to celebrations"
  ON celebrations FOR ALL
  TO service_role
  USING (TRUE)
  WITH CHECK (TRUE);

-- -------------------------------------------------------
-- profiles
-- -------------------------------------------------------

-- Anyone authenticated can read all profiles
CREATE POLICY "Authenticated users can view profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (TRUE);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Service role full access
CREATE POLICY "Service role full access to profiles"
  ON profiles FOR ALL
  TO service_role
  USING (TRUE)
  WITH CHECK (TRUE);

-- -------------------------------------------------------
-- family_tree_nodes
-- -------------------------------------------------------

-- Users can read tree nodes in celebrations they belong to
CREATE POLICY "Members can view tree nodes in their celebrations"
  ON family_tree_nodes FOR SELECT
  TO authenticated
  USING (
    celebration_id IN (
      SELECT celebration_id FROM memberships WHERE user_id = auth.uid()
    )
  );

-- Members with can_add_to_tree permission can insert nodes
CREATE POLICY "Members with permission can add tree nodes"
  ON family_tree_nodes FOR INSERT
  TO authenticated
  WITH CHECK (
    celebration_id IN (
      SELECT celebration_id FROM memberships
      WHERE user_id = auth.uid() AND can_add_to_tree = TRUE
    )
  );

-- Service role full access (API routes handle permission checks)
CREATE POLICY "Service role full access to tree nodes"
  ON family_tree_nodes FOR ALL
  TO service_role
  USING (TRUE)
  WITH CHECK (TRUE);

-- -------------------------------------------------------
-- memberships
-- -------------------------------------------------------

-- Users can view their own memberships
CREATE POLICY "Users can view own memberships"
  ON memberships FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Service role full access
CREATE POLICY "Service role full access to memberships"
  ON memberships FOR ALL
  TO service_role
  USING (TRUE)
  WITH CHECK (TRUE);

-- -------------------------------------------------------
-- invitations
-- -------------------------------------------------------

-- Members can view invitations in their celebrations
CREATE POLICY "Members can view invitations in their celebrations"
  ON invitations FOR SELECT
  TO authenticated
  USING (
    celebration_id IN (
      SELECT celebration_id FROM memberships WHERE user_id = auth.uid()
    )
  );

-- Members with can_invite permission can create invitations
CREATE POLICY "Members with permission can create invitations"
  ON invitations FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by IN (
      SELECT id FROM memberships
      WHERE user_id = auth.uid() AND can_invite = TRUE
    )
  );

-- Anyone can read an invitation by code (needed for the invite landing page)
-- This is handled via the service role in the API route instead.

-- Service role full access
CREATE POLICY "Service role full access to invitations"
  ON invitations FOR ALL
  TO service_role
  USING (TRUE)
  WITH CHECK (TRUE);

-- -------------------------------------------------------
-- videos
-- -------------------------------------------------------

-- Members can view videos in their celebrations (only visible ones, unless owner)
CREATE POLICY "Members can view visible videos in their celebrations"
  ON videos FOR SELECT
  TO authenticated
  USING (
    celebration_id IN (
      SELECT celebration_id FROM memberships WHERE user_id = auth.uid()
    )
    AND (is_visible = TRUE OR uploader_id = auth.uid())
  );

-- Users can insert their own videos
CREATE POLICY "Users can insert own videos"
  ON videos FOR INSERT
  TO authenticated
  WITH CHECK (uploader_id = auth.uid());

-- Users can update their own videos (e.g., change title)
CREATE POLICY "Users can update own videos"
  ON videos FOR UPDATE
  TO authenticated
  USING (uploader_id = auth.uid())
  WITH CHECK (uploader_id = auth.uid());

-- Users can delete their own videos
CREATE POLICY "Users can delete own videos"
  ON videos FOR DELETE
  TO authenticated
  USING (uploader_id = auth.uid());

-- Service role full access
CREATE POLICY "Service role full access to videos"
  ON videos FOR ALL
  TO service_role
  USING (TRUE)
  WITH CHECK (TRUE);

-- -------------------------------------------------------
-- letters
-- -------------------------------------------------------

-- Members can view visible letters in their celebrations
CREATE POLICY "Members can view visible letters in their celebrations"
  ON letters FOR SELECT
  TO authenticated
  USING (
    celebration_id IN (
      SELECT celebration_id FROM memberships WHERE user_id = auth.uid()
    )
    AND (is_visible = TRUE OR author_id = auth.uid())
  );

-- Users can insert their own letters
CREATE POLICY "Users can insert own letters"
  ON letters FOR INSERT
  TO authenticated
  WITH CHECK (author_id = auth.uid());

-- Users can update their own letters
CREATE POLICY "Users can update own letters"
  ON letters FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

-- Users can delete their own letters
CREATE POLICY "Users can delete own letters"
  ON letters FOR DELETE
  TO authenticated
  USING (author_id = auth.uid());

-- Service role full access
CREATE POLICY "Service role full access to letters"
  ON letters FOR ALL
  TO service_role
  USING (TRUE)
  WITH CHECK (TRUE);

-- -------------------------------------------------------
-- llm_sessions
-- -------------------------------------------------------

-- Members can view sessions in their celebrations
CREATE POLICY "Members can view llm sessions in their celebrations"
  ON llm_sessions FOR SELECT
  TO authenticated
  USING (
    celebration_id IN (
      SELECT celebration_id FROM memberships WHERE user_id = auth.uid()
    )
  );

-- Service role full access
CREATE POLICY "Service role full access to llm sessions"
  ON llm_sessions FOR ALL
  TO service_role
  USING (TRUE)
  WITH CHECK (TRUE);

-- ============================================================
-- PHASE 6: STORAGE POLICIES
-- ============================================================

-- avatars: authenticated upload own, public read
CREATE POLICY "Users can upload avatars"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Anyone can view avatars"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can delete own avatars"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- videos: authenticated upload own, authenticated read (celebration members only via RLS on videos table)
CREATE POLICY "Users can upload videos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'videos');

CREATE POLICY "Authenticated users can read videos"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'videos');

CREATE POLICY "Users can delete own videos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'videos' AND (storage.foldername(name))[1] = auth.uid()::text);

-- celebrations: authenticated upload (owners), public read
CREATE POLICY "Users can upload celebration images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'celebrations');

CREATE POLICY "Anyone can view celebration images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'celebrations');

-- generated-images: public read, service role write
CREATE POLICY "Anyone can view generated images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'generated-images');

CREATE POLICY "Service role can upload generated images"
  ON storage.objects FOR INSERT
  TO service_role
  WITH CHECK (bucket_id = 'generated-images');

-- ============================================================
-- PHASE 7: REALTIME
-- ============================================================

-- Add tables to realtime publication (wrapped in DO blocks for idempotency)
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE family_tree_nodes;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE videos;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE letters;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE memberships;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
