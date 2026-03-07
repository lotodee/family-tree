-- ============================================================
-- SEED: FUNNIER ANSWERS FOR VIDEO GENERATION
-- ============================================================
-- These answers are designed to trigger hilarious AI video generation
-- with embarrassing stories, roasts, and dramatic Nigerian family moments

-- Delete existing answers first
DELETE FROM answers;

-- ============================================================
-- KEMI'S SELF-ANSWERS (The Strict Firstborn)
-- ============================================================
INSERT INTO answers (respondent_id, subject_id, question_id, answer_text, status, input_method, is_confirmed)
SELECT
  '11111111-0000-0000-0000-000000000010',
  '00000000-0000-0000-0000-000000000010',
  q.id,
  CASE q.display_order
    WHEN 1 THEN 'My happiest memory is when Daddy caught Wale sneaking out at night to meet a girl and made him kneel down for 3 hours holding his ears. I watched from the window eating groundnuts. THAT was a good night.'
    WHEN 2 THEN 'Daddy taught me how to give "the look" - you know, the Nigerian parent look that can freeze a child mid-misbehavior from across the room. I have perfected it. My children cannot even THINK about misbehaving without feeling my eyes on them.'
    WHEN 3 THEN 'I am basically the FBI of this family. Nothing happens without me knowing. Ronke thinks she can hide things? Please. I knew about her secret boyfriend three months before she told anyone. I have spies everywhere - they are called "my children who tell me everything."'
    WHEN 4 THEN 'I once ate an entire pot of jollof rice meant for a family gathering and blamed it on the neighbor''s dog. I was 35 years old. The dog was a chihuahua. Nobody questioned it. I still cannot believe I got away with it.'
    WHEN 5 THEN 'Daddy''s 70th birthday when Bunmi''s wig flew off during her dance performance and landed on the cake. She kept dancing like nothing happened. The video still exists. I play it every Christmas.'
    WHEN 6 THEN 'I cannot cook without tasting everything fifty times. By the time the food is ready, I have already eaten half of it. My children think the portions are small because "that''s Nigerian style." No, it''s because your mother has no self-control.'
    WHEN 7 THEN 'Family means having people who will roast you at every gathering but will also fight anyone who tries to disrespect you. We are allowed to call each other useless, but let an outsider try it!'
    WHEN 8 THEN 'My biggest dream is to finally prove that I am Daddy''s favorite child. Wale thinks it''s him? Ha! Sola thinks it''s her? Please! I have been working on this for 60 years and I WILL win.'
    WHEN 9 THEN 'Daddy, remember when you said "Kemi, you will never find a husband with that mouth"? Well, I found one AND I control him completely. You were wrong AND right at the same time.'
    WHEN 10 THEN '"The Woman Who Knows Everything" - because I literally do. Ask me what any family member is doing right now and I can tell you. It''s not gossip, it''s INTELLIGENCE GATHERING.'
  END,
  'confirmed', 'text', TRUE
FROM questions q WHERE q.type = 'self' AND q.display_order <= 10;

