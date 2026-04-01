-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Profiles (auto-created on signup via trigger)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  display_name text,
  bio text,
  avatar_url text,
  follower_count integer DEFAULT 0,
  following_count integer DEFAULT 0,
  total_likes integer DEFAULT 0,
  is_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Music
CREATE TABLE IF NOT EXISTS music (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  artist text NOT NULL,
  audio_url text NOT NULL,
  cover_url text,
  duration integer,
  usage_count integer DEFAULT 0
);

-- Videos
CREATE TABLE IF NOT EXISTS videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text,
  description text,
  video_url text NOT NULL,
  thumbnail_url text,
  duration integer,
  view_count bigint DEFAULT 0,
  like_count bigint DEFAULT 0,
  comment_count bigint DEFAULT 0,
  share_count bigint DEFAULT 0,
  hashtags text[],
  music_id uuid REFERENCES music(id),
  is_public boolean DEFAULT true,
  allow_comments boolean DEFAULT true,
  allow_duet boolean DEFAULT true,
  allow_stitch boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Video views
CREATE TABLE IF NOT EXISTS video_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id uuid REFERENCES videos(id) ON DELETE CASCADE,
  viewer_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  session_id text,
  watch_duration integer,
  completed boolean DEFAULT false,
  ad_impression boolean DEFAULT false,
  ad_revenue_kes numeric(10,4) DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Ad impressions
CREATE TABLE IF NOT EXISTS ad_impressions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id uuid REFERENCES videos(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  ad_network text,
  ad_type text,
  revenue_kes numeric(10,4) NOT NULL,
  creator_share_kes numeric(10,4) GENERATED ALWAYS AS (revenue_kes * 0.4) STORED,
  creator_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  paid_out boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Earnings
CREATE TABLE IF NOT EXISTS earnings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  total_platform_revenue_kes numeric(12,4) DEFAULT 0,
  total_earned_kes numeric(12,4) DEFAULT 0,
  available_balance_kes numeric(12,4) DEFAULT 0,
  total_withdrawn_kes numeric(12,4) DEFAULT 0,
  lifetime_views bigint DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

-- Withdrawals
CREATE TABLE IF NOT EXISTS withdrawals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  amount_kes numeric(10,2) NOT NULL,
  method text,
  phone_number text,
  account_details jsonb,
  status text DEFAULT 'pending',
  mpesa_transaction_id text,
  processed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Likes
CREATE TABLE IF NOT EXISTS likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  video_id uuid REFERENCES videos(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, video_id)
);

