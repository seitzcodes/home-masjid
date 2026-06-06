-- Create the RPC for user's personalized feed
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
    content TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ
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
        p.content,
        p.image_url,
        p.created_at
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
