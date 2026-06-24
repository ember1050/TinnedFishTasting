"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { FishWithStats, FishType } from "@/lib/types";
import { computeValueMetric } from "@/lib/scoring";
import { fishTypeBadgeClasses } from "@/lib/fish-display";

type SortKey =
  | "rank"
  | "name"
  | "brand"
  | "overall"
  | "weight"
  | "protein"
  | "price"
  | "value";

export function FishTable({ fish }: { fish: FishWithStats[] }) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<FishType | "">("");
  const [sortKey, setSortKey] = useState<SortKey>("rank");
  const [sortAsc, setSortAsc] = useState(true);

  const filtered = useMemo(() => {
    let result = fish;

    if (typeFilter) {
      result = result.filter((f) => f.fish_type === typeFilter);
    }

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.brand.toLowerCase().includes(q)
      );
    }

    if (sortKey !== "rank") {
      result = [...result].sort((a, b) => {
        let cmp = 0;
        switch (sortKey) {
          case "name":
            cmp = a.name.localeCompare(b.name);
            break;
          case "brand":
            cmp = a.brand.localeCompare(b.brand);
            break;
          case "overall":
            cmp = (a.avg_overall ?? 0) - (b.avg_overall ?? 0);
            break;
          case "protein":
            cmp = a.protein_g - b.protein_g;
            break;
          case "price":
            cmp = a.price_usd - b.price_usd;
            break;
          case "weight":
            cmp = a.weight_g - b.weight_g;
            break;
          case "value":
            cmp = computeValueMetric(a) - computeValueMetric(b);
            break;
        }
        return sortAsc ? cmp : -cmp;
      });
    }

    return result;
  }, [fish, search, typeFilter, sortKey, sortAsc]);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(key === "name" || key === "brand");
    }
  }

  const SortHeader = ({
    label,
    field,
    hint,
  }: {
    label: string;
    field: SortKey;
    hint?: string;
  }) => (
    <th
      onClick={() => handleSort(field)}
      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-900 select-none"
    >
      <span className="inline-flex items-center">
        {label}
        {hint && (
          <span
            className="group relative ml-1"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-gray-400 normal-case cursor-help">ⓘ</span>
            <span className="pointer-events-none absolute right-0 top-full z-20 mt-1 hidden w-52 rounded bg-gray-900 px-2 py-1 text-xs font-normal normal-case tracking-normal text-white shadow-lg group-hover:block">
              {hint}
            </span>
          </span>
        )}
        {sortKey === field && (
          <span className="ml-1">{sortAsc ? "↑" : "↓"}</span>
        )}
      </span>
    </th>
  );

  return (
    <>
      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-3">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as FishType | "")}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">All Fish Types</option>
          <option value="sardine">Sardine</option>
          <option value="tuna">Tuna</option>
          <option value="mackerel">Mackerel</option>
          <option value="salmon">Salmon</option>
          <option value="anchovy">Anchovy</option>
          <option value="trout">Trout</option>
          <option value="herring">Herring</option>
          <option value="mussel">Mussel</option>
          <option value="oyster">Oyster</option>
        </select>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or brand..."
          className="rounded-md border border-gray-300 px-3 py-2 text-sm w-64"
        />
        {(search || typeFilter) && (
          <button
            onClick={() => {
              setSearch("");
              setTypeFilter("");
            }}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <SortHeader label="#" field="rank" />
              <SortHeader label="Name" field="name" />
              <SortHeader label="Brand" field="brand" />
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <SortHeader label="Score" field="overall" />
              <SortHeader label="Weight" field="weight" />
              <SortHeader label="Protein" field="protein" />
              <SortHeader label="Price" field="price" />
              <SortHeader
                label="Value"
                field="value"
                hint="The average of two 0–10 scores — protein-per-dollar and grams-per-dollar — so it rewards both nutrition and quantity."
              />
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="px-4 py-12 text-center text-gray-500"
                >
                  No fish match your filters.
                </td>
              </tr>
            ) : (
              filtered.map((f, i) => (
                <tr key={f.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-400 font-medium">
                    {i + 1}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/fish/${f.id}`}
                      className="text-sm font-medium text-blue-600 hover:underline"
                    >
                      {f.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {f.brand}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${fishTypeBadgeClasses(f.fish_type)}`}>
                      {f.fish_type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold">
                    {f.avg_overall?.toFixed(1) ?? "—"}
                    <span className="text-xs text-gray-400 ml-1">
                      ({f.review_count})
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {f.weight_g}g
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {f.protein_g}g
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    ${f.price_usd.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {computeValueMetric(f).toFixed(1)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-gray-400">
        Value is the average of two 0–10 scores — protein-per-dollar and
        food-per-dollar — so it rewards both nutrition and quantity. Click
        column headers to sort.
      </p>
    </>
  );
}
