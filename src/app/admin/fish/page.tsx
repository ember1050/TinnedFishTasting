import Link from "next/link";
import { getAdminStatus } from "@/lib/auth-helpers";
import { getAllFishWithStats } from "@/lib/data";

/**
 * Admin fish management — list all fish from the database with edit/add buttons.
 */
export default async function AdminFishPage() {
  const { isAdmin } = await getAdminStatus();

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold">Admin access required.</h1>
      </div>
    );
  }

  const fish = await getAllFishWithStats();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Manage Fish</h1>
          <p className="mt-1 text-sm text-gray-500">
            {fish.length} fish in the catalog.
          </p>
        </div>
        <Link
          href="/admin/fish/new"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
        >
          + Add Fish
        </Link>
      </div>

      {fish.length === 0 ? (
        <div className="rounded-lg border p-8 text-center text-gray-400">
          No fish yet. Add the first one.
        </div>
      ) : (
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
                  Reviews
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {fish.map((f) => (
                <tr key={f.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium">{f.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{f.brand}</td>
                  <td className="px-4 py-3 text-sm capitalize text-gray-600">
                    {f.fish_type}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    ${f.price_usd.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {f.review_count}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <Link
                      href={`/admin/fish/${f.id}/edit`}
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
      )}
    </div>
  );
}
