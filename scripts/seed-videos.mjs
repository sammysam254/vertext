/**
 * Vertex — Test Video Seeder
 * Generates 50 short test videos and uploads them to Supabase Storage,
 * then inserts video records into the database.
 *
 * Run: node scripts/seed-videos.mjs
 * Requires: npm install @supabase/supabase-js canvas fluent-ffmpeg @ffmpeg-installer/ffmpeg
 */

import { createClient } from '@supabase/supabase-js';
import { createCanvas } from 'canvas';
import { execSync } from 'child_process';
import { writeFileSync, mkdirSync, rmSync, existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Supabase client (service role for seeding) ──────────────────────────────
const SUPABASE_URL = 'https://dkffujuqrhojgzpslmok.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrZmZ1anVxcmhvamd6cHNsbW9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5NzU3NzUsImV4cCI6MjA5MDU1MTc3NX0.TUE6LZqp2bv1Xv4AjIeNmEjcUbnbJJPgQvouIDYPw_M';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const TMP_DIR = join(__dirname, '../.tmp-videos');
const DURATION = 10; // seconds
const WIDTH = 720;
const HEIGHT = 1280;
const FPS = 24;

// ── Video metadata ───────────────────────────────────────────────────────────
const VIDEO_DATA = [
  { title: 'Morning Vibes', desc: 'Starting the day right ☀️', tags: ['morning', 'lifestyle', 'vibes'], color: '#FF6B6B', emoji: '☀️' },
  { title: 'City Lights', desc: 'Urban nights are unmatched 🌃', tags: ['city', 'night', 'urban'], color: '#4ECDC4', emoji: '🌃' },
  { title: 'Cooking Hack', desc: 'This trick will change your life 🍳', tags: ['food', 'cooking', 'hack'], color: '#45B7D1', emoji: '🍳' },
  { title: 'Dance Challenge', desc: 'Can you keep up? 💃', tags: ['dance', 'challenge', 'fun'], color: '#96CEB4', emoji: '💃' },
  { title: 'Travel Diary', desc: 'Nairobi to the world 🌍', tags: ['travel', 'nairobi', 'kenya'], color: '#FFEAA7', emoji: '🌍' },
  { title: 'Fitness Routine', desc: '5 min workout, no excuses 💪', tags: ['fitness', 'workout', 'health'], color: '#DDA0DD', emoji: '💪' },
  { title: 'Tech Review', desc: 'Is this phone worth it? 📱', tags: ['tech', 'review', 'phone'], color: '#98D8C8', emoji: '📱' },
  { title: 'Sunset Chill', desc: 'Golden hour hits different 🌅', tags: ['sunset', 'chill', 'nature'], color: '#F7DC6F', emoji: '🌅' },
  { title: 'Comedy Skit', desc: 'When your boss calls on Friday 😂', tags: ['comedy', 'funny', 'relatable'], color: '#BB8FCE', emoji: '😂' },
  { title: 'Music Cover', desc: 'My take on this classic 🎵', tags: ['music', 'cover', 'singing'], color: '#85C1E9', emoji: '🎵' },
  { title: 'Street Food', desc: 'Best nyama choma in Nairobi 🥩', tags: ['food', 'streetfood', 'kenya'], color: '#F1948A', emoji: '🥩' },
  { title: 'Study With Me', desc: '2 hour focus session 📚', tags: ['study', 'focus', 'productivity'], color: '#82E0AA', emoji: '📚' },
  { title: 'Fashion Fit', desc: 'OOTD — thrifted everything 👗', tags: ['fashion', 'ootd', 'thrift'], color: '#F8C471', emoji: '👗' },
  { title: 'Pet Moments', desc: 'My cat judging me again 🐱', tags: ['pets', 'cat', 'cute'], color: '#AED6F1', emoji: '🐱' },
  { title: 'Life Advice', desc: 'Things I wish I knew at 20 🧠', tags: ['advice', 'life', 'wisdom'], color: '#A9DFBF', emoji: '🧠' },
  { title: 'Art Process', desc: 'Watch me paint this in 60s 🎨', tags: ['art', 'painting', 'creative'], color: '#F9E79F', emoji: '🎨' },
  { title: 'Night Routine', desc: 'How I wind down 🌙', tags: ['routine', 'night', 'selfcare'], color: '#D7BDE2', emoji: '🌙' },
  { title: 'Gym Progress', desc: '6 months transformation 🏋️', tags: ['gym', 'fitness', 'transformation'], color: '#A3E4D7', emoji: '🏋️' },
  { title: 'Book Review', desc: 'This book changed my mindset 📖', tags: ['books', 'reading', 'review'], color: '#FAD7A0', emoji: '📖' },
  { title: 'Nairobi Vlog', desc: 'A day in the city 🏙️', tags: ['nairobi', 'vlog', 'kenya'], color: '#AED6F1', emoji: '🏙️' },
  { title: 'Smoothie Recipe', desc: 'Healthy and delicious 🥤', tags: ['health', 'recipe', 'smoothie'], color: '#A9DFBF', emoji: '🥤' },
  { title: 'Coding Tips', desc: 'Shortcuts that save hours ⌨️', tags: ['coding', 'tech', 'tips'], color: '#85C1E9', emoji: '⌨️' },
  { title: 'Motivation Monday', desc: 'Start the week strong 🔥', tags: ['motivation', 'monday', 'mindset'], color: '#F1948A', emoji: '🔥' },
  { title: 'Plant Care', desc: 'How I keep my plants alive 🌿', tags: ['plants', 'garden', 'nature'], color: '#82E0AA', emoji: '🌿' },
  { title: 'Coffee Art', desc: 'Latte art tutorial ☕', tags: ['coffee', 'art', 'barista'], color: '#D5DBDB', emoji: '☕' },
  { title: 'Skincare Routine', desc: 'My 5-step morning routine 🧴', tags: ['skincare', 'beauty', 'routine'], color: '#FADBD8', emoji: '🧴' },
  { title: 'Matatu Culture', desc: 'Nairobi matatu vibes 🚌', tags: ['nairobi', 'matatu', 'culture'], color: '#F9E79F', emoji: '🚌' },
  { title: 'Unboxing', desc: 'What I ordered online 📦', tags: ['unboxing', 'shopping', 'haul'], color: '#D2B4DE', emoji: '📦' },
  { title: 'Sunset Run', desc: 'Evening jog hits different 🏃', tags: ['running', 'fitness', 'sunset'], color: '#FAD7A0', emoji: '🏃' },
  { title: 'DIY Decor', desc: 'Room makeover on a budget 🏠', tags: ['diy', 'decor', 'home'], color: '#A9CCE3', emoji: '🏠' },
  { title: 'Kenyan Cuisine', desc: 'Ugali and sukuma wiki 🍽️', tags: ['food', 'kenya', 'cuisine'], color: '#A9DFBF', emoji: '🍽️' },
  { title: 'Mindfulness', desc: '5 min meditation for beginners 🧘', tags: ['meditation', 'mindfulness', 'wellness'], color: '#D7BDE2', emoji: '🧘' },
  { title: 'Photography Tips', desc: 'Better photos with your phone 📸', tags: ['photography', 'tips', 'phone'], color: '#85C1E9', emoji: '📸' },
  { title: 'Hustle Story', desc: 'From zero to something 💼', tags: ['hustle', 'business', 'motivation'], color: '#F8C471', emoji: '💼' },
  { title: 'Afrobeats Mix', desc: 'Banger after banger 🎶', tags: ['music', 'afrobeats', 'mix'], color: '#F1948A', emoji: '🎶' },
  { title: 'Language Learning', desc: 'Swahili in 60 seconds 🗣️', tags: ['language', 'swahili', 'learning'], color: '#AED6F1', emoji: '🗣️' },
  { title: 'Budget Tips', desc: 'Save KES 10k this month 💰', tags: ['money', 'budget', 'finance'], color: '#A9DFBF', emoji: '💰' },
  { title: 'Sunrise Hike', desc: 'Mt. Kenya views are insane 🏔️', tags: ['hiking', 'kenya', 'nature'], color: '#A3E4D7', emoji: '🏔️' },
  { title: 'Viral Recipe', desc: 'TikTok pasta but make it Kenyan 🍝', tags: ['food', 'recipe', 'viral'], color: '#FAD7A0', emoji: '🍝' },
  { title: 'Thrift Haul', desc: 'KES 500 outfit challenge 👕', tags: ['fashion', 'thrift', 'budget'], color: '#D2B4DE', emoji: '👕' },
  { title: 'Productivity Hack', desc: 'How I get 10x more done ⚡', tags: ['productivity', 'hack', 'tips'], color: '#F9E79F', emoji: '⚡' },
  { title: 'Relationship Advice', desc: 'Red flags you are ignoring 🚩', tags: ['relationships', 'advice', 'dating'], color: '#F1948A', emoji: '🚩' },
  { title: 'Nairobi Nightlife', desc: 'Where to go this weekend 🎉', tags: ['nairobi', 'nightlife', 'fun'], color: '#BB8FCE', emoji: '🎉' },
  { title: 'Crypto Explained', desc: 'Bitcoin in 60 seconds ₿', tags: ['crypto', 'bitcoin', 'finance'], color: '#F8C471', emoji: '₿' },
  { title: 'Yoga Flow', desc: 'Morning stretch routine 🧘', tags: ['yoga', 'fitness', 'morning'], color: '#A9DFBF', emoji: '🧘' },
  { title: 'Street Style', desc: 'Nairobi fashion week vibes 👟', tags: ['fashion', 'nairobi', 'style'], color: '#85C1E9', emoji: '👟' },
  { title: 'Coding Project', desc: 'Built this app in a weekend 💻', tags: ['coding', 'project', 'tech'], color: '#AED6F1', emoji: '💻' },
  { title: 'Gratitude Journal', desc: 'Why I write every morning 📝', tags: ['journal', 'gratitude', 'mindset'], color: '#D7BDE2', emoji: '📝' },
  { title: 'Kenyan Wildlife', desc: 'Maasai Mara is unreal 🦁', tags: ['wildlife', 'kenya', 'safari'], color: '#F9E79F', emoji: '🦁' },
  { title: 'Vertex Earnings', desc: 'I made KES 2,400 this month! 💚', tags: ['vertex', 'earnings', 'creator'], color: '#00C853', emoji: '💚' },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

/**
 * Generate a single PNG frame for a video using node-canvas.
 * Each frame shows the video title, emoji, and a progress indicator.
 */
function generateFrame(videoData, frameIndex, totalFrames) {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');
  const { r, g, b } = hexToRgb(videoData.color);

  // Animated gradient background
  const progress = frameIndex / totalFrames;
  const hueShift = Math.floor(progress * 30);

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
  grad.addColorStop(0, `rgb(${Math.min(r + hueShift, 255)}, ${Math.min(g, 255)}, ${Math.min(b, 255)})`);
  grad.addColorStop(0.5, `rgb(${Math.max(r - 40, 0)}, ${Math.max(g - 40, 0)}, ${Math.max(b - 40, 0)})`);
  grad.addColorStop(1, `rgb(10, 10, 10)`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Animated circle pulse
  const pulseSize = 200 + Math.sin(progress * Math.PI * 4) * 50;
  ctx.beginPath();
  ctx.arc(WIDTH / 2, HEIGHT / 2 - 100, pulseSize, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(255,255,255,0.05)`;
  ctx.fill();

  // Vertex watermark top
  ctx.fillStyle = '#00C853';
  ctx.font = 'bold 36px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('VERTEX', WIDTH / 2, 80);

  // Big emoji
  ctx.font = `${120 + Math.sin(progress * Math.PI * 2) * 10}px Arial`;
  ctx.textAlign = 'center';
  ctx.fillText(videoData.emoji, WIDTH / 2, HEIGHT / 2 - 60);

  // Title
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 52px Arial';
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0,0,0,0.8)';
  ctx.shadowBlur = 10;
  ctx.fillText(videoData.title, WIDTH / 2, HEIGHT / 2 + 80);

  // Description
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.font = '32px Arial';
  ctx.shadowBlur = 6;
  ctx.fillText(videoData.desc, WIDTH / 2, HEIGHT / 2 + 140);

  // Hashtags
  ctx.fillStyle = '#00C853';
  ctx.font = '28px Arial';
  ctx.shadowBlur = 0;
  const hashStr = videoData.tags.map(t => `#${t}`).join('  ');
  ctx.fillText(hashStr, WIDTH / 2, HEIGHT / 2 + 200);

  // Progress bar at bottom
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.fillRect(0, HEIGHT - 8, WIDTH, 8);
  ctx.fillStyle = '#00C853';
  ctx.fillRect(0, HEIGHT - 8, WIDTH * progress, 8);

  // Frame counter (small, bottom right)
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.font = '20px Arial';
  ctx.textAlign = 'right';
  ctx.fillText(`${Math.ceil(progress * DURATION)}s / ${DURATION}s`, WIDTH - 20, HEIGHT - 20);

  return canvas.toBuffer('image/png');
}

/**
 * Generate a thumbnail (first frame) as PNG
 */
function generateThumbnail(videoData) {
  return generateFrame(videoData, 0, FPS * DURATION);
}

/**
 * Use ffmpeg to stitch PNG frames into an MP4
 */
function createVideoFromFrames(framesDir, outputPath) {
  const ffmpegPath = process.env.FFMPEG_PATH || 'ffmpeg';
  const cmd = `"${ffmpegPath}" -y -framerate ${FPS} -i "${framesDir}/frame_%04d.png" -c:v libx264 -pix_fmt yuv420p -crf 28 -preset fast "${outputPath}" 2>&1`;
  try {
    execSync(cmd, { stdio: 'pipe' });
    return true;
  } catch {
    // Try without quotes (Linux/Mac)
    try {
      const cmd2 = `ffmpeg -y -framerate ${FPS} -i "${framesDir}/frame_%04d.png" -c:v libx264 -pix_fmt yuv420p -crf 28 -preset fast "${outputPath}" 2>&1`;
      execSync(cmd2, { stdio: 'pipe' });
      return true;
    } catch (e2) {
      console.error('ffmpeg error:', e2.message);
      return false;
    }
  }
}

// ── Seed a single video ──────────────────────────────────────────────────────

async function seedVideo(videoData, index, userId) {
  const videoId = `test-video-${index + 1}`;
  const framesDir = join(TMP_DIR, videoId);
  const videoPath = join(TMP_DIR, `${videoId}.mp4`);
  const thumbPath = join(TMP_DIR, `${videoId}-thumb.png`);

  console.log(`\n[${index + 1}/50] Generating: ${videoData.title}`);

  // Create frames directory
  mkdirSync(framesDir, { recursive: true });

  const totalFrames = FPS * DURATION;

  // Generate all frames
  process.stdout.write('  Rendering frames... ');
  for (let f = 0; f < totalFrames; f++) {
    const framePng = generateFrame(videoData, f, totalFrames);
    writeFileSync(join(framesDir, `frame_${String(f).padStart(4, '0')}.png`), framePng);
  }
  console.log(`${totalFrames} frames done`);

  // Generate thumbnail
  const thumbPng = generateThumbnail(videoData);
  writeFileSync(thumbPath, thumbPng);

  // Encode video
  process.stdout.write('  Encoding MP4... ');
  const encoded = createVideoFromFrames(framesDir, videoPath);
  if (!encoded) {
    console.log('FAILED — skipping');
    return null;
  }
  console.log('done');

  // Upload video to Supabase Storage
  process.stdout.write('  Uploading video... ');
  const videoBuffer = readFileSync(videoPath);
  const storagePath = `test/${videoId}.mp4`;

  const { error: videoUploadError } = await supabase.storage
    .from('videos')
    .upload(storagePath, videoBuffer, {
      contentType: 'video/mp4',
      upsert: true,
    });

  if (videoUploadError) {
    console.log(`FAILED: ${videoUploadError.message}`);
    return null;
  }

  const { data: { publicUrl: videoUrl } } = supabase.storage
    .from('videos')
    .getPublicUrl(storagePath);
  console.log('done');

  // Upload thumbnail
  process.stdout.write('  Uploading thumbnail... ');
  const thumbBuffer = readFileSync(thumbPath);
  const thumbStoragePath = `test/${videoId}-thumb.png`;

  const { error: thumbUploadError } = await supabase.storage
    .from('thumbnails')
    .upload(thumbStoragePath, thumbBuffer, {
      contentType: 'image/png',
      upsert: true,
    });

  let thumbnailUrl = null;
  if (!thumbUploadError) {
    const { data: { publicUrl } } = supabase.storage
      .from('thumbnails')
      .getPublicUrl(thumbStoragePath);
    thumbnailUrl = publicUrl;
    console.log('done');
  } else {
    // Try uploading thumb to videos bucket as fallback
    await supabase.storage
      .from('videos')
      .upload(`test/${videoId}-thumb.png`, thumbBuffer, { contentType: 'image/png', upsert: true });
    const { data: { publicUrl } } = supabase.storage
      .from('videos')
      .getPublicUrl(`test/${videoId}-thumb.png`);
    thumbnailUrl = publicUrl;
    console.log('done (videos bucket)');
  }

  // Insert video record into database
  process.stdout.write('  Inserting DB record... ');
  const { data: inserted, error: dbError } = await supabase
    .from('videos')
    .insert({
      user_id: userId,
      title: videoData.title,
      description: videoData.desc,
      video_url: videoUrl,
      thumbnail_url: thumbnailUrl,
      duration: DURATION,
      hashtags: videoData.tags,
      is_public: true,
      allow_comments: true,
      view_count: Math.floor(Math.random() * 5000),
      like_count: Math.floor(Math.random() * 500),
      comment_count: Math.floor(Math.random() * 50),
      share_count: Math.floor(Math.random() * 100),
    })
    .select('id')
    .single();

  if (dbError) {
    console.log(`FAILED: ${dbError.message}`);
    return null;
  }
  console.log(`done (id: ${inserted.id})`);

  // Cleanup local files
  rmSync(framesDir, { recursive: true, force: true });
  rmSync(videoPath, { force: true });
  rmSync(thumbPath, { force: true });

  return inserted.id;
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🎬 Vertex Test Video Seeder');
  console.log('═══════════════════════════════════════');

  // Check ffmpeg
  try {
    execSync('ffmpeg -version', { stdio: 'pipe' });
    console.log('✅ ffmpeg found');
  } catch {
    console.error('❌ ffmpeg not found. Install it first:');
    console.error('   Windows: winget install ffmpeg  OR  choco install ffmpeg');
    console.error('   Mac:     brew install ffmpeg');
    console.error('   Linux:   sudo apt install ffmpeg');
    process.exit(1);
  }

  // Check canvas
  try {
    const { createCanvas: test } = await import('canvas');
    test(10, 10);
    console.log('✅ node-canvas found');
  } catch {
    console.error('❌ node-canvas not found. Run: npm install canvas');
    process.exit(1);
  }

  // Get or create a test user
  console.log('\n📋 Setting up test user...');
  let userId;

  // Try to sign in as test user
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: 'testcreator@vertex.app',
    password: 'vertex_test_2024',
  });

  if (signInData?.user) {
    userId = signInData.user.id;
    console.log(`✅ Signed in as test user: ${userId}`);
  } else {
    // Create test user
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: 'testcreator@vertex.app',
      password: 'vertex_test_2024',
      options: {
        data: { username: 'testcreator' },
      },
    });

    if (signUpError || !signUpData.user) {
      console.error('❌ Could not create test user:', signUpError?.message);
      console.error('   Create a user manually in Supabase Auth and set USER_ID env var');
      // Fall back to env var
      userId = process.env.SEED_USER_ID;
      if (!userId) {
        console.error('   Or set SEED_USER_ID=<your-user-id> and re-run');
        process.exit(1);
      }
    } else {
      userId = signUpData.user.id;
      console.log(`✅ Created test user: ${userId}`);
    }
  }

  // Ensure profile exists
  await supabase.from('profiles').upsert({
    id: userId,
    username: 'testcreator',
    display_name: 'Vertex Test Creator',
    bio: 'Official test account for Vertex platform 🎬',
  }, { onConflict: 'id' });

  // Create tmp directory
  mkdirSync(TMP_DIR, { recursive: true });

  // Seed all 50 videos
  console.log('\n🎥 Generating 50 test videos...');
  console.log('   This will take a few minutes.\n');

  const results = [];
  for (let i = 0; i < VIDEO_DATA.length; i++) {
    const id = await seedVideo(VIDEO_DATA[i], i, userId);
    results.push({ title: VIDEO_DATA[i].title, id, success: !!id });
  }

  // Cleanup tmp dir
  if (existsSync(TMP_DIR)) {
    rmSync(TMP_DIR, { recursive: true, force: true });
  }

  // Summary
  const succeeded = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success);

  console.log('\n═══════════════════════════════════════');
  console.log(`✅ Seeded ${succeeded}/50 videos successfully`);

  if (failed.length > 0) {
    console.log(`❌ Failed: ${failed.map(f => f.title).join(', ')}`);
  }

  console.log('\n🚀 Your Vertex feed is ready to test!');
  console.log('   Test credentials:');
  console.log('   Email:    testcreator@vertex.app');
  console.log('   Password: vertex_test_2024');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
