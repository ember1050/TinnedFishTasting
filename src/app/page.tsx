import Link from "next/link";

export default function Home() {
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

      {/* Top Ranked Preview */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Top Ranked</h2>
        <p className="text-gray-500">
          Rankings will appear here once fish are added and reviewed.
        </p>
      </section>
    </div>
  );
}

