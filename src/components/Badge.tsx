"use client";

import { useEffect, useRef, useState } from "react";
import { getAchievementMeta } from "@/lib/achievements";

/**
 * A single earned achievement: the badge icon, an optional count bubble when
 * the same badge was earned more than once, and a tooltip (hover AND click, so
 * it works on touch) showing the achievement's title + description.
 */
export function Badge({
  kind,
  count = 1,
  size = 28,
}: {
  kind: string;
  count?: number;
  size?: number;
}) {
  const meta = getAchievementMeta(kind);
  const [hovered, setHovered] = useState(false);
  const [pinned, setPinned] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!pinned) return;
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setPinned(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setPinned(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [pinned]);

  if (!meta) return null;
  const Icon = meta.icon;
  const open = hovered || pinned;

  return (
    <span ref={ref} className="relative inline-flex">
      <button
        type="button"
        aria-label={meta.label}
        aria-expanded={open}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
        onClick={() => setPinned((p) => !p)}
        className="relative inline-flex items-center justify-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        <Icon size={size} />
        {count >= 2 && (
          <span className="absolute -bottom-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white">
            {count}
          </span>
        )}
      </button>

      {open && (
        <span
          role="tooltip"
          className="absolute left-0 top-full z-50 mt-2 w-max max-w-[min(16rem,calc(100vw-2.5rem))] rounded-md border border-gray-200 bg-white p-3 text-left shadow-lg"
        >
          <span className="block text-sm font-semibold text-gray-900">
            {meta.label}
            {count >= 2 && (
              <span className="ml-1 font-normal text-gray-400">×{count}</span>
            )}
          </span>
          <span className="mt-0.5 block text-xs text-gray-500">
            {meta.description}
          </span>
        </span>
      )}
    </span>
  );
}
