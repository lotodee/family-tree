-- ============================================================
-- SEED: PROFILES AND ANSWERS FOR LLM TESTING
-- ============================================================
-- Since profiles.id references auth.users(id), we temporarily disable
-- the FK constraint to insert seed data for LLM testing.

-- Step 1: Disable the foreign key constraint on profiles
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- ============================================================
-- SEED: PROFILES FOR FAMILY MEMBERS
-- ============================================================

-- Generation 0
INSERT INTO profiles (id, full_name, email, relationship_type, tree_node_id) VALUES
  ('11111111-0000-0000-0000-000000000001', 'Michael Ademiluyi', 'grandpa@ademiluyi.com', 'patriarch', '00000000-0000-0000-0000-000000000001'),
  ('11111111-0000-0000-0000-000000000002', 'Racheal Ademiluyi', 'grandma@ademiluyi.com', 'matriarch', '00000000-0000-0000-0000-000000000002');

-- Generation 1 - Children
INSERT INTO profiles (id, full_name, email, relationship_type, tree_node_id) VALUES
  ('11111111-0000-0000-0000-000000000010', 'Kemi Loto', 'kemi@ademiluyi.com', 'child', '00000000-0000-0000-0000-000000000010'),
  ('11111111-0000-0000-0000-000000000020', 'Sola Aralepo', 'sola@ademiluyi.com', 'child', '00000000-0000-0000-0000-000000000020'),
  ('11111111-0000-0000-0000-000000000030', 'Bunmi Ogunlola', 'bunmi@ademiluyi.com', 'child', '00000000-0000-0000-0000-000000000030'),
  ('11111111-0000-0000-0000-000000000040', 'Wale Ademiluyi', 'wale@ademiluyi.com', 'child', '00000000-0000-0000-0000-000000000040'),
  ('11111111-0000-0000-0000-000000000050', 'Ronke Wealth', 'ronke@ademiluyi.com', 'child', '00000000-0000-0000-0000-000000000050'),
  ('11111111-0000-0000-0000-000000000060', 'Lanre Ademiluyi', 'lanre@ademiluyi.com', 'child', '00000000-0000-0000-0000-000000000060'),
  ('11111111-0000-0000-0000-000000000070', 'Akeem Ademiluyi', 'akeem@ademiluyi.com', 'child', '00000000-0000-0000-0000-000000000070'),
  ('11111111-0000-0000-0000-000000000080', 'Leke Ademiluyi', 'leke@ademiluyi.com', 'child', '00000000-0000-0000-0000-000000000080');

-- Generation 1 - Spouses
INSERT INTO profiles (id, full_name, email, relationship_type, tree_node_id) VALUES
  ('11111111-0000-0000-0000-000000000011', 'Deji Loto', 'dejiloto@ademiluyi.com', 'spouse', '00000000-0000-0000-0000-000000000011'),
  ('11111111-0000-0000-0000-000000000021', 'Anthony Aralepo', 'anthony@ademiluyi.com', 'spouse', '00000000-0000-0000-0000-000000000021'),
  ('11111111-0000-0000-0000-000000000041', 'Toyin Ademiluyi', 'toyin@ademiluyi.com', 'spouse', '00000000-0000-0000-0000-000000000041'),
  ('11111111-0000-0000-0000-000000000051', 'John Wealth', 'john@ademiluyi.com', 'spouse', '00000000-0000-0000-0000-000000000051'),
  ('11111111-0000-0000-0000-000000000061', 'Shayo Ademiluyi', 'shayo@ademiluyi.com', 'spouse', '00000000-0000-0000-0000-000000000061');

-- Generation 2 - Grandchildren
INSERT INTO profiles (id, full_name, email, relationship_type, tree_node_id) VALUES
  ('11111111-0000-0000-0000-000000000101', 'Yinka Loto', 'yinka@ademiluyi.com', 'grandchild', '00000000-0000-0000-0000-000000000101'),
  ('11111111-0000-0000-0000-000000000102', 'Olamide Loto', 'olamide@ademiluyi.com', 'grandchild', '00000000-0000-0000-0000-000000000102'),
  -- Dotun already exists with email lolamidotun@gmail.com, skip creating
  ('11111111-0000-0000-0000-000000000104', 'Irewole Loto', 'irewole@ademiluyi.com', 'grandchild', '00000000-0000-0000-0000-000000000104'),
  ('11111111-0000-0000-0000-000000000201', 'Praise Aralepo', 'praise@ademiluyi.com', 'grandchild', '00000000-0000-0000-0000-000000000201'),
  ('11111111-0000-0000-0000-000000000202', 'Promise Aralepo', 'promise@ademiluyi.com', 'grandchild', '00000000-0000-0000-0000-000000000202'),
  ('11111111-0000-0000-0000-000000000203', 'Purpose Aralepo', 'purpose@ademiluyi.com', 'grandchild', '00000000-0000-0000-0000-000000000203'),
  ('11111111-0000-0000-0000-000000000301', 'Dami Ogunlola', 'dami@ademiluyi.com', 'grandchild', '00000000-0000-0000-0000-000000000301'),
  ('11111111-0000-0000-0000-000000000302', 'Lolade Ogunlola', 'lolade@ademiluyi.com', 'grandchild', '00000000-0000-0000-0000-000000000302'),
  ('11111111-0000-0000-0000-000000000303', 'Busola Ogunlola', 'busola@ademiluyi.com', 'grandchild', '00000000-0000-0000-0000-000000000303'),
  ('11111111-0000-0000-0000-000000000304', 'Kenny Ogunlola', 'kenny@ademiluyi.com', 'grandchild', '00000000-0000-0000-0000-000000000304'),
  ('11111111-0000-0000-0000-000000000305', 'Taiwo Ogunlola', 'taiwo@ademiluyi.com', 'grandchild', '00000000-0000-0000-0000-000000000305'),
  ('11111111-0000-0000-0000-000000000401', 'Lily Ademiluyi', 'lily@ademiluyi.com', 'grandchild', '00000000-0000-0000-0000-000000000401'),
  ('11111111-0000-0000-0000-000000000402', 'Olive Ademiluyi', 'olive@ademiluyi.com', 'grandchild', '00000000-0000-0000-0000-000000000402'),
  ('11111111-0000-0000-0000-000000000403', 'Ark Ademiluyi', 'ark@ademiluyi.com', 'grandchild', '00000000-0000-0000-0000-000000000403'),
  ('11111111-0000-0000-0000-000000000501', 'Tofunmi Wealth', 'tofunmi@ademiluyi.com', 'grandchild', '00000000-0000-0000-0000-000000000501'),
  ('11111111-0000-0000-0000-000000000502', 'Toni Wealth', 'toni@ademiluyi.com', 'grandchild', '00000000-0000-0000-0000-000000000502'),
  ('11111111-0000-0000-0000-000000000503', 'Tamilore Wealth', 'tamilore@ademiluyi.com', 'grandchild', '00000000-0000-0000-0000-000000000503'),
  ('11111111-0000-0000-0000-000000000601', 'Adunmi Ademiluyi', 'adunmi@ademiluyi.com', 'grandchild', '00000000-0000-0000-0000-000000000601');

