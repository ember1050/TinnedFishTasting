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
    .select("fish_id, flavor_score, texture_score, value_score, overall_score, is_from_tasting")
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
        avg_value: null,
        review_count: 0,
        tasting_review_count: 0,
      };
    }

    const avg = (scores: number[]) =>
      Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10;
    const avgNullable = (scores: (number | null)[]) => {
      const present = scores.filter((s): s is number => s != null);
      return present.length > 0 ? avg(present) : null;
    };

    return {
      ...f,
      avg_overall: avg(fishReviews.map((r) => r.overall_score)),
      avg_flavor: avg(fishReviews.map((r) => r.flavor_score)),
      avg_texture: avg(fishReviews.map((r) => r.texture_score)),
      avg_value: avgNullable(fishReviews.map((r) => r.value_score)),
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

export async function getReviewsForFish(
  fishId: string,
  page = 1,
  pageSize = 10
) {
  const supabase = await createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, count, error } = await supabase
    .from("reviews")
    .select("*, profiles!reviews_user_id_fkey(display_name)", { count: "exact" })
    .eq("fish_id", fishId)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error || !data || data.length === 0) {
    if (page > 1) return { reviews: [], total: 0, page, pageSize };
    const mock = getMockReviewsForFish(fishId);
    return { reviews: mock, total: mock.length, page, pageSize };
  }

  // Tally votes for this page of reviews + the viewer's own votes.
  const ids = data.map((r) => r.id);
  const [{ data: votes }, { data: auth }] = await Promise.all([
    supabase.from("review_votes").select("review_id, value, user_id").in("review_id", ids),
    supabase.auth.getUser(),
  ]);
  const myId = auth?.user?.id;
  const net = new Map<string, number>();
  const mine = new Map<string, number>();
  for (const v of votes || []) {
    net.set(v.review_id, (net.get(v.review_id) ?? 0) + v.value);
    if (v.user_id === myId) mine.set(v.review_id, v.value);
  }

  const reviews = data.map((r) => ({
    ...r,
    user_name:
      (r.profiles as { display_name: string } | null)?.display_name ||
      "Anonymous",
    net_votes: net.get(r.id) ?? 0,
    my_vote: mine.get(r.id) ?? 0,
  }));

  return { reviews, total: count ?? reviews.length, page, pageSize };
}
