import Link from "next/link";
import { notFound } from "next/navigation";
import { getFishById, getReviewsForFish, getAllFishWithStats } from "@/lib/data";
import { computeValueMetric } from "@/lib/scoring";
import { getAdminStatus } from "@/lib/auth-helpers";
import { fishTypeBadgeClasses } from "@/lib/fish-display";
import { RadarChart } from "@/components/RadarChart";
import { ReviewVotes } from "@/components/ReviewVotes";
import { createClient } from "@/lib/supabase/server";

export default async function FishDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { id } = await params;
  const pageNum = Math.max(1, parseInt((await searchParams).page ?? "1") || 1);
  const [fish, { isAdmin, userId }] = await Promise.all([
    getFishById(id),
    getAdminStatus(),
  ]);

  if (!fish) {
    notFound();
  }

  const { reviews, total, pageSize } = await getReviewsForFish(id, pageNum);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  let hasUserReview = false;
  if (userId) {
    const supabase = await createClient();
    const { data: userReview } = await supabase
      .from("reviews")
      .select("id")
      .eq("fish_id", id)
      .eq("user_id", userId)
      .maybeSingle();
    hasUserReview = Boolean(userReview);
  }

  const allStats = await getAllFishWithStats();
  const stats = allStats.find((f) => f.id === id);
  const proteinPerDollar = (fish.protein_g / fish.price_usd).toFixed(1);
  const gramsPerDollar = (fish.weight_g / fish.price_usd).toFixed(0);
  const calPerGram = (fish.calories / fish.weight_g).toFixed(2);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href="/fish"
        className="text-sm text-blue-600 hover:underline mb-4 inline-block"
      >
        ← Back to rankings
      </Link>

      {/* Hero section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="aspect-square bg-white border border-gray-200 rounded-lg flex items-center justify-center overflow-hidden p-4">
          {fish.image_url ? (
            <img
              src={fish.image_url}
              alt={fish.name}
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="text-center text-gray-400">
              <div className="text-6xl mb-2">🐟</div>
              <p className="text-sm">No image yet</p>
            </div>
          )}
        </div>
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold">{fish.name}</h1>
            {isAdmin && (
              <Link
                href={`/admin/fish/${id}/edit`}
                className="rounded-md bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-200"
              >
                Edit
              </Link>
            )}
          </div>
          <p className="text-lg text-gray-600 mb-1 flex items-center gap-2">
            <span>{fish.brand}</span>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${fishTypeBadgeClasses(
                fish.fish_type
              )}`}
            >
              {fish.fish_type}
            </span>
            {fish.salt_level !== "salted" && (
              <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
                {fish.salt_level === "no_salt" ? "No salt" : "Low sodium"}
              </span>
            )}
          </p>
          {fish.description && (
            <p className="text-sm text-gray-500 mb-4">{fish.description}</p>
          )}

          {/* Score badge */}
          {stats?.avg_overall !== null && stats?.avg_overall !== undefined && (
            <div className="inline-flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full mb-6">
              <span className="text-2xl font-bold text-blue-700">
                {stats.avg_overall.toFixed(1)}
              </span>
              <div className="text-left">
                <span className="text-sm text-blue-600 block">/10 overall</span>
                <span className="text-xs text-blue-400">
                  {stats.review_count} review{stats.review_count !== 1 && "s"}
                  {stats.tasting_review_count > 0 &&
                    ` (${stats.tasting_review_count} from tastings)`}
                </span>
              </div>
            </div>
          )}

          {/* Nutrition card */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-semibold mb-3">Nutrition & Value</h3>
            <dl className="grid grid-cols-2 gap-y-2 text-sm">
              <dt className="text-gray-500">Weight</dt>
              <dd className="font-medium">{fish.weight_g}g</dd>
              <dt className="text-gray-500">Calories</dt>
              <dd className="font-medium">{fish.calories} kcal</dd>
              <dt className="text-gray-500">Protein</dt>
              <dd className="font-medium">{fish.protein_g}g</dd>
              {fish.fat_g !== null && (
                <>
                  <dt className="text-gray-500">Fat</dt>
                  <dd className="font-medium">{fish.fat_g}g</dd>
                </>
              )}
              {fish.sodium_mg !== null && (
                <>
                  <dt className="text-gray-500">Sodium</dt>
                  <dd className="font-medium">{fish.sodium_mg}mg</dd>
                </>
              )}
              <dt className="text-gray-500">Price</dt>
              <dd className="font-medium">${fish.price_usd.toFixed(2)}</dd>
              <dt className="text-gray-500 font-medium border-t pt-2 mt-2">Cal/gram</dt>
              <dd className="font-medium border-t pt-2 mt-2">{calPerGram}</dd>
              <dt className="text-gray-500 font-medium">Protein/dollar</dt>
              <dd className="font-medium">{proteinPerDollar}g/$</dd>
              <dt className="text-gray-500 font-medium">Food/dollar</dt>
              <dd className="font-medium">{gramsPerDollar}g/$</dd>
              <dt
                className="text-gray-500 font-medium"
                title="Geometric mean of protein-per-dollar and grams-per-dollar, scaled to 0–10"
              >
                Value Score
              </dt>
              <dd className="font-medium">{computeValueMetric(fish).toFixed(1)}/10</dd>
            </dl>
          </div>
        </div>
      </div>

      {/* Rating breakdown */}
      {stats?.avg_overall !== null && stats?.avg_overall !== undefined && (
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-4">Rating Breakdown</h2>
          <div className="flex flex-col md:flex-row md:items-center gap-8">
            <div className="w-full max-w-xs mx-auto md:mx-0">
              <RadarChart
                axes={[
                  { label: "Flavor", value: stats.avg_flavor },
                  { label: "Texture", value: stats.avg_texture },
                  { label: "Value", value: stats.avg_value },
                  { label: "Overall", value: stats.avg_overall },
                ]}
                max={10}
                size={300}
              />
            </div>
            <dl className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm flex-1">
              {[
                { label: "Flavor", value: stats.avg_flavor },
                { label: "Texture", value: stats.avg_texture },
                { label: "Value", value: stats.avg_value },
                { label: "Overall", value: stats.avg_overall },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="flex items-center justify-between gap-4 border-b border-gray-100 pb-1"
                >
                  <dt className="text-gray-500">{label}</dt>
                  <dd className="font-semibold text-gray-800">
                    {value?.toFixed(1) ?? "—"}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
          {stats.avg_value === null && (
            <p className="mt-3 text-xs text-gray-400">
              Value isn&apos;t scored in blind tastings, so it may be missing
              until someone leaves a community review.
            </p>
          )}
        </section>
      )}

      {/* Reviews */}
      <section>
        <h2 className="text-xl font-bold mb-4">
          Reviews ({total})
        </h2>

        {/* Review CTA / empty state */}
        {userId && hasUserReview ? (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-lg flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-900">
                You reviewed this fish.
              </p>
              <p className="text-sm text-emerald-700">
                Want to update your scores or notes?
              </p>
            </div>
            <Link
              href={`/fish/${id}/review`}
              className="rounded-md bg-emerald-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-emerald-500"
            >
              Edit your review
            </Link>
          </div>
        ) : userId ? (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-lg flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-blue-900">
                {total === 0 ? "No reviews yet." : "Tried this fish?"}
              </p>
              <p className="text-sm text-blue-800">
                {total === 0
                  ? "Be the first to rate this fish."
                  : "Share your thoughts with a review."}
              </p>
            </div>
            <Link
              href={`/fish/${id}/review`}
              className="rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-500"
            >
              {total === 0 ? "Be the first to review" : "Leave a review"}
            </Link>
          </div>
        ) : (
          <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-gray-800">
                {total === 0 ? "No reviews yet." : "Tried this fish?"}
              </p>
              <p className="text-sm text-gray-600">
                Log in to {total === 0 ? "be the first to review it." : "leave a review."}
              </p>
            </div>
            <Link
              href="/auth/login"
              className="rounded-md bg-gray-800 px-4 py-1.5 text-sm font-medium text-white hover:bg-gray-700"
            >
              Log In
            </Link>
          </div>
        )}
        {total === 0 ? (
          <p className="text-sm text-gray-500">
            Reviews will appear here once someone shares their rating.
          </p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">
                      {review.user_name}
                    </span>
                    {review.is_from_tasting && (
                      <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                        ✓ Verified Tasting
                      </span>
                    )}
                  </div>
                  <span className="text-lg font-bold text-blue-700">
                    {review.overall_score}/10
                  </span>
                </div>
                {review.notes && (
                  <p className="text-sm text-gray-600 mb-3">{review.notes}</p>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex gap-4 text-xs text-gray-400">
                    <span>Flavor: {review.flavor_score}</span>
                    <span>Texture: {review.texture_score}</span>
                    {review.value_score !== null &&
                      review.value_score !== undefined && (
                        <span>Value: {review.value_score}</span>
                      )}
                  </div>
                  <ReviewVotes
                    reviewId={review.id}
                    net={review.net_votes ?? 0}
                    mine={review.my_vote ?? 0}
                    canVote={!!userId}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-4 text-sm">
            {pageNum > 1 && (
              <Link
                href={`/fish/${id}?page=${pageNum - 1}`}
                className="text-blue-600 hover:underline"
              >
                ← Previous
              </Link>
            )}
            <span className="text-gray-500">
              Page {pageNum} of {totalPages}
            </span>
            {pageNum < totalPages && (
              <Link
                href={`/fish/${id}?page=${pageNum + 1}`}
                className="text-blue-600 hover:underline"
              >
                Next →
              </Link>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
