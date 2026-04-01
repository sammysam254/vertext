-- Add functions to increment/decrement user total likes

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
