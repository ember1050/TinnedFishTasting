-- Joining a PRIVATE tasting by event code is a chicken-and-egg problem: RLS
-- hides private tastings from non-participants, so a user can't SELECT the
-- tasting to discover its id before joining. This SECURITY DEFINER function
-- looks up the tasting by code and enrolls the caller as a participant.
CREATE OR REPLACE FUNCTION join_tasting_by_code(p_code TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tasting_id UUID;
  v_uid UUID := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT id INTO v_tasting_id
  FROM tastings
  WHERE event_code = upper(btrim(p_code));

  IF v_tasting_id IS NULL THEN
    RAISE EXCEPTION 'Invalid event code';
  END IF;

  INSERT INTO tasting_participants (tasting_id, user_id)
  VALUES (v_tasting_id, v_uid)
  ON CONFLICT DO NOTHING;

  RETURN v_tasting_id;
END;
$$;
