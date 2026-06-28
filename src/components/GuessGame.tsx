"use client";

import { useCallback, useRef, useState } from "react";
import { saveGuess } from "@/app/actions/tasting";

interface Candidate {
  fish_id: string;
  label: string;
}

interface TinGuess {
  notes: string;
  primary: string;
  alternate: string;
}

type SaveStatus = "idle" | "saving" | "saved" | "error";

export function GuessGame({
  tastingId,
  tins,
  candidates,
}: {
  tastingId: string;
  tins: { blind_number: number; notes: string; primary: string; alternate: string }[];
  candidates: Candidate[];
}) {
  const [guesses, setGuesses] = useState<Record<number, TinGuess>>(() => {
    const out: Record<number, TinGuess> = {};
    for (const t of tins) {
      out[t.blind_number] = {
        notes: t.notes,
        primary: t.primary,
        alternate: t.alternate,
      };
    }
    return out;
  });
  const [status, setStatus] = useState<Record<number, SaveStatus>>({});
  const timers = useRef<Record<number, ReturnType<typeof setTimeout>>>({});

  const update = useCallback(
    (n: number, patch: Partial<TinGuess>) => {
      setGuesses((prev) => {
        const next = { ...prev[n], ...patch };
        setStatus((s) => ({ ...s, [n]: "saving" }));
        clearTimeout(timers.current[n]);
        timers.current[n] = setTimeout(async () => {
          const res = await saveGuess(
            tastingId,
            n,
            next.primary || null,
            next.alternate || null
          );
          setStatus((s) => ({ ...s, [n]: res?.error ? "error" : "saved" }));
        }, 500);
        return { ...prev, [n]: next };
      });
    },
    [tastingId]
  );

  return (
    <div className="space-y-5">
      {tins.map((t) => {
        const g = guesses[t.blind_number];
        const st = status[t.blind_number] ?? "idle";
        return (
          <div key={t.blind_number} className="rounded-xl border p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="flex items-center gap-2 text-lg font-bold">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-sm font-semibold text-white">
                  {t.blind_number}
                </span>
                Tin #{t.blind_number}
              </h3>
              <span className="text-xs text-gray-400">
                {st === "saving" && "Saving…"}
                {st === "saved" && "✓ Saved"}
                {st === "error" && (
                  <span className="text-red-500">Save failed</span>
                )}
              </span>
            </div>

            {t.notes ? (
              <p className="mb-4 rounded-md bg-gray-50 border px-3 py-2 text-sm text-gray-600">
                <span className="font-medium text-gray-500">Your notes: </span>
                {t.notes}
              </p>
            ) : (
              <p className="mb-4 text-sm text-gray-400 italic">
                You didn&apos;t leave notes for this tin.
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First guess
                </label>
                <select
                  value={g.primary}
                  onChange={(e) => update(t.blind_number, { primary: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="">— Select —</option>
                  {candidates
                    .filter((c) => c.fish_id !== g.alternate)
                    .map((c) => (
                      <option key={c.fish_id} value={c.fish_id}>
                        {c.label}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Backup guess
                  <span className="ml-1 text-xs font-normal text-gray-400">
                    (optional)
                  </span>
                </label>
                <select
                  value={g.alternate}
                  onChange={(e) =>
                    update(t.blind_number, { alternate: e.target.value })
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="">— Select —</option>
                  {candidates
                    .filter((c) => c.fish_id !== g.primary)
                    .map((c) => (
                      <option key={c.fish_id} value={c.fish_id}>
                        {c.label}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
