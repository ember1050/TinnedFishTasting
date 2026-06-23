import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, avatar_url, is_admin, created_at")
    .eq("id", user.id)
    .single();

  // Fetch user's reviews with fish name
  const { data: reviews } = await supabase
    .from("reviews")
    .select("id, overall_score, is_from_tasting, created_at, fish:fish_id(id, name)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Fetch tastings the user participated in
  const { data: participations } = await supabase
    .from("tasting_participants")
    .select("tasting_id")
    .eq("user_id", user.id);

  const reviewCount = reviews?.length ?? 0;
  const tastingCount = participations?.length ?? 0;
  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "Unknown";

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="md:col-span-1">
          <div className="border rounded-lg p-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-2xl mb-4">
              🐟
            </div>
            <h2 className="text-xl font-bold">
              {profile?.display_name ?? "User"}
            </h2>
            <p className="text-sm text-gray-500">{user.email}</p>
            <p className="text-xs text-gray-400 mt-1">
              Member since {memberSince}
            </p>
            {profile?.is_admin && (
              <span className="inline-block mt-2 text-xs font-medium bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                Admin
              </span>
            )}

            <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4">
              <div>
                <div className="text-2xl font-bold">{reviewCount}</div>
                <div className="text-xs text-gray-500">Reviews</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{tastingCount}</div>
                <div className="text-xs text-gray-500">Tastings</div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews & Activity */}
        <div className="md:col-span-2">
          <h2 className="text-xl font-bold mb-4">My Reviews</h2>
          {reviewCount === 0 ? (
            <div className="border rounded-lg p-6 text-center text-gray-400">
              <p>No reviews yet.</p>
              <Link
                href="/fish"
                className="text-sm text-blue-600 hover:underline mt-2 inline-block"
              >
                Browse fish to leave your first review →
              </Link>
            </div>
          ) : (
            <div className="border rounded-lg divide-y">
              {reviews!.map((review) => {
                const fish = review.fish as unknown as {
                  id: string;
                  name: string;
                } | null;
                return (
                  <div
                    key={review.id}
                    className="flex items-center justify-between px-4 py-3"
                  >
                    <div>
                      <Link
                        href={`/fish/${fish?.id ?? ""}`}
                        className="text-sm font-medium text-blue-600 hover:underline"
                      >
                        {fish?.name ?? "Unknown fish"}
                      </Link>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-400">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                        {review.is_from_tasting && (
                          <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                            Tasting
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-lg font-bold">
                      {review.overall_score}
                      <span className="text-sm text-gray-400">/10</span>
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Reach goal placeholder */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <h3 className="text-sm font-medium text-gray-600 mb-1">
              🎯 Fish Completion Tracker (Coming Soon)
            </h3>
            <p className="text-xs text-gray-400">
              See which fish from the catalog you&apos;ve reviewed and which ones
              are still waiting for your verdict.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
