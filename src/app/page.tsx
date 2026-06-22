import Link from "next/link";
import { getAllFishWithStats } from "@/lib/data";
import { rankFish, computeValueMetric } from "@/lib/scoring";

export default async function Home() {
  const allFish = await getAllFishWithStats();
  const reviewed = allFish.filter((f) => f.avg_overall !== null);
  const globalAvg =
    reviewed.length > 0
      ? reviewed.reduce((sum, f) => sum + f.avg_overall!, 0) / reviewed.length
      : 5;
  const ranked = rankFish(allFish, globalAvg).slice(0, 5);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      {/* Hero */}
      <section className="text-center mb-16">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          🐟 Tinned Fish Rankings
        </h1>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          The definitive guide to rating, ranking, and reviewing tinned fish.
          Backed by nutrition data, community reviews, and blind tastings.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/fish"
            className="rounded-md bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
          >
            Browse Rankings
          </Link>
          <Link
            href="/tastings"
            className="rounded-md bg-white px-6 py-3 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            Host a Tasting
          </Link>
        </div>
      </section>

      {/* Top Ranked */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Top Ranked</h2>
          <Link href="/fish" className="text-sm text-blue-600 hover:underline">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ranked.map((fish, i) => (
            <Link
              key={fish.id}
              href={`/fish/${fish.id}`}
              className="block border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-gray-300">
                    #{i + 1}
                  </span>
                  <div>
                    <h3 className="font-semibold text-sm leading-tight">
                      {fish.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {fish.brand} • {fish.fish_type}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-blue-700">
                    {fish.avg_overall?.toFixed(1) ?? "—"}
                  </div>
                  <div className="text-xs text-gray-400">
                    {fish.review_count} review{fish.review_count !== 1 && "s"}
                  </div>
                </div>
              </div>
              <div className="mt-3 flex gap-4 text-xs text-gray-500">
                <span>{fish.protein_g}g protein</span>
                <span>${fish.price_usd.toFixed(2)}</span>
                <span>Value: {computeValueMetric(fish).toFixed(1)}/10</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
