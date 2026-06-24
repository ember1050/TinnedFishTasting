CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('bug', 'feature')),
  message TEXT NOT NULL CHECK (char_length(message) BETWEEN 1 AND 4000),
  page_url TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','triaged','resolved','wont_fix')),
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_feedback_created ON feedback(created_at DESC);

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Any authenticated user can submit feedback attributed to themselves.
CREATE POLICY "Users can submit feedback"
  ON feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can see their own; admins can see all.
CREATE POLICY "View own or admin views all"
  ON feedback FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
  );

-- Admins can update status.
CREATE POLICY "Admins can update feedback"
  ON feedback FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));
