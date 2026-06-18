import Link from "next/link";

/**
 * User profile page — shows account info, review history, tasting history.
 *
 * TODO: Wire to Supabase auth and profile data.
 * TODO: Add "fish completion table" (reach goal) showing which fish
 * the user has/hasn't reviewed.
 */
export default function ProfilePage() {
  // Mock user data
  const user = {
    name: "FishFan42",
    email: "fishfan@example.com",
    memberSince: "January 2026",
    reviewCount: 12,
    tastingsAttended: 3,
  };

  const recentReviews = [
    {
      id: "r1",
      fishName: "Wild Planet Sardines in EVOO",
      score: 8,
      date: "May 10, 2026",
      isTasting: true,
    },
    {
      id: "r3",
      fishName: "Ortiz Tuna Fillets",
      score: 9,
      date: "May 10, 2026",
      isTasting: true,
    },
    {
      id: "r7",
      fishName: "Ortiz Anchovies",
      score: 9,
      date: "May 10, 2026",
      isTasting: true,
    },
    {
      id: "r10",
      fishName: "Patagonia Smoked Mussels",
      score: 8,
      date: "Jun 1, 2026",
      isTasting: false,
    },
  ];

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
            <h2 className="text-xl font-bold">{user.name}</h2>
            <p className="text-sm text-gray-500">{user.email}</p>
            <p className="text-xs text-gray-400 mt-1">
              Member since {user.memberSince}
            </p>

            <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4">
              <div>
                <div className="text-2xl font-bold">{user.reviewCount}</div>
                <div className="text-xs text-gray-500">Reviews</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {user.tastingsAttended}
                </div>
                <div className="text-xs text-gray-500">Tastings</div>
              </div>
            </div>

            <button className="mt-4 w-full text-sm text-gray-500 hover:text-gray-700 underline">
              Edit Profile
            </button>
          </div>
        </div>

        {/* Reviews & Activity */}
        <div className="md:col-span-2">
          <h2 className="text-xl font-bold mb-4">My Reviews</h2>
          <div className="border rounded-lg divide-y">
            {recentReviews.map((review) => (
              <div
                key={review.id}
                className="flex items-center justify-between px-4 py-3"
              >
                <div>
                  <Link
                    href={`/fish/${review.id}`}
                    className="text-sm font-medium text-blue-600 hover:underline"
                  >
                    {review.fishName}
                  </Link>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-400">{review.date}</span>
                    {review.isTasting && (
                      <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                        Tasting
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-lg font-bold">
                  {review.score}
                  <span className="text-sm text-gray-400">/10</span>
                </span>
              </div>
            ))}
          </div>

          {/* Reach goal placeholder */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <h3 className="text-sm font-medium text-gray-600 mb-1">
              🎯 Fish Completion Tracker (Coming Soon)
            </h3>
            <p className="text-xs text-gray-400">
              See which fish from the catalog you&apos;ve reviewed and which ones are
              still waiting for your verdict.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
