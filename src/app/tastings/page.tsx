import Link from "next/link";

export default function TastingsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Tastings</h1>
        <Link
          href="/tastings/new"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
        >
          Host a Tasting
        </Link>
      </div>

      {/* Join by code */}
      <div className="mb-8 p-6 bg-gray-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Join a Private Tasting</h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter event code..."
            className="rounded-md border border-gray-300 px-3 py-2 text-sm flex-1 max-w-xs"
          />
          <button className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">
            Join
          </button>
        </div>
      </div>

      {/* Public tastings */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Public Tastings</h2>
        <p className="text-gray-500">No public tastings are currently listed.</p>
      </section>
    </div>
  );
}
