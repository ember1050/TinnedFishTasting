export type FishType =
  | "sardine"
  | "tuna"
  | "mackerel"
  | "salmon"
  | "anchovy"
  | "trout"
  | "herring"
  | "cod"
  | "mussel"
  | "oyster"
  | "clam"
  | "squid"
  | "other";

export interface Fish {
  id: string;
  name: string;
  brand: string;
  fish_type: FishType;
  weight_g: number;
  calories: number;
  protein_g: number;
  fat_g: number | null;
  sodium_mg: number | null;
  price_usd: number;
  image_url: string | null;
  description: string | null;
  sourcing_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  user_id: string;
  fish_id: string;
  flavor_score: number;
  texture_score: number;
  aesthetics_score: number;
  value_score: number;
  overall_score: number;
  notes: string | null;
  is_from_tasting: boolean;
  tasting_id: string | null;
  created_at: string;
  updated_at: string;
}

export type TastingState =
  | "setup"
  | "blind_active"
  | "blind_locked"
  | "reveal"
  | "comprehensive_active"
  | "comprehensive_locked"
  | "published";

export interface Tasting {
  id: string;
  host_user_id: string;
  title: string;
  is_public: boolean;
  event_code: string | null;
  state: TastingState;
  created_at: string;
  updated_at: string;
}

export interface TastingFish {
  id: string;
  tasting_id: string;
  fish_id: string;
  blind_number: number;
}

export interface BlindResponse {
  id: string;
  tasting_id: string;
  user_id: string;
  blind_number: number;
  flavor_score: number | null;
  texture_score: number | null;
  notes: string | null;
  guess_primary: string | null;
  guess_alternate: string | null;
  submitted_at: string | null;
}

export interface FishWithStats extends Fish {
  avg_overall: number | null;
  avg_flavor: number | null;
  avg_texture: number | null;
  avg_aesthetics: number | null;
  avg_value: number | null;
  review_count: number;
  tasting_review_count: number;
}
