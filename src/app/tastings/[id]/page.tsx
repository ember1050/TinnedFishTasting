import Link from "next/link";

/**
 * Tasting lobby — shows tasting info, participants, and the two main
 * action buttons (Blind Tasting / Full Review) controlled by the host.
 *
 * TODO: Wire to real-time Supabase state. Currently a static prototype.
 */
export default async function TastingLobbyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Mock tasting state
  const tasting = {
    id,
    title: "Friday Fish Night #3",
    host: "Emma",
    state: "blind_active" as const,
    participants: ["Emma (Host)", "FishFan42", "TinOpener", "SardineQueen"],
    fishCount: 4,
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href="/tastings"
        className="text-sm text-blue-600 hover:underline mb-4 inline-block"
      >
        ← Back to tastings
      </Link>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">{tasting.title}</h1>
          <p className="text-gray-500 mt-1">
            Hosted by {tasting.host} • {tasting.fishCount} fish •{" "}
            {tasting.participants.length} participants
          </p>
        </div>
        <span className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700 ring-1 ring-inset ring-green-600/20 capitalize">
          {tasting.state.replace("_", " ")}
        </span>
      </div>

      {/* Participants */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Participants</h2>
        <div className="flex flex-wrap gap-2">
          {tasting.participants.map((p) => (
            <span
              key={p}
              className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm"
            >
              {p}
            </span>
          ))}
        </div>
      </section>

      {/* Action Buttons */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href={`/tastings/${id}/blind`}
          className="block border-2 border-blue-200 rounded-xl p-6 hover:border-blue-400 hover:shadow-md transition-all"
        >
          <div className="text-3xl mb-3">🙈</div>
          <h3 className="text-xl font-bold mb-1">Blind Tasting</h3>
          <p className="text-sm text-gray-500">
            Score each numbered tin on flavor and texture. Then guess which fish
            is which.
          </p>
          <div className="mt-4 inline-flex items-center text-sm font-medium text-blue-600">
            Start →
          </div>
        </Link>

        <div className="block border-2 border-gray-200 rounded-xl p-6 opacity-50 cursor-not-allowed">
          <div className="text-3xl mb-3">📋</div>
          <h3 className="text-xl font-bold mb-1">Full Review</h3>
          <p className="text-sm text-gray-500">
            Review each fish with full details visible. Unlocked by host after
            blind tasting.
          </p>
          <div className="mt-4 inline-flex items-center text-sm font-medium text-gray-400">
            🔒 Locked by host
          </div>
        </div>
      </section>

      {/* Host Controls hint */}
      <div className="mt-8 p-4 bg-amber-50 rounded-lg border border-amber-200">
        <p className="text-sm text-amber-800">
          <strong>Host view:</strong>{" "}
          <Link
            href={`/tastings/${id}/host`}
            className="text-amber-700 underline hover:text-amber-900"
          >
            Open host control panel →
          </Link>
        </p>
      </div>
    </div>
  );
}
