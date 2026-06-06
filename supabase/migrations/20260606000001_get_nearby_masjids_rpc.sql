-- Enable PostGIS if not already enabled
CREATE EXTENSION IF NOT EXISTS postgis SCHEMA public;

-- Create the optimized RPC function
CREATE OR REPLACE FUNCTION home_masjid.get_nearby_masjids(
  user_lat double precision,
  user_lng double precision,
  radius_meters double precision
)
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  address text,
  city text,
  country text,
  is_verified boolean,
  contact_email text,
  distance_meters double precision
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.name,
    m.description,
    m.address,
    m.city,
    m.country,
    m.is_verified,
    m.contact_email,
    -- Ensure extensions.ST_Distance uses the correct schema
    ST_Distance(
      m.gps_location,
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography
    ) as distance_meters
  FROM 
    home_masjid.masjids m
  WHERE 
    m.gps_location IS NOT NULL AND
    ST_DWithin(
      m.gps_location,
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
      radius_meters
    )
  ORDER BY 
    distance_meters ASC;
END;
$$ SET search_path = public, extensions, home_masjid;
