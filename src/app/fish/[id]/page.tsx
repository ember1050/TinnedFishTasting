import Link from "next/link";
import { notFound } from "next/navigation";
import { getFishById, getReviewsForFish, getAllFishWithStats } from "@/lib/data";
import { computeValueMetric } from "@/lib/scoring";

export default async function FishDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const fish = await getFishById(id);

  if (!fish) {
    notFound();
  }

  const reviews = await getReviewsForFish(id);
  const allStats = await getAllFishWithStats();
  const stats = allStats.find((f) => f.id === id);
  const proteinPerDollar = (fish.protein_g / fish.price_usd).toFixed(1);
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
        <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center text-gray-400">
            <div className="text-6xl mb-2">🐟</div>
            <p className="text-sm">Product image</p>
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-1">{fish.name}</h1>
          <p className="text-lg text-gray-600 mb-1">
            {fish.brand} • <span className="capitalize">{fish.fish_type}</span>
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
              <dt className="text-gray-500 font-medium">Value Score</dt>
              <dd className="font-medium">{computeValueMetric(fish).toFixed(1)}/10</dd>
            </dl>
          </div>
        </div>
      </div>

      {/* Rating breakdown */}
      {stats?.avg_overall !== null && stats?.avg_overall !== undefined && (
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-4">Rating Breakdown</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: "Flavor", value: stats.avg_flavor },
              { label: "Texture", value: stats.avg_texture },
              { label: "Aesthetics", value: stats.avg_aesthetics },
              { label: "Value", value: stats.avg_value },
              { label: "Overall", value: stats.avg_overall },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="text-center p-4 bg-gray-50 rounded-lg"
              >
                <div className="text-2xl font-bold text-gray-800">
                  {value?.toFixed(1) ?? "—"}
                </div>
                <div className="text-sm text-gray-500 mt-1">{label}</div>
                {value !== null && value !== undefined && (
                  <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${(value / 10) * 100}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Reviews */}
      <section>
        <h2 className="text-xl font-bold mb-4">
          Reviews ({reviews.length})
        </h2>
        {reviews.length === 0 ? (
          <p className="text-gray-500">
            No reviews yet. Be the first to rate this fish!
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
                <div className="flex gap-4 text-xs text-gray-400">
                  <span>Flavor: {review.flavor_score}</span>
                  <span>Texture: {review.texture_score}</span>
                  <span>Aesthetics: {review.aesthetics_score}</span>
                  <span>Value: {review.value_score}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
