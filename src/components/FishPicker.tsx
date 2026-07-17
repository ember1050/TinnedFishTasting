"use client";

import { useEffect, useRef, useState } from "react";
import { FishThumb } from "@/components/FishChip";

export interface FishOption {
  fish_id: string;
  name: string;
  brand: string;
  image_url?: string | null;
}

/**
 * Image-aware replacement for a native <select> of fish. Shows the chosen
 * fish's thumbnail + name + brand, and opens a list of options each with their
 * own thumbnail — critical because many tinned fish share near-identical names.
 */
export function FishPicker({
  options,
  value,
  onChange,
  disabled = false,
  exclude,
  placeholder = "— Select —",
  allowClear = false,
}: {
  options: FishOption[];
  value: string;
  onChange: (fishId: string) => void;
  disabled?: boolean;
  exclude?: string;
  placeholder?: string;
  allowClear?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const selected = options.find((o) => o.fish_id === value) || null;
  const visible = options.filter((o) => !exclude || o.fish_id !== exclude);

  function pick(id: string) {
    onChange(id);
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 rounded-md border border-gray-300 px-3 py-2 text-left text-sm disabled:bg-gray-100 disabled:text-gray-500"
      >
        {selected ? (
          <span className="flex min-w-0 items-center gap-2">
            <FishThumb
              imageUrl={selected.image_url}
              name={selected.name}
              size={28}
            />
            <span className="min-w-0">
              <span className="block truncate font-medium">
                {selected.name}
              </span>
              <span className="block truncate text-xs text-gray-500">
                {selected.brand}
              </span>
            </span>
          </span>
        ) : (
          <span className="text-gray-400">{placeholder}</span>
        )}
        <span aria-hidden="true" className="shrink-0 text-xs text-gray-400">
          ▾
        </span>
      </button>

      {open && !disabled && (
        <ul
          role="listbox"
          className="absolute z-40 mt-1 max-h-72 w-full overflow-auto rounded-md border border-gray-200 bg-white py-1 shadow-lg"
        >
          {allowClear && (
            <li>
              <button
                type="button"
                onClick={() => pick("")}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-500 hover:bg-gray-50"
              >
                {placeholder}
              </button>
            </li>
          )}
          {visible.map((o) => (
            <li key={o.fish_id}>
              <button
                type="button"
                role="option"
                aria-selected={o.fish_id === value}
                onClick={() => pick(o.fish_id)}
                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50 ${
                  o.fish_id === value ? "bg-blue-50" : ""
                }`}
              >
                <FishThumb imageUrl={o.image_url} name={o.name} size={28} />
                <span className="min-w-0">
                  <span className="block truncate font-medium">{o.name}</span>
                  <span className="block truncate text-xs text-gray-500">
                    {o.brand}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
