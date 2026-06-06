-- Migration to add iqama_times JSONB column for the Prayer Times Override feature

ALTER TABLE home_masjid.masjids
ADD COLUMN iqama_times JSONB DEFAULT '{}'::jsonb;