-- ============================================================
-- WALE'S SELF-ANSWERS (The "Cool" Uncle)
-- ============================================================
INSERT INTO answers (respondent_id, subject_id, question_id, answer_text, status, input_method, is_confirmed)
SELECT
  '11111111-0000-0000-0000-000000000040',
  '00000000-0000-0000-0000-000000000040',
  q.id,
  CASE q.display_order
    WHEN 1 THEN 'When Daddy bought me my first car and I crashed it into a wall THREE HOURS later. He just looked at me, shook his head, and walked away. He did not speak to me for two weeks. Best two weeks of silence I ever got!'
    WHEN 2 THEN 'Daddy taught me that if you cannot beat them, marry someone smarter than you. That is why I married Toyin. She handles all the thinking. I just nod and say "yes dear" and life is peaceful.'
    WHEN 3 THEN 'I am the uncle who gives the children money and tells them not to tell their parents. Then I tell the parents anyway because watching the children panic is the funniest thing ever. I am chaotic neutral.'
    WHEN 4 THEN 'I practiced my wedding speech in the mirror for THREE MONTHS. When the day came, I forgot everything and just said "she is fine, I love her, let''s eat." Standing ovation. Sometimes less is more.'
    WHEN 5 THEN 'Christmas 2010 when Akeem tried to fry turkey for the first time and set the kitchen on fire. We all ran outside in our Christmas clothes. The turkey was still frozen in the middle. We ordered Chinese food. Best Christmas ever.'
    WHEN 6 THEN 'I argue with my wife in Yoruba when I know I am losing. She does not speak Yoruba well so I always win by default. Twenty years of marriage and she still has not figured out my strategy.'
    WHEN 7 THEN 'Family is a WhatsApp group that never stops pinging, where everyone has an opinion on your life, and you cannot leave because Mummy will call you crying asking what she did wrong.'
    WHEN 8 THEN 'My dream is to be the favorite uncle. Currently losing to Lanre because he gives bigger envelopes at parties. This is basically an arms race at this point.'
    WHEN 9 THEN 'Daddy, thank you for teaching me that it is okay to be wrong as long as you never admit it. The Ademiluyi way. I have passed this wisdom to my children.'
    WHEN 10 THEN '"The Man Who Peaked In Secondary School" - I was the coolest guy in school. Been riding that wave for 40 years. Still cool. Ask anybody. Actually, do not ask Kemi, she is biased.'
  END,
  'confirmed', 'text', TRUE
FROM questions q WHERE q.type = 'self' AND q.display_order <= 10;

-- ============================================================
-- SOLA'S SELF-ANSWERS (The Drama Queen)
-- ============================================================
INSERT INTO answers (respondent_id, subject_id, question_id, answer_text, status, input_method, is_confirmed)
SELECT
  '11111111-0000-0000-0000-000000000020',
  '00000000-0000-0000-0000-000000000020',
  q.id,
  CASE q.display_order
    WHEN 1 THEN 'When I won the family talent show three years in a row and Bunmi CRIED. She said I cheated because I used playback music. The music was live, I am just that good. She is still bitter about it.'
    WHEN 2 THEN 'Daddy taught me to enter every room like I own it. I do not just walk into places, I ARRIVE. Even when I go to the market, the tomato sellers know a queen is present.'
    WHEN 3 THEN 'I am the one who starts singing at family gatherings even when nobody asked. "Sola, we are trying to eat." And? You can eat AND enjoy my beautiful voice. You are welcome.'
    WHEN 4 THEN 'I have secretly kept every love letter Anthony wrote me since we started dating. He thinks he is not romantic. I have 47 letters that prove otherwise. I am saving them for his 60th birthday embarrassment.'
    WHEN 5 THEN 'Mummy and Daddy''s 50th anniversary when I choreographed a dance for all the children. Wale stepped on Ronke''s foot, she fell into the cake table, and the cake landed on the pastor. PERFECT entertainment.'
    WHEN 6 THEN 'I cannot have a conversation without making it about myself. You got promoted? Let me tell you about MY promotion in 1998. You are sick? Let me tell you about when I was sick but worse. It is a gift.'
    WHEN 7 THEN 'Family is God''s way of making sure you are never bored. Also never at peace. Also never without someone to fight with. Also never without someone to call at 2am crying. It is a package deal.'
    WHEN 8 THEN 'I want to renew my wedding vows but make it bigger than the original wedding. Anthony said we cannot afford it. I said "did I ask for your input?" Planning is ongoing.'
    WHEN 9 THEN 'Daddy, you always told me to dream big. So I did. I married Anthony, who is very tall. Six foot three. Big dreams achieved.'
    WHEN 10 THEN '"Sola: The Musical" - because my life IS a musical. I sing when I am happy, cry when I am sad, and perform for everyone whether they want it or not. You are all lucky to witness this.'
  END,
  'confirmed', 'text', TRUE
FROM questions q WHERE q.type = 'self' AND q.display_order <= 10;