-- Mark all tree nodes as claimed
UPDATE family_tree_nodes SET is_claimed = TRUE, claimed_by =
  CASE id
    WHEN '00000000-0000-0000-0000-000000000001' THEN '11111111-0000-0000-0000-000000000001'
    WHEN '00000000-0000-0000-0000-000000000002' THEN '11111111-0000-0000-0000-000000000002'
    WHEN '00000000-0000-0000-0000-000000000010' THEN '11111111-0000-0000-0000-000000000010'
    WHEN '00000000-0000-0000-0000-000000000020' THEN '11111111-0000-0000-0000-000000000020'
    WHEN '00000000-0000-0000-0000-000000000030' THEN '11111111-0000-0000-0000-000000000030'
    WHEN '00000000-0000-0000-0000-000000000040' THEN '11111111-0000-0000-0000-000000000040'
    WHEN '00000000-0000-0000-0000-000000000050' THEN '11111111-0000-0000-0000-000000000050'
    WHEN '00000000-0000-0000-0000-000000000060' THEN '11111111-0000-0000-0000-000000000060'
    WHEN '00000000-0000-0000-0000-000000000070' THEN '11111111-0000-0000-0000-000000000070'
    WHEN '00000000-0000-0000-0000-000000000080' THEN '11111111-0000-0000-0000-000000000080'
    WHEN '00000000-0000-0000-0000-000000000011' THEN '11111111-0000-0000-0000-000000000011'
    WHEN '00000000-0000-0000-0000-000000000021' THEN '11111111-0000-0000-0000-000000000021'
    WHEN '00000000-0000-0000-0000-000000000041' THEN '11111111-0000-0000-0000-000000000041'
    WHEN '00000000-0000-0000-0000-000000000051' THEN '11111111-0000-0000-0000-000000000051'
    WHEN '00000000-0000-0000-0000-000000000061' THEN '11111111-0000-0000-0000-000000000061'
    WHEN '00000000-0000-0000-0000-000000000101' THEN '11111111-0000-0000-0000-000000000101'
    WHEN '00000000-0000-0000-0000-000000000102' THEN '11111111-0000-0000-0000-000000000102'
    WHEN '00000000-0000-0000-0000-000000000103' THEN (SELECT id FROM profiles WHERE email = 'lolamidotun@gmail.com')
    WHEN '00000000-0000-0000-0000-000000000104' THEN '11111111-0000-0000-0000-000000000104'
    WHEN '00000000-0000-0000-0000-000000000201' THEN '11111111-0000-0000-0000-000000000201'
    WHEN '00000000-0000-0000-0000-000000000202' THEN '11111111-0000-0000-0000-000000000202'
    WHEN '00000000-0000-0000-0000-000000000203' THEN '11111111-0000-0000-0000-000000000203'
    WHEN '00000000-0000-0000-0000-000000000301' THEN '11111111-0000-0000-0000-000000000301'
    WHEN '00000000-0000-0000-0000-000000000302' THEN '11111111-0000-0000-0000-000000000302'
    WHEN '00000000-0000-0000-0000-000000000303' THEN '11111111-0000-0000-0000-000000000303'
    WHEN '00000000-0000-0000-0000-000000000304' THEN '11111111-0000-0000-0000-000000000304'
    WHEN '00000000-0000-0000-0000-000000000305' THEN '11111111-0000-0000-0000-000000000305'
    WHEN '00000000-0000-0000-0000-000000000401' THEN '11111111-0000-0000-0000-000000000401'
    WHEN '00000000-0000-0000-0000-000000000402' THEN '11111111-0000-0000-0000-000000000402'
    WHEN '00000000-0000-0000-0000-000000000403' THEN '11111111-0000-0000-0000-000000000403'
    WHEN '00000000-0000-0000-0000-000000000501' THEN '11111111-0000-0000-0000-000000000501'
    WHEN '00000000-0000-0000-0000-000000000502' THEN '11111111-0000-0000-0000-000000000502'
    WHEN '00000000-0000-0000-0000-000000000503' THEN '11111111-0000-0000-0000-000000000503'
    WHEN '00000000-0000-0000-0000-000000000601' THEN '11111111-0000-0000-0000-000000000601'
    ELSE claimed_by
  END
WHERE id IN (
  '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000020',
  '00000000-0000-0000-0000-000000000030', '00000000-0000-0000-0000-000000000040',
  '00000000-0000-0000-0000-000000000050', '00000000-0000-0000-0000-000000000060',
  '00000000-0000-0000-0000-000000000070', '00000000-0000-0000-0000-000000000080',
  '00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000021',
  '00000000-0000-0000-0000-000000000041', '00000000-0000-0000-0000-000000000051',
  '00000000-0000-0000-0000-000000000061',
  '00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000102',
  '00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000104',
  '00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000202',
  '00000000-0000-0000-0000-000000000203',
  '00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000302',
  '00000000-0000-0000-0000-000000000303', '00000000-0000-0000-0000-000000000304',
  '00000000-0000-0000-0000-000000000305',
  '00000000-0000-0000-0000-000000000401', '00000000-0000-0000-0000-000000000402',
  '00000000-0000-0000-0000-000000000403',
  '00000000-0000-0000-0000-000000000501', '00000000-0000-0000-0000-000000000502',
  '00000000-0000-0000-0000-000000000503',
  '00000000-0000-0000-0000-000000000601'
);

-- ============================================================
-- SEED: ANSWERS (Self-answers about themselves)
-- ============================================================

-- Helper: Get question IDs by display_order and type
-- Self Q1: What is your happiest memory with Grandpa?
-- Self Q2: What is something Grandpa taught you that you still carry with you today?
-- Self Q3: Describe yourself in a way that would make everyone in the family laugh.
-- Self Q4: What is one thing about you that most of the family probably doesn't know?
-- Self Q5: If you could relive one family gathering, which one would it be and why?
-- Self Q6: What is the most Nigerian thing about you?
-- Self Q7: What does family mean to you in one honest paragraph?
-- Self Q8: What is your biggest dream right now?
-- Self Q9: What would you want Grandpa to know about how he has shaped your life?
-- Self Q10: If the family made a movie about your life, what would the title be and why?

-- ============================================================
-- KEMI'S SELF-ANSWERS
-- ============================================================
INSERT INTO answers (respondent_id, subject_id, question_id, answer_text, status, input_method, is_confirmed)
SELECT
  '11111111-0000-0000-0000-000000000010',
  '00000000-0000-0000-0000-000000000010',
  q.id,
  CASE q.display_order
    WHEN 1 THEN 'My happiest memory with Daddy is when he taught me how to drive in his old Peugeot 504. I was terrified but he was so patient, laughing every time I stalled the engine. He said "Kemi, life is like driving - you will stall sometimes, but you just start again." I think about that every time I face a challenge.'
    WHEN 2 THEN 'Daddy taught me that education is the one thing nobody can ever take from you. He sacrificed so much to send us all to good schools. Now I make sure all my children understand this same value.'
    WHEN 3 THEN 'I am the firstborn who acts like she is still in charge of everyone even though we are all grown adults with children! My siblings call me "Mummy Number Two" and honestly, they are not wrong. If I see you not eating well, I WILL call you.'
    WHEN 4 THEN 'Most people dont know that I secretly write poetry. I have notebooks full of poems about family, love, and Nigeria. I have never shown anyone except Deji.'
    WHEN 5 THEN 'Daddys 80th birthday in 2006. The whole family was together, all the grandchildren were still young and running around. Daddy danced so much that night! It was the last time I saw him that free and happy before his health started declining.'
    WHEN 6 THEN 'I cannot eat any food without pepper. Even ice cream, I will find a way to add suya spice. My children in America think I am crazy but this is how Daddy raised us!'
    WHEN 7 THEN 'Family means everything. It is the foundation that holds you up when the world tries to knock you down. The Ademiluyi name means something - it means resilience, love, and togetherness. We fight, yes, but we always come back together. That is what Daddy built.'
    WHEN 8 THEN 'My biggest dream is to see Daddy celebrate this 100th birthday surrounded by all of us. And secretly, I hope one of my grandchildren becomes a doctor - we need more doctors in this family!'
    WHEN 9 THEN 'Daddy, you showed me what strength really looks like. It is not about being loud or forceful. It is about being steady, consistent, and always putting family first. I try to be that for my own children and I hope I make you proud.'
    WHEN 10 THEN '"The General" - because everyone in this family knows that when Kemi speaks, you better listen! But also because like a general, I am always fighting for my troops - my family.'
  END,
  'confirmed', 'text', TRUE
FROM questions q WHERE q.type = 'self' AND q.display_order <= 10;

-- ============================================================
-- WALE'S SELF-ANSWERS
-- ============================================================
INSERT INTO answers (respondent_id, subject_id, question_id, answer_text, status, input_method, is_confirmed)
SELECT
  '11111111-0000-0000-0000-000000000040',
  '00000000-0000-0000-0000-000000000040',
  q.id,
  CASE q.display_order
    WHEN 1 THEN 'Watching football with Daddy on Saturday afternoons. He would explain every play, every strategy. He taught me that football, like life, requires both individual brilliance and teamwork. Those afternoons shaped who I am today.'
    WHEN 2 THEN 'Integrity. Daddy always said "Your name is all you have. Once you lose your integrity, you have lost everything." In business, I have walked away from deals that compromised my values because of this teaching.'
    WHEN 3 THEN 'I am the brother who thinks he is funnier than he actually is. I tell jokes that only I laugh at, but I laugh so hard that eventually everyone else starts laughing too - at me, not the joke. At least I bring joy!'
    WHEN 4 THEN 'I am terrified of flying. Every flight, I am gripping the armrest and praying. My wife Toyin holds my hand the whole time. The big strong Wale, scared of airplanes!'
    WHEN 5 THEN 'Christmas 1995 when Daddy surprised us all with a trip to the village. The whole family traveled together in two buses. We sang songs the whole way. The children today will never know that kind of simple, pure joy.'
    WHEN 6 THEN 'My love for agege bread and akara for breakfast. I dont care how fancy the hotel is or what country I am in - if I can find agege bread, that is what I am eating.'
    WHEN 7 THEN 'Family is the only wealth that matters. I have seen rich men die alone and poor men die surrounded by love. I will choose love every time. The Ademiluyis are wealthy beyond measure because of our love.'
    WHEN 8 THEN 'To build something that my children and their children will be proud of. Not just money, but a legacy of service and integrity. I want the Ademiluyi name to mean something for generations.'
    WHEN 9 THEN 'Daddy, you never raised your voice at me even when I deserved it. You corrected with wisdom, not anger. I try to do the same with Lily, Olive, and Ark, though sometimes I fail. Your patience is my goal.'
    WHEN 10 THEN '"The Quiet Storm" - because I am not the loudest in the room, but when I move, things happen. Slow and steady, but powerful. Just like Daddy taught me.'
  END,
  'confirmed', 'text', TRUE
