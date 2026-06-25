-- Fix infinite recursion (Postgres 42P17) between the tastings and
-- tasting_participants RLS policies. The original policies referenced each
-- other directly, so evaluating one required evaluating the other forever.
--
-- The fix: membership checks run through SECURITY DEFINER functions, which
-- bypass RLS on the tables they read, breaking the cycle.

CREATE OR REPLACE FUNCTION is_tasting_participant(p_tasting UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM tasting_participants
    WHERE tasting_id = p_tasting AND user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION is_tasting_host(p_tasting UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM tastings
    WHERE id = p_tasting AND host_user_id = auth.uid()
  );
$$;

-- tastings: visible to everyone if public, else to host + participants.
DROP POLICY IF EXISTS "Public tastings visible to all" ON tastings;
CREATE POLICY "Tastings visible to public, host, participants"
  ON tastings FOR SELECT USING (
    is_public = true
    OR host_user_id = auth.uid()
    OR is_tasting_participant(id)
  );

-- tasting_participants: a row is visible to its own user, the host, or a
-- co-participant of the same tasting.
DROP POLICY IF EXISTS "Participants visible to tasting members" ON tasting_participants;
CREATE POLICY "Participants visible to members"
  ON tasting_participants FOR SELECT USING (
    user_id = auth.uid()
    OR is_tasting_host(tasting_id)
    OR is_tasting_participant(tasting_id)
  );

-- tasting_fish: visible to host + participants.
DROP POLICY IF EXISTS "Tasting fish visible to participants" ON tasting_fish;
CREATE POLICY "Tasting fish visible to host and participants"
  ON tasting_fish FOR SELECT USING (
    is_tasting_host(tasting_id) OR is_tasting_participant(tasting_id)
  );

-- tasting_fish: only the host can add/modify the lineup.
DROP POLICY IF EXISTS "Host can manage tasting fish" ON tasting_fish;
CREATE POLICY "Host can manage tasting fish"
  ON tasting_fish FOR ALL USING (is_tasting_host(tasting_id));
