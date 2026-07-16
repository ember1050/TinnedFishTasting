import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getTastingContext, getTastingFish, getMyBlindResponses } from "@/lib/tastings";
import { AchievementPopup } from "@/components/AchievementPopup";

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ctx = await getTastingContext(id);
  if (!ctx) notFound();

  const { tasting, userId } = ctx;

  if (tasting.state !== "published") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-gray-600 mb-4">
          Results haven&apos;t been published yet.
        </p>
        <Link
          href={`/tastings/${id}`}
          className="text-blue-600 hover:underline text-sm"
        >
          ← Back to tasting
        </Link>
      </div>
    );
  }

  const fish = await getTastingFish(id);
  const correctByNumber = new Map(fish.map((f) => [f.blind_number, f.fish]));

  // Personal report card (if the viewer was a participant).
  const myResponses = userId ? await getMyBlindResponses(id, userId) : [];
  let primaryCorrect = 0;
  let alternateCorrect = 0;
  for (const r of myResponses) {
    const correct = correctByNumber.get(r.blind_number);
    if (!correct) continue;
    if (r.guess_primary === correct.id) primaryCorrect++;
    else if (r.guess_alternate === correct.id) alternateCorrect++;
  }
  const guessScore = primaryCorrect * 2 + alternateCorrect * 1;
  const maxScore = fish.length * 2;
  const hasGuesses = myResponses.some(
    (r) => r.guess_primary || r.guess_alternate
  );

  // Group ranking — average published overall score per fish from this tasting.
  const supabase = await createClient();

  // Did the viewer earn Perfect Taste in this tasting? (source of truth = DB)
  let earnedPerfectTaste = false;
  if (userId) {
    const { data: ach } = await supabase
      .from("user_achievements")
      .select("id")
      .eq("user_id", userId)
      .eq("kind", "perfect_taste")
      .eq("tasting_id", id)
      .maybeSingle();
    earnedPerfectTaste = !!ach;
  }

  const { data: reviews } = await supabase
    .from("reviews")
    .select("fish_id, overall_score")
    .eq("tasting_id", id);

  const agg = new Map<string, { sum: number; n: number }>();
  for (const rv of reviews ?? []) {
    const a = agg.get(rv.fish_id) ?? { sum: 0, n: 0 };
    a.sum += rv.overall_score;
    a.n += 1;
    agg.set(rv.fish_id, a);
  }

  const ranking = fish
    .map((f) => {
      const a = agg.get(f.fish.id);
      return {
        fish: f.fish,
        blind_number: f.blind_number,
        avg: a ? a.sum / a.n : null,
        n: a?.n ?? 0,
      };
    })
    .sort((x, y) => (y.avg ?? -1) - (x.avg ?? -1));

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      <AchievementPopup
        tastingId={id}
        kind="perfect_taste"
        earned={earnedPerfectTaste}
      />
      <Link
        href={`/tastings/${id}`}
        className="text-sm text-blue-600 hover:underline mb-4 inline-block"
      >
        ← Back to tasting
      </Link>

      <h1 className="text-3xl font-bold mb-1">Results</h1>
      <p className="text-gray-500 mb-8">{tasting.title}</p>

      {/* Personal report card */}
      {hasGuesses && (
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-3">Your Report Card</h2>
          <div className="rounded-xl border bg-blue-50 border-blue-100 p-5 mb-4">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-blue-700">
                {guessScore}
              </span>
              <span className="text-blue-500">/ {maxScore} points</span>
            </div>
            <p className="text-sm text-blue-800 mt-1">
              {primaryCorrect} nailed on the first guess
              {alternateCorrect > 0 && `, ${alternateCorrect} on the backup`}.
            </p>
          </div>
          <div className="rounded-lg border divide-y">
            {fish.map((f) => {
              const r = myResponses.find(
                (x) => x.blind_number === f.blind_number
              );
              const correct = f.fish;
              const gotPrimary = r?.guess_primary === correct.id;
              const gotAlternate = r?.guess_alternate === correct.id;
              return (
                <div
                  key={f.blind_number}
                  className="flex items-center justify-between px-4 py-2 text-sm"
                >
                  <span className="flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-xs font-semibold text-white">
                      {f.blind_number}
                    </span>
                    <Link
                      href={`/fish/${correct.id}`}
                      className="font-medium text-blue-600 hover:underline"
                    >
                      {correct.name}
                    </Link>
                    <span className="text-gray-400">{correct.brand}</span>
                  </span>
                  <span>
                    {gotPrimary ? (
                      <span className="text-green-600 font-medium">
                        ✓ First guess
                      </span>
                    ) : gotAlternate ? (
                      <span className="text-amber-600 font-medium">
                        ✓ Backup
                      </span>
                    ) : (
                      <span className="text-red-500">✗ Missed</span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* The reveal */}
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-3">The Reveal</h2>
        <div className="rounded-lg border divide-y">
          {fish.map((f) => (
            <div
              key={f.blind_number}
              className="flex items-center gap-3 px-4 py-2 text-sm"
            >
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-xs font-semibold text-white">
                {f.blind_number}
              </span>
              <Link
                href={`/fish/${f.fish.id}`}
                className="font-medium text-blue-600 hover:underline"
              >
                {f.fish.name}
              </Link>
              <span className="text-gray-400">{f.fish.brand}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Group ranking */}
      <section>
        <h2 className="text-xl font-bold mb-1">Group Tier List</h2>
        <p className="text-sm text-gray-500 mb-3">
          Each fish&apos;s average <strong>overall rating</strong> across
          everyone&apos;s blind reviews (out of 10). This is about how the fish
          scored — not who guessed it right.
        </p>
        <div className="rounded-lg border divide-y">
          {ranking.map((r, i) => (
            <div
              key={r.fish.id}
              className="flex items-center justify-between px-4 py-3"
            >
              <span className="flex items-center gap-3">
                <span className="text-lg font-bold text-gray-400 w-6">
                  {i + 1}
                </span>
                <Link
                  href={`/fish/${r.fish.id}`}
                  className="font-medium text-blue-600 hover:underline"
                >
                  {r.fish.name}
                </Link>
                <span className="text-sm text-gray-400">{r.fish.brand}</span>
              </span>
              <span className="text-sm">
                {r.avg !== null ? (
                  <span className="font-bold">{r.avg.toFixed(1)}</span>
                ) : (
                  <span className="text-gray-400">no reviews</span>
                )}
                {r.avg !== null && (
                  <span className="text-gray-400"> /10</span>
                )}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
