"use client";

import { useState } from "react";
import Link from "next/link";

/**
 * Host control panel — state machine for progressing the tasting.
 *
 * TODO: Wire to Supabase real-time. State changes should broadcast
 * to all participants via WebSocket.
 * TODO: Show participant completion status (who has submitted).
 */

type TastingState =
  | "setup"
  | "blind_active"
  | "blind_locked"
  | "reveal"
  | "comprehensive_active"
  | "comprehensive_locked"
  | "published";

const STATE_LABELS: Record<TastingState, string> = {
  setup: "Setup",
  blind_active: "Blind Tasting Active",
  blind_locked: "Blind Phase Locked",
  reveal: "Results Revealed",
  comprehensive_active: "Full Review Active",
  comprehensive_locked: "Full Review Locked",
  published: "Published",
};

const STATE_FLOW: TastingState[] = [
  "setup",
  "blind_active",
  "blind_locked",
  "reveal",
  "comprehensive_active",
  "comprehensive_locked",
  "published",
];

export default function HostControlPage() {
  const [state, setState] = useState<TastingState>("blind_active");

  const currentIndex = STATE_FLOW.indexOf(state);
  const nextState = STATE_FLOW[currentIndex + 1] as TastingState | undefined;
  const prevState = STATE_FLOW[currentIndex - 1] as TastingState | undefined;

  // Mock participant status
  const participants = [
    { name: "FishFan42", blindDone: true, compDone: false },
    { name: "TinOpener", blindDone: true, compDone: false },
    { name: "SardineQueen", blindDone: false, compDone: false },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href=".."
        className="text-sm text-blue-600 hover:underline mb-4 inline-block"
      >
        ← Back to tasting lobby
      </Link>

      <h1 className="text-3xl font-bold mb-2">Host Control Panel</h1>
      <p className="text-gray-500 mb-8">
        Manage the tasting flow. Advance stages when participants are ready.
      </p>

      {/* State Machine Visualization */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Tasting Progress</h2>
        <div className="flex items-center gap-1 overflow-x-auto pb-2">
          {STATE_FLOW.map((s, i) => (
            <div key={s} className="flex items-center">
              <div
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium ${
                  s === state
                    ? "bg-blue-600 text-white"
                    : i < currentIndex
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {STATE_LABELS[s]}
              </div>
              {i < STATE_FLOW.length - 1 && (
                <span className="text-gray-300 mx-1">→</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Participant Status */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Participants</h2>
        <div className="border rounded-lg divide-y">
          {participants.map((p) => (
            <div
              key={p.name}
              className="flex items-center justify-between px-4 py-3"
            >
              <span className="text-sm font-medium">{p.name}</span>
              <div className="flex gap-3 text-xs">
                <span
                  className={
                    p.blindDone ? "text-green-600" : "text-gray-400"
                  }
                >
                  Blind: {p.blindDone ? "✓" : "pending"}
                </span>
                <span
                  className={
                    p.compDone ? "text-green-600" : "text-gray-400"
                  }
                >
                  Review: {p.compDone ? "✓" : "pending"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        {prevState && (
          <button
            onClick={() => setState(prevState)}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            ← Back to {STATE_LABELS[prevState]}
          </button>
        )}
        {nextState && (
          <button
            onClick={() => setState(nextState)}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
          >
            Advance to {STATE_LABELS[nextState]} →
          </button>
        )}
        {state === "published" && (
          <span className="inline-flex items-center text-sm text-green-600 font-medium">
            ✓ Tasting complete and published!
          </span>
        )}
      </div>

      {/* Warnings */}
      {state === "blind_active" &&
        participants.some((p) => !p.blindDone) && (
          <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200 text-sm text-amber-800">
            ⚠️ Not all participants have submitted blind scores yet.
            Advancing will lock out incomplete submissions.
          </div>
        )}
    </div>
  );
}