FROM questions q WHERE q.type = 'self' AND q.display_order <= 10;

-- ============================================================
-- DOTUN'S SELF-ANSWERS (GRANDCHILD) - Uses real profile
-- ============================================================
INSERT INTO answers (respondent_id, subject_id, question_id, answer_text, status, input_method, is_confirmed)
SELECT
  (SELECT id FROM profiles WHERE email = 'lolamidotun@gmail.com'),
  '00000000-0000-0000-0000-000000000103',
  q.id,
  CASE q.display_order
    WHEN 1 THEN 'Grandpa used to save the biggest piece of meat for me when I visited. He would wink at me and say "Dotun, you need to grow strong like me." I was his favorite, no matter what my cousins say! That special treatment made me feel so loved.'
    WHEN 2 THEN 'Grandpa taught me that technology is not everything. He would turn off the TV and tell us stories about the family history. Those stories taught me more about life than any school. I now collect and document all our family stories.'
    WHEN 3 THEN 'I am the tech guy everyone calls when their phone or computer breaks. "Dotun, my WhatsApp is not working!" - I hear this at least five times during every family gathering. I should start charging!'
    WHEN 4 THEN 'I am actually a really good cook. I learned from watching Grandma Racheal but I keep it secret because I am afraid my aunties will put me to work in the kitchen at every family event!'
    WHEN 5 THEN 'Grandpas 90th birthday. All the cousins performed a play we wrote ourselves about the family history. Grandpa laughed so hard he cried. We made mistakes but he loved every second.'
    WHEN 6 THEN 'I CANNOT be late. Nigerian time does not apply to me. If the event starts at 2pm, I am there at 1:45pm. My cousins tease me but Grandpa was the same way - "Time waits for no man, Dotun."'
    WHEN 7 THEN 'Family is my anchor. When I moved abroad for work, I was so homesick. But knowing I have this massive, loving, chaotic family back home gives me courage. We are never alone in this family.'
    WHEN 8 THEN 'I want to create an app or platform that helps Nigerian families stay connected across the world. Distance should not break family bonds. Technology can help us stay together.'
    WHEN 9 THEN 'Grandpa, you showed me that being a good man is not about being tough or aggressive. You led with kindness, patience, and love. Every woman I date, I ask myself - would Grandpa approve? That is my standard.'
    WHEN 10 THEN '"The Fixer" - because whether its a broken laptop, a family argument, or someone needing advice, somehow I end up in the middle trying to fix it. I got it from Grandpa - he was always the peacemaker.'
  END,
  'confirmed', 'text', TRUE
FROM questions q WHERE q.type = 'self' AND q.display_order <= 10;

-- ============================================================
-- BUNMI'S SELF-ANSWERS
-- ============================================================
INSERT INTO answers (respondent_id, subject_id, question_id, answer_text, status, input_method, is_confirmed)
SELECT
  '11111111-0000-0000-0000-000000000030',
  '00000000-0000-0000-0000-000000000030',
  q.id,
  CASE q.display_order
    WHEN 1 THEN 'When Daddy walked me down the aisle at my wedding to Deji. He whispered "You will always be my little girl" and I cried so much the makeup artist had to fix my face three times! That moment is frozen in my heart forever.'
    WHEN 2 THEN 'Daddy taught me resilience. When Deji passed, Daddy was my rock. He said "Bunmi, grief is love with nowhere to go. Let it out, but keep living." I raised five children alone because of that strength he gave me.'
    WHEN 3 THEN 'I am the sister who cries at everything. Weddings, funerals, graduations, even TV commercials. My children have learned to always carry tissue when they are with me. It is embarrassing but I cannot help it!'
    WHEN 4 THEN 'After Deji died, I learned to fix things around the house myself - plumbing, electrical, everything. My sons dont know that half the repairs they think a handyman did were actually done by their mother at 2am!'
    WHEN 5 THEN 'The Christmas after Deji passed, when the whole family surrounded me and my children. Nobody let us feel alone for even one minute. That is when I truly understood what family means - showing up when it hurts.'
    WHEN 6 THEN 'I cannot sleep without my wrapper properly tied. It does not matter how hot the night is - if my wrapper is loose, I am awake. My children in UK think I am dramatic but this is non-negotiable!'
    WHEN 7 THEN 'Family is survival. When life knocked me down, family picked me up. The Ademiluyis are not perfect but we show up for each other. That is everything.'
    WHEN 8 THEN 'To see all my five children settled and happy. Dami, Lolade, Busola, Kenny, Taiwo - I want them to find love, success, and peace. That is a mothers only dream.'
    WHEN 9 THEN 'Daddy, you were there for me when my world collapsed. You never judged, never lectured. You just held my hand and said "We will get through this together." You kept your promise. Thank you.'
    WHEN 10 THEN '"The Phoenix" - because I rose from the ashes. Losing Deji should have broken me but instead, with Gods grace and family support, I became stronger. My children are my proudest achievement.'
  END,
  'confirmed', 'text', TRUE
FROM questions q WHERE q.type = 'self' AND q.display_order <= 10;

-- ============================================================
-- YINKA'S SELF-ANSWERS (GRANDCHILD)
-- ============================================================
INSERT INTO answers (respondent_id, subject_id, question_id, answer_text, status, input_method, is_confirmed)
SELECT
  '11111111-0000-0000-0000-000000000101',
  '00000000-0000-0000-0000-000000000101',
  q.id,
  CASE q.display_order
    WHEN 1 THEN 'Grandpa teaching me and my siblings traditional games in the backyard. He was so competitive! He would pretend to let us win then surprise us at the last moment. His laughter was contagious.'
    WHEN 2 THEN 'Respect for elders. Grandpa always stood when an elder entered the room, even at his age. He taught me that respect costs nothing but means everything. I practice this everywhere I go.'
    WHEN 3 THEN 'I am the cousin who takes 500 photos at every event and shares approximately 3. My phone storage is 90% family photos. Everyone complains when I pull out the camera but then they all ask for the photos later!'
    WHEN 4 THEN 'I have a secret journal where I write letters to my future children about our family history. I want them to know where they come from, especially the stories Grandpa told us that might be forgotten.'
    WHEN 5 THEN 'Any Christmas at Grandpas house. The chaos, the food, the arguments over who gets the last jollof rice. Pure magic. I would give anything for one more of those gatherings with everyone healthy and together.'
    WHEN 6 THEN 'I cannot have a conversation without using my hands! Even on phone calls, I am gesturing. My American friends find it hilarious. This is what happens when you grow up in a Nigerian household!'
    WHEN 7 THEN 'Family is identity. I know who I am because I know where I come from. Being an Ademiluyi means something - it means excellence, love, and never giving up. I carry that everywhere.'
    WHEN 8 THEN 'To document our entire family history properly - photos, stories, genealogy. Too many families lose their stories when the elders pass. I want to preserve ours forever.'
    WHEN 9 THEN 'Grandpa, you made me feel special even though you had so many grandchildren. Whenever I visited, your face would light up. That unconditional love taught me how to love others. I will never forget it.'
    WHEN 10 THEN '"The Archivist" - because I am obsessed with keeping records of everything. Photos, videos, stories. One day, the next generation will thank me for being the family memory keeper!'
  END,
  'confirmed', 'text', TRUE
FROM questions q WHERE q.type = 'self' AND q.display_order <= 10;

-- ============================================================
-- ABOUT OTHERS ANSWERS
-- ============================================================

-- About Q1: What is the first word that comes to mind when you think of this person?
-- About Q2: What is your funniest memory with this person?
-- About Q3: How would you describe this person to a stranger?
-- About Q4: What is something this person does that nobody else in the family does?
-- About Q5: What is the kindest thing this person has ever done for you?
-- About Q6: If this person were a character in a movie, who would they be?
-- About Q7: What do you think this person's superpower is?
-- About Q8: What is one thing you admire about this person?
-- About Q9: What would this person be famous for if the whole world knew them?
-- About Q10: In one sentence, why is this person important to the family?

