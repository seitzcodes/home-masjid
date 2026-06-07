-- Migration: Privacy and Social Features

-- 1. Alter user_profiles
ALTER TABLE home_masjid.user_profiles
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS is_profile_public BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS show_donations_publicly BOOLEAN DEFAULT true;

-- 2. Create post_likes table
CREATE TABLE IF NOT EXISTS home_masjid.post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES home_masjid.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

ALTER TABLE home_masjid.post_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read likes" ON home_masjid.post_likes FOR SELECT TO public USING (true);
CREATE POLICY "Users can insert their own likes" ON home_masjid.post_likes FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete their own likes" ON home_masjid.post_likes FOR DELETE TO authenticated USING (user_id = auth.uid());

-- 3. Modify donations table foreign key from CASCADE to SET NULL
-- Drop the existing constraint
ALTER TABLE home_masjid.donations DROP CONSTRAINT IF EXISTS donations_user_id_fkey;

-- Add it back with SET NULL
ALTER TABLE home_masjid.donations
  ADD CONSTRAINT donations_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES home_masjid.user_profiles(id) 
  ON DELETE SET NULL;

-- 4. Update RPC get_user_feed to return likes and comments counts
-- Drop the existing function
DROP FUNCTION IF EXISTS home_masjid.get_user_feed(UUID, INT);

-- Recreate with new fields
CREATE OR REPLACE FUNCTION home_masjid.get_user_feed(
    req_user_id UUID,
    limit_count INT DEFAULT 50
)
RETURNS TABLE (
    post_id UUID,
    masjid_id UUID,
    masjid_name TEXT,
    author_id UUID,
    author_name TEXT,
    author_username TEXT,
    content TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ,
    likes_count BIGINT,
    comments_count BIGINT,
    has_liked BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id as post_id,
        p.masjid_id,
        m.name as masjid_name,
        p.author_id,
        u.full_name as author_name,
        u.username as author_username,
        p.content,
        p.image_url,
        p.created_at,
        (SELECT COUNT(*) FROM home_masjid.post_likes pl WHERE pl.post_id = p.id) as likes_count,
        (SELECT COUNT(*) FROM home_masjid.comments c WHERE c.post_id = p.id) as comments_count,
        EXISTS(SELECT 1 FROM home_masjid.post_likes pl WHERE pl.post_id = p.id AND pl.user_id = req_user_id) as has_liked
    FROM home_masjid.posts p
    JOIN home_masjid.masjids m ON m.id = p.masjid_id
    LEFT JOIN home_masjid.user_profiles u ON u.id = p.author_id
    WHERE 
        -- The post belongs to the user's home masjid
        p.masjid_id = (SELECT home_masjid_id FROM home_masjid.user_profiles WHERE id = req_user_id)
        OR 
        -- The post belongs to a masjid the user follows
        p.masjid_id IN (SELECT f.masjid_id FROM home_masjid.masjid_followers f WHERE f.user_id = req_user_id)
    ORDER BY p.created_at DESC
    LIMIT limit_count;
END;
$$ SET search_path = public, extensions, home_masjid;
