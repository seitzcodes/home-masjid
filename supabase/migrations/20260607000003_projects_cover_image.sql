-- Add cover_image_url to projects so faculty can upload a visual for each campaign
ALTER TABLE home_masjid.projects
  ADD COLUMN IF NOT EXISTS cover_image_url TEXT;
