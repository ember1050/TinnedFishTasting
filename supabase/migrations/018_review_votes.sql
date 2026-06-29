-- Up/down voting on reviews. Additive only — no changes to existing tables.
CREATE TABLE review_votes (
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  value SMALLINT NOT NULL CHECK (value IN (-1, 1)),
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (review_id, user_id)
);

CREATE INDEX idx_review_votes_review ON review_votes(review_id);

ALTER TABLE review_votes ENABLE ROW LEVEL SECURITY;

-- Anyone can read vote tallies; only the owner can cast/change/remove their vote.
CREATE POLICY "Votes are viewable by everyone"
  ON review_votes FOR SELECT USING (true);
CREATE POLICY "Users can cast their own vote"
  ON review_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can change their own vote"
  ON review_votes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can remove their own vote"
  ON review_votes FOR DELETE USING (auth.uid() = user_id);