-- Dotun talking about Grandpa Michael - Uses real profile
INSERT INTO answers (respondent_id, subject_id, question_id, answer_text, status, input_method, is_confirmed)
SELECT
  (SELECT id FROM profiles WHERE email = 'lolamidotun@gmail.com'),
  '00000000-0000-0000-0000-000000000001',
  q.id,
  CASE q.display_order
    WHEN 1 THEN 'Legend.'
    WHEN 2 THEN 'When Grandpa tried to use my smartphone and accidentally video called someone in China! He was so confused and started speaking Yoruba to them. We couldnt stop laughing for hours!'
    WHEN 3 THEN 'Imagine the wisest person you know, multiply by ten, add the biggest heart possible, and sprinkle in the ability to make everyone feel special. That is Grandpa Michael.'
    WHEN 4 THEN 'Grandpa remembers everyones birthday without needing a phone or calendar. Even with all these grandchildren, he never forgets. His memory is supernatural!'
    WHEN 5 THEN 'When I was struggling in school, Grandpa sat with me for hours helping me understand my homework. He never made me feel stupid. He said "Dotun, even I was slow once. Patience is the key."'
    WHEN 6 THEN 'He would be Mufasa from The Lion King - wise, powerful, loving, and the undisputed king of his pride. Everything he does is for his family.'
    WHEN 7 THEN 'Making people feel seen. No matter how many people are in the room, Grandpa makes you feel like you are the only one that matters.'
    WHEN 8 THEN 'His patience. I have never seen him lose his temper. Even when we grandchildren were being terrible, he stayed calm. I aspire to have even half his patience.'
    WHEN 9 THEN 'Being the greatest father and grandfather in Nigerian history. Not joking - if there was a hall of fame, he would be first ballot.'
    WHEN 10 THEN 'Grandpa Michael is the root of our family tree - without him, none of us would exist, and more importantly, we would not know how to love.'
  END,
  'confirmed', 'text', TRUE
FROM questions q WHERE q.type = 'about_other' AND q.display_order <= 10;

-- Kemi talking about Wale
INSERT INTO answers (respondent_id, subject_id, question_id, answer_text, status, input_method, is_confirmed)
SELECT
  '11111111-0000-0000-0000-000000000010',
  '00000000-0000-0000-0000-000000000040',
  q.id,
  CASE q.display_order
    WHEN 1 THEN 'Steady.'
    WHEN 2 THEN 'When Wale tried to cook for the first time as an adult and set off every smoke alarm in the house! He was so confident until the fire department showed up. We still tease him about his "famous jollof" that was actually charcoal!'
    WHEN 3 THEN 'My younger brother who acts like an elder. He is quiet but when he speaks, everyone listens. The most reliable person I know.'
    WHEN 4 THEN 'Wale wakes up at 4am every single day without an alarm. He has done this since childhood. I dont understand how his body works!'
    WHEN 5 THEN 'When Deji and I were struggling financially early in our marriage, Wale quietly paid our rent for three months without telling anyone. I only found out years later. That is who he is.'
    WHEN 6 THEN 'Morgan Freeman in any movie - calm, wise, with a voice that makes you trust everything he says. Plus the man ages gracefully!'
    WHEN 7 THEN 'Strategic thinking. Wale sees ten steps ahead while the rest of us are still figuring out step one. He should have been a chess grandmaster.'
    WHEN 8 THEN 'His loyalty. Once you are in Wales circle, he will defend you to the death. He never forgets the people who were there for him.'
    WHEN 9 THEN 'Building successful businesses while staying humble. He proves that you can succeed without stepping on others.'
    WHEN 10 THEN 'Wale is the brother we all lean on - he may be quiet, but his strength holds this family together.'
  END,
  'confirmed', 'text', TRUE
FROM questions q WHERE q.type = 'about_other' AND q.display_order <= 10;

-- Wale talking about Kemi
INSERT INTO answers (respondent_id, subject_id, question_id, answer_text, status, input_method, is_confirmed)
SELECT
  '11111111-0000-0000-0000-000000000040',
  '00000000-0000-0000-0000-000000000010',
  q.id,
  CASE q.display_order
    WHEN 1 THEN 'Commander.'
    WHEN 2 THEN 'At my wedding, Kemi gave a toast that was supposed to be 3 minutes. It turned into 20 minutes of her telling embarrassing childhood stories. By the end, my wife knew every stupid thing I ever did as a child!'
    WHEN 3 THEN 'Imagine a general who runs her troops with military precision but also cries at sad movies. That is Kemi - tough and tender in perfect balance.'
    WHEN 4 THEN 'Kemi knows everyones business in the entire family. I dont know how she does it, but nothing escapes her. She should work for intelligence services!'
    WHEN 5 THEN 'When I was considering a risky business move, everyone told me to play it safe. Kemi was the only one who said "Wale, if you feel it in your heart, do it. I believe in you." Her faith in me changed my life.'
    WHEN 6 THEN 'Meryl Streep - commanding every scene, making everyone around her better, and aging like fine wine. An absolute queen.'
    WHEN 7 THEN 'Bringing order to chaos. Put Kemi in any chaotic situation and within minutes she has organized everything and everyone. It is genuinely impressive.'
    WHEN 8 THEN 'Her sacrificial love. Everything she does is for family. She puts everyone else first, sometimes to her own detriment.'
    WHEN 9 THEN 'Being the greatest big sister in history. She practically raised all of us while also being a daughter to Daddy and Mummy.'
    WHEN 10 THEN 'Kemi is our North Star - when any of us is lost, we look to her for direction.'
  END,
  'confirmed', 'text', TRUE
FROM questions q WHERE q.type = 'about_other' AND q.display_order <= 10;

-- Yinka talking about Dotun (sibling love)
INSERT INTO answers (respondent_id, subject_id, question_id, answer_text, status, input_method, is_confirmed)
SELECT
  '11111111-0000-0000-0000-000000000101',
  '00000000-0000-0000-0000-000000000103',
  q.id,
  CASE q.display_order
    WHEN 1 THEN 'Brilliant.'
    WHEN 2 THEN 'Dotun once tried to impress a girl by speaking French at a family party. He learned like five phrases from YouTube. She was ACTUALLY French. The look on his face when she started responding in rapid French was priceless!'
    WHEN 3 THEN 'The smartest person I know who somehow also lacks basic common sense in everyday situations. Like a genius who cannot remember where he put his keys.'
    WHEN 4 THEN 'Dotun can fix literally anything electronic. He once fixed Grandpas ancient radio that everyone said was dead. He is like a tech whisperer.'
    WHEN 5 THEN 'When I was heartbroken after a breakup, Dotun drove two hours at midnight just to bring me ice cream and sit with me in silence. He didnt need to say anything. That is brother love.'
    WHEN 6 THEN 'Tony Stark - incredibly smart, always has a solution, but also a bit of a showoff when he gets excited about something techy!'
    WHEN 7 THEN 'Problem-solving. There is no problem Dotun cannot figure out. Give him five minutes and he will have three solutions ready.'
    WHEN 8 THEN 'His determination. When he sets his mind on something, nothing stops him. He finished his masters while working full-time. The man does not give up.'
    WHEN 9 THEN 'Creating something that changes how Nigerian families stay connected. He has big dreams and the skills to make them happen.'
    WHEN 10 THEN 'Dotun is the cousin who makes us all feel like the future is in good hands.'
  END,
  'confirmed', 'text', TRUE
FROM questions q WHERE q.type = 'about_other' AND q.display_order <= 10;

-- Bunmi talking about Grandpa Michael
INSERT INTO answers (respondent_id, subject_id, question_id, answer_text, status, input_method, is_confirmed)
SELECT
  '11111111-0000-0000-0000-000000000030',
  '00000000-0000-0000-0000-000000000001',
  q.id,
  CASE q.display_order
    WHEN 1 THEN 'Anchor.'
    WHEN 2 THEN 'Daddy once tried to dance to hip-hop music at a party to impress the grandchildren. He was doing some kind of move that looked like a chicken having a seizure. We all laughed until we cried, and he laughed the hardest!'
    WHEN 3 THEN 'If you took all the best qualities a human can have - patience, wisdom, love, humor, strength - and put them in one person, you would get something close to Daddy.'
    WHEN 4 THEN 'Daddy prays for every single family member by name every morning. Every single one. Even the in-laws. The dedication is humbling.'
    WHEN 5 THEN 'After Deji died, Daddy would call me every single night just to hear my voice and make sure I was okay. He did this for two years straight. That consistency saved me.'
    WHEN 6 THEN 'Gandalf from Lord of the Rings - ancient, wise, always appearing exactly when you need him most with exactly the right words.'
    WHEN 7 THEN 'Unconditional love. No matter what you have done or where you have failed, Daddy loves you anyway. You cannot earn it or lose it. It just is.'
    WHEN 8 THEN 'His ability to stay calm in any storm. I have seen him face terrible situations and never lose his peace. I am still trying to learn this.'
    WHEN 9 THEN 'Raising eight children who all love each other and raised their own loving families. In todays world, that is a miracle.'
    WHEN 10 THEN 'Daddy is the proof that good men exist, and his legacy will echo through generations of Ademiluyis yet to come.'
  END,
  'confirmed', 'text', TRUE
FROM questions q WHERE q.type = 'about_other' AND q.display_order <= 10;

