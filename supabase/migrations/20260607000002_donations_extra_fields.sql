-- Migration: Extra fields on donations for anonymous + recurring support,
-- plus a paystack_plans cache table to avoid re-creating Paystack plans.

-- 1. Add anonymity flag so donors can hide their identity on the public donor wall
ALTER TABLE home_masjid.donations
  ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN NOT NULL DEFAULT false;

-- 2. Add recurring flag to distinguish Sadaqah Jariyah subscriptions from one-time gifts
ALTER TABLE home_masjid.donations
  ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN NOT NULL DEFAULT false;

-- 3. Cache Paystack plan codes per (project, amount_cents).
--    Paystack requires a Plan object before a subscription can be created.
--    We cache per-amount so we don't hit the API on every donation.
CREATE TABLE IF NOT EXISTS home_masjid.paystack_plans (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id   UUID        NOT NULL REFERENCES home_masjid.projects(id) ON DELETE CASCADE,
  amount_cents INT         NOT NULL,
  plan_code    TEXT        NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, amount_cents)
);

-- Only service_role can manage plans (they are server-side only)
ALTER TABLE home_masjid.paystack_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role manages plans"
  ON home_masjid.paystack_plans
  USING (true)
  WITH CHECK (true);