-- ============================================================
-- BUNMI'S SELF-ANSWERS (The Underdog Fighter)
-- ============================================================
INSERT INTO answers (respondent_id, subject_id, question_id, answer_text, status, input_method, is_confirmed)
SELECT
  '11111111-0000-0000-0000-000000000030',
  '00000000-0000-0000-0000-000000000030',
  q.id,
  CASE q.display_order
    WHEN 1 THEN 'When I beat Kemi in arm wrestling at Daddy''s 85th birthday. She said she was not ready. She was ready. She is just weak. I have the video. I play it when I need motivation.'
    WHEN 2 THEN 'Daddy taught me that being the middle child means you have to fight for everything. So I fight. At the dinner table, I fight for the best piece of meat. In conversations, I fight to be heard. In life, I fight to win.'
    WHEN 3 THEN 'I am the aunt who remembers EVERY embarrassing thing you did as a child and brings it up at the worst possible moments. Your fiancé is meeting the family? Let me tell them about when you wet the bed at 12 years old.'
    WHEN 4 THEN 'I can hold a grudge for decades. Ronke borrowed my gold earrings in 1992 and never returned them. I smile at her at family gatherings but I have not forgotten. I WILL get those earrings back.'
    WHEN 5 THEN 'When my wig flew off at Daddy''s 70th birthday and I kept dancing. You know why? Because Ademiluyis do not stop performing just because of minor disasters. The wig was not important. The SHOW was important.'
    WHEN 6 THEN 'I pray out loud. Very loud. In public. On the bus. In the market. Anywhere. If you are uncomfortable with my relationship with God, that is YOUR problem.'
    WHEN 7 THEN 'Family is knowing that your siblings will clap for you when you succeed but also remind you of that time you failed spectacularly. It keeps you humble. Too humble sometimes.'
    WHEN 8 THEN 'My dream is for Kemi to finally admit that I am the better cook. It has been 45 years of her claiming she can cook better. She cannot. Her jollof is DRY. I said what I said.'
    WHEN 9 THEN 'Daddy, thank you for telling me I was your favorite when nobody was listening. I know you told everyone the same thing but I choose to believe you meant it most with me.'
    WHEN 10 THEN '"The Comeback Queen" - because every time life knocks me down, I get up, fix my wig, and keep dancing. Try to defeat me. You cannot. I am inevitable.'
  END,
  'confirmed', 'text', TRUE
FROM questions q WHERE q.type = 'self' AND q.display_order <= 10;

-- ============================================================
-- RONKE'S SELF-ANSWERS (The Fashionista)
-- ============================================================
INSERT INTO answers (respondent_id, subject_id, question_id, answer_text, status, input_method, is_confirmed)
SELECT
  '11111111-0000-0000-0000-000000000050',
  '00000000-0000-0000-0000-000000000050',
  q.id,
  CASE q.display_order
    WHEN 1 THEN 'When Daddy saw me in my first ankara outfit that I designed myself and said "Ronke, this is beautiful." I cried. Then he said "but it is too short" and I cried again for different reasons.'
    WHEN 2 THEN 'Daddy taught me that presentation matters. That is why I cannot leave the house without being fully coordinated. Shoes matching bag matching earrings matching lipstick. Even if I am just going to buy bread, I must look correct.'
    WHEN 3 THEN 'I am the one who judges everyone''s outfit at family gatherings but says nothing. My face says it all. Sola knows what she did at Christmas 2019. We do not need to discuss it. The color combination spoke for itself.'
    WHEN 4 THEN 'I have a secret Pinterest board of outfit ideas for my own funeral. It is not morbid, it is PLANNING. I will not be caught dead looking ordinary. Literally.'
    WHEN 5 THEN 'My wedding day. Not because of John - he was fine - but because my wedding dress was PERFECT. I designed it myself. Sola tried to outshine me with her asoebi. She failed. I have the photos to prove it.'
    WHEN 6 THEN 'I cannot watch Nigerian movies without commenting on the fashion. "Why is she wearing that?" "Those shoes with that dress?" My children have banned me from watching movies with them.'
    WHEN 7 THEN 'Family is a support system that will tell you your outfit is beautiful even when it is not, and then laugh about it behind your back. But it is okay because we all do it to each other.'
    WHEN 8 THEN 'My dream is to dress Kemi properly at least once. Just ONCE I want her to not look like she got dressed in the dark. It is a simple dream but it feels impossible.'
    WHEN 9 THEN 'Daddy, you once said my fashion sense came from Mummy. That is the best compliment you ever gave me. Mummy was always the best dressed woman in any room.'
    WHEN 10 THEN '"Fashion Emergency" - because whenever there is an event, I am the one everyone calls panicking about what to wear. I should start charging for consultations.'
  END,
  'confirmed', 'text', TRUE
