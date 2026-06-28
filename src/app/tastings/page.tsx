import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getPublicTastings, getMyTastings, STATE_LABELS } from "@/lib/tastings";
import { JoinByCode } from "@/components/JoinByCode";

export default async function TastingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [publicTastings, myTastings] = await Promise.all([
    getPublicTastings(),
    user ? getMyTastings(user.id) : Promise.resolve([]),
  ]);

  // The hub only surfaces tastings still in progress; finished ones live on the
  // profile.
  const activeTastings = myTastings.filter((t) => t.state !== "published");

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

      {/* My tastings (active only) */}
      {activeTastings.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">My Active Tastings</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeTastings.map((t) => (
              <li key={t.id}>
                <Link
                  href={`/tastings/${t.id}`}
                  className="block rounded-lg border p-4 hover:border-blue-400 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{t.title}</h3>
                    <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                      {STATE_LABELS[t.state]}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {t.is_host ? "You're hosting" : "Joined"}
                    {!t.is_public && " • Private"}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Join by code */}
      <div className="mb-8 p-6 bg-gray-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Join a Private Tasting</h2>
        <JoinByCode />
      </div>

      {/* Public tastings */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Public Tastings</h2>
        {publicTastings.length === 0 ? (
          <p className="text-gray-500">
            No public tastings are currently listed.
          </p>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {publicTastings.map((t) => (
              <li key={t.id}>
                <Link
                  href={`/tastings/${t.id}`}
                  className="block rounded-lg border p-4 hover:border-blue-400 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{t.title}</h3>
                    <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                      {STATE_LABELS[t.state]}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {t.participant_count} participant
                    {t.participant_count !== 1 && "s"}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
