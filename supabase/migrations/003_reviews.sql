-- Casual reviews (any logged-in user can leave on any fish)
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  fish_id UUID NOT NULL REFERENCES fish(id) ON DELETE CASCADE,
  flavor_score INTEGER NOT NULL CHECK (flavor_score BETWEEN 1 AND 10),
  texture_score INTEGER NOT NULL CHECK (texture_score BETWEEN 1 AND 10),
  aesthetics_score INTEGER NOT NULL CHECK (aesthetics_score BETWEEN 1 AND 10),
  value_score INTEGER NOT NULL CHECK (value_score BETWEEN 1 AND 10),
  overall_score INTEGER NOT NULL CHECK (overall_score BETWEEN 1 AND 10),
  notes TEXT,
  is_from_tasting BOOLEAN DEFAULT false,
  tasting_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, fish_id, tasting_id)
);

CREATE INDEX idx_reviews_fish ON reviews(fish_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);

-- RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews are viewable by everyone"
  ON reviews FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create reviews"
  ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
  ON reviews FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews"
  ON reviews FOR DELETE USING (auth.uid() = user_id);
