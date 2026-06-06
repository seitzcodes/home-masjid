-- Migration: Peer Validation tracking
-- Creates a table to track which verified faculty members vouched for a pending claim

CREATE TABLE IF NOT EXISTS home_masjid.masjid_claim_vouches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id UUID NOT NULL REFERENCES home_masjid.masjid_claims(id) ON DELETE CASCADE,
  vouching_user_id UUID NOT NULL REFERENCES auth.users(id),
  comments TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(claim_id, vouching_user_id)
);

-- RLS Policies for the vouches table
ALTER TABLE home_masjid.masjid_claim_vouches ENABLE ROW LEVEL SECURITY;

-- Admins can view all vouches
CREATE POLICY "Admins can view vouches"
  ON home_masjid.masjid_claim_vouches FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM home_masjid.user_profiles
      WHERE id = auth.uid() AND is_superadmin = true
    )
  );

-- Faculty can view vouches
CREATE POLICY "Faculty can view vouches"
  ON home_masjid.masjid_claim_vouches FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM home_masjid.masjid_faculty
      WHERE user_id = auth.uid()
    )
  );

-- Faculty can insert vouches
CREATE POLICY "Faculty can insert vouches"
  ON home_masjid.masjid_claim_vouches FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM home_masjid.masjid_faculty
      WHERE user_id = auth.uid()
    ) AND
    vouching_user_id = auth.uid()
  );

-- UPDATE RLS for masjid_claims to allow faculty to see pending claims
-- (Normally only the claimer or admins can see claims)
CREATE POLICY "Faculty can view pending claims for peer review"
  ON home_masjid.masjid_claims FOR SELECT
  TO authenticated
  USING (
    status = 'pending' AND
    EXISTS (
      SELECT 1 FROM home_masjid.masjid_faculty
      WHERE user_id = auth.uid()
    )
  );
