-- Migration for Facility Categorization and Onboarding Flow

-- 1. Create the facility_category ENUM
CREATE TYPE home_masjid.facility_category AS ENUM (
    'jumuah_masjid',
    'daily_masjid',
    'public_musalla',
    'private_facility'
);

-- 2. Add columns to masjids table
ALTER TABLE home_masjid.masjids ADD COLUMN IF NOT EXISTS facility_type home_masjid.facility_category DEFAULT 'jumuah_masjid';
ALTER TABLE home_masjid.masjids ADD COLUMN IF NOT EXISTS is_public_directory_listed BOOLEAN DEFAULT true;

-- 3. Update the existing get_nearby_masjids RPC
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
    ST_Distance(
      m.gps_location,
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography
    ) as distance_meters
  FROM 
    home_masjid.masjids m
  WHERE 
    m.gps_location IS NOT NULL AND
    m.is_public_directory_listed = true AND
    ST_DWithin(
      m.gps_location,
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
      radius_meters
    )
  ORDER BY 
    distance_meters ASC;
END;
$$ SET search_path = public, extensions, home_masjid;

-- 4. Update get_nearest_masjids RPC (if it exists)
CREATE OR REPLACE FUNCTION home_masjid.get_nearest_masjids(
  user_lat double precision,
  user_lng double precision,
  max_distance_meters double precision DEFAULT 50000
)
RETURNS SETOF home_masjid.masjids
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT m.*
  FROM home_masjid.masjids m
  WHERE 
    m.gps_location IS NOT NULL AND
    m.is_public_directory_listed = true AND
    ST_DWithin(
      m.gps_location,
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
      max_distance_meters
    )
  ORDER BY 
    ST_Distance(
      m.gps_location,
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography
    ) ASC;
END;
$$ SET search_path = public, extensions, home_masjid;
