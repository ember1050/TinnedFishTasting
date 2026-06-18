import Link from "next/link";

export default function FishListPage() {
  // TODO: Replace with Supabase query once connected
  const placeholder = true;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Browse Tinned Fish</h1>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-3">
        <select className="rounded-md border border-gray-300 px-3 py-2 text-sm">
          <option value="">All Fish Types</option>
          <option value="sardine">Sardine</option>
          <option value="tuna">Tuna</option>
          <option value="mackerel">Mackerel</option>
          <option value="salmon">Salmon</option>
          <option value="anchovy">Anchovy</option>
          <option value="trout">Trout</option>
          <option value="mussel">Mussel</option>
          <option value="oyster">Oyster</option>
        </select>
        <input
          type="text"
          placeholder="Search by name or brand..."
          className="rounded-md border border-gray-300 px-3 py-2 text-sm w-64"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rank
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Brand
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Score
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Protein/g
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {placeholder && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-12 text-center text-gray-500"
                >
                  No fish have been added yet. Check back soon!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