FROM questions q WHERE q.type = 'self' AND q.display_order <= 10;

-- ============================================================
-- LANRE'S SELF-ANSWERS (The Quiet One With Secrets)
-- ============================================================
INSERT INTO answers (respondent_id, subject_id, question_id, answer_text, status, input_method, is_confirmed)
SELECT
  '11111111-0000-0000-0000-000000000060',
  '00000000-0000-0000-0000-000000000060',
  q.id,
  CASE q.display_order
    WHEN 1 THEN 'When I discovered Daddy''s secret stash of chin chin that he hid from everyone. I never told anyone. We had a silent agreement - I kept his secret, he let me have some. This is the first time I am revealing this.'
    WHEN 2 THEN 'Daddy taught me that the quiet ones see everything. While my siblings are fighting over who is the favorite, I am observing. Taking notes. Storing information for later use. The quiet ones are the dangerous ones.'
    WHEN 3 THEN 'I am the sibling nobody worries about because I "have it together." Little do they know I have eaten cereal for dinner 4 times this week. But my bills are paid so nobody questions it.'
    WHEN 4 THEN 'I have been pretending to not understand Yoruba well for 20 years so people say interesting things around me. The SECRETS I have collected. I could write a book. Maybe I will.'
    WHEN 5 THEN 'When all my siblings got drunk at Daddy''s 80th birthday and I recorded everything. I have videos of Wale crying about his childhood, Sola confessing she cannot actually sing, and Kemi admitting she is not as smart as she thinks. LEVERAGE.'
    WHEN 6 THEN 'I take three-hour naps on weekends and tell everyone I was "busy with work stuff." Shayo knows but she is also napping so she cannot say anything. Marriage is about mutual blackmail.'
    WHEN 7 THEN 'Family is a reality TV show that you cannot escape. You did not audition for this, you cannot quit, and the drama never ends. But the catering is good and the characters are entertaining.'
    WHEN 8 THEN 'My biggest dream is to finally reveal all the family secrets I have been collecting and watch the chaos unfold. But I will save it for a really important occasion. Maybe Daddy''s 100th birthday speech.'
    WHEN 9 THEN 'Daddy, you always said "Lanre is the sensible one." I am not sensible. I am just quiet. Those are very different things. Thank you for the cover though.'
    WHEN 10 THEN '"The Silent Witness" - because I have seen things. I know things. I will never tell. Unless you cross me. Then I will tell EVERYTHING.'
  END,
  'confirmed', 'text', TRUE
FROM questions q WHERE q.type = 'self' AND q.display_order <= 10;

-- ============================================================
-- AKEEM'S SELF-ANSWERS (The Troublemaker Bachelor)
-- ============================================================
INSERT INTO answers (respondent_id, subject_id, question_id, answer_text, status, input_method, is_confirmed)
SELECT
  '11111111-0000-0000-0000-000000000070',
  '00000000-0000-0000-0000-000000000070',
  q.id,
  CASE q.display_order
    WHEN 1 THEN 'When Daddy stopped asking me when I am getting married. It took 15 years of "I am focusing on myself" but he finally gave up. Victory tastes like freedom and silence at family gatherings.'
    WHEN 2 THEN 'Daddy taught me that being the troublemaker is a full-time job. Someone has to keep family gatherings interesting. If everyone is comfortable, I am not doing my job.'
    WHEN 3 THEN 'I am the one who brings up old family drama at dinner just to watch people squirm. "Remember when Wale crashed the car?" "Remember Bunmi''s wig incident?" I am a historian. An important job.'
    WHEN 4 THEN 'I have been telling women I am younger than I actually am for so long that I genuinely forgot my real age. Leke had to remind me last year. This is fine. Age is just a number anyway.'
    WHEN 5 THEN 'Christmas 2010 when I set the kitchen on fire trying to deep fry a frozen turkey. In my defense, YouTube made it look easy. The fire department was very nice about it. Kemi was NOT.'
    WHEN 6 THEN 'I cannot commit to dinner plans, let alone marriage. My siblings have stopped inviting me to events because I confirm, then maybe show up, then definitely leave early. It is called being mysterious.'
    WHEN 7 THEN 'Family is a group of people who will never let you forget your mistakes but will also never let you pay for dinner. Fair trade honestly.'
    WHEN 8 THEN 'My dream is to continue being the fun uncle with no responsibilities until I die. Kids love me because I am basically a large child. This is my superpower.'
    WHEN 9 THEN 'Daddy, thank you for never giving up on me even when I gave you plenty of reasons to. The turkey fire, the car incidents, the multiple "career changes." Your patience is legendary.'
    WHEN 10 THEN '"Commitment Issues: The Movie" - it would be a very short movie because I would leave before finishing it. Just like everything else in my life.'
  END,
  'confirmed', 'text', TRUE