-- Dotun talking about Aunty Bunmi - Uses real profile
INSERT INTO answers (respondent_id, subject_id, question_id, answer_text, status, input_method, is_confirmed)
SELECT
  (SELECT id FROM profiles WHERE email = 'lolamidotun@gmail.com'),
  '00000000-0000-0000-0000-000000000030',
  q.id,
  CASE q.display_order
    WHEN 1 THEN 'Warrior.'
    WHEN 2 THEN 'Aunty Bunmi once chased a goat that stole food from the Christmas table. She ran in her expensive outfit, caught the goat, and still made it back in time to serve dessert. Legend!'
    WHEN 3 THEN 'The strongest woman I know who cries at greeting card commercials. She contains multitudes - fierce protector and gentle soul.'
    WHEN 4 THEN 'Aunty Bunmi can look at any child and immediately know if they are lying. It is terrifying. We all learned early that you cannot hide anything from her.'
    WHEN 5 THEN 'She sponsored my coding bootcamp when I could not afford it. She said "Dotun, invest in yourself first, pay me back when you make it." That changed my life trajectory.'
    WHEN 6 THEN 'The Black Panther Queen - regal, powerful, protective of her people, and not to be underestimated by anyone.'
    WHEN 7 THEN 'Rising from ashes. What she went through losing Uncle Deji would break most people. She came out stronger and raised five amazing children alone.'
    WHEN 8 THEN 'Her selflessness. Even when she was struggling, she was helping others. I dont know how she does it.'
    WHEN 9 THEN 'Writing a book about how to survive loss and still thrive. Her story could help millions of widows worldwide.'
    WHEN 10 THEN 'Aunty Bunmi shows us that we are never defined by what happens to us, only by how we rise after.'
  END,
  'confirmed', 'text', TRUE
FROM questions q WHERE q.type = 'about_other' AND q.display_order <= 10;

-- ============================================================
-- GRANDPA MICHAEL'S SELF-ANSWERS
-- ============================================================
INSERT INTO answers (respondent_id, subject_id, question_id, answer_text, status, input_method, is_confirmed)
SELECT
  '11111111-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  q.id,
  CASE q.display_order
    WHEN 1 THEN 'Every moment with my grandchildren is my happiest memory. But if I must choose one - the day I held my first grandchild, Yinka. I looked at her tiny fingers and thought, "My legacy continues." That feeling never gets old, even now with 19 grandchildren.'
    WHEN 2 THEN 'My own father taught me that a man is measured not by what he accumulates, but by what he gives away. I have tried to live this every day. Everything I have built is for my children and their children.'
    WHEN 3 THEN 'I am the old man who still thinks he can dance better than all of you! Ask anyone - at any party, I am the first on the dance floor and the last to leave. My knees disagree but my spirit is forever young!'
    WHEN 4 THEN 'I secretly enjoy TikTok. My grandchildren showed me and now I watch videos of people cooking and dancing. I do not understand most of it but it makes me laugh. Do not tell anyone!'
    WHEN 5 THEN 'My wedding day to Racheal in 1956. We had nothing but love. She wore a simple white dress and I thought she was the most beautiful woman in the world. Seventy years later, I still think so.'
    WHEN 6 THEN 'I still wake up at 5am to pray, even at 100 years old. This is the Nigerian in me - discipline, faith, and early mornings. My children think I am crazy but this is how we were raised.'
    WHEN 7 THEN 'Family is my greatest achievement. Not my career, not my properties, not any title. Eight children who love each other, nineteen grandchildren who know their roots - this is wealth. This is legacy.'
    WHEN 8 THEN 'My biggest dream is to see great-grandchildren before I go. And to dance at at least one more wedding! God has been good - maybe He will give me both.'
    WHEN 9 THEN 'I would want myself to know that despite all my mistakes, my children turned out well. I was not perfect but I tried. And seeing all of you here, loving each other - that is all the validation I need.'
    WHEN 10 THEN '"The Patriarch" - because that is what I am. I built this family with Racheal, brick by brick, prayer by prayer. Every Ademiluyi carries a piece of me, and that is the greatest honor.'
  END,
  'confirmed', 'text', TRUE
FROM questions q WHERE q.type = 'self' AND q.display_order <= 10;

-- ============================================================
-- GRANDMA RACHEAL'S SELF-ANSWERS
-- ============================================================
INSERT INTO answers (respondent_id, subject_id, question_id, answer_text, status, input_method, is_confirmed)
SELECT
  '11111111-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000002',
  q.id,
  CASE q.display_order
    WHEN 1 THEN 'Watching Michael hold each of our eight children for the first time. The same expression of wonder and love every single time. That man was born to be a father. And now grandfather. He still has that same look with the grandchildren.'
    WHEN 2 THEN 'Michael taught me patience. When I wanted to rush, he would say "Racheal, the yam that is roasted slowly tastes the sweetest." I have passed this to all my daughters. Good things take time.'
    WHEN 3 THEN 'I am the grandmother who always thinks everyone is too thin! "Have you eaten?" is my greeting. My grandchildren run when they see me coming because they know I will feed them until they cannot move!'
    WHEN 4 THEN 'I write letters to each grandchild on their birthday. Handwritten letters that I have been writing since they were born. One day, they will have a collection of my thoughts and prayers for them.'
    WHEN 5 THEN 'Christmas 1985 when all eight children were home with their spouses. The house was so full, so loud, so alive. We did not have much money that year but we had everything that mattered.'
    WHEN 6 THEN 'I cannot cook without singing. Yoruba hymns, old songs, sometimes I make up my own. My children grew up with the smell of stew and the sound of my voice. It is how I pray over the food.'
    WHEN 7 THEN 'Family is my ministry. I did not become a pastor or evangelist. My pulpit was my kitchen, my congregation was my children. Every meal was communion, every conversation was discipleship.'
    WHEN 8 THEN 'To see Michael healthy and happy at 100. That is my only dream now. We have walked this road together for so long - I want to celebrate every remaining step with him.'
    WHEN 9 THEN 'Michael, thank you for choosing me in 1956 when you could have chosen anyone. Thank you for being faithful, for working hard, for loving our children fiercely. We built something beautiful together.'
    WHEN 10 THEN '"The Heart" - because if Michael is the head of this family, I am the heart. I feel everything, I pray for everyone, I love without limits. Every family needs a heart.'
  END,
  'confirmed', 'text', TRUE
FROM questions q WHERE q.type = 'self' AND q.display_order <= 10;

-- ============================================================
-- SOLA'S SELF-ANSWERS
-- ============================================================
INSERT INTO answers (respondent_id, subject_id, question_id, answer_text, status, input_method, is_confirmed)
SELECT
  '11111111-0000-0000-0000-000000000020',
  '00000000-0000-0000-0000-000000000020',
  q.id,
  CASE q.display_order
    WHEN 1 THEN 'Daddy teaching me to ride a bicycle in the backyard. He held the seat and promised not to let go. Of course he let go, but by then I was already riding! He shouted "I knew you could do it!" I can still hear his voice.'
    WHEN 2 THEN 'Daddy taught me that faith without works is dead. He never just prayed - he prayed AND worked. My children Praise, Promise, and Purpose are named after this philosophy. We speak things into existence but we also work for them.'
    WHEN 3 THEN 'I am the sister who sends voice notes that are basically podcasts! Five minutes, ten minutes, twenty minutes. My siblings stopped listening after minute two but I keep sending them anyway. I have a lot to say!'
    WHEN 4 THEN 'I have kept a gratitude journal since 1992. Every single night, I write three things I am thankful for. I have boxes of these journals. One day my grandchildren will read them and know how blessed we were.'
    WHEN 5 THEN 'The day Anthony proposed to me at Daddys house. The whole family was there "by accident" - Kemi had orchestrated the whole thing. I said yes before he even finished the question!'
    WHEN 6 THEN 'I am convinced that no problem cannot be solved with a good pot of egusi soup. Heartbreak? Egusi. Job loss? Egusi. Disagreement with your spouse? Egusi. This is the Nigerian way.'
    WHEN 7 THEN 'Family is purpose. My children are literally named for this belief. We exist to love, support, and elevate each other. When one rises, we all rise. When one falls, we all catch them.'
    WHEN 8 THEN 'To see Praise, Promise, and Purpose find their callings and excel. They are still young but I see such potential in them. I pray daily for God to guide their steps.'
    WHEN 9 THEN 'Daddy, watching you and Mummy love each other taught me what marriage should be. Anthony and I try to model our relationship after yours. You gave us the blueprint.'
    WHEN 10 THEN '"The Prayer Warrior" - because I am convinced that half the good things that happen in this family are because I have been praying about them secretly for years!'
  END,
  'confirmed', 'text', TRUE
FROM questions q WHERE q.type = 'self' AND q.display_order <= 10;

