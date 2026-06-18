import Link from "next/link";

export default async function FishDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // TODO: Fetch from Supabase
  // const fish = await getFish(id);

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
          <span className="text-gray-400 text-lg">Product Image</span>
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-2">Fish Name</h1>
          <p className="text-lg text-gray-600 mb-4">Brand • Fish Type</p>

          {/* Score badge */}
          <div className="inline-flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full mb-6">
            <span className="text-2xl font-bold text-blue-700">—</span>
            <span className="text-sm text-blue-600">/10 overall</span>
          </div>

          {/* Nutrition card */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-semibold mb-3">Nutrition Facts</h3>
            <dl className="grid grid-cols-2 gap-y-2 text-sm">
              <dt className="text-gray-500">Weight</dt>
              <dd className="font-medium">— g</dd>
              <dt className="text-gray-500">Calories</dt>
              <dd className="font-medium">—</dd>
              <dt className="text-gray-500">Protein</dt>
              <dd className="font-medium">— g</dd>
              <dt className="text-gray-500">Fat</dt>
              <dd className="font-medium">— g</dd>
              <dt className="text-gray-500">Sodium</dt>
              <dd className="font-medium">— mg</dd>
              <dt className="text-gray-500">Price</dt>
              <dd className="font-medium">$—</dd>
              <dt className="text-gray-500">Protein/Dollar</dt>
              <dd className="font-medium">— g/$</dd>
            </dl>
          </div>
        </div>
      </div>

      {/* Rating breakdown */}
      <section className="mb-12">
        <h2 className="text-xl font-bold mb-4">Rating Breakdown</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {["Flavor", "Texture", "Aesthetics", "Value", "Overall"].map(
            (dim) => (
              <div key={dim} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-300">—</div>
                <div className="text-sm text-gray-500 mt-1">{dim}</div>
              </div>
            )
          )}
        </div>
      </section>

      {/* Reviews */}
      <section>
        <h2 className="text-xl font-bold mb-4">Reviews</h2>
        <p className="text-gray-500">
          No reviews yet. Be the first to rate this fish!
        </p>
      </section>
    </div>
  );
}
