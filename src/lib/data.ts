import { createClient } from "@/lib/supabase/server";
import type { Fish, FishWithStats } from "@/lib/types";
import { getBadgesForUsers } from "@/lib/badges";

/**
 * Data access layer — queries Supabase for live data.
 */

export async function getAllFishWithStats(): Promise<FishWithStats[]> {
  const supabase = await createClient();

  const { data: fish, error } = await supabase
    .from("fish")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !fish || fish.length === 0) {
    return [];
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
    return null;
  }

  return data;
}

export async function getReviewsForFish(
  fishId: string,
  page = 1,
  pageSize = 5,
  sort: "newest" | "popular" = "newest"
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("reviews")
    .select("*, profiles!reviews_user_id_fkey(display_name)")
    .eq("fish_id", fishId)
    .order("created_at", { ascending: false })
    .limit(500);

  if (error || !data || data.length === 0) {
    return { reviews: [], total: 0, page, pageSize };
  }

  // Tally votes across all reviews + the viewer's own votes (small dataset).
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

  // Badges for the review authors (single batched query, no N+1).
  const badgesByUser = await getBadgesForUsers(
    data.map((r) => r.user_id as string)
  );

  const enriched = data.map((r) => ({
    ...r,
    user_name:
      (r.profiles as { display_name: string } | null)?.display_name ||
      "Anonymous",
    net_votes: net.get(r.id) ?? 0,
    my_vote: mine.get(r.id) ?? 0,
    author_badges: badgesByUser.get(r.user_id as string) ?? [],
  }));

  if (sort === "popular") {
    enriched.sort(
      (a, b) =>
        b.net_votes - a.net_votes ||
        +new Date(b.created_at) - +new Date(a.created_at)
    );
  }

  const total = enriched.length;
  const from = (page - 1) * pageSize;
  return { reviews: enriched.slice(from, from + pageSize), total, page, pageSize };
}
