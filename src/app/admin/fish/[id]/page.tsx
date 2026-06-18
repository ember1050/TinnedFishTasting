import Link from "next/link";

/**
 * Admin fish edit/create form.
 * TODO: Wire to Supabase insert/update.
 * TODO: Add image upload to Supabase Storage.
 */
export default async function AdminFishEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const isNew = id === "new";

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href="/admin/fish"
        className="text-sm text-blue-600 hover:underline mb-4 inline-block"
      >
        ← Back to fish list
      </Link>

      <h1 className="text-3xl font-bold mb-8">
        {isNew ? "Add New Fish" : "Edit Fish"}
      </h1>

      <form className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Wild Sardines in Extra Virgin Olive Oil"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Brand *
            </label>
            <input
              type="text"
              placeholder="e.g. Wild Planet"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fish Type *
            </label>
            <select className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
              <option value="">Select type...</option>
              <option value="sardine">Sardine</option>
              <option value="tuna">Tuna</option>
              <option value="mackerel">Mackerel</option>
              <option value="salmon">Salmon</option>
              <option value="anchovy">Anchovy</option>
              <option value="trout">Trout</option>
              <option value="herring">Herring</option>
              <option value="cod">Cod</option>
              <option value="mussel">Mussel</option>
              <option value="oyster">Oyster</option>
              <option value="clam">Clam</option>
              <option value="squid">Squid</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price (USD) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="4.99"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <h2 className="text-lg font-semibold pt-4 border-t">Nutrition Facts</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Weight (g) *
            </label>
            <input
              type="number"
              min="0"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Calories *
            </label>
            <input
              type="number"
              min="0"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Protein (g) *
            </label>
            <input
              type="number"
              min="0"
              step="0.1"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fat (g)
            </label>
            <input
              type="number"
              min="0"
              step="0.1"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sodium (mg)
            </label>
            <input
              type="number"
              min="0"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image
            </label>
            <input
              type="file"
              accept="image/*"
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            rows={3}
            placeholder="Brief description of the product..."
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sourcing Notes
          </label>
          <input
            type="text"
            placeholder="e.g. Pacific Ocean, sustainably caught"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <div className="pt-4 border-t flex gap-3">
          <button
            type="button"
            className="rounded-md bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-500"
          >
            {isNew ? "Add Fish" : "Save Changes"}
          </button>
          <Link
            href="/admin/fish"
            className="rounded-md px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
