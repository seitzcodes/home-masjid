-- Enable PostGIS if not already enabled
CREATE EXTENSION IF NOT EXISTS postgis SCHEMA public;

-- Create the RPC function
CREATE OR REPLACE FUNCTION home_masjid.get_nearest_masjids(
  user_lat double precision,
  user_lng double precision,
  max_distance_meters double precision DEFAULT 50000 -- default 50km
)
RETURNS TABLE (
  id uuid,
  name text,
  city text,
  country text,
  distance_meters double precision,
  is_verified boolean
)
LANGUAGE sql
STABLE
AS $$
  SELECT 
    m.id,
    m.name,
    m.city,
    m.country,
    -- Calculate distance in meters using ST_Distance
    ST_Distance(
      m.gps_location, 
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography
    ) as distance_meters,
    m.is_verified
  FROM 
    home_masjid.masjids m
  WHERE 
    m.gps_location IS NOT NULL
    AND ST_Distance(
      m.gps_location, 
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography
    ) <= max_distance_meters
  ORDER BY 
    distance_meters ASC;
$$ SET search_path = public, extensions, home_masjid;
