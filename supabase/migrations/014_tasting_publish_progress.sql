-- Publishing and host progress need to cross the per-user RLS boundary on
-- blind_responses (own-only) and reviews (insert only as yourself). Both are
-- exposed as SECURITY DEFINER functions that verify the caller is the host.

-- Turn every participant's blind response into a published "verified tasting"
-- review (value omitted) and flip the tasting to published. Runs as definer so
-- it can write reviews on behalf of each participant; the per-row trigger still
-- enforces that is_from_tasting is only set for real participants.
CREATE OR REPLACE FUNCTION publish_tasting_results(p_tasting UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM tastings WHERE id = p_tasting AND host_user_id = v_uid
  ) THEN
    RAISE EXCEPTION 'Only the host can publish results';
  END IF;

  INSERT INTO reviews (
    user_id, fish_id, flavor_score, texture_score, aesthetics_score,
    value_score, overall_score, notes, is_from_tasting, tasting_id
  )
  SELECT br.user_id, tf.fish_id, br.flavor_score, br.texture_score,
         br.aesthetics_score, NULL, br.overall_score, br.review_text,
         true, p_tasting
  FROM blind_responses br
  JOIN tasting_fish tf
    ON tf.tasting_id = br.tasting_id AND tf.blind_number = br.blind_number
  WHERE br.tasting_id = p_tasting AND br.overall_score IS NOT NULL
  ON CONFLICT (user_id, fish_id) DO UPDATE SET
    flavor_score = EXCLUDED.flavor_score,
    texture_score = EXCLUDED.texture_score,
    aesthetics_score = EXCLUDED.aesthetics_score,
    value_score = EXCLUDED.value_score,
    overall_score = EXCLUDED.overall_score,
    notes = EXCLUDED.notes,
    is_from_tasting = EXCLUDED.is_from_tasting,
    tasting_id = EXCLUDED.tasting_id,
    updated_at = now();

  UPDATE tastings SET state = 'published' WHERE id = p_tasting;
END;
$$;

-- Per-participant submission progress for the host panel (counts only, no
-- content). Returns rows only when the caller hosts the tasting.
CREATE OR REPLACE FUNCTION tasting_submission_counts(p_tasting UUID)
RETURNS TABLE (user_id UUID, display_name TEXT, scored INT, guessed INT)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT tp.user_id,
         p.display_name,
         COALESCE(s.scored, 0)::int,
         COALESCE(g.guessed, 0)::int
  FROM tasting_participants tp
  JOIN profiles p ON p.id = tp.user_id
  LEFT JOIN (
    SELECT user_id, count(*) AS scored
    FROM blind_responses
    WHERE tasting_id = p_tasting AND overall_score IS NOT NULL
    GROUP BY user_id
  ) s ON s.user_id = tp.user_id
  LEFT JOIN (
    SELECT user_id, count(*) AS guessed
    FROM blind_responses
    WHERE tasting_id = p_tasting AND guess_primary IS NOT NULL
    GROUP BY user_id
  ) g ON g.user_id = tp.user_id
  WHERE tp.tasting_id = p_tasting
    AND EXISTS (
      SELECT 1 FROM tastings t
      WHERE t.id = p_tasting AND t.host_user_id = auth.uid()
    );
$$;
