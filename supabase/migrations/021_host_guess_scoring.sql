-- Round 4: host guess view — expose the backup guess's brand and which guess
-- (first vs backup) was correct, so the host can see each participant's score
-- and where the points came from. Additive; return type changes so DROP first.

DROP FUNCTION IF EXISTS tasting_guesses(UUID);
CREATE OR REPLACE FUNCTION tasting_guesses(p_tasting UUID)
RETURNS TABLE (user_id UUID, display_name TEXT, blind_number INT,
  primary_guess TEXT, primary_brand TEXT,
  alternate_guess TEXT, alternate_brand TEXT,
  primary_correct BOOLEAN, alternate_correct BOOLEAN, correct BOOLEAN)
LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE AS $$
  SELECT br.user_id, p.display_name, br.blind_number,
         fp.name, fp.brand, fa.name, fa.brand,
         (tf.fish_id = br.guess_primary),
         (tf.fish_id = br.guess_alternate),
         (tf.fish_id = br.guess_primary OR tf.fish_id = br.guess_alternate)
  FROM blind_responses br
  JOIN profiles p ON p.id = br.user_id
  LEFT JOIN fish fp ON fp.id = br.guess_primary
  LEFT JOIN fish fa ON fa.id = br.guess_alternate
  LEFT JOIN tasting_fish tf
    ON tf.tasting_id = br.tasting_id AND tf.blind_number = br.blind_number
  WHERE br.tasting_id = p_tasting
    AND (br.guess_primary IS NOT NULL OR br.guess_alternate IS NOT NULL)
    AND EXISTS (
      SELECT 1 FROM tastings t
      WHERE t.id = p_tasting AND t.host_user_id = auth.uid()
    )
  ORDER BY p.display_name, br.blind_number;
$$;
