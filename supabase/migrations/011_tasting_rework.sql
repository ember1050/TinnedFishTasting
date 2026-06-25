-- Rework the tasting flow for the v1 format:
--   setup → blind_active → blind_locked → guessing_active → guessing_locked → published
-- The review (sensory scores + a published review_text) is captured BLIND in
-- stage 1; stage 2 is guessing only. "value" is omitted from tasting reviews.

-- 1. New state machine. The tastings table is empty, so swapping the CHECK
--    constraint is safe.
ALTER TABLE tastings DROP CONSTRAINT IF EXISTS tastings_state_check;
ALTER TABLE tastings ADD CONSTRAINT tastings_state_check CHECK (state IN (
  'setup',            -- host configuring
  'blind_active',     -- participants score + write their review (blind)
  'blind_locked',     -- interlude: host presents the candidate fish types IRL
  'guessing_active',  -- participants submit a 1st + backup guess per tin
  'guessing_locked',  -- guesses submitted; host wrapping up before reveal
  'published'         -- reveal correctness + published reviews go live
));

-- 2. Blind stage captures the full sensory review. Decision: two text fields —
--    private `notes` (scratchpad, shown read-only during guessing) and the
--    published `review_text`.
ALTER TABLE blind_responses
  ADD COLUMN IF NOT EXISTS aesthetics_score INTEGER CHECK (aesthetics_score BETWEEN 1 AND 10),
  ADD COLUMN IF NOT EXISTS overall_score INTEGER CHECK (overall_score BETWEEN 1 AND 10),
  ADD COLUMN IF NOT EXISTS review_text TEXT;

-- 3. Tasting reviews omit "value" (can't be judged blind), so value_score must
--    allow NULL. Community reviews still provide it.
ALTER TABLE reviews ALTER COLUMN value_score DROP NOT NULL;

-- 4. Enable Supabase Realtime so participants react live to host state changes,
--    the lobby reflects joins, and the host sees submission progress.
ALTER PUBLICATION supabase_realtime ADD TABLE tastings;
ALTER PUBLICATION supabase_realtime ADD TABLE tasting_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE blind_responses;
