-- Drop existing functions to avoid return type conflicts
DROP FUNCTION IF EXISTS home_masjid.get_nearest_masjids(double precision, double precision, double precision);
DROP FUNCTION IF EXISTS home_masjid.get_nearby_masjids(double precision, double precision, double precision);

-- Recreate get_nearest_masjids (used by directory)
CREATE OR REPLACE FUNCTION home_masjid.get_nearest_masjids(
  user_lat double precision,
  user_lng double precision,
  max_distance_meters double precision DEFAULT 50000
)
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  address text,
  city text,
  country text,
  contact_email text,
  gps_location geography,
  facilities jsonb,
  jumuah_times jsonb,
  iqama_times jsonb,
  is_verified boolean,
  distance_meters double precision
)
LANGUAGE sql
STABLE
AS $$
  SELECT 
    m.id,
    m.name,
    m.description,
    m.address,
    m.city,
    m.country,
    m.contact_email,
    m.gps_location,
    m.facilities,
    m.jumuah_times,
    m.iqama_times,
    m.is_verified,
    ST_Distance(
      m.gps_location, 
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography
    ) as distance_meters
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

-- Recreate get_nearby_masjids (optimized plpgsql version)
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
  contact_email text,
  gps_location geography,
  facilities jsonb,
  jumuah_times jsonb,
  iqama_times jsonb,
  is_verified boolean,
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
    m.contact_email,
    m.gps_location,
    m.facilities,
    m.jumuah_times,
    m.iqama_times,
    m.is_verified,
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
