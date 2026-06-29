-- Unique usernames + avatar storage. All additive; no existing data has
-- duplicate display_names (verified), so the unique index applies cleanly.

-- Case-insensitive unique display_name (the username).
CREATE UNIQUE INDEX profiles_display_name_unique ON profiles (lower(display_name));

-- Public avatars bucket.
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Anyone can view avatars; users manage only files under their own uid folder.
CREATE POLICY "Avatars are public" ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');
CREATE POLICY "Users upload own avatar" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users update own avatar" ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users delete own avatar" ON storage.objects FOR DELETE
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
