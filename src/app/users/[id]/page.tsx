import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBadgesForUser } from "@/lib/badges";
import { BadgeShelf } from "@/components/BadgeShelf";

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, avatar_url, created_at")
    .eq("id", id)
    .maybeSingle();

  if (!profile) notFound();

  const { data: reviews, count } = await supabase
    .from("reviews")
    .select("id, overall_score, is_from_tasting, created_at, fish:fish_id(id, name, brand)", {
      count: "exact",
    })
    .eq("user_id", id)
    .order("created_at", { ascending: false })
    .range(0, 9);

  const memberSince = new Date(profile.created_at).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const badges = await getBadgesForUser(id);

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-2xl overflow-hidden">
          {profile.avatar_url ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
          ) : (
            "🐟"
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{profile.display_name}</h1>
            <BadgeShelf badges={badges} size={26} />
          </div>
          <p className="text-sm text-gray-500">
            {count ?? 0} review{count !== 1 && "s"} • Member since {memberSince}
          </p>
        </div>
      </div>

      <h2 className="text-lg font-bold mb-3">Reviews</h2>
      {!reviews || reviews.length === 0 ? (
        <p className="text-gray-500">No reviews yet.</p>
      ) : (
        <div className="border rounded-lg divide-y">
          {reviews.map((r) => {
            const fish = r.fish as unknown as {
              id: string;
              name: string;
              brand: string;
            } | null;
            return (
              <div key={r.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <Link
                    href={`/fish/${fish?.id ?? ""}`}
                    className="text-sm font-medium text-blue-600 hover:underline"
                  >
                    {fish?.name ?? "Unknown fish"}
                  </Link>
                  {fish?.brand && (
                    <p className="text-xs text-gray-500">{fish.brand}</p>
                  )}
                </div>
                <span className="text-sm font-bold">
                  {r.overall_score}
                  <span className="text-gray-400">/10</span>
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
