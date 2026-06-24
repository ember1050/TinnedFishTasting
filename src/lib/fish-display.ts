import type { FishType } from "@/lib/types";

/**
 * Consistent Tailwind badge classes per fish type, so a given species always
 * shows the same color across the table and detail pages.
 */
const FISH_TYPE_BADGE: Record<FishType, string> = {
  tuna: "bg-blue-100 text-blue-800",
  mackerel: "bg-purple-100 text-purple-800",
  sardine: "bg-amber-100 text-amber-800",
  salmon: "bg-rose-100 text-rose-800",
  trout: "bg-orange-100 text-orange-800",
  anchovy: "bg-red-100 text-red-800",
  herring: "bg-teal-100 text-teal-800",
  cod: "bg-slate-100 text-slate-800",
  mussel: "bg-indigo-100 text-indigo-800",
  oyster: "bg-cyan-100 text-cyan-800",
  clam: "bg-lime-100 text-lime-800",
  squid: "bg-fuchsia-100 text-fuchsia-800",
  other: "bg-gray-100 text-gray-700",
};

export function fishTypeBadgeClasses(type: FishType): string {
  return FISH_TYPE_BADGE[type] ?? FISH_TYPE_BADGE.other;
}
