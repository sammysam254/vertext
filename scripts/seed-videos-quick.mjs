/**
 * Vertex — Quick Test Video Seeder (no ffmpeg required)
 * Uses publicly available short test videos from the internet,
 * then inserts 50 video records pointing to them.
 *
 * Run: node scripts/seed-videos-quick.mjs
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://dkffujuqrhojgzpslmok.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrZmZ1anVxcmhvamd6cHNsbW9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5NzU3NzUsImV4cCI6MjA5MDU1MTc3NX0.TUE6LZqp2bv1Xv4AjIeNmEjcUbnbJJPgQvouIDYPw_M';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Free-to-use short vertical test videos (9:16 aspect ratio, ~10s each)
// These are sample/demo videos from public CDNs
const TEST_VIDEO_URLS = [
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4',
];

const VIDEO_DATA = [
  { title: 'Morning Vibes', desc: 'Starting the day right ☀️', tags: ['morning', 'lifestyle', 'vibes'] },
  { title: 'City Lights', desc: 'Urban nights are unmatched 🌃', tags: ['city', 'night', 'urban'] },
  { title: 'Cooking Hack', desc: 'This trick will change your life 🍳', tags: ['food', 'cooking', 'hack'] },
  { title: 'Dance Challenge', desc: 'Can you keep up? 💃', tags: ['dance', 'challenge', 'fun'] },
  { title: 'Travel Diary', desc: 'Nairobi to the world 🌍', tags: ['travel', 'nairobi', 'kenya'] },
  { title: 'Fitness Routine', desc: '5 min workout, no excuses 💪', tags: ['fitness', 'workout', 'health'] },
  { title: 'Tech Review', desc: 'Is this phone worth it? 📱', tags: ['tech', 'review', 'phone'] },
  { title: 'Sunset Chill', desc: 'Golden hour hits different 🌅', tags: ['sunset', 'chill', 'nature'] },
  { title: 'Comedy Skit', desc: 'When your boss calls on Friday 😂', tags: ['comedy', 'funny', 'relatable'] },
  { title: 'Music Cover', desc: 'My take on this classic 🎵', tags: ['music', 'cover', 'singing'] },
  { title: 'Street Food', desc: 'Best nyama choma in Nairobi 🥩', tags: ['food', 'streetfood', 'kenya'] },
  { title: 'Study With Me', desc: '2 hour focus session 📚', tags: ['study', 'focus', 'productivity'] },
  { title: 'Fashion Fit', desc: 'OOTD — thrifted everything 👗', tags: ['fashion', 'ootd', 'thrift'] },
  { title: 'Pet Moments', desc: 'My cat judging me again 🐱', tags: ['pets', 'cat', 'cute'] },
  { title: 'Life Advice', desc: 'Things I wish I knew at 20 🧠', tags: ['advice', 'life', 'wisdom'] },
  { title: 'Art Process', desc: 'Watch me paint this in 60s 🎨', tags: ['art', 'painting', 'creative'] },
  { title: 'Night Routine', desc: 'How I wind down 🌙', tags: ['routine', 'night', 'selfcare'] },
  { title: 'Gym Progress', desc: '6 months transformation 🏋️', tags: ['gym', 'fitness', 'transformation'] },
  { title: 'Book Review', desc: 'This book changed my mindset 📖', tags: ['books', 'reading', 'review'] },
  { title: 'Nairobi Vlog', desc: 'A day in the city 🏙️', tags: ['nairobi', 'vlog', 'kenya'] },
  { title: 'Smoothie Recipe', desc: 'Healthy and delicious 🥤', tags: ['health', 'recipe', 'smoothie'] },
  { title: 'Coding Tips', desc: 'Shortcuts that save hours ⌨️', tags: ['coding', 'tech', 'tips'] },
  { title: 'Motivation Monday', desc: 'Start the week strong 🔥', tags: ['motivation', 'monday', 'mindset'] },
  { title: 'Plant Care', desc: 'How I keep my plants alive 🌿', tags: ['plants', 'garden', 'nature'] },
  { title: 'Coffee Art', desc: 'Latte art tutorial ☕', tags: ['coffee', 'art', 'barista'] },
  { title: 'Skincare Routine', desc: 'My 5-step morning routine 🧴', tags: ['skincare', 'beauty', 'routine'] },
  { title: 'Matatu Culture', desc: 'Nairobi matatu vibes 🚌', tags: ['nairobi', 'matatu', 'culture'] },
  { title: 'Unboxing', desc: 'What I ordered online 📦', tags: ['unboxing', 'shopping', 'haul'] },
  { title: 'Sunset Run', desc: 'Evening jog hits different 🏃', tags: ['running', 'fitness', 'sunset'] },
  { title: 'DIY Decor', desc: 'Room makeover on a budget 🏠', tags: ['diy', 'decor', 'home'] },
  { title: 'Kenyan Cuisine', desc: 'Ugali and sukuma wiki 🍽️', tags: ['food', 'kenya', 'cuisine'] },
  { title: 'Mindfulness', desc: '5 min meditation for beginners 🧘', tags: ['meditation', 'mindfulness', 'wellness'] },
  { title: 'Photography Tips', desc: 'Better photos with your phone 📸', tags: ['photography', 'tips', 'phone'] },
  { title: 'Hustle Story', desc: 'From zero to something 💼', tags: ['hustle', 'business', 'motivation'] },
  { title: 'Afrobeats Mix', desc: 'Banger after banger 🎶', tags: ['music', 'afrobeats', 'mix'] },
  { title: 'Language Learning', desc: 'Swahili in 60 seconds 🗣️', tags: ['language', 'swahili', 'learning'] },
  { title: 'Budget Tips', desc: 'Save KES 10k this month 💰', tags: ['money', 'budget', 'finance'] },
  { title: 'Sunrise Hike', desc: 'Mt. Kenya views are insane 🏔️', tags: ['hiking', 'kenya', 'nature'] },
  { title: 'Viral Recipe', desc: 'TikTok pasta but make it Kenyan 🍝', tags: ['food', 'recipe', 'viral'] },
  { title: 'Thrift Haul', desc: 'KES 500 outfit challenge 👕', tags: ['fashion', 'thrift', 'budget'] },
  { title: 'Productivity Hack', desc: 'How I get 10x more done ⚡', tags: ['productivity', 'hack', 'tips'] },
  { title: 'Relationship Advice', desc: 'Red flags you are ignoring 🚩', tags: ['relationships', 'advice', 'dating'] },
  { title: 'Nairobi Nightlife', desc: 'Where to go this weekend 🎉', tags: ['nairobi', 'nightlife', 'fun'] },
  { title: 'Crypto Explained', desc: 'Bitcoin in 60 seconds ₿', tags: ['crypto', 'bitcoin', 'finance'] },
  { title: 'Yoga Flow', desc: 'Morning stretch routine 🧘', tags: ['yoga', 'fitness', 'morning'] },
  { title: 'Street Style', desc: 'Nairobi fashion week vibes 👟', tags: ['fashion', 'nairobi', 'style'] },
  { title: 'Coding Project', desc: 'Built this app in a weekend 💻', tags: ['coding', 'project', 'tech'] },
  { title: 'Gratitude Journal', desc: 'Why I write every morning 📝', tags: ['journal', 'gratitude', 'mindset'] },
  { title: 'Kenyan Wildlife', desc: 'Maasai Mara is unreal 🦁', tags: ['wildlife', 'kenya', 'safari'] },
  { title: 'Vertex Earnings', desc: 'I made KES 2,400 this month! 💚', tags: ['vertex', 'earnings', 'creator'] },
];

async function main() {
  console.log('🎬 Vertex Quick Video Seeder');
  console.log('═══════════════════════════════════════');
  console.log('Using public test videos (no ffmpeg needed)\n');

  // Sign in or create test user
  let userId = process.env.SEED_USER_ID;

  if (!userId) {
    console.log('📋 Setting up test user...');

    // Try sign in first
    const { data: signIn } = await supabase.auth.signInWithPassword({
      email: 'testcreator@vertex.app',
      password: 'vertex_test_2024',
    });

    if (signIn?.user) {
      userId = signIn.user.id;
      console.log(`✅ Signed in: ${userId}`);
    } else {
      // Try sign up
      const { data: signUp, error: signUpError } = await supabase.auth.signUp({
        email: 'testcreator@vertex.app',
        password: 'vertex_test_2024',
        options: { data: { username: 'testcreator' } },
      });

      if (signUp?.user) {
        userId = signUp.user.id;
        console.log(`✅ Created user: ${userId}`);
      } else {
        console.log(`\n❌ Auth error: ${signUpError?.message}`);
        console.log('\n📌 Run the SQL migration first, then retry:');
        console.log('   1. Open: https://supabase.com/dashboard/project/dkffujuqrhojgzpslmok/sql/new');
        console.log('   2. Paste contents of: vertex/supabase/migrations/001_schema.sql');
        console.log('   3. Click Run');
        console.log('   4. npm run seed\n');
        console.log('   OR create a user in Supabase Auth dashboard, then:');
        console.log('   SEED_USER_ID=<uuid> npm run seed\n');
        process.exit(1);
      }
    }
  }

  // Upsert profile
  await supabase.from('profiles').upsert({
    id: userId,
    username: 'testcreator',
    display_name: 'Vertex Test Creator',
    bio: '🎬 Official test account · Creating content on Vertex',
    is_verified: true,
  }, { onConflict: 'id' });

  console.log('\n📹 Inserting 50 video records...\n');

  let success = 0;
  let fail = 0;

  for (let i = 0; i < VIDEO_DATA.length; i++) {
    const v = VIDEO_DATA[i];
    // Cycle through the test video URLs
    const videoUrl = TEST_VIDEO_URLS[i % TEST_VIDEO_URLS.length];

    const { error } = await supabase.from('videos').insert({
      user_id: userId,
      title: v.title,
      description: v.desc,
      video_url: videoUrl,
      thumbnail_url: null,
      duration: 10,
      hashtags: v.tags,
      is_public: true,
      allow_comments: true,
      view_count: Math.floor(Math.random() * 10000),
      like_count: Math.floor(Math.random() * 1000),
      comment_count: Math.floor(Math.random() * 100),
      share_count: Math.floor(Math.random() * 200),
    });

    if (error) {
      console.log(`  ❌ [${i + 1}/50] ${v.title}: ${error.message}`);
      fail++;
    } else {
      console.log(`  ✅ [${i + 1}/50] ${v.title}`);
      success++;
    }
  }

  // Seed some ad impressions for earnings demo
  console.log('\n💰 Seeding earnings data...');
  for (let i = 0; i < 20; i++) {
    await supabase.from('ad_impressions').insert({
      creator_id: userId,
      ad_network: ['monetag', 'adsense', 'simulated'][i % 3],
      ad_type: ['interstitial', 'banner', 'rewarded'][i % 3],
      revenue_kes: (Math.random() * 2 + 0.05).toFixed(4),
    });
  }

  // Upsert earnings record
  await supabase.rpc('increment_earnings', {
    p_user_id: userId,
    p_platform_revenue: 1500,
    p_creator_share: 600,
  }).catch(() => {
    // RPC may not exist yet — insert directly
    supabase.from('earnings').upsert({
      user_id: userId,
      total_platform_revenue_kes: 1500,
      total_earned_kes: 600,
      available_balance_kes: 600,
      total_withdrawn_kes: 0,
      lifetime_views: success * 100,
    }, { onConflict: 'user_id' });
  });

  console.log('\n═══════════════════════════════════════');
  console.log(`✅ ${success}/50 videos seeded`);
  if (fail > 0) console.log(`❌ ${fail} failed`);
  console.log('\n🚀 Test credentials:');
  console.log('   Email:    testcreator@vertex.app');
  console.log('   Password: vertex_test_2024');
  console.log('\n   Run: cd vertex && npm run dev');
}

main().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