-- Comments
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  video_id uuid REFERENCES videos(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES comments(id) ON DELETE CASCADE,
  content text NOT NULL,
  like_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Follows
CREATE TABLE IF NOT EXISTS follows (
  follower_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  following_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (follower_id, following_id)
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  actor_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  type text,
  video_id uuid REFERENCES videos(id) ON DELETE SET NULL,
  message text,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- =====================
-- FUNCTIONS & TRIGGERS
-- =====================

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_username text;
  v_counter integer := 0;
BEGIN
  -- Get the desired username
  v_username := COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1));
  
  -- Ensure username is unique by appending a number if needed
  WHILE EXISTS (SELECT 1 FROM profiles WHERE username = v_username) LOOP
    v_counter := v_counter + 1;
    v_username := COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)) || v_counter::text;
  END LOOP;
  
  INSERT INTO profiles (id, username, display_name)
  VALUES (
    NEW.id,
    v_username,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the auth signup
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Increment earnings RPC
CREATE OR REPLACE FUNCTION increment_earnings(
  p_user_id uuid,
  p_platform_revenue numeric,
  p_creator_share numeric
)
RETURNS void AS $$
BEGIN
  INSERT INTO earnings (user_id, total_platform_revenue_kes, total_earned_kes, available_balance_kes)
  VALUES (p_user_id, p_platform_revenue, p_creator_share, p_creator_share)
  ON CONFLICT (user_id) DO UPDATE SET
    total_platform_revenue_kes = earnings.total_platform_revenue_kes + p_platform_revenue,
    total_earned_kes = earnings.total_earned_kes + p_creator_share,
    available_balance_kes = earnings.available_balance_kes + p_creator_share,
    updated_at = now();
END;
$$ LANGUAGE plpgsql;

-- Increment view count
CREATE OR REPLACE FUNCTION increment_view_count(p_video_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE videos SET view_count = view_count + 1 WHERE id = p_video_id;
END;
$$ LANGUAGE plpgsql;

-- Deduct balance on withdrawal
CREATE OR REPLACE FUNCTION deduct_balance(p_user_id uuid, p_amount numeric)
RETURNS void AS $$
BEGIN
  UPDATE earnings
  SET available_balance_kes = available_balance_kes - p_amount,
      total_withdrawn_kes = total_withdrawn_kes + p_amount,
      updated_at = now()
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Restore balance on failed withdrawal
CREATE OR REPLACE FUNCTION restore_balance(p_user_id uuid, p_amount numeric)
RETURNS void AS $$
BEGIN
  UPDATE earnings
  SET available_balance_kes = available_balance_kes + p_amount,
      total_withdrawn_kes = total_withdrawn_kes - p_amount,
      updated_at = now()
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Increment user total likes
CREATE OR REPLACE FUNCTION increment_user_likes(p_user_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET total_likes = total_likes + 1
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Decrement user total likes
CREATE OR REPLACE FUNCTION decrement_user_likes(p_user_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET total_likes = GREATEST(total_likes - 1, 0)
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Update like count trigger
CREATE OR REPLACE FUNCTION update_like_count()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE videos SET like_count = like_count + 1 WHERE id = NEW.video_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE videos SET like_count = like_count - 1 WHERE id = OLD.video_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_like_change ON likes;
CREATE TRIGGER on_like_change
  AFTER INSERT OR DELETE ON likes
  FOR EACH ROW EXECUTE FUNCTION update_like_count();

-- Update comment count trigger
CREATE OR REPLACE FUNCTION update_comment_count()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE videos SET comment_count = comment_count + 1 WHERE id = NEW.video_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE videos SET comment_count = comment_count - 1 WHERE id = OLD.video_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_comment_change ON comments;
CREATE TRIGGER on_comment_change
  AFTER INSERT OR DELETE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_comment_count();

-- =====================
-- ROW LEVEL SECURITY
-- =====================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_impressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles: public read, own write
CREATE POLICY "profiles_public_read" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_own_update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Videos: public read for public videos, own write
CREATE POLICY "videos_public_read" ON videos FOR SELECT USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "videos_own_insert" ON videos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "videos_own_update" ON videos FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "videos_own_delete" ON videos FOR DELETE USING (auth.uid() = user_id);

-- Earnings: own only
CREATE POLICY "earnings_own" ON earnings FOR ALL USING (auth.uid() = user_id);

-- Withdrawals: own only
CREATE POLICY "withdrawals_own" ON withdrawals FOR ALL USING (auth.uid() = user_id);

-- Likes: public read, own write
CREATE POLICY "likes_public_read" ON likes FOR SELECT USING (true);
CREATE POLICY "likes_own_write" ON likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "likes_own_delete" ON likes FOR DELETE USING (auth.uid() = user_id);

-- Comments: public read, own write
CREATE POLICY "comments_public_read" ON comments FOR SELECT USING (true);
CREATE POLICY "comments_own_insert" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "comments_own_delete" ON comments FOR DELETE USING (auth.uid() = user_id);

-- Follows: public read, own write
CREATE POLICY "follows_public_read" ON follows FOR SELECT USING (true);
CREATE POLICY "follows_own_write" ON follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "follows_own_delete" ON follows FOR DELETE USING (auth.uid() = follower_id);

-- Notifications: own only
CREATE POLICY "notifications_own" ON notifications FOR ALL USING (auth.uid() = user_id);

-- Video views: insert for all, read own
CREATE POLICY "video_views_insert" ON video_views FOR INSERT WITH CHECK (true);
CREATE POLICY "video_views_own_read" ON video_views FOR SELECT USING (auth.uid() = viewer_id);

-- Ad impressions: service role insert, creator read
CREATE POLICY "ad_impressions_creator_read" ON ad_impressions FOR SELECT USING (auth.uid() = creator_id);

-- Enable Realtime on earnings
ALTER PUBLICATION supabase_realtime ADD TABLE earnings;
