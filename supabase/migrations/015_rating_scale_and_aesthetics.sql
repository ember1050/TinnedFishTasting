-- Two rating changes from testing feedback:
--   1. Use a 0–10 scale so the slider's midpoint (5) sits dead-center, and the
--      neutral/unset thumb reads as centered. Relaxing 1–10 to 0–10 is
--      backward-compatible with all existing scores.
--   2. Retire "aesthetics" as a rated dimension (you can't judge a tin's looks
--      blind). Make it nullable and stop collecting it.

-- reviews: relax score ranges to 0–10
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_flavor_score_check;
ALTER TABLE reviews ADD CONSTRAINT reviews_flavor_score_check CHECK (flavor_score BETWEEN 0 AND 10);
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_texture_score_check;
ALTER TABLE reviews ADD CONSTRAINT reviews_texture_score_check CHECK (texture_score BETWEEN 0 AND 10);
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_value_score_check;
ALTER TABLE reviews ADD CONSTRAINT reviews_value_score_check CHECK (value_score IS NULL OR value_score BETWEEN 0 AND 10);
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_overall_score_check;
ALTER TABLE reviews ADD CONSTRAINT reviews_overall_score_check CHECK (overall_score BETWEEN 0 AND 10);

-- reviews: retire aesthetics (nullable, 0–10 when present)
ALTER TABLE reviews ALTER COLUMN aesthetics_score DROP NOT NULL;
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_aesthetics_score_check;
ALTER TABLE reviews ADD CONSTRAINT reviews_aesthetics_score_check CHECK (aesthetics_score IS NULL OR aesthetics_score BETWEEN 0 AND 10);

-- blind_responses: relax to 0–10 (all already nullable)
ALTER TABLE blind_responses DROP CONSTRAINT IF EXISTS blind_responses_flavor_score_check;
ALTER TABLE blind_responses ADD CONSTRAINT blind_responses_flavor_score_check CHECK (flavor_score IS NULL OR flavor_score BETWEEN 0 AND 10);
ALTER TABLE blind_responses DROP CONSTRAINT IF EXISTS blind_responses_texture_score_check;
ALTER TABLE blind_responses ADD CONSTRAINT blind_responses_texture_score_check CHECK (texture_score IS NULL OR texture_score BETWEEN 0 AND 10);
ALTER TABLE blind_responses DROP CONSTRAINT IF EXISTS blind_responses_overall_score_check;
ALTER TABLE blind_responses ADD CONSTRAINT blind_responses_overall_score_check CHECK (overall_score IS NULL OR overall_score BETWEEN 0 AND 10);
ALTER TABLE blind_responses DROP CONSTRAINT IF EXISTS blind_responses_aesthetics_score_check;
-- aesthetics retired from blind responses too