-- ============================================================
-- RONKE'S SELF-ANSWERS
-- ============================================================
INSERT INTO answers (respondent_id, subject_id, question_id, answer_text, status, input_method, is_confirmed)
SELECT
  '11111111-0000-0000-0000-000000000050',
  '00000000-0000-0000-0000-000000000050',
  q.id,
  CASE q.display_order
    WHEN 1 THEN 'Daddy coming to my graduation ceremony. He had just recovered from an illness and everyone told him to rest. But he said "I did not come this far to miss my daughter graduate." He sat in the front row beaming. I have never felt more loved.'
    WHEN 2 THEN 'Financial wisdom. Daddy taught us to save before we spend, to invest before we indulge. My husband John and I built our wealth on these principles. Our children Tofunmi, Toni, and Tamilore know these rules by heart.'
    WHEN 3 THEN 'I am the sister who gives unsolicited financial advice at family gatherings! Someone mentions buying something and I immediately ask about their savings rate. My siblings find it annoying but secretly they all come to me when they need help!'
    WHEN 4 THEN 'I am terrified of cooking. My mother-in-law taught me the basics after I married John, but I still call Mummy or Kemi whenever I try anything complicated. My children think I am a good cook but everything is just following phone instructions!'
    WHEN 5 THEN 'The family reunion in 2010 when Daddy announced he was paying for all the grandchildrens school fees that year. The way everyone celebrated - that generosity is what I try to emulate now that we have the means.'
    WHEN 6 THEN 'I greet everyone with "How is your health?" before anything else. Very Nigerian, very specific. Money comes and goes but health is wealth. My husband thinks it is excessive but I do not care.'
    WHEN 7 THEN 'Family is investment - the most important one you will ever make. Everything else depreciates. Land, cars, even money. But the love and support of family? That only grows.'
    WHEN 8 THEN 'To establish a family foundation that supports education for underprivileged children. Daddy changed our trajectory through education. I want to do the same for others in his name.'
    WHEN 9 THEN 'Daddy, you showed me that wealth is a responsibility, not a reward. You were never flashy with your success - you quietly lifted everyone around you. I try to do the same.'
    WHEN 10 THEN '"The Accountant" - because I track everything! Family expenses, investments, even who owes who money from ten years ago. My siblings find it annoying but they always come to me for loans!'
  END,
  'confirmed', 'text', TRUE
FROM questions q WHERE q.type = 'self' AND q.display_order <= 10;

-- ============================================================
-- LANRE'S SELF-ANSWERS
-- ============================================================
INSERT INTO answers (respondent_id, subject_id, question_id, answer_text, status, input_method, is_confirmed)
SELECT
  '11111111-0000-0000-0000-000000000060',
  '00000000-0000-0000-0000-000000000060',
  q.id,
  CASE q.display_order
    WHEN 1 THEN 'Playing chess with Daddy every Sunday afternoon. He beat me for years - YEARS - before I finally won. When I did, he smiled and said "Now teach Adunmi." He was always thinking about the next generation.'
    WHEN 2 THEN 'Strategic thinking. Daddy approached life like a chess game - always thinking five moves ahead. In my business, I use this constantly. Before making any decision, I ask myself what would Daddy do.'
    WHEN 3 THEN 'I am the brother who shows up late to everything but somehow always arrives at the most dramatic moment! My wife Shayo says I have a talent for theatrical entrances. I cannot help it - I like to be memorable!'
    WHEN 4 THEN 'I write music. Nobody in the family knows this but I have composed over 50 songs. Love songs, worship songs, even a jingle for a company once. One day I might share them but for now they are mine.'
    WHEN 5 THEN 'Daddy and Mummys 50th anniversary celebration in 2006. We surprised them with a party and flew in relatives from all over the world. Daddys face when he walked in - that is what family is about.'
    WHEN 6 THEN 'I must have palm wine at any celebration. It does not matter if we are in Lagos or London - find me palm wine. My daughter Adunmi thinks it is disgusting but she will understand when she is older.'
    WHEN 7 THEN 'Family is legacy. Every business I build, every relationship I form, every lesson I teach Adunmi - it is all about extending what Daddy started. We are not individuals, we are links in a chain.'
    WHEN 8 THEN 'To see Adunmi become a woman of substance. She is my only child and I pour everything into her. I want her to carry the Ademiluyi name with pride and add her own chapters to our story.'
    WHEN 9 THEN 'Daddy, you never compared us to each other. With eight children, it would have been easy to play favorites. But you made each of us feel like the special one. That is a gift I try to give Adunmi.'
    WHEN 10 THEN '"The Strategist" - because I am always planning, always scheming (in a good way!). Family business, investments, even family events - if it needs organizing, I am your man.'
  END,
  'confirmed', 'text', TRUE
FROM questions q WHERE q.type = 'self' AND q.display_order <= 10;

-- ============================================================
-- AKEEM'S SELF-ANSWERS
-- ============================================================
INSERT INTO answers (respondent_id, subject_id, question_id, answer_text, status, input_method, is_confirmed)
SELECT
  '11111111-0000-0000-0000-000000000070',
  '00000000-0000-0000-0000-000000000070',
  q.id,
  CASE q.display_order
    WHEN 1 THEN 'Daddy taking me to my first football match. I was maybe 8 years old. He explained every rule, every strategy. When our team scored, he lifted me on his shoulders. I could see the whole stadium. I felt like I was on top of the world.'
    WHEN 2 THEN 'Daddy taught me that being unmarried does not make you incomplete. He said "Akeem, a tree stands alone before it becomes a forest." He never pressured me to marry. He understood that I was finding my own path.'
    WHEN 3 THEN 'I am the bachelor uncle that all the nieces and nephews come to for "cool uncle" activities! Video games, late night movies, junk food - whatever their parents say no to, Uncle Akeem says yes. It is my role!'
    WHEN 4 THEN 'I can bake. Not just cakes - proper pastries, bread, croissants. I took classes in France but I never told anyone. My nephews and nieces think I buy the birthday cakes. Nope - Uncle Akeem makes them!'
    WHEN 5 THEN 'New Years Eve 1999. The whole family thought the world was ending with Y2K. We stayed up together, praying, laughing, eating. When midnight came and nothing happened, Daddy said "See? Faith over fear." Best party ever.'
    WHEN 6 THEN 'I argue with every taxi driver about the route. It does not matter if I do not know the city - I will insist there is a better way. My siblings refuse to share taxis with me because of this!'
    WHEN 7 THEN 'Family is anchor. When you are single like me, it is easy to drift. But knowing I have this massive family, knowing there is always a place at the table for me - that keeps me grounded.'
    WHEN 8 THEN 'To find peace with my path. I am not married, I do not have children - sometimes I wonder if I disappointed Daddy. But my dream is to fully accept that my purpose might look different, and that is okay.'
    WHEN 9 THEN 'Daddy, thank you for never making me feel less than because I did not follow the traditional path. You loved me exactly as I am. That unconditional acceptance is rare and I treasure it.'
    WHEN 10 THEN '"The Cool Uncle" - because every family needs one! Someone to spoil the kids, tell inappropriate jokes, and remind everyone that life is supposed to be fun. That is my job.'
  END,
  'confirmed', 'text', TRUE
FROM questions q WHERE q.type = 'self' AND q.display_order <= 10;

-- ============================================================
-- LEKE'S SELF-ANSWERS
-- ============================================================
INSERT INTO answers (respondent_id, subject_id, question_id, answer_text, status, input_method, is_confirmed)
SELECT
  '11111111-0000-0000-0000-000000000080',
  '00000000-0000-0000-0000-000000000080',
  q.id,
  CASE q.display_order
    WHEN 1 THEN 'Being the last child meant I got Daddy when he was most relaxed, most patient. My happiest memory is sitting with him on the porch as he told me stories about his own childhood. He had time for those long conversations.'
    WHEN 2 THEN 'Contentment. Daddy was never chasing the next thing - he was grateful for what he had. When my older siblings stress about achievements, I remember Daddy saying "Leke, enough is a feast." I live by this.'
    WHEN 3 THEN 'I am the last born who everyone still treats like a baby even though I am a whole adult! My siblings will text to check if I have eaten. I am literally 40-something years old. But I also enjoy the attention so I do not complain!'
    WHEN 4 THEN 'I am a night owl who functions best after midnight. My siblings think I am lazy because I wake up late. But they do not know I was working or creating until 4am. The nighttime is when my brain truly works.'
    WHEN 5 THEN 'Any Christmas at home. Being the youngest meant I got the most presents and the most attention. My siblings complained but honestly? It was great being the baby of the family!'
    WHEN 6 THEN 'I cannot eat white rice without stew. Not fried rice, not jollof - white rice specifically needs stew for me. It is a psychological thing at this point. My foreign friends think I am dramatic but they do not understand!'
    WHEN 7 THEN 'Family is safety net. I have taken risks in my career and personal life because I know that if I fall, this family will catch me. That security gave me courage to pursue unconventional paths.'
    WHEN 8 THEN 'To make Daddy proud in my own way. I am not as successful as Wale or as organized as Kemi. But I want to find my own version of success that honors everything Daddy taught us.'
    WHEN 9 THEN 'Daddy, thank you for not expecting me to be like my older siblings. You saw me as an individual, not as a younger version of them. You let me find my own way. I hope I am making you proud.'
    WHEN 10 THEN '"The Baby" - because I will always be the baby of the family, no matter how old I get! And honestly, being the favorite child has its perks. Yes, I said favorite. My siblings can fight me.'
  END,
  'confirmed', 'text', TRUE
