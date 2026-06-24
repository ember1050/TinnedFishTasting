-- Reviews table is empty; switch to one live review per (user, fish).
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_user_id_fish_id_tasting_id_key;
ALTER TABLE reviews ADD CONSTRAINT reviews_user_fish_unique UNIQUE (user_id, fish_id);
