import Link from "next/link";
import { MOCK_FISH } from "@/lib/mock-data";

/**
 * Admin fish management — list all fish with edit/add buttons.
 * TODO: Wire to Supabase CRUD operations.
 */
export default function AdminFishPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Manage Fish</h1>
        <Link
          href="/admin/fish/new"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
        >
          + Add Fish
        </Link>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Brand
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Price
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {MOCK_FISH.map((fish) => (
              <tr key={fish.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium">{fish.name}</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {fish.brand}
                </td>
                <td className="px-4 py-3 text-sm capitalize text-gray-600">
                  {fish.fish_type}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  ${fish.price_usd.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-sm">
                  <Link
                    href={`/admin/fish/${fish.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
