import Link from "next/link";

/**
 * Results / Report Card page.
 * Shows after host reveals: guess accuracy, group rankings, individual stats.
 *
 * TODO: Generate real "Wrapped"-style insights from data.
 * TODO: Wire to actual tasting results from DB.
 * TODO: Revisit the visual design — charts/graphs would be nice here.
 */
export default function ResultsPage() {
  // Mock results
  const guessResults = {
    correct: 3,
    total: 4,
    primaryCorrect: 2,
    alternateCorrect: 1,
    points: 5,
    maxPoints: 8,
  };

  const groupRankings = [
    { rank: 1, name: "Ortiz Tuna Fillets", avgScore: 8.7, topPicks: 3 },
    { rank: 2, name: "Nuri Smoked Sardines", avgScore: 8.3, topPicks: 2 },
    { rank: 3, name: "King Oscar Mackerel", avgScore: 7.8, topPicks: 1 },
    { rank: 4, name: "Wild Planet Sardines", avgScore: 7.2, topPicks: 0 },
  ];

  const insights = [
    "🎯 You guessed 3/4 fish correctly — top 25% of guessers!",
    "🐟 You rated sardines 20% higher than the group average",
    "💰 You tend to rank budget fish higher on value (obvious but true!)",
    "👯 Your taste profile most closely matches TinOpener's",
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href=".."
        className="text-sm text-blue-600 hover:underline mb-4 inline-block"
      >
        ← Back to tasting lobby
      </Link>

      <h1 className="text-3xl font-bold mb-2">Results & Report Card</h1>
      <p className="text-gray-500 mb-8">Friday Fish Night #3</p>

      {/* Guess Accuracy */}
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-4">🎯 Your Guess Accuracy</h2>
        <div className="bg-blue-50 rounded-lg p-6">
          <div className="text-4xl font-bold text-blue-700 mb-1">
            {guessResults.correct}/{guessResults.total}
          </div>
          <p className="text-sm text-blue-600 mb-3">fish guessed correctly</p>
          <div className="text-sm text-gray-600 space-y-1">
            <p>Primary correct: {guessResults.primaryCorrect} (×2 pts)</p>
            <p>Alternate correct: {guessResults.alternateCorrect} (×1 pt)</p>
            <p className="font-medium">
              Total: {guessResults.points}/{guessResults.maxPoints} points
            </p>
          </div>
        </div>
      </section>

      {/* Group Rankings */}
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-4">🏆 Group Rankings</h2>
        <div className="border rounded-lg divide-y">
          {groupRankings.map((fish) => (
            <div
              key={fish.rank}
              className="flex items-center justify-between px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`text-lg font-bold ${
                    fish.rank === 1
                      ? "text-yellow-500"
                      : fish.rank === 2
                      ? "text-gray-400"
                      : fish.rank === 3
                      ? "text-amber-600"
                      : "text-gray-300"
                  }`}
                >
                  #{fish.rank}
                </span>
                <div>
                  <p className="font-medium text-sm">{fish.name}</p>
                  <p className="text-xs text-gray-400">
                    In {fish.topPicks} participant&apos;s top 3
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold">{fish.avgScore}</span>
                <span className="text-sm text-gray-400">/10</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Personal Insights */}
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-4">📊 Your Tasting Wrapped</h2>
        <div className="space-y-3">
          {insights.map((insight, i) => (
            <div
              key={i}
              className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 text-sm"
            >
              {insight}
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-gray-400">
          Insights become more detailed after 3+ tastings.
        </p>
      </section>
    </div>
  );
}
