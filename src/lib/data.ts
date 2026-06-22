import { createClient } from "@/lib/supabase/server";
import type { Fish, FishWithStats } from "@/lib/types";
import { getMockFishWithStats, getMockFishById, getMockReviewsForFish } from "@/lib/mock-data";

/**
 * Data access layer — queries Supabase when available,
 * falls back to mock data if the DB is empty.
 *
 * TODO: Remove mock fallbacks once real data is populated.
 */

export async function getAllFishWithStats(): Promise<FishWithStats[]> {
  const supabase = await createClient();

  const { data: fish, error } = await supabase
    .from("fish")
    .select("*")
    .order("created_at", { ascending: false });

  // If no fish in DB yet, fall back to mock data
  if (error || !fish || fish.length === 0) {
    return getMockFishWithStats();
  }

  // Fetch review stats for each fish
  const fishIds = fish.map((f) => f.id);
  const { data: reviews } = await supabase
    .from("reviews")
    .select("fish_id, flavor_score, texture_score, aesthetics_score, value_score, overall_score, is_from_tasting")
    .in("fish_id", fishIds);

  return fish.map((f) => {
    const fishReviews = (reviews || []).filter((r) => r.fish_id === f.id);
    const count = fishReviews.length;

    if (count === 0) {
      return {
        ...f,
        avg_overall: null,
        avg_flavor: null,
        avg_texture: null,
        avg_aesthetics: null,
        avg_value: null,
        review_count: 0,
        tasting_review_count: 0,
      };
    }

    const avg = (scores: number[]) =>
      Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10;

    return {
      ...f,
      avg_overall: avg(fishReviews.map((r) => r.overall_score)),
      avg_flavor: avg(fishReviews.map((r) => r.flavor_score)),
      avg_texture: avg(fishReviews.map((r) => r.texture_score)),
      avg_aesthetics: avg(fishReviews.map((r) => r.aesthetics_score)),
      avg_value: avg(fishReviews.map((r) => r.value_score)),
      review_count: count,
      tasting_review_count: fishReviews.filter((r) => r.is_from_tasting).length,
    };
  });
}

export async function getFishById(id: string): Promise<Fish | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("fish")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    // Fall back to mock data
    return getMockFishById(id) || null;
  }

  return data;
}

export async function getReviewsForFish(fishId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("reviews")
    .select("*, profiles(display_name)")
    .eq("fish_id", fishId)
    .order("created_at", { ascending: false });

  if (error || !data || data.length === 0) {
    // Fall back to mock
    return getMockReviewsForFish(fishId);
  }

  return data.map((r) => ({
    ...r,
    user_name: (r.profiles as { display_name: string } | null)?.display_name || "Anonymous",
  }));
}
