-- Allow public read access to fish table, admin-only writes
ALTER TABLE fish ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Fish are viewable by everyone"
  ON fish FOR SELECT USING (true);

CREATE POLICY "Only admins can insert fish"
  ON fish FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Only admins can update fish"
  ON fish FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Only admins can delete fish"
  ON fish FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );
