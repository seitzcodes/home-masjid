-- Atomic function to increment a project's current_amount.
-- Using a single UPDATE avoids the TOCTOU race condition that a read+write pattern creates
-- when two webhooks fire simultaneously for the same project.
CREATE OR REPLACE FUNCTION home_masjid.increment_project_amount(
  p_id UUID,
  amount NUMERIC
) RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE home_masjid.projects
  SET current_amount = current_amount + amount
  WHERE id = p_id;
$$;
