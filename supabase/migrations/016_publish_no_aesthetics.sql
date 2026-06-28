-- Aesthetics is retired and reviews now only publish when complete. Replace the
-- publish function: drop aesthetics from the mapping and only turn a blind
-- response into a review when flavor, texture, and overall are all set.
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
    user_id, fish_id, flavor_score, texture_score,
    value_score, overall_score, notes, is_from_tasting, tasting_id
  )
  SELECT br.user_id, tf.fish_id, br.flavor_score, br.texture_score,
         NULL, br.overall_score, br.review_text, true, p_tasting
  FROM blind_responses br
  JOIN tasting_fish tf
    ON tf.tasting_id = br.tasting_id AND tf.blind_number = br.blind_number
  WHERE br.tasting_id = p_tasting
    AND br.flavor_score IS NOT NULL
    AND br.texture_score IS NOT NULL
    AND br.overall_score IS NOT NULL
  ON CONFLICT (user_id, fish_id) DO UPDATE SET
    flavor_score = EXCLUDED.flavor_score,
    texture_score = EXCLUDED.texture_score,
    value_score = EXCLUDED.value_score,
    overall_score = EXCLUDED.overall_score,
    notes = EXCLUDED.notes,
    is_from_tasting = EXCLUDED.is_from_tasting,
    tasting_id = EXCLUDED.tasting_id,
    updated_at = now();

  UPDATE tastings SET state = 'published' WHERE id = p_tasting;
END;
$$;
