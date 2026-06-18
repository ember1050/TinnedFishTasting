-- Fish product catalog
CREATE TABLE fish (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  fish_type TEXT NOT NULL CHECK (fish_type IN (
    'sardine', 'tuna', 'mackerel', 'salmon', 'anchovy',
    'trout', 'herring', 'cod', 'mussel', 'oyster', 'clam', 'squid', 'other'
  )),
  weight_g NUMERIC NOT NULL,
  calories NUMERIC NOT NULL,
  protein_g NUMERIC NOT NULL,
  fat_g NUMERIC,
  sodium_mg NUMERIC,
  price_usd NUMERIC NOT NULL,
  image_url TEXT,
  description TEXT,
  sourcing_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Computed columns (useful for sorting/filtering)
COMMENT ON TABLE fish IS 'Tinned fish product catalog - admin managed';

-- Index for common queries
CREATE INDEX idx_fish_type ON fish(fish_type);
CREATE INDEX idx_fish_brand ON fish(brand);