FROM questions q WHERE q.type = 'self' AND q.display_order <= 10;

-- ============================================================
-- OLAMIDE'S SELF-ANSWERS (GRANDCHILD)
-- ============================================================
INSERT INTO answers (respondent_id, subject_id, question_id, answer_text, status, input_method, is_confirmed)
SELECT
  '11111111-0000-0000-0000-000000000102',
  '00000000-0000-0000-0000-000000000102',
  q.id,
  CASE q.display_order
    WHEN 1 THEN 'Grandpa braiding my hair when I was little. Yes, braiding! Grandma was sick one day and I was crying because no one could do my hair. Grandpa watched a video and spent two hours braiding it perfectly. That is the kind of man he is.'
    WHEN 2 THEN 'Grandpa taught me that being a woman is powerful. He never treated his granddaughters as less than his grandsons. He said "Olamide, you can do anything. Your gender is not a limitation." That shaped my entire worldview.'
    WHEN 3 THEN 'I am the cousin who always has snacks in my bag. Always. Someone is hungry? Olamide has chin chin. Need gum? Olamide has it. I am basically a walking convenience store at family events!'
    WHEN 4 THEN 'I write fan fiction online under a secret pen name. I have thousands of readers and they have no idea I am a Nigerian girl from the Ademiluyi family. It is my creative outlet and I love the anonymity.'
    WHEN 5 THEN 'Grandpas 95th birthday when all the grandchildren performed a coordinated dance. We practiced for weeks in secret. The look on his face when we started dancing - pure joy. That is what family does.'
    WHEN 6 THEN 'I say "ah ah!" in response to literally everything surprising. Good news? Ah ah! Bad news? Ah ah! It confuses my non-Nigerian friends but it is just automatic at this point.'
    WHEN 7 THEN 'Family is identity. When people ask who I am, I start with "I am an Ademiluyi." Not my job, not my degrees - my family. Because that is what matters most.'
    WHEN 8 THEN 'To publish my writing one day under my real name. I want the world to know that a Nigerian girl from this family created worlds and told stories that touched millions of people.'
    WHEN 9 THEN 'Grandpa, you made me feel beautiful and capable. In a world that sometimes makes young women doubt themselves, you never let me forget my worth. I carry that confidence everywhere.'
    WHEN 10 THEN '"The Dreamer" - because my head is always in the clouds, imagining stories and possibilities. My siblings say I am not practical but dreamers change the world!'
  END,
  'confirmed', 'text', TRUE
FROM questions q WHERE q.type = 'self' AND q.display_order <= 10;

-- ============================================================
-- DAMI'S SELF-ANSWERS (GRANDCHILD - Bunmi's firstborn)
-- ============================================================
INSERT INTO answers (respondent_id, subject_id, question_id, answer_text, status, input_method, is_confirmed)
SELECT
  '11111111-0000-0000-0000-000000000301',
  '00000000-0000-0000-0000-000000000301',
  q.id,
  CASE q.display_order
    WHEN 1 THEN 'When my father passed away, Grandpa stepped in as my father figure. He would call me every week to check on me. One day he said "Dami, you are still my grandson. Death cannot change that." I became a man because of his guidance.'
    WHEN 2 THEN 'Grandpa taught me that real men protect their families. After my father died, I watched Grandpa protect and provide for my mother and us children. That is the kind of man I strive to be.'
    WHEN 3 THEN 'I am the protective older brother who still checks in on my four younger siblings like they are babies! They are grown adults but I still ask where they are going and when they will be back. Old habits!'
    WHEN 4 THEN 'I have all of my fathers belongings stored safely. His clothes, his watch, his books. My siblings do not know that I kept everything. One day I will share them when the time is right.'
    WHEN 5 THEN 'The first Christmas after Dad passed, when the family surrounded us with so much love that we almost forgot to cry. Grandpa sat with me privately and said "Grief is allowed, but so is joy." I choose both.'
    WHEN 6 THEN 'I call everyone "my guy" - men, women, elders, children. It is a habit I cannot break. My mother has scolded me for calling her "my guy" but it is just how I talk!'
    WHEN 7 THEN 'Family is survival. Literally. When Dad died, this family kept us alive - emotionally, financially, spiritually. I know what family means because I know what losing feels like.'
    WHEN 8 THEN 'To make my late father proud. To become the man he was hoping I would be. Every day I wake up and ask myself - would Dad be proud of this? That is my compass.'
    WHEN 9 THEN 'Grandpa, you became my father when I lost mine. You never tried to replace him but you filled the gap with so much love. I am who I am because you did not let me fall.'
    WHEN 10 THEN '"The Guardian" - because I protect everyone in my life fiercely. My siblings, my mother, my cousins - I would fight anyone for them. That is what my father would have done.'
  END,
  'confirmed', 'text', TRUE
FROM questions q WHERE q.type = 'self' AND q.display_order <= 10;

-- ============================================================
-- LILY'S SELF-ANSWERS (GRANDCHILD - Wale's daughter)
-- ============================================================
INSERT INTO answers (respondent_id, subject_id, question_id, answer_text, status, input_method, is_confirmed)
SELECT
  '11111111-0000-0000-0000-000000000401',
  '00000000-0000-0000-0000-000000000401',
  q.id,
  CASE q.display_order
    WHEN 1 THEN 'Grandpa naming me Lily. He said when I was born, I was so delicate and beautiful, like a lily flower. Every time he sees me, he still calls me "my little flower." I am 25 but I will always be his little flower.'
    WHEN 2 THEN 'Grandpa taught me elegance. He always dressed well, spoke well, treated everyone with respect. He said "Lily, how you carry yourself matters." I think about this every time I enter a room.'
    WHEN 3 THEN 'I am the cousin who takes forever to get ready! My siblings Olive and Ark have learned to tell me events start two hours earlier than they actually do. It works - I usually arrive on time now!'
    WHEN 4 THEN 'I have been learning Yoruba secretly using apps and tutors. My parents raised us speaking English and I always felt disconnected from that part of my heritage. I want to surprise Grandpa by speaking to him fluently one day.'
    WHEN 5 THEN 'Family dinner at Grandpas house when I was 12. No special occasion, just everyone together eating jollof rice and laughing. The simplicity of it was perfect. I did not know then how rare those moments are.'
    WHEN 6 THEN 'I hiss to express disapproval - you know, that Nigerian "mtchew" sound. My non-Nigerian friends find it hilarious but it comes out automatically when I am annoyed!'
    WHEN 7 THEN 'Family is roots. When you know where you come from, you can go anywhere. Being an Ademiluyi gives me confidence because I know I have a strong foundation beneath me.'
    WHEN 8 THEN 'To bridge the gap between our generation and the elders. I feel like we are losing so many stories, so much wisdom. I want to be the bridge that keeps us connected.'
    WHEN 9 THEN 'Grandpa, thank you for my name. Every time someone calls me Lily, I remember that you chose it with love. I try to be as beautiful inside as the flower you saw when I was born.'
    WHEN 10 THEN '"The Flower" - because that is what Grandpa calls me! And like a flower, I try to bring beauty and fragrance wherever I go. Even when life is hard, I try to bloom.'
  END,
  'confirmed', 'text', TRUE
FROM questions q WHERE q.type = 'self' AND q.display_order <= 10;

-- ============================================================
-- MORE ABOUT-OTHERS ANSWERS
-- ============================================================

-- Wale talking about Grandpa Michael
INSERT INTO answers (respondent_id, subject_id, question_id, answer_text, status, input_method, is_confirmed)
SELECT
  '11111111-0000-0000-0000-000000000040',
  '00000000-0000-0000-0000-000000000001',
  q.id,
  CASE q.display_order
    WHEN 1 THEN 'Rock.'
    WHEN 2 THEN 'When Daddy tried to use the TV remote but accidentally ordered five movies on pay-per-view! He was so confused about the bill. We still laugh about "Daddys expensive movie night" to this day.'
    WHEN 3 THEN 'A man of few words but immense action. He does not preach - he demonstrates. Everything I know about being a man, I learned by watching him live.'
    WHEN 4 THEN 'Daddy writes in a journal every single night. I found this out only recently. Decades of his thoughts, prayers, and reflections. I hope one day he shares them with us.'
    WHEN 5 THEN 'When I failed my first business venture, Daddy quietly paid off my debts without telling anyone. I only found out when the creditors stopped calling. He never mentioned it, never made me feel ashamed.'
    WHEN 6 THEN 'Mufasa, but make him Nigerian. The wise king who rules with love, not fear. The one everyone looks to for guidance. The foundation of everything good in our pride.'
    WHEN 7 THEN 'Turning enemies into friends. I have watched Daddy resolve conflicts that seemed impossible. People who hated each other would leave his presence as brothers. It is almost supernatural.'
    WHEN 8 THEN 'His humility. This man has achieved so much but never boasts. If you met him without knowing, you would think he was an ordinary person. That is true greatness.'
    WHEN 9 THEN 'Raising eight successful children who all genuinely love each other. In Nigeria, family disputes destroy kingdoms. But Daddy built something united. That is his miracle.'
    WHEN 10 THEN 'Daddy is the reason we exist, and more importantly, the reason we know how to love.'
  END,
  'confirmed', 'text', TRUE
