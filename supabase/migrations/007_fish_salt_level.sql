-- Structured salt level: default-assume salted, flag the exceptions.
-- Flavor + packing medium stay in the product name; only the salt descriptor
-- is extracted out so names read cleaner.

ALTER TABLE fish
  ADD COLUMN salt_level TEXT NOT NULL DEFAULT 'salted'
  CHECK (salt_level IN ('salted', 'low_sodium', 'no_salt'));

-- Classify from the existing name wording (run before stripping).
UPDATE fish SET salt_level = 'no_salt'     WHERE name ILIKE '%no salt%';
UPDATE fish SET salt_level = 'low_sodium'  WHERE name ILIKE '%low sodium%';

-- Strip the trailing salt descriptor from the name (keep medium + flavor).
UPDATE fish
  SET name = btrim(regexp_replace(name, ',\s*(no salt|low sodium|salt)\s*$', '', 'i'));
