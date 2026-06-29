-- Tasting guessing: let participants lock in answers, show the host brands +
-- live correctness, and support host backtracking. All additive.

ALTER TABLE tasting_participants
  ADD COLUMN IF NOT EXISTS guesses_submitted_at TIMESTAMPTZ;

-- Host progress: add whether each participant has locked their guesses.
DROP FUNCTION IF EXISTS tasting_submission_counts(UUID);
CREATE OR REPLACE FUNCTION tasting_submission_counts(p_tasting UUID)
RETURNS TABLE (user_id UUID, display_name TEXT, scored INT, guessed INT, submitted BOOLEAN)
LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE AS $$
  SELECT tp.user_id, p.display_name,
         COALESCE(s.scored,0)::int, COALESCE(g.guessed,0)::int,
         tp.guesses_submitted_at IS NOT NULL
  FROM tasting_participants tp
  JOIN profiles p ON p.id = tp.user_id
  LEFT JOIN (SELECT user_id, count(*) scored FROM blind_responses WHERE tasting_id=p_tasting AND overall_score IS NOT NULL GROUP BY user_id) s ON s.user_id=tp.user_id
  LEFT JOIN (SELECT user_id, count(*) guessed FROM blind_responses WHERE tasting_id=p_tasting AND guess_primary IS NOT NULL GROUP BY user_id) g ON g.user_id=tp.user_id
  WHERE tp.tasting_id=p_tasting
    AND EXISTS (SELECT 1 FROM tastings t WHERE t.id=p_tasting AND t.host_user_id=auth.uid());
$$;

-- Host guess view: include brand + whether each guess was correct.
DROP FUNCTION IF EXISTS tasting_guesses(UUID);
CREATE OR REPLACE FUNCTION tasting_guesses(p_tasting UUID)
RETURNS TABLE (user_id UUID, display_name TEXT, blind_number INT,
  primary_guess TEXT, primary_brand TEXT, alternate_guess TEXT, correct BOOLEAN)
LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE AS $$
  SELECT br.user_id, p.display_name, br.blind_number,
         fp.name, fp.brand, fa.name,
         (tf.fish_id = br.guess_primary OR tf.fish_id = br.guess_alternate)
  FROM blind_responses br
  JOIN profiles p ON p.id = br.user_id
  LEFT JOIN fish fp ON fp.id = br.guess_primary
  LEFT JOIN fish fa ON fa.id = br.guess_alternate
  LEFT JOIN tasting_fish tf ON tf.tasting_id=br.tasting_id AND tf.blind_number=br.blind_number
  WHERE br.tasting_id=p_tasting
    AND (br.guess_primary IS NOT NULL OR br.guess_alternate IS NOT NULL)
    AND EXISTS (SELECT 1 FROM tastings t WHERE t.id=p_tasting AND t.host_user_id=auth.uid())
  ORDER BY p.display_name, br.blind_number;
$$;
