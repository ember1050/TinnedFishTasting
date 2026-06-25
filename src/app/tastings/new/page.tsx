"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import { createTasting } from "@/app/actions/tasting";
import { fishTypeBadgeClasses } from "@/lib/fish-display";
import type { FishType } from "@/lib/types";

interface FishOption {
  id: string;
  name: string;
  brand: string;
  fish_type: FishType;
}

export default function NewTastingPage() {
  const [catalog, setCatalog] = useState<FishOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<FishOption[]>([]);

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    supabase
      .from("fish")
      .select("id, name, brand, fish_type")
      .order("name")
      .then(({ data }) => {
        setCatalog((data as FishOption[]) ?? []);
        setLoading(false);
      });
  }, []);

  const selectedIds = useMemo(
    () => new Set(selected.map((f) => f.id)),
    [selected]
  );

  const results = useMemo(() => {
    const q = search.trim().toLowerCase();
    return catalog
      .filter((f) => !selectedIds.has(f.id))
      .filter(
        (f) =>
          !q ||
          f.name.toLowerCase().includes(q) ||
          f.brand.toLowerCase().includes(q)
      )
      .slice(0, 20);
  }, [catalog, search, selectedIds]);

  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string } | undefined, formData: FormData) => {
      return await createTasting(formData);
    },
    undefined
  );

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href="/tastings"
        className="text-sm text-blue-600 hover:underline mb-4 inline-block"
      >
        ← Back to tastings
      </Link>

      <h1 className="text-3xl font-bold mb-2">Host a Tasting</h1>
      <p className="text-gray-500 mb-8">
        Pick fish from the catalog and assign blind numbers. The order you add
        them sets each tin&apos;s number — label your physical tins to match.
      </p>

      {state?.error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-6">
        <input
          type="hidden"
          name="fish_ids"
          value={selected.map((f) => f.id).join(",")}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tasting Name
          </label>
          <input
            name="title"
            type="text"
            required
            placeholder="e.g. Friday Fish Night #3"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Visibility
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="visibility"
                value="private"
                defaultChecked
              />
              Private (invite code)
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" name="visibility" value="public" />
              Public (anyone can join)
            </label>
          </div>
        </div>

        {/* Selected fish (order = blind numbers) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Selected Fish ({selected.length})
          </label>
          {selected.length === 0 ? (
            <p className="text-sm text-gray-400 border border-dashed rounded-md px-3 py-4">
              No fish added yet. Search below to add at least two.
            </p>
          ) : (
            <ul className="space-y-2">
              {selected.map((f, i) => (
                <li
                  key={f.id}
                  className="flex items-center justify-between rounded-md border bg-white px-3 py-2 text-sm"
                >
                  <span className="flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-xs font-semibold text-white">
                      {i + 1}
                    </span>
                    <span className="font-medium">{f.name}</span>
                    <span className="text-gray-400">{f.brand}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${fishTypeBadgeClasses(
                        f.fish_type
                      )}`}
                    >
                      {f.fish_type}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setSelected((s) => s.filter((x) => x.id !== f.id))
                    }
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Search + add */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Add Fish from Catalog
          </label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or brand..."
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm mb-2"
          />
          <div className="border rounded-md divide-y max-h-72 overflow-y-auto">
            {loading ? (
              <p className="px-3 py-4 text-sm text-gray-400">Loading catalog…</p>
            ) : results.length === 0 ? (
              <p className="px-3 py-4 text-sm text-gray-400">
                {search ? "No matches." : "All catalog fish are selected."}
              </p>
            ) : (
              results.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => {
                    setSelected((s) => [...s, f]);
                    setSearch("");
                  }}
                  className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-gray-50"
                >
                  <span>
                    <span className="font-medium">{f.name}</span>{" "}
                    <span className="text-gray-400">{f.brand}</span>
                  </span>
                  <span className="text-blue-600 text-xs font-medium">
                    + Add
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="pt-4 border-t flex gap-3">
          <button
            type="submit"
            disabled={pending || selected.length < 2}
            className="rounded-md bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
          >
            {pending ? "Creating…" : "Create Tasting"}
          </button>
          <Link
            href="/tastings"
            className="rounded-md px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
