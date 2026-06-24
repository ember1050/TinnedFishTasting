import type { Fish, FishType } from "@/lib/types";

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

/**
 * Affordability tier (Google-Maps style) based on price per gram of drained
 * product — fairer than absolute price across very different tin sizes.
 * Thresholds derived from the current catalog spread (~$0.015–$0.18 /g).
 */
export interface PriceTier {
  tier: 1 | 2 | 3 | 4;
  label: "$" | "$$" | "$$$" | "$$$$";
  perGram: number;
}

export function priceTier(fish: Pick<Fish, "price_usd" | "weight_g">): PriceTier {
  const perGram = fish.weight_g > 0 ? fish.price_usd / fish.weight_g : 0;
  let tier: PriceTier["tier"];
  if (perGram < 0.03) tier = 1;
  else if (perGram < 0.06) tier = 2;
  else if (perGram < 0.12) tier = 3;
  else tier = 4;
  const label = (["$", "$$", "$$$", "$$$$"] as const)[tier - 1];
  return { tier, label, perGram };
}
