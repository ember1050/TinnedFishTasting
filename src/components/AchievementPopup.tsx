"use client";

import { useEffect, useState } from "react";
import { getAchievementMeta } from "@/lib/achievements";

/**
 * One-time celebratory popup shown on the results page when the viewer earned
 * an achievement in this tasting. "Seen" is tracked in localStorage per tasting
 * so it doesn't reappear on every visit.
 */
export function AchievementPopup({
  tastingId,
  kind,
  earned,
}: {
  tastingId: string;
  kind: string;
  earned: boolean;
}) {
  const [open, setOpen] = useState(false);
  const meta = getAchievementMeta(kind);
  const storageKey = `achievement-seen-${kind}-${tastingId}`;

  useEffect(() => {
    if (!earned) return;
    try {
      if (localStorage.getItem(storageKey)) return;
    } catch {
      // localStorage unavailable — just show it this once.
    }
    setOpen(true);
  }, [earned, storageKey]);

  function close() {
    setOpen(false);
    try {
      localStorage.setItem(storageKey, "1");
    } catch {
      // ignore
    }
  }

  if (!open || !meta) return null;
  const Icon = meta.icon;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      onClick={close}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex justify-center">
          <Icon size={96} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">You have perfect taste!</h2>
        <p className="mt-1 text-sm font-medium text-blue-700">{meta.label}</p>
        <p className="mt-2 text-sm text-gray-500">{meta.description}</p>
        <button
          type="button"
          onClick={close}
          className="mt-6 w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
        >
          Nice!
        </button>
      </div>
    </div>
  );
}
