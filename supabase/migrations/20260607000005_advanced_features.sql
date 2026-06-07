-- Migration: Phase 7 Advanced Features
-- Adds tables for Jumu'ah schedules, Ramadan tracking, and Content moderation reports

-- 1. Jumu'ah Schedules
CREATE TABLE IF NOT EXISTS home_masjid.jumuah_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  masjid_id UUID NOT NULL REFERENCES home_masjid.masjids(id) ON DELETE CASCADE,
  khutbah_time TIME NOT NULL,
  speaker_name TEXT,
  topic TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for Jumu'ah
ALTER TABLE home_masjid.jumuah_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read jumuah" ON home_masjid.jumuah_schedules FOR SELECT TO public USING (true);
CREATE POLICY "Faculty manage jumuah" ON home_masjid.jumuah_schedules FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM home_masjid.masjid_faculty WHERE user_id = auth.uid() AND masjid_id = jumuah_schedules.masjid_id)
);

-- 2. Ramadan Schedules
CREATE TABLE IF NOT EXISTS home_masjid.ramadan_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  masjid_id UUID NOT NULL REFERENCES home_masjid.masjids(id) ON DELETE CASCADE,
  hijri_year INT NOT NULL,
  taraweeh_time TIME,
  iftar_provided BOOLEAN DEFAULT false,
  itikaf_available BOOLEAN DEFAULT false,
  UNIQUE(masjid_id, hijri_year)
);

-- RLS for Ramadan
ALTER TABLE home_masjid.ramadan_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read ramadan" ON home_masjid.ramadan_schedules FOR SELECT TO public USING (true);
CREATE POLICY "Faculty manage ramadan" ON home_masjid.ramadan_schedules FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM home_masjid.masjid_faculty WHERE user_id = auth.uid() AND masjid_id = ramadan_schedules.masjid_id)
);

-- 3. Content Moderation Reports
CREATE TABLE IF NOT EXISTS home_masjid.content_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES auth.users(id),
  target_type TEXT NOT NULL CHECK (target_type IN ('post', 'comment', 'masjid', 'user')),
  target_id UUID NOT NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for Moderation
ALTER TABLE home_masjid.content_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can insert reports" ON home_masjid.content_reports FOR INSERT TO authenticated WITH CHECK (reporter_id = auth.uid());
CREATE POLICY "Admins can view reports" ON home_masjid.content_reports FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM home_masjid.user_profiles WHERE id = auth.uid() AND is_superadmin = true)
);
CREATE POLICY "Admins can manage reports" ON home_masjid.content_reports FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM home_masjid.user_profiles WHERE id = auth.uid() AND is_superadmin = true)
);
