"use client";

/**
 * A 0–10 rating slider. The midpoint (5) sits dead-center, and an unset score
 * (value === null) shows a centered thumb with a "–" readout until the user
 * moves it — so "not yet rated" is visually distinct from a real 5.
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
      <input
        type="range"
        min={0}
        max={10}
        step={1}
        value={value ?? 5}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        aria-label={label}
      />
      <div className="flex justify-between text-xs text-gray-400 mt-0.5">
        <span>0</span>
        <span>5</span>
        <span>10</span>
      </div>
    </div>
  );
}