FROM questions q WHERE q.type = 'self' AND q.display_order <= 10;

-- ============================================================
-- LEKE'S SELF-ANSWERS (The Baby Of The Family)
-- ============================================================
INSERT INTO answers (respondent_id, subject_id, question_id, answer_text, status, input_method, is_confirmed)
SELECT
  '11111111-0000-0000-0000-000000000080',
  '00000000-0000-0000-0000-000000000080',
  q.id,
  CASE q.display_order
    WHEN 1 THEN 'When I realized that being the lastborn meant I could blame everything on my older siblings and Mummy would believe me. "Wale did it" worked until I was 25 years old. Still works sometimes.'
    WHEN 2 THEN 'Daddy taught me that being the baby of the family is a POSITION, not an age. I will be the baby at 50 years old. At 60. At 70. I have permanently secured this role and I am not giving it up.'
    WHEN 3 THEN 'I am the one who cries first at family gatherings. Happy tears, sad tears, "I ate too much" tears. My siblings call me emotional. I call it "being in touch with my feelings." They are jealous.'
    WHEN 4 THEN 'I have been secretly recording a podcast about family drama for two years. It is called "What Happened At Christmas" and it has 12 listeners. All anonymous. I suspect Lanre is one of them.'
    WHEN 5 THEN 'My naming ceremony. I do not remember it but I have heard the story 400 times. Apparently I cried so much that the pastor shortened the ceremony. I was making a statement even as a baby.'
    WHEN 6 THEN 'I still call Mummy when I have problems. I am a grown adult with bills and responsibilities but when something goes wrong, I call Mummy. And she still says "ask your Daddy." Circle of life.'
    WHEN 7 THEN 'Family is a group of people who remember you as a child no matter how old you get. Kemi still talks to me like I am five. I am literally an adult with a job but okay Aunty Kemi, tell me what to do again.'
    WHEN 8 THEN 'My dream is to write a book about growing up as the lastborn in a Nigerian family. Working title: "It Wasn''t Me: A Memoir of Blaming My Siblings."'
    WHEN 9 THEN 'Daddy, thank you for defending me against Kemi when she said I was spoiled. You said "he is not spoiled, he is LOVED." Same thing but it sounded better coming from you.'
    WHEN 10 THEN '"Baby of the Family" - it is not a movie, it is a documentary about my life as the most protected, most excused, and most loved child. My siblings will hate it. I do not care.'
  END,
  'confirmed', 'text', TRUE
FROM questions q WHERE q.type = 'self' AND q.display_order <= 10;

-- ============================================================
-- NOTE: Dotun's profile is not seeded (he registers with real account)
-- His answers will be added when he registers
-- ============================================================

