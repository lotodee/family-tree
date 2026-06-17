-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE gender_type AS ENUM ('male', 'female', 'unknown');
CREATE TYPE node_type AS ENUM ('biological', 'spouse');
CREATE TYPE relationship_type AS ENUM ('patriarch', 'matriarch', 'child', 'grandchild', 'spouse');
CREATE TYPE question_type AS ENUM ('self', 'about_other');
CREATE TYPE question_category AS ENUM ('personality', 'memories', 'funny', 'heartfelt', 'general');
CREATE TYPE answer_status AS ENUM ('draft', 'transcribing', 'review', 'confirmed');
CREATE TYPE input_method AS ENUM ('text', 'voice');

-- ============================================================
-- TABLES
-- ============================================================

-- Family tree nodes: the skeleton of the family tree.
-- Pre-seeded with all known family members.
-- People "claim" their node during registration.
CREATE TABLE family_tree_nodes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  display_name TEXT NOT NULL,
  full_name TEXT,
  gender gender_type DEFAULT 'unknown',
  generation INT NOT NULL,
  parent_node_id UUID REFERENCES family_tree_nodes(id),
  spouse_node_id UUID REFERENCES family_tree_nodes(id),
  branch TEXT,
  is_claimed BOOLEAN DEFAULT FALSE,
  claimed_by UUID,
  is_deceased BOOLEAN DEFAULT FALSE,
  node_type node_type DEFAULT 'biological',
  status TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profiles: extends Supabase Auth users with family-specific data.
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  relationship_type relationship_type NOT NULL,
  father_name TEXT,
  mother_name TEXT,
  tree_node_id UUID REFERENCES family_tree_nodes(id),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add FK from family_tree_nodes.claimed_by to profiles after profiles exists.
ALTER TABLE family_tree_nodes
  ADD CONSTRAINT fk_claimed_by FOREIGN KEY (claimed_by) REFERENCES profiles(id);

-- Questions: curated set of questions, pre-seeded.
CREATE TABLE questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  text TEXT NOT NULL,
  type question_type NOT NULL,
  category question_category DEFAULT 'general',
  is_active BOOLEAN DEFAULT TRUE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Answers: every response from every person about themselves or others.
CREATE TABLE answers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  respondent_id UUID REFERENCES profiles(id) NOT NULL,
  subject_id UUID REFERENCES family_tree_nodes(id) NOT NULL,
  question_id UUID REFERENCES questions(id) NOT NULL,
  answer_text TEXT,
  voice_url TEXT,
  raw_transcription TEXT,
  status answer_status DEFAULT 'draft',
  input_method input_method DEFAULT 'text',
  is_confirmed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unique constraint: one answer per respondent per question per subject.
ALTER TABLE answers
  ADD CONSTRAINT unique_answer UNIQUE (respondent_id, subject_id, question_id);

-- LLM sessions: event day playground prompts and responses.
CREATE TABLE llm_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  prompt TEXT NOT NULL,
  response_text TEXT,
  image_url TEXT,
  subjects UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================

INSERT INTO storage.buckets (id, name, public) VALUES ('voice-recordings', 'voice-recordings', FALSE);
INSERT INTO storage.buckets (id, name, public) VALUES ('generated-images', 'generated-images', TRUE);
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', TRUE);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Enable RLS on all tables.
ALTER TABLE family_tree_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE llm_sessions ENABLE ROW LEVEL SECURITY;

-- family_tree_nodes: anyone authenticated can read. Only service role updates claims.
CREATE POLICY "Anyone can view tree nodes"
  ON family_tree_nodes FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "Service role can insert tree nodes"
  ON family_tree_nodes FOR INSERT
  TO service_role
  WITH CHECK (TRUE);

CREATE POLICY "Service role can update tree nodes"
  ON family_tree_nodes FOR UPDATE
  TO service_role
  USING (TRUE)
  WITH CHECK (TRUE);

-- profiles: anyone authenticated can read all profiles. Users can update their own.
CREATE POLICY "Anyone can view profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Service role can also insert profiles (needed during registration).
CREATE POLICY "Service role can insert profiles"
  ON profiles FOR INSERT
  TO service_role
  WITH CHECK (TRUE);

-- questions: anyone authenticated can read. No user writes.
CREATE POLICY "Anyone can view questions"
  ON questions FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "Service role can manage questions"
  ON questions FOR ALL
  TO service_role
  USING (TRUE)
  WITH CHECK (TRUE);

-- answers: anyone authenticated can read all answers.
-- Users can only insert/update/delete their own answers.
CREATE POLICY "Anyone can view answers"
  ON answers FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "Users can insert own answers"
  ON answers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = respondent_id);

CREATE POLICY "Users can update own answers"
  ON answers FOR UPDATE
  TO authenticated
  USING (auth.uid() = respondent_id)
  WITH CHECK (auth.uid() = respondent_id);

CREATE POLICY "Users can delete own answers"
  ON answers FOR DELETE
  TO authenticated
  USING (auth.uid() = respondent_id);

-- llm_sessions: anyone authenticated can read. Only service role inserts.
CREATE POLICY "Anyone can view llm sessions"
  ON llm_sessions FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "Service role can insert llm sessions"
  ON llm_sessions FOR INSERT
  TO service_role
  WITH CHECK (TRUE);

-- ============================================================
-- STORAGE POLICIES
-- ============================================================

-- voice-recordings: authenticated users can upload their own. Anyone authenticated can read.
CREATE POLICY "Users can upload voice recordings"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'voice-recordings');

CREATE POLICY "Users can read voice recordings"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'voice-recordings');

-- generated-images: public read. Only service role writes.
CREATE POLICY "Anyone can view generated images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'generated-images');

CREATE POLICY "Service role can upload generated images"
  ON storage.objects FOR INSERT
  TO service_role
  WITH CHECK (bucket_id = 'generated-images');

-- avatars: authenticated users can upload. Public read.
CREATE POLICY "Users can upload avatars"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Anyone can view avatars"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'avatars');

-- ============================================================
-- REALTIME
-- ============================================================

-- Enable realtime on family_tree_nodes for live tree updates.
ALTER PUBLICATION supabase_realtime ADD TABLE family_tree_nodes;
