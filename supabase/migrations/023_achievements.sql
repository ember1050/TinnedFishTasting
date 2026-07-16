-- Achievements / profile badges. All additive.
-- First badge: "perfect_taste" — a participant who matched every fish in a
-- tasting's guessing round on their FIRST guess (true max score).

CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  -- Source tasting (nullable so future non-tasting badges can be awarded too).
  tasting_id UUID REFERENCES tastings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Same badge can stack across different tastings, but not double-award one.
  UNIQUE (user_id, kind, tasting_id)
);

CREATE INDEX idx_user_achievements_user ON user_achievements (user_id);

ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- Badges are public (shown on profiles + next to reviews).
CREATE POLICY "Achievements are viewable by everyone"
  ON user_achievements FOR SELECT USING (true);

-- No client writes: only the SECURITY DEFINER award function below inserts.

-- Award tasting-derived achievements. Host-gated + idempotent. Called right
-- after publish (state is already 'published'). SECURITY DEFINER so it can
-- write achievement rows for every participant, which RLS forbids clients.
CREATE OR REPLACE FUNCTION award_tasting_achievements(p_tasting UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_fish_count INT;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM tastings WHERE id = p_tasting AND host_user_id = v_uid
  ) THEN
    RAISE EXCEPTION 'Only the host can award achievements';
  END IF;

  SELECT count(*) INTO v_fish_count
  FROM tasting_fish WHERE tasting_id = p_tasting;

  IF v_fish_count = 0 THEN
    RETURN;
  END IF;

  -- Perfect Taste: number of correct FIRST guesses equals the fish count.
  INSERT INTO user_achievements (user_id, kind, tasting_id)
  SELECT br.user_id, 'perfect_taste', p_tasting
  FROM blind_responses br
  JOIN tasting_fish tf
    ON tf.tasting_id = br.tasting_id AND tf.blind_number = br.blind_number
  WHERE br.tasting_id = p_tasting
    AND br.guess_primary = tf.fish_id
  GROUP BY br.user_id
  HAVING count(*) = v_fish_count
  ON CONFLICT (user_id, kind, tasting_id) DO NOTHING;
END;
$$;
