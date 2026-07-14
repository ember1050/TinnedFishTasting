-- Prevent duplicate fish. Identity = brand + name (case-insensitive) + salt_level.
-- salt_level is part of the key because migration 007 extracted the salt
-- descriptor OUT of the name into a structured field, so salted / low_sodium /
-- no_salt variants legitimately share a name but are distinct products.
-- Verified: no existing rows collide under this key, so the index applies cleanly.

CREATE UNIQUE INDEX IF NOT EXISTS fish_brand_name_salt_unique
  ON fish (lower(brand), lower(name), salt_level);
