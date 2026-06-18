"use client";

import { useState } from "react";
import Link from "next/link";

/**
 * Comprehensive review phase — users see the actual fish details
 * and leave a final review that gets published to the site.
 *
 * TODO: Pull actual fish data from DB.
 * TODO: Show other participants' blind notes alongside.
 * TODO: Revisit the "top 3" vs "re-rank all" decision after user testing.
 */

const TASTING_FISH = [
  {
    number: 1,
    id: "1",
    name: "Wild Planet Sardines in EVOO",
    brand: "Wild Planet",
    price: 4.29,
    protein_g: 17,
    calories: 210,
  },
  {
    number: 2,
    id: "3",
    name: "Ortiz Tuna Fillets in Olive Oil",
    brand: "Ortiz",
    price: 9.49,
    protein_g: 25,
    calories: 200,
  },
  {
    number: 3,
    id: "4",
    name: "King Oscar Mackerel Fillets",
    brand: "King Oscar",
    price: 3.49,
    protein_g: 18,
    calories: 190,
  },
  {
    number: 4,
    id: "5",
    name: "Nuri Smoked Sardines",
    brand: "Nuri",
    price: 6.99,
    protein_g: 14,
    calories: 170,
  },
];

interface CompReview {
  fishId: string;
  overallScore: number | null;
  flavorScore: number | null;
  textureScore: number | null;
  aestheticsScore: number | null;
  valueScore: number | null;
  notes: string;
}

function ScoreBar({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | null;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-medium text-gray-500 w-20">{label}</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`w-6 h-6 rounded text-xs font-medium transition-colors ${
              value !== null && n <= value
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      <span className="text-sm font-medium w-6 text-right">
        {value ?? "—"}
      </span>
    </div>
  );
}

export default function ComprehensiveReviewPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reviews, setReviews] = useState<CompReview[]>(
    TASTING_FISH.map((f) => ({
      fishId: f.id,
      overallScore: null,
      flavorScore: null,
      textureScore: null,
      aestheticsScore: null,
      valueScore: null,
      notes: "",
    }))
  );
  const [submitted, setSubmitted] = useState(false);

  const currentFish = TASTING_FISH[currentIndex];
  const currentReview = reviews[currentIndex];

  function updateReview(update: Partial<CompReview>) {
    setReviews((prev) =>
      prev.map((r, i) => (i === currentIndex ? { ...r, ...update } : r))
    );
  }

  const allReviewed = reviews.every((r) => r.overallScore !== null);

  if (submitted) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h1 className="text-2xl font-bold mb-2">Reviews Submitted!</h1>
        <p className="text-gray-500 mb-6">
          Your reviews will be published once the host releases results.
        </p>
        <Link
          href=".."
          className="rounded-md bg-gray-100 px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-200"
        >
          Back to Tasting Lobby
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href=".."
        className="text-sm text-blue-600 hover:underline mb-4 inline-block"
      >
        ← Back to tasting lobby
      </Link>

      <h1 className="text-3xl font-bold mb-2">Full Review</h1>
      <p className="text-gray-500 mb-6">
        Now that labels are revealed, review each fish considering price,
        flavor, aesthetics, and overall value.
      </p>

      {/* Fish nav */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {TASTING_FISH.map((f, i) => (
          <button
            key={f.id}
            onClick={() => setCurrentIndex(i)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              i === currentIndex
                ? "bg-blue-600 text-white"
                : reviews[i].overallScore
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            #{f.number} {f.brand}
            {reviews[i].overallScore && " ✓"}
          </button>
        ))}
      </div>

      {/* Current fish review */}
      <div className="border rounded-lg p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold">{currentFish.name}</h2>
            <p className="text-sm text-gray-500">
              Was Tin #{currentFish.number} • {currentFish.brand}
            </p>
          </div>
          <div className="text-right text-sm text-gray-500">
            <div>${currentFish.price.toFixed(2)}</div>
            <div>{currentFish.protein_g}g protein</div>
            <div>{currentFish.calories} cal</div>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <ScoreBar
            label="Overall"
            value={currentReview.overallScore}
            onChange={(v) => updateReview({ overallScore: v })}
          />
          <ScoreBar
            label="Flavor"
            value={currentReview.flavorScore}
            onChange={(v) => updateReview({ flavorScore: v })}
          />
          <ScoreBar
            label="Texture"
            value={currentReview.textureScore}
            onChange={(v) => updateReview({ textureScore: v })}
          />
          <ScoreBar
            label="Aesthetics"
            value={currentReview.aestheticsScore}
            onChange={(v) => updateReview({ aestheticsScore: v })}
          />
          <ScoreBar
            label="Value"
            value={currentReview.valueScore}
            onChange={(v) => updateReview({ valueScore: v })}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Review notes (published to site)
          </label>
          <textarea
            value={currentReview.notes}
            onChange={(e) => updateReview({ notes: e.target.value })}
            placeholder="Your thoughts on this fish considering price, flavor, presentation..."
            rows={3}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <button
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
            className="text-sm text-blue-600 hover:underline disabled:text-gray-300 disabled:no-underline"
          >
            ← Previous
          </button>
          {currentIndex < TASTING_FISH.length - 1 ? (
            <button
              onClick={() => setCurrentIndex(currentIndex + 1)}
              className="text-sm text-blue-600 hover:underline"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={() => setSubmitted(true)}
              disabled={!allReviewed}
              className={`rounded-md px-4 py-2 text-sm font-semibold text-white ${
                allReviewed
                  ? "bg-blue-600 hover:bg-blue-500"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
            >
              Submit All Reviews
            </button>
          )}
        </div>
      </div>

      <p className="mt-4 text-xs text-gray-400">
        {reviews.filter((r) => r.overallScore !== null).length}/
        {TASTING_FISH.length} reviewed
      </p>
    </div>
  );
}
