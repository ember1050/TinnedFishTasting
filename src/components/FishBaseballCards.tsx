"use client";

import { useMemo } from "react";
import { fishTypeBadgeClasses } from "@/lib/fish-display";
import type { Fish } from "@/lib/types";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Interlude "baseball cards" — the fish in the tasting shown in a randomized
 * order (so it doesn't mirror the blind numbering) with their base stats but no
 * ratings. Swipe/scroll horizontally.
 */
export function FishBaseballCards({ fish }: { fish: Fish[] }) {
  const shuffled = useMemo(() => shuffle(fish), [fish]);

  return (
    <div className="-mx-1 mt-4 flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory">
      {shuffled.map((f) => {
        const proteinPerDollar =
          f.price_usd > 0 ? (f.protein_g / f.price_usd).toFixed(1) : "–";
        return (
          <div
            key={f.id}
            className="snap-center shrink-0 w-64 rounded-xl border bg-white p-4 shadow-sm"
          >
            <div className="aspect-square mb-3 flex items-center justify-center overflow-hidden rounded-lg border bg-white p-2">
              {f.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={f.image_url}
                  alt={f.name}
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="text-center text-gray-300">
                  <div className="text-5xl">🐟</div>
                </div>
              )}
            </div>

            <div className="flex items-start justify-between gap-2 mb-1">
              <h4 className="font-semibold leading-tight">{f.name}</h4>
            </div>
            <p className="text-sm text-gray-500 mb-3 flex items-center gap-2">
              {f.brand}
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${fishTypeBadgeClasses(
                  f.fish_type
                )}`}
              >
                {f.fish_type}
              </span>
            </p>

            <dl className="grid grid-cols-2 gap-y-1.5 text-sm">
              <dt className="text-gray-500">Price</dt>
              <dd className="text-right font-medium">
                ${f.price_usd.toFixed(2)}
              </dd>
              <dt className="text-gray-500">Weight</dt>
              <dd className="text-right font-medium">{f.weight_g}g</dd>
              <dt className="text-gray-500">Protein</dt>
              <dd className="text-right font-medium">{f.protein_g}g</dd>
              <dt className="text-gray-500">Calories</dt>
              <dd className="text-right font-medium">{f.calories}</dd>
              <dt className="text-gray-500">Protein / $</dt>
              <dd className="text-right font-medium">{proteinPerDollar}g</dd>
            </dl>
          </div>
        );
      })}
    </div>
  );
}
