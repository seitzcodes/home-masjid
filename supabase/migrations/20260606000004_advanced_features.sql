-- Migration for Phase 7: Advanced Features (Analytics & Discovery)

-- 1. Modify home_masjid.masjids to support JSONB fields
ALTER TABLE home_masjid.masjids ADD COLUMN IF NOT EXISTS facilities JSONB DEFAULT '{}'::jsonb;
ALTER TABLE home_masjid.masjids ADD COLUMN IF NOT EXISTS jumuah_times JSONB DEFAULT '[]'::jsonb;

-- 2. Create home_masjid.masjid_followers table
CREATE TABLE IF NOT EXISTS home_masjid.masjid_followers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    masjid_id UUID NOT NULL REFERENCES home_masjid.masjids(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES home_masjid.user_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (masjid_id, user_id)
);

ALTER TABLE home_masjid.masjid_followers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for masjid_followers
-- Public can see who follows what (or maybe just counts, but letting anyone read is fine for a public network)
CREATE POLICY "Public can view masjid followers"
    ON home_masjid.masjid_followers FOR SELECT
    USING (true);

-- Users can follow masjids
CREATE POLICY "Users can follow masjids"
    ON home_masjid.masjid_followers FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can unfollow masjids
CREATE POLICY "Users can unfollow masjids"
    ON home_masjid.masjid_followers FOR DELETE
    USING (auth.uid() = user_id);

-- 3. Enhance the get_nearest_masjids RPC
-- We already have `get_nearest_masjids(lat float, long float, radius float)`
-- No changes needed for it right now, we will just call it from Next.js.
