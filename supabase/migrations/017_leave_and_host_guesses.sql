-- Support two feedback items:
--   1. Let participants leave a tasting (there was no DELETE policy).
--   2. Let the host view participants' guesses (blind_responses are own-only,
--      so this needs a SECURITY DEFINER function gated to the host).

CREATE POLICY "Users can leave tastings"
  ON tasting_participants FOR DELETE USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION tasting_guesses(p_tasting UUID)
RETURNS TABLE (
  user_id UUID,
  display_name TEXT,
  blind_number INT,
  primary_guess TEXT,
  alternate_guess TEXT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT br.user_id,
         p.display_name,
         br.blind_number,
         fp.name AS primary_guess,
         fa.name AS alternate_guess
  FROM blind_responses br
  JOIN profiles p ON p.id = br.user_id
  LEFT JOIN fish fp ON fp.id = br.guess_primary
  LEFT JOIN fish fa ON fa.id = br.guess_alternate
  WHERE br.tasting_id = p_tasting
    AND (br.guess_primary IS NOT NULL OR br.guess_alternate IS NOT NULL)
    AND EXISTS (
      SELECT 1 FROM tastings t
      WHERE t.id = p_tasting AND t.host_user_id = auth.uid()
    )
  ORDER BY p.display_name, br.blind_number;
$$;
