import Link from "next/link";

/**
 * TODO: Revisit this page with real Supabase data.
 * Currently shows a mock tasting setup flow.
 */
export default function NewTastingPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href="/tastings"
        className="text-sm text-blue-600 hover:underline mb-4 inline-block"
      >
        ← Back to tastings
      </Link>

      <h1 className="text-3xl font-bold mb-2">Host a Tasting</h1>
      <p className="text-gray-500 mb-8">
        Set up a blind tasting event. Select fish from the catalog, assign blind
        numbers, and invite participants.
      </p>

      <form className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tasting Name
          </label>
          <input
            type="text"
            placeholder="e.g. Friday Fish Night #3"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Visibility
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" name="visibility" value="private" defaultChecked />
              Private (invite code)
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" name="visibility" value="public" />
              Public (anyone can join)
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Fish (from catalog)
          </label>
          <p className="text-xs text-gray-400 mb-2">
            TODO: This will be a searchable multi-select from the fish database.
            For now, showing a placeholder.
          </p>
          <div className="border rounded-md p-4 bg-gray-50 text-sm text-gray-500 space-y-2">
            <div className="flex items-center justify-between p-2 bg-white rounded border">
              <span>#1 — Wild Planet Sardines in EVOO</span>
              <button type="button" className="text-red-500 text-xs">Remove</button>
            </div>
            <div className="flex items-center justify-between p-2 bg-white rounded border">
              <span>#2 — Ortiz Tuna Fillets</span>
              <button type="button" className="text-red-500 text-xs">Remove</button>
            </div>
            <div className="flex items-center justify-between p-2 bg-white rounded border">
              <span>#3 — King Oscar Mackerel</span>
              <button type="button" className="text-red-500 text-xs">Remove</button>
            </div>
            <div className="flex items-center justify-between p-2 bg-white rounded border">
              <span>#4 — Nuri Smoked Sardines</span>
              <button type="button" className="text-red-500 text-xs">Remove</button>
            </div>
            <button
              type="button"
              className="text-blue-600 text-sm hover:underline"
            >
              + Add fish from catalog
            </button>
          </div>
        </div>

        <div className="pt-4 border-t flex gap-3">
          <button
            type="button"
            className="rounded-md bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-500"
          >
            Create Tasting
          </button>
          <Link
            href="/tastings"
            className="rounded-md px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
