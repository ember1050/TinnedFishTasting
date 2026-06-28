"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { saveBlindResponse } from "@/app/actions/tasting";
import { RatingSlider } from "@/components/RatingSlider";

interface TinState {
  flavor_score: number | null;
  texture_score: number | null;
  overall_score: number | null;
  notes: string;
  review_text: string;
}

type SaveStatus = "idle" | "saving" | "saved" | "error";

const EMPTY: TinState = {
  flavor_score: null,
  texture_score: null,
  overall_score: null,
  notes: "",
  review_text: "",
};

export function BlindTasting({
  tastingId,
  blindNumbers,
  initial,
}: {
  tastingId: string;
  blindNumbers: number[];
  initial: Record<number, Partial<TinState>>;
}) {
  const [tins, setTins] = useState<Record<number, TinState>>(() => {
    const out: Record<number, TinState> = {};
    for (const n of blindNumbers) {
      out[n] = { ...EMPTY, ...initial[n] };
    }
    return out;
  });
  const [status, setStatus] = useState<Record<number, SaveStatus>>({});
  const timers = useRef<Record<number, ReturnType<typeof setTimeout>>>({});

  const scheduleSave = useCallback(
    (n: number, next: TinState) => {
      setStatus((s) => ({ ...s, [n]: "saving" }));
      clearTimeout(timers.current[n]);
      timers.current[n] = setTimeout(async () => {
        const res = await saveBlindResponse(tastingId, n, {
          flavor_score: next.flavor_score,
          texture_score: next.texture_score,
          overall_score: next.overall_score,
          notes: next.notes || null,
          review_text: next.review_text || null,
        });
        setStatus((s) => ({ ...s, [n]: res?.error ? "error" : "saved" }));
      }, 700);
    },
    [tastingId]
  );

  const update = useCallback(
    (n: number, patch: Partial<TinState>) => {
      setTins((prev) => {
        const next = { ...prev[n], ...patch };
        scheduleSave(n, next);
        return { ...prev, [n]: next };
      });
    },
    [scheduleSave]
  );

  useEffect(() => {
    const t = timers.current;
    return () => {
      Object.values(t).forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="space-y-6">
      {blindNumbers.map((n) => {
        const tin = tins[n];
        const st = status[n] ?? "idle";
        const complete =
          tin.flavor_score !== null &&
          tin.texture_score !== null &&
          tin.overall_score !== null;
        return (
          <div key={n} className="rounded-xl border p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="flex items-center gap-2 text-lg font-bold">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-sm font-semibold text-white">
                  {n}
                </span>
                Tin #{n}
              </h3>
              <span className="text-xs text-gray-400">
                {st === "saving" && "Saving…"}
                {st === "saved" && "✓ Saved"}
                {st === "error" && (
                  <span className="text-red-500">Save failed</span>
                )}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <RatingSlider
                label="Flavor"
                value={tin.flavor_score}
                onChange={(v) => update(n, { flavor_score: v })}
              />
              <RatingSlider
                label="Texture"
                value={tin.texture_score}
                onChange={(v) => update(n, { texture_score: v })}
              />
              <RatingSlider
                label="Overall"
                value={tin.overall_score}
                onChange={(v) => update(n, { overall_score: v })}
              />
            </div>

            {!complete && (
              <p className="mb-4 text-xs text-amber-700">
                Move all three sliders so this tin&apos;s review gets published.
              </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Private notes
                  <span className="ml-1 text-xs font-normal text-gray-400">
                    (just for you, during guessing)
                  </span>
                </label>
                <textarea
                  rows={3}
                  value={tin.notes}
                  onChange={(e) => update(n, { notes: e.target.value })}
                  placeholder="Briny, firm, smoky…"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your review
                  <span className="ml-1 text-xs font-normal text-gray-400">
                    (published to the fish page)
                  </span>
                </label>
                <textarea
                  rows={3}
                  value={tin.review_text}
                  onChange={(e) => update(n, { review_text: e.target.value })}
                  placeholder="What you'd want others to know about this one…"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
