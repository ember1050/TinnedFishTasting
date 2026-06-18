-- Tasting events
CREATE TABLE tastings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  is_public BOOLEAN DEFAULT false,
  event_code TEXT UNIQUE, -- for private tastings
  state TEXT NOT NULL DEFAULT 'setup' CHECK (state IN (
    'setup',              -- Host is configuring
    'blind_active',       -- Participants can score blind items
    'blind_locked',       -- Blind scoring submitted, guessing phase
    'reveal',            -- Host has revealed results
    'comprehensive_active', -- Participants doing full reviews
    'comprehensive_locked', -- Full reviews submitted
    'published'          -- Results published to site
  )),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Fish assigned to a tasting with blind numbers
CREATE TABLE tasting_fish (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tasting_id UUID NOT NULL REFERENCES tastings(id) ON DELETE CASCADE,
  fish_id UUID NOT NULL REFERENCES fish(id) ON DELETE CASCADE,
  blind_number INTEGER NOT NULL,
  UNIQUE(tasting_id, blind_number),
  UNIQUE(tasting_id, fish_id)
);

-- Participants
CREATE TABLE tasting_participants (
  tasting_id UUID NOT NULL REFERENCES tastings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (tasting_id, user_id)
);

-- Blind tasting responses (flavor + texture scores per blind number)
CREATE TABLE blind_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tasting_id UUID NOT NULL REFERENCES tastings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  blind_number INTEGER NOT NULL,
  flavor_score INTEGER CHECK (flavor_score BETWEEN 1 AND 10),
  texture_score INTEGER CHECK (texture_score BETWEEN 1 AND 10),
  notes TEXT,
  guess_primary UUID REFERENCES fish(id),
  guess_alternate UUID REFERENCES fish(id),
  submitted_at TIMESTAMPTZ,
  UNIQUE(tasting_id, user_id, blind_number)
);

-- Top picks from comprehensive portion
CREATE TABLE comprehensive_top_picks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tasting_id UUID NOT NULL REFERENCES tastings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  pick_rank INTEGER NOT NULL CHECK (pick_rank BETWEEN 1 AND 3),
  fish_id UUID NOT NULL REFERENCES fish(id),
  UNIQUE(tasting_id, user_id, pick_rank)
);

-- RLS policies
ALTER TABLE tastings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasting_fish ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasting_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE blind_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE comprehensive_top_picks ENABLE ROW LEVEL SECURITY;

-- Tastings: public ones visible to all, private to participants/host
CREATE POLICY "Public tastings visible to all"
  ON tastings FOR SELECT USING (
    is_public = true
    OR host_user_id = auth.uid()
    OR id IN (SELECT tasting_id FROM tasting_participants WHERE user_id = auth.uid())
  );

CREATE POLICY "Host can update own tasting"
  ON tastings FOR UPDATE USING (host_user_id = auth.uid());

CREATE POLICY "Authenticated users can create tastings"
  ON tastings FOR INSERT WITH CHECK (auth.uid() = host_user_id);

-- Tasting fish: visible to participants
CREATE POLICY "Tasting fish visible to participants"
  ON tasting_fish FOR SELECT USING (
    tasting_id IN (
      SELECT id FROM tastings WHERE host_user_id = auth.uid()
      UNION
      SELECT tasting_id FROM tasting_participants WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Host can manage tasting fish"
  ON tasting_fish FOR ALL USING (
    tasting_id IN (SELECT id FROM tastings WHERE host_user_id = auth.uid())
  );

-- Participants
CREATE POLICY "Participants visible to tasting members"
  ON tasting_participants FOR SELECT USING (
    tasting_id IN (
      SELECT id FROM tastings WHERE host_user_id = auth.uid()
      UNION
      SELECT tasting_id FROM tasting_participants WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join tastings"
  ON tasting_participants FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Blind responses: own only (until reveal)
CREATE POLICY "Users can manage own blind responses"
  ON blind_responses FOR ALL USING (auth.uid() = user_id);

-- Comprehensive top picks: own only
CREATE POLICY "Users can manage own top picks"
  ON comprehensive_top_picks FOR ALL USING (auth.uid() = user_id);
