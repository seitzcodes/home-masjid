-- Migration: Janazah System

CREATE TABLE IF NOT EXISTS home_masjid.janazahs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  masjid_id UUID NOT NULL REFERENCES home_masjid.masjids(id) ON DELETE CASCADE,
  reported_by UUID NOT NULL REFERENCES auth.users(id),
  deceased_name TEXT NOT NULL,
  date_of_passing DATE NOT NULL,
  janazah_time TEXT NOT NULL,
  burial_location TEXT,
  notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE home_masjid.janazahs ENABLE ROW LEVEL SECURITY;

-- Public can see approved janazahs
CREATE POLICY "Public read approved janazahs" ON home_masjid.janazahs FOR SELECT TO public USING (status = 'approved');

-- Authenticated users can insert
CREATE POLICY "Users can insert janazahs" ON home_masjid.janazahs FOR INSERT TO authenticated WITH CHECK (reported_by = auth.uid());

-- Authenticated users can see their own pending/rejected submissions
CREATE POLICY "Users can read own submissions" ON home_masjid.janazahs FOR SELECT TO authenticated USING (reported_by = auth.uid());

-- Faculty can do everything for their masjids
CREATE POLICY "Faculty manage janazahs" ON home_masjid.janazahs FOR ALL TO authenticated USING (
  EXISTS (
    SELECT 1 FROM home_masjid.masjid_faculty 
    WHERE user_id = auth.uid() AND masjid_id = janazahs.masjid_id
  )
);

-- Webhook Trigger using pg_net
CREATE OR REPLACE FUNCTION home_masjid.notify_janazah_approved()
RETURNS trigger AS $$
DECLARE
  webhook_url text;
BEGIN
  -- In a real production setup, we would read this from vault or settings
  -- For local dev, we assume ngrok or localhost is set up, but let's fall back to a dummy or local URL
  -- The Next.js API route will receive the POST
  webhook_url := current_setting('app.settings.site_url', true);
  IF webhook_url IS NULL OR webhook_url = '' THEN
    webhook_url := 'http://localhost:3000';
  END IF;

  IF NEW.status = 'approved' AND (TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.status != 'approved')) THEN
    PERFORM net.http_post(
      url := webhook_url || '/api/webhooks/janazah',
      headers := '{"Content-Type": "application/json"}'::jsonb,
      body := json_build_object('record', row_to_json(NEW))::jsonb
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_janazah_approved_trigger ON home_masjid.janazahs;
CREATE TRIGGER on_janazah_approved_trigger
AFTER INSERT OR UPDATE ON home_masjid.janazahs
FOR EACH ROW EXECUTE FUNCTION home_masjid.notify_janazah_approved();
