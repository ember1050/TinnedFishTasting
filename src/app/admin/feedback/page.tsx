import { getAdminStatus } from "@/lib/auth-helpers";
import { createClient } from "@/lib/supabase/server";

type FeedbackRow = {
  id: string;
  type: "bug" | "feature";
  message: string;
  page_url: string | null;
  status: string;
  created_at: string | null;
  profiles: { display_name: string | null } | { display_name: string | null }[] | null;
};

function profileName(profile: FeedbackRow["profiles"]): string {
  const value = Array.isArray(profile) ? profile[0] : profile;
  return value?.display_name || "Unknown user";
}

function formatDate(value: string | null): string {
  if (!value) return "Unknown date";
  return new Date(value).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function typeBadgeClass(type: FeedbackRow["type"]): string {
  return type === "bug"
    ? "bg-red-50 text-red-700"
    : "bg-blue-50 text-blue-700";
}

export default async function AdminFeedbackPage() {
  const { isAdmin } = await getAdminStatus();

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold">Admin access required.</h1>
      </div>
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("feedback")
    .select("id, type, message, page_url, status, created_at, profiles(display_name)")
    .order("created_at", { ascending: false });

  const feedback = (data ?? []) as FeedbackRow[];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Feedback</h1>
        <p className="mt-1 text-sm text-gray-500">
          Bug reports and feature requests submitted by users.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error.message}
        </div>
      )}

      {feedback.length === 0 ? (
        <div className="rounded-lg border p-8 text-center text-gray-400">
          No feedback yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Message
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Page
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Submitter
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {feedback.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${typeBadgeClass(
                        item.type
                      )}`}
                    >
                      {item.type === "bug" ? "Bug" : "Feature"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm capitalize text-gray-600">
                    {item.status.replaceAll("_", " ")}
                  </td>
                  <td className="max-w-xl whitespace-pre-wrap px-4 py-3 text-sm text-gray-900">
                    {item.message}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {item.page_url || "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {profileName(item.profiles)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {formatDate(item.created_at)}
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
