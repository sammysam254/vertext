-- ============================================================
-- Vertex — Test User + 50 Videos Seed
-- Run AFTER 001_schema.sql
-- ============================================================

-- 1. Create test user in auth.users
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password,
  email_confirmed_at, raw_user_meta_data,
  created_at, updated_at, role, aud
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'testcreator@vertex.app',
  crypt('vertex_test_2024', gen_salt('bf')),
  now(),
  '{"username": "testcreator"}'::jsonb,
  now(), now(), 'authenticated', 'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- 2. Create profile
INSERT INTO profiles (id, username, display_name, bio, is_verified)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'testcreator', 'Vertex Test Creator',
  '🎬 Official test account · Creating content on Vertex', true
) ON CONFLICT (id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  bio = EXCLUDED.bio,
  is_verified = EXCLUDED.is_verified;

-- 3. Earnings record
INSERT INTO earnings (user_id, total_platform_revenue_kes, total_earned_kes, available_balance_kes, lifetime_views)
VALUES ('00000000-0000-0000-0000-000000000001', 1500.0000, 600.0000, 600.0000, 5000)
ON CONFLICT (user_id) DO UPDATE SET
  total_platform_revenue_kes = EXCLUDED.total_platform_revenue_kes,
  total_earned_kes = EXCLUDED.total_earned_kes,
  available_balance_kes = EXCLUDED.available_balance_kes;

-- 4. Insert 50 test videos
-- Fix: use individual INSERT statements to avoid the text[] casting issue
-- with PL/pgSQL 2D arrays. Each row has its own explicit ARRAY[...] literal.

INSERT INTO videos (user_id, title, description, video_url, duration, hashtags, is_public, allow_comments, view_count, like_count, comment_count, share_count) VALUES
('00000000-0000-0000-0000-000000000001','Morning Vibes','Starting the day right ☀️','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',10,ARRAY['morning','lifestyle','vibes'],true,true,floor(random()*10000)::bigint,floor(random()*1000)::bigint,floor(random()*100)::bigint,floor(random()*200)::bigint),
('00000000-0000-0000-0000-000000000001','City Lights','Urban nights are unmatched 🌃','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',10,ARRAY['city','night','urban'],true,true,floor(random()*10000)::bigint,floor(random()*1000)::bigint,floor(random()*100)::bigint,floor(random()*200)::bigint),
('00000000-0000-0000-0000-000000000001','Cooking Hack','This trick will change your life 🍳','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',10,ARRAY['food','cooking','hack'],true,true,floor(random()*10000)::bigint,floor(random()*1000)::bigint,floor(random()*100)::bigint,floor(random()*200)::bigint),
('00000000-0000-0000-0000-000000000001','Dance Challenge','Can you keep up? 💃','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',10,ARRAY['dance','challenge','fun'],true,true,floor(random()*10000)::bigint,floor(random()*1000)::bigint,floor(random()*100)::bigint,floor(random()*200)::bigint),
('00000000-0000-0000-0000-000000000001','Travel Diary','Nairobi to the world 🌍','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',10,ARRAY['travel','nairobi','kenya'],true,true,floor(random()*10000)::bigint,floor(random()*1000)::bigint,floor(random()*100)::bigint,floor(random()*200)::bigint),
('00000000-0000-0000-0000-000000000001','Fitness Routine','5 min workout, no excuses 💪','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',10,ARRAY['fitness','workout','health'],true,true,floor(random()*10000)::bigint,floor(random()*1000)::bigint,floor(random()*100)::bigint,floor(random()*200)::bigint),
('00000000-0000-0000-0000-000000000001','Tech Review','Is this phone worth it? 📱','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',10,ARRAY['tech','review','phone'],true,true,floor(random()*10000)::bigint,floor(random()*1000)::bigint,floor(random()*100)::bigint,floor(random()*200)::bigint),
('00000000-0000-0000-0000-000000000001','Sunset Chill','Golden hour hits different 🌅','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4',10,ARRAY['sunset','chill','nature'],true,true,floor(random()*10000)::bigint,floor(random()*1000)::bigint,floor(random()*100)::bigint,floor(random()*200)::bigint),
('00000000-0000-0000-0000-000000000001','Comedy Skit','When your boss calls on Friday 😂','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',10,ARRAY['comedy','funny','relatable'],true,true,floor(random()*10000)::bigint,floor(random()*1000)::bigint,floor(random()*100)::bigint,floor(random()*200)::bigint),
('00000000-0000-0000-0000-000000000001','Music Cover','My take on this classic 🎵','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4',10,ARRAY['music','cover','singing'],true,true,floor(random()*10000)::bigint,floor(random()*1000)::bigint,floor(random()*100)::bigint,floor(random()*200)::bigint),
('00000000-0000-0000-0000-000000000001','Street Food','Best nyama choma in Nairobi 🥩','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',10,ARRAY['food','streetfood','kenya'],true,true,floor(random()*10000)::bigint,floor(random()*1000)::bigint,floor(random()*100)::bigint,floor(random()*200)::bigint),
('00000000-0000-0000-0000-000000000001','Study With Me','2 hour focus session 📚','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',10,ARRAY['study','focus','productivity'],true,true,floor(random()*10000)::bigint,floor(random()*1000)::bigint,floor(random()*100)::bigint,floor(random()*200)::bigint),
('00000000-0000-0000-0000-000000000001','Fashion Fit','OOTD — thrifted everything 👗','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',10,ARRAY['fashion','ootd','thrift'],true,true,floor(random()*10000)::bigint,floor(random()*1000)::bigint,floor(random()*100)::bigint,floor(random()*200)::bigint),
('00000000-0000-0000-0000-000000000001','Pet Moments','My cat judging me again 🐱','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',10,ARRAY['pets','cat','cute'],true,true,floor(random()*10000)::bigint,floor(random()*1000)::bigint,floor(random()*100)::bigint,floor(random()*200)::bigint),
('00000000-0000-0000-0000-000000000001','Life Advice','Things I wish I knew at 20 🧠','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',10,ARRAY['advice','life','wisdom'],true,true,floor(random()*10000)::bigint,floor(random()*1000)::bigint,floor(random()*100)::bigint,floor(random()*200)::bigint),
('00000000-0000-0000-0000-000000000001','Art Process','Watch me paint this in 60s 🎨','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',10,ARRAY['art','painting','creative'],true,true,floor(random()*10000)::bigint,floor(random()*1000)::bigint,floor(random()*100)::bigint,floor(random()*200)::bigint),
('00000000-0000-0000-0000-000000000001','Night Routine','How I wind down 🌙','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',10,ARRAY['routine','night','selfcare'],true,true,floor(random()*10000)::bigint,floor(random()*1000)::bigint,floor(random()*100)::bigint,floor(random()*200)::bigint),
('00000000-0000-0000-0000-000000000001','Gym Progress','6 months transformation 🏋️','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4',10,ARRAY['gym','fitness','transformation'],true,true,floor(random()*10000)::bigint,floor(random()*1000)::bigint,floor(random()*100)::bigint,floor(random()*200)::bigint),
('00000000-0000-0000-0000-000000000001','Book Review','This book changed my mindset 📖','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',10,ARRAY['books','reading','review'],true,true,floor(random()*10000)::bigint,floor(random()*1000)::bigint,floor(random()*100)::bigint,floor(random()*200)::bigint),
('00000000-0000-0000-0000-000000000001','Nairobi Vlog','A day in the city 🏙️','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4',10,ARRAY['nairobi','vlog','kenya'],true,true,floor(random()*10000)::bigint,floor(random()*1000)::bigint,floor(random()*100)::bigint,floor(random()*200)::bigint),
('00000000-0000-0000-0000-000000000001','Smoothie Recipe','Healthy and delicious 🥤','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',10,ARRAY['health','recipe','smoothie'],true,true,floor(random()*10000)::bigint,floor(random()*1000)::bigint,floor(random()*100)::bigint,floor(random()*200)::bigint),
('00000000-0000-0000-0000-000000000001','Coding Tips','Shortcuts that save hours ⌨️','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',10,ARRAY['coding','tech','tips'],true,true,floor(random()*10000)::bigint,floor(random()*1000)::bigint,floor(random()*100)::bigint,floor(random()*200)::bigint),
('00000000-0000-0000-0000-000000000001','Motivation Monday','Start the week strong 🔥','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',10,ARRAY['motivation','monday','mindset'],true,true,floor(random()*10000)::bigint,floor(random()*1000)::bigint,floor(random()*100)::bigint,floor(random()*200)::bigint),
('00000000-0000-0000-0000-000000000001','Plant Care','How I keep my plants alive 🌿','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',10,ARRAY['plants','garden','nature'],true,true,floor(random()*10000)::bigint,floor(random()*1000)::bigint,floor(random()*100)::bigint,floor(random()*200)::bigint),
('00000000-0000-0000-0000-000000000001','Coffee Art','Latte art tutorial ☕','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',10,ARRAY['coffee','art','barista'],true,true,floor(random()*10000)::bigint,floor(random()*1000)::bigint,floor(random()*100)::bigint,floor(random()*200)::bigint),
('00000000-0000-0000-0000-000000000001','Skincare Routine','My 5-step morning routine 🧴','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',10,ARRAY['skincare','beauty','routine'],true,true,floor(random()*10000)::bigint,floor(random()*1000)::bigint,floor(random()*100)::bigint,floor(random()*200)::bigint),
('00000000-0000-0000-0000-000000000001','Matatu Culture','Nairobi matatu vibes 🚌','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',10,ARRAY['nairobi','matatu','culture'],true,true,floor(random()*10000)::bigint,floor(random()*1000)::bigint,floor(random()*100)::bigint,floor(random()*200)::bigint),
('00000000-0000-0000-0000-000000000001','Unboxing','What I ordered online 📦','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4',10,ARRAY['unboxing','shopping','haul'],true,true,floor(random()*10000)::bigint,floor(random()*1000)::bigint,floor(random()*100)::bigint,floor(random()*200)::bigint),
('00000000-0000-0000-0000-000000000001','Sunset Run','Evening jog hits different 🏃','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',10,ARRAY['running','fitness','sunset'],true,true,floor(random()*10000)::bigint,floor(random()*1000)::bigint,floor(random()*100)::bigint,floor(random()*200)::bigint),
('00000000-0000-0000-0000-000000000001','DIY Decor','Room makeover on a budget 🏠','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4',10,ARRAY['diy','decor','home'],true,true,floor(random()*10000)::bigint,floor(random()*1000)::bigint,floor(random()*100)::bigint,floor(random()*200)::bigint),
('00000000-0000-0000-0000-000000000001','Kenyan Cuisine','Ugali and sukuma wiki 🍽️','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',10,ARRAY['food','kenya','cuisine'],true,true,floor(random()*10000)::bigint,floor(random()*1000)::bigint,floor(random()*100)::bigint,floor(random()*200)::bigint),
('00000000-0000-0000-0000-000000000001','Mindfulness','5 min meditation for beginners 🧘','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',10,ARRAY['meditation','mindfulness','wellness'],true,true,floor(random()*10000)::bigint,floor(random()*1000)::bigint,floor(random()*100)::bigint,floor(random()*200)::bigint),
('00000000-0000-0000-0000-000000000001','Photography Tips','Better photos with your phone 📸','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',10,ARRAY['photography','tips','phone'],true,true,floor(random()*10000)::bigint,floor(random()*1000)::bigint,floor(random()*100)::bigint,floor(random()*200)::bigint),
('00000000-0000-0000-0000-000000000001','Hustle Story','From zero to something 💼','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',10,ARRAY['hustle','business','motivation'],true,true,floor(random()*10000)::bigint,floor(random()*1000)::bigint,floor(random()*100)::bigint,floor(random()*200)::bigint),
('00000000-0000-0000-0000-000000000001','Afrobeats Mix','Banger after banger 🎶','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',10,ARRAY['music','afrobeats','mix'],true,true,floor(random()*10000)::bigint,floor(random()*1000)::bigint,floor(random()*100)::bigint,floor(random()*200)::bigint),
('00000000-0000-0000-0000-000000000001','Language Learning','Swahili in 60 seconds 🗣️','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',10,ARRAY['language','swahili','learning'],true,true,floor(random()*10000)::bigint,floor(random()*1000)::bigint,floor(random()*100)::bigint,floor(random()*200)::bigint),
('00000000-0000-0000-0000-000000000001','Budget Tips','Save KES 10k this month 💰','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',10,ARRAY['money','budget','finance'],true,true,floor(random()*10000)::bigint,floor(random()*1000)::bigint,floor(random()*100)::bigint,floor(random()*200)::bigint),
('00000000-0000-0000-0000-000000000001','Sunrise Hike','Mt. Kenya views are insane 🏔️','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4',10,ARRAY['hiking','kenya','nature'],true,true,floor(random()*10000)::bigint,floor(random()*1000)::bigint,floor(random()*100)::bigint,floor(random()*200)::bigint),
('00000000-0000-0000-0000-000000000001','Viral Recipe','TikTok pasta but make it Kenyan 🍝','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',10,ARRAY['food','recipe','viral'],true,true,floor(random()*10000)::bigint,floor(random()*1000)::bigint,floor(random()*100)::bigint,floor(random()*200)::bigint),
('00000000-0000-0000-0000-000000000001','Thrift Haul','KES 500 outfit challenge 👕','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4',10,ARRAY['fashion','thrift','budget'],true,true,floor(random()*10000)::bigint,floor(random()*1000)::bigint,floor(random()*100)::bigint,floor(random()*200)::bigint),
('00000000-0000-0000-0000-000000000001','Productivity Hack','How I get 10x more done ⚡','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',10,ARRAY['productivity','hack','tips'],true,true,floor(random()*10000)::bigint,floor(random()*1000)::bigint,floor(random()*100)::bigint,floor(random()*200)::bigint),
('00000000-0000-0000-0000-000000000001','Relationship Advice','Red flags you are ignoring 🚩','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',10,ARRAY['relationships','advice','dating'],true,true,floor(random()*10000)::bigint,floor(random()*1000)::bigint,floor(random()*100)::bigint,floor(random()*200)::bigint),
('00000000-0000-0000-0000-000000000001','Nairobi Nightlife','Where to go this weekend 🎉','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',10,ARRAY['nairobi','nightlife','fun'],true,true,floor(random()*10000)::bigint,floor(random()*1000)::bigint,floor(random()*100)::bigint,floor(random()*200)::bigint),
('00000000-0000-0000-0000-000000000001','Crypto Explained','Bitcoin in 60 seconds ₿','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',10,ARRAY['crypto','bitcoin','finance'],true,true,floor(random()*10000)::bigint,floor(random()*1000)::bigint,floor(random()*100)::bigint,floor(random()*200)::bigint),
('00000000-0000-0000-0000-000000000001','Yoga Flow','Morning stretch routine 🧘','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',10,ARRAY['yoga','fitness','morning'],true,true,floor(random()*10000)::bigint,floor(random()*1000)::bigint,floor(random()*100)::bigint,floor(random()*200)::bigint),
('00000000-0000-0000-0000-000000000001','Street Style','Nairobi fashion week vibes 👟','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',10,ARRAY['fashion','nairobi','style'],true,true,floor(random()*10000)::bigint,floor(random()*1000)::bigint,floor(random()*100)::bigint,floor(random()*200)::bigint),
('00000000-0000-0000-0000-000000000001','Coding Project','Built this app in a weekend 💻','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',10,ARRAY['coding','project','tech'],true,true,floor(random()*10000)::bigint,floor(random()*1000)::bigint,floor(random()*100)::bigint,floor(random()*200)::bigint),
('00000000-0000-0000-0000-000000000001','Gratitude Journal','Why I write every morning 📝','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4',10,ARRAY['journal','gratitude','mindset'],true,true,floor(random()*10000)::bigint,floor(random()*1000)::bigint,floor(random()*100)::bigint,floor(random()*200)::bigint),
('00000000-0000-0000-0000-000000000001','Kenyan Wildlife','Maasai Mara is unreal 🦁','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',10,ARRAY['wildlife','kenya','safari'],true,true,floor(random()*10000)::bigint,floor(random()*1000)::bigint,floor(random()*100)::bigint,floor(random()*200)::bigint),
('00000000-0000-0000-0000-000000000001','Vertex Earnings','I made KES 2,400 this month! 💚','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4',10,ARRAY['vertex','earnings','creator'],true,true,floor(random()*10000)::bigint,floor(random()*1000)::bigint,floor(random()*100)::bigint,floor(random()*200)::bigint);

-- 5. Seed ad impressions linked to the test user's videos
INSERT INTO ad_impressions (video_id, creator_id, ad_network, ad_type, revenue_kes)
SELECT
  v.id,
  '00000000-0000-0000-0000-000000000001',
  (ARRAY['monetag','adsense','simulated'])[floor(random()*3+1)::int],
  (ARRAY['interstitial','banner','rewarded'])[floor(random()*3+1)::int],
  round((random() * 2 + 0.05)::numeric, 4)
FROM videos v
WHERE v.user_id = '00000000-0000-0000-0000-000000000001'
LIMIT 30;

SELECT '✅ Seeded 50 test videos + test user successfully!' AS result;