FROM questions q WHERE q.type = 'about_other' AND q.display_order <= 10;

-- Grandpa Michael talking about Kemi
INSERT INTO answers (respondent_id, subject_id, question_id, answer_text, status, input_method, is_confirmed)
SELECT
  '11111111-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000010',
  q.id,
  CASE q.display_order
    WHEN 1 THEN 'Firstborn.'
    WHEN 2 THEN 'When Kemi was learning to cook and burned the rice so badly the pot turned black! She cried for hours. I told her "Kemi, even I burned rice as a young man." She did not believe me but it made her feel better.'
    WHEN 3 THEN 'My first child, my first teacher. Kemi taught me how to be a father. Every mistake I did not make with the younger ones was because Kemi patiently endured my learning curve.'
    WHEN 4 THEN 'Kemi calls her mother every single day, sometimes twice. No matter how busy she is. That devotion is rare and beautiful. She will do the same for me if I let her!'
    WHEN 5 THEN 'Kemi paid for Bunmis children school fees for three years after Deji passed. She told no one, just quietly handled it. That is my daughter - action over words.'
    WHEN 6 THEN 'A general who leads with love. Yes, she is tough. Yes, she gives orders. But everything she does is because she loves fiercely. Her troops - I mean, her siblings - are loyal because of this love.'
    WHEN 7 THEN 'Organization. That woman can plan an event for 500 people in one week. I do not know how she does it but I am grateful. Every family function, Kemi is the engine.'
    WHEN 8 THEN 'Her sacrifice. Kemi put her own dreams on hold many times to help raise her younger siblings. She was a second mother before she even had her own children. I can never repay that debt.'
    WHEN 9 THEN 'Being the template for her siblings. They all looked up to her, learned from her, sometimes competed with her. She set the standard of excellence that the Ademiluyi children are known for.'
    WHEN 10 THEN 'Kemi is my right hand - when I could not be there, she was. She is the extension of my authority and my love.'
  END,
  'confirmed', 'text', TRUE
FROM questions q WHERE q.type = 'about_other' AND q.display_order <= 10;

-- Sola talking about Bunmi
INSERT INTO answers (respondent_id, subject_id, question_id, answer_text, status, input_method, is_confirmed)
SELECT
  '11111111-0000-0000-0000-000000000020',
  '00000000-0000-0000-0000-000000000030',
  q.id,
  CASE q.display_order
    WHEN 1 THEN 'Survivor.'
    WHEN 2 THEN 'When Bunmi tried to discipline her son Kenny and he just laughed at her because she was also laughing! She could not keep a straight face. The whole room was dying of laughter. She has no poker face!'
    WHEN 3 THEN 'My sister who turned tragedy into testimony. What she went through would have destroyed most people. Instead, she became stronger and raised five incredible children alone.'
    WHEN 4 THEN 'Bunmi sings worship songs while doing literally everything - cooking, cleaning, driving. Her house always sounds like a church. It is actually quite comforting.'
    WHEN 5 THEN 'After Deji died, Bunmi moved in with me for three months. I held her while she cried every night. Watching her rebuild herself was the most inspiring thing I have ever witnessed.'
    WHEN 6 THEN 'The Phoenix from Harry Potter - literally risen from ashes, more powerful than before, and still beautiful. Bunmi is magical like that.'
    WHEN 7 THEN 'Faith under fire. When everything was falling apart, Bunmi never lost her faith. She cried, yes. She struggled, yes. But she never stopped believing. That is real strength.'
    WHEN 8 THEN 'Her mother heart. Those five children never felt fatherless because Bunmi loved enough for two parents. She gave them stability, discipline, and endless affection.'
    WHEN 9 THEN 'Being proof that widowhood is not the end. Young widows in our community look at Bunmi and find hope. Her life is a sermon without words.'
    WHEN 10 THEN 'Bunmi is our reminder that the Ademiluyi spirit cannot be broken - it can only grow stronger through trials.'
  END,
  'confirmed', 'text', TRUE
FROM questions q WHERE q.type = 'about_other' AND q.display_order <= 10;

-- Lily talking about her father Wale
INSERT INTO answers (respondent_id, subject_id, question_id, answer_text, status, input_method, is_confirmed)
SELECT
  '11111111-0000-0000-0000-000000000401',
  '00000000-0000-0000-0000-000000000040',
  q.id,
  CASE q.display_order
    WHEN 1 THEN 'Safe.'
    WHEN 2 THEN 'Dad trying to do the "whip and nae nae" dance at my birthday party! He was SO serious about getting it right. My friends still bring it up. He has no rhythm but maximum confidence!'
    WHEN 3 THEN 'My father is a quiet storm. He does not say much but when he moves, mountains move with him. He leads by example, not by volume.'
    WHEN 4 THEN 'Dad meditates every morning at 5am. No one knows this because he does it before anyone wakes up. I only found out because I woke up sick once and saw him sitting in silence, completely at peace.'
    WHEN 5 THEN 'When I was bullied in school, Dad flew from Nigeria to my university in two days. He did not even tell me he was coming. He just showed up, held me, and said "No one hurts my flower." I felt invincible.'
    WHEN 6 THEN 'Black Panther - T Challa himself! Quiet, dignified, powerful, and fiercely protective of his family (Wakanda = us!). Plus, Dad looks good in a suit like T Challa does.'
    WHEN 7 THEN 'Making you feel protected without even saying anything. Just his presence makes me feel safe. I have never felt afraid when Dad is around. Never.'
    WHEN 8 THEN 'His consistency. Dad is the same person every single day. No mood swings, no surprises. That stability is rare and precious. My siblings and I always knew what to expect.'
    WHEN 9 THEN 'Being proof that successful men can also be gentle fathers. Dad built an empire but never missed a school play, never forgot a birthday. He showed us you can have both.'
    WHEN 10 THEN 'Dad is our fortress - when the world is chaotic, he is steady. We all run to him when we need to feel grounded.'
  END,
  'confirmed', 'text', TRUE
FROM questions q WHERE q.type = 'about_other' AND q.display_order <= 10;

-- Akeem talking about Leke
INSERT INTO answers (respondent_id, subject_id, question_id, answer_text, status, input_method, is_confirmed)
SELECT
  '11111111-0000-0000-0000-000000000070',
  '00000000-0000-0000-0000-000000000080',
  q.id,
  CASE q.display_order
    WHEN 1 THEN 'Partner.'
    WHEN 2 THEN 'When Leke confidently gave directions to a taxi driver and we ended up in a completely different city! He was so sure he knew the way. We did not speak for an hour but now it is our funniest story.'
    WHEN 3 THEN 'My baby brother who somehow became my best friend. We are both unmarried, both the "different" ones in the family. We understand each other in ways the others cannot.'
    WHEN 4 THEN 'Leke has kept every single birthday card the family ever gave him. He has boxes of them. I found out when helping him move apartments. The man is secretly sentimental!'
    WHEN 5 THEN 'When I was going through depression, Leke did not give advice or quotes. He just sat with me in silence for hours. Sometimes that is all you need - someone who shows up without judgment.'
    WHEN 6 THEN 'The Dude from The Big Lebowski - laid back, goes with the flow, does not stress about what others think. Leke has this effortless coolness that I admire.'
    WHEN 7 THEN 'Making people feel comfortable. Leke has no pretense. What you see is what you get. People relax around him because he creates no pressure.'
    WHEN 8 THEN 'His freedom from expectations. While the rest of us chase achievements, Leke just... lives. He is happy. Truly happy. I think he cracked the code that the rest of us missed.'
    WHEN 9 THEN 'Showing that success looks different for everyone. Leke is not wealthy or famous but he is content. That is its own kind of success that our society does not celebrate enough.'
    WHEN 10 THEN 'Leke is our reminder to breathe - in a family of high achievers, he gives us permission to just be.'
  END,
  'confirmed', 'text', TRUE
FROM questions q WHERE q.type = 'about_other' AND q.display_order <= 10;

-- ============================================================
-- RE-ENABLE FOREIGN KEY CONSTRAINT
-- ============================================================
-- Re-add the constraint with NOT VALID so existing seed rows are not checked
-- but new rows (real users) must have valid auth.users entries.
ALTER TABLE profiles
  ADD CONSTRAINT profiles_id_fkey
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE NOT VALID;
