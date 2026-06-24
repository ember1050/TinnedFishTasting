CREATE OR REPLACE FUNCTION enforce_review_tasting_flag()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_from_tasting = true THEN
    IF NEW.tasting_id IS NULL
       OR NOT EXISTS (
         SELECT 1 FROM tasting_participants tp
         WHERE tp.tasting_id = NEW.tasting_id AND tp.user_id = NEW.user_id
       ) THEN
      -- Not a legitimate tasting review: strip the verified flag.
      NEW.is_from_tasting := false;
      NEW.tasting_id := NULL;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_enforce_review_tasting_flag
  BEFORE INSERT OR UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION enforce_review_tasting_flag();
