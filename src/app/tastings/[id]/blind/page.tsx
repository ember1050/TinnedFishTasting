"use client";

import { useState } from "react";
import Link from "next/link";

/**
 * Blind tasting interface.
 * Users score each numbered tin on flavor + texture, write notes,
 * then move to the guessing phase.
 *
 * TODO: Revisit UX — need to test with real users whether the
 * step-by-step flow or an all-at-once grid works better.
 * TODO: Wire to Supabase for persistence and real-time sync.
 */

interface BlindEntry {
  number: number;
  flavorScore: number | null;
  textureScore: number | null;
  notes: string;
}

const FISH_COUNT = 4;

function ScoreSelector({
  value,
  onChange,
  label,
}: {
  value: number | null;
  onChange: (v: number) => void;
  label: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">
        {label}
      </label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`w-7 h-7 rounded text-xs font-medium transition-colors ${
              value === n
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function BlindTastingPage() {
  const [entries, setEntries] = useState<BlindEntry[]>(
    Array.from({ length: FISH_COUNT }, (_, i) => ({
      number: i + 1,
      flavorScore: null,
      textureScore: null,
      notes: "",
    }))
  );
  const [submitted, setSubmitted] = useState(false);

  function updateEntry(index: number, update: Partial<BlindEntry>) {
    setEntries((prev) =>
      prev.map((e, i) => (i === index ? { ...e, ...update } : e))
    );
  }

  const allScored = entries.every(
    (e) => e.flavorScore !== null && e.textureScore !== null
  );

  if (submitted) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 text-center">
        <div className="text-5xl mb-4">✅</div>
        <h1 className="text-2xl font-bold mb-2">Blind Scores Submitted!</h1>
        <p className="text-gray-500 mb-6">
          Now it&apos;s time to guess which fish is which.
        </p>
        <Link
          href="../guess"
          className="rounded-md bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-500"
        >
          Continue to Guessing →
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

      <h1 className="text-3xl font-bold mb-2">Blind Tasting</h1>
      <p className="text-gray-500 mb-8">
        Score each numbered tin on flavor and texture. Take notes to help you
        guess later. You can adjust scores until you submit.
      </p>

      <div className="space-y-6">
        {entries.map((entry, i) => (
          <div key={entry.number} className="border rounded-lg p-5">
            <h3 className="text-lg font-bold mb-4">
              Tin #{entry.number}
            </h3>
            <div className="space-y-4">
              <ScoreSelector
                label="Flavor (1-10)"
                value={entry.flavorScore}
                onChange={(v) => updateEntry(i, { flavorScore: v })}
              />
              <ScoreSelector
                label="Texture (1-10)"
                value={entry.textureScore}
                onChange={(v) => updateEntry(i, { textureScore: v })}
              />
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Notes
                </label>
                <textarea
                  value={entry.notes}
                  onChange={(e) => updateEntry(i, { notes: e.target.value })}
                  placeholder="Oily, smoky, firm texture, mild flavor..."
                  rows={2}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <p className="text-sm text-gray-400">
          {entries.filter((e) => e.flavorScore && e.textureScore).length}/
          {FISH_COUNT} scored
        </p>
        <button
          onClick={() => setSubmitted(true)}
          disabled={!allScored}
          className={`rounded-md px-6 py-3 text-sm font-semibold text-white ${
            allScored
              ? "bg-blue-600 hover:bg-blue-500"
              : "bg-gray-300 cursor-not-allowed"
          }`}
        >
          Submit Scores & Continue →
        </button>
      </div>
    </div>
  );
}