-- ============================================================
-- OLAMIDE'S SELF-ANSWERS (The Overachiever)
-- ============================================================
INSERT INTO answers (respondent_id, subject_id, question_id, answer_text, status, input_method, is_confirmed)
SELECT
  '11111111-0000-0000-0000-000000000102',
  '00000000-0000-0000-0000-000000000102',
  q.id,
  CASE q.display_order
    WHEN 1 THEN 'When I came first in class and Mummy said "why not first in the SCHOOL?" I have been chasing that impossible standard ever since. I came first in school eventually. She said "why not first in the STATE?" It never ends.'
    WHEN 2 THEN 'Grandpa taught me that Ademiluyis do not come second. We come first or we do not compete. This has given me crippling perfectionism but also several awards so... balanced?'
    WHEN 3 THEN 'I am the cousin who asks "what are your five-year goals?" at family parties. Everyone hates me for it but SOMEONE needs to make sure this generation does not waste their potential!'
    WHEN 4 THEN 'I once cried because I got 98% on a test. My teacher asked what was wrong. I said "where is the other 2%?" She thought I was joking. I was NOT joking. Those 2 marks are still missing.'
    WHEN 5 THEN 'When I graduated top of my class and my parents clapped politely like I had just done the MINIMUM. Then Dotun graduated with average grades and they threw a PARTY. The favoritism is real.'
    WHEN 6 THEN 'I color-code my notes, my calendar, AND my refrigerator. My siblings think I am crazy. I think they are disorganized. We are both right.'
    WHEN 7 THEN 'Family means people who will celebrate your achievements for exactly 5 minutes before asking "what is next?" This keeps me motivated. Also stressed. But mostly motivated.'
    WHEN 8 THEN 'My dream is for Mummy to say "I am proud of you" without following it with "BUT you should also..." Just once. Just ONCE I want the sentence to end at "proud of you."'
    WHEN 9 THEN 'Grandpa, you told me I was smart when I was 5 years old and I have been trying to prove it ever since. Thirty years of proving myself. I am tired but I cannot stop now.'
    WHEN 10 THEN '"Still Not Good Enough: The Olamide Story" - A documentary about Nigerian childhood expectations and the therapy I will eventually need. Coming to Netflix never, because I am too busy achieving things.'
  END,
  'confirmed', 'text', TRUE
FROM questions q WHERE q.type = 'self' AND q.display_order <= 10;

-- ============================================================
-- YINKA'S SELF-ANSWERS (The Sarcastic One)
-- ============================================================
INSERT INTO answers (respondent_id, subject_id, question_id, answer_text, status, input_method, is_confirmed)
SELECT
  '11111111-0000-0000-0000-000000000101',
  '00000000-0000-0000-0000-000000000101',
  q.id,
  CASE q.display_order
    WHEN 1 THEN 'When Grandpa forgot my name at Christmas dinner and called me Yemi. Then Yomi. Then Yetunde. He eventually just pointed at me and said "that one." I felt so seen.'
    WHEN 2 THEN 'Grandpa taught me the art of selective hearing. When someone is being annoying, just pretend you cannot hear them. Works at family gatherings. Works at work. Life-changing skill.'
    WHEN 3 THEN 'I am the cousin who responds to "how are you?" with "existing." My aunties have stopped asking. Mission accomplished.'
    WHEN 4 THEN 'I have perfected the art of looking busy at family events to avoid being assigned work. Phone in hand, frown on face, occasionally sighing at nothing. Works every time.'
    WHEN 5 THEN 'When Uncle Wale tried to give a speech at Grandpa''s 85th birthday and his notes fell into the soup. He kept talking like nothing happened. That is the energy I aspire to.'
    WHEN 6 THEN 'I cannot smile for photos. My face does not cooperate. In every family picture, everyone is beaming and I look like I am being held hostage. It is a medical condition at this point.'
    WHEN 7 THEN 'Family is people who know exactly which of your buttons to push but do it anyway because "it is funny." It is not funny. But I cannot leave because they have the food.'
    WHEN 8 THEN 'My dream is to attend one family gathering without someone asking about my love life. Current record: zero gatherings. The streak continues.'
    WHEN 9 THEN 'Grandpa, thank you for being equally confused about everyone''s names. It makes me feel like part of a shared experience rather than personally forgotten.'
    WHEN 10 THEN '"Why Am I Like This?" - An introspective drama about being the sarcastic one in a family of dramatic people. Runtime: however long this family gathering takes.'
  END,
  'confirmed', 'text', TRUE
FROM questions q WHERE q.type = 'self' AND q.display_order <= 10;
