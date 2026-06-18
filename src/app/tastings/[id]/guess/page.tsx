"use client";

import { useState } from "react";
import Link from "next/link";

/**
 * Guessing phase — match each blind number to the actual fish.
 * Users pick a primary guess and optionally an alternate.
 *
 * TODO: Revisit — drag-and-drop matching interface may be better UX.
 * TODO: Show the user's notes from the blind phase next to each number.
 * TODO: Wire to Supabase.
 */

const BLIND_ITEMS = [
  { number: 1, notes: "Rich, oily, soft bones" },
  { number: 2, notes: "Firm, meaty, expensive taste" },
  { number: 3, notes: "Bold flavor, great on toast" },
  { number: 4, notes: "Smoky, delicate, almost sweet" },
];

const FISH_OPTIONS = [
  { id: "1", name: "Wild Planet Sardines in EVOO" },
  { id: "3", name: "Ortiz Tuna Fillets" },
  { id: "4", name: "King Oscar Mackerel" },
  { id: "5", name: "Nuri Smoked Sardines" },
];

interface Guess {
  number: number;
  primary: string;
  alternate: string;
}

export default function GuessingPage() {
  const [guesses, setGuesses] = useState<Guess[]>(
    BLIND_ITEMS.map((item) => ({
      number: item.number,
      primary: "",
      alternate: "",
    }))
  );
  const [submitted, setSubmitted] = useState(false);

  function updateGuess(index: number, field: "primary" | "alternate", value: string) {
    setGuesses((prev) =>
      prev.map((g, i) => (i === index ? { ...g, [field]: value } : g))
    );
  }

  const allGuessed = guesses.every((g) => g.primary !== "");

  if (submitted) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 text-center">
        <div className="text-5xl mb-4">🎯</div>
        <h1 className="text-2xl font-bold mb-2">Guesses Submitted!</h1>
        <p className="text-gray-500 mb-6">
          Waiting for the host to reveal results...
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

      <h1 className="text-3xl font-bold mb-2">Guess the Fish</h1>
      <p className="text-gray-500 mb-8">
        Match each numbered tin to the actual fish. Pick your primary guess,
        and optionally a second guess if you&apos;re unsure.
        <span className="block mt-1 text-xs">
          Primary correct = 2 pts • Alternate correct = 1 pt
        </span>
      </p>

      <div className="space-y-6">
        {BLIND_ITEMS.map((item, i) => (
          <div key={item.number} className="border rounded-lg p-5">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-bold">Tin #{item.number}</h3>
            </div>
            <p className="text-sm text-gray-500 italic mb-4 bg-gray-50 px-3 py-2 rounded">
              Your notes: &quot;{item.notes}&quot;
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Primary Guess *
                </label>
                <select
                  value={guesses[i].primary}
                  onChange={(e) => updateGuess(i, "primary", e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="">Select a fish...</option>
                  {FISH_OPTIONS.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Alternate Guess (optional)
                </label>
                <select
                  value={guesses[i].alternate}
                  onChange={(e) => updateGuess(i, "alternate", e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="">None</option>
                  {FISH_OPTIONS.filter((f) => f.id !== guesses[i].primary).map(
                    (f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <p className="text-sm text-gray-400">
          {guesses.filter((g) => g.primary).length}/{BLIND_ITEMS.length} matched
        </p>
        <button
          onClick={() => setSubmitted(true)}
          disabled={!allGuessed}
          className={`rounded-md px-6 py-3 text-sm font-semibold text-white ${
            allGuessed
              ? "bg-blue-600 hover:bg-blue-500"
              : "bg-gray-300 cursor-not-allowed"
          }`}
        >
          Submit Guesses →
        </button>
      </div>
    </div>
  );
}
