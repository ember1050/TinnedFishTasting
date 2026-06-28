"use client";

import { useRef } from "react";

/**
 * A 1–10 rating slider. Before it's set (value === null) the thumb starts
 * dead-center with a "–" readout, so "not yet rated" reads as a neutral middle
 * position; moving it snaps to integers 1–10. Built custom (not a native range)
 * so the unset thumb can sit at exactly 50%.
 */
export function RatingSlider({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: number | null;
  onChange: (v: number) => void;
  hint?: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const pct = value === null ? 50 : ((value - 1) / 9) * 100;

  function setFromClientX(clientX: number) {
    const el = trackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    onChange(Math.round(1 + ratio * 9));
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-gray-700">
          {label}
          {hint && (
            <span className="ml-1 text-xs font-normal text-gray-400">
              {hint}
            </span>
          )}
        </span>
        <span className="text-sm font-bold text-blue-700">
          {value === null ? "–" : `${value}/10`}
        </span>
      </div>

      <div
        ref={trackRef}
        role="slider"
        aria-label={label}
        aria-valuemin={1}
        aria-valuemax={10}
        aria-valuenow={value ?? undefined}
        tabIndex={0}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          setFromClientX(e.clientX);
        }}
        onPointerMove={(e) => {
          if (e.buttons === 1) setFromClientX(e.clientX);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight" || e.key === "ArrowUp") {
            onChange(Math.min(10, (value ?? 5) + 1));
            e.preventDefault();
          } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
            onChange(Math.max(1, (value ?? 6) - 1));
            e.preventDefault();
          }
        }}
        className="relative h-6 cursor-pointer select-none touch-none"
      >
        <div className="absolute top-1/2 left-0 right-0 h-2 -translate-y-1/2 rounded-full bg-gray-200" />
        {value !== null && (
          <div
            className="absolute top-1/2 left-0 h-2 -translate-y-1/2 rounded-full bg-blue-500"
            style={{ width: `${pct}%` }}
          />
        )}
        <div
          className={`absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow ${
            value === null ? "bg-gray-400" : "bg-blue-600"
          }`}
          style={{ left: `${pct}%` }}
        />
      </div>

      <div className="flex justify-between text-xs text-gray-400 mt-0.5">
        <span>1</span>
        <span>10</span>
      </div>
    </div>
  );
}
