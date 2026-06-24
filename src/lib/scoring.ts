import type { FishWithStats } from "./types";

/**
 * Calculates a Bayesian-weighted average to prevent fish with very few
 * reviews from dominating the rankings. Uses the global mean and a
 * confidence threshold (minimum votes before the score is trustworthy).
 */
export function bayesianAverage(
  itemAvg: number,
  itemCount: number,
  globalAvg: number,
  confidenceThreshold: number = 5
): number {
  return (
    (confidenceThreshold * globalAvg + itemCount * itemAvg) /
    (confidenceThreshold + itemCount)
  );
}

/**
 * Value score (0–10): the geometric mean of two "per dollar" rates —
 * protein per dollar and drained grams per dollar.
 *
 *   geometric mean = sqrt( (protein/price) × (weight/price) )
 *                  = sqrt(protein_g × weight_g) / price_usd
 *
 * The geometric mean is the statistically appropriate average for ratios:
 * unlike the previous arithmetic blend it has no arbitrary per-factor anchors,
 * penalizes imbalance between the two rates, and doesn't clamp/flatten the top
 * of the ranking. The raw composite is divided by VALUE_REF — the best value in
 * the current 45-item catalog (~29.7), rounded to 30 — to map onto a 0–10 scale.
 * Recalibrate VALUE_REF if the catalog's price/nutrition spread shifts.
 */
const VALUE_REF = 30;

export function computeValueMetric(fish: {
  protein_g: number;
  weight_g: number;
  price_usd: number;
}): number {
  if (fish.price_usd <= 0) return 0;
  const composite = Math.sqrt(fish.protein_g * fish.weight_g) / fish.price_usd;
  const scaled = (composite / VALUE_REF) * 10;
  return Math.min(10, Math.round(scaled * 10) / 10);
}

/**
 * Sort fish by ranking score (Bayesian average of overall_score).
 */
export function rankFish(
  fish: FishWithStats[],
  globalAvg: number
): FishWithStats[] {
  return [...fish].sort((a, b) => {
    const scoreA = a.avg_overall
      ? bayesianAverage(a.avg_overall, a.review_count, globalAvg)
      : 0;
    const scoreB = b.avg_overall
      ? bayesianAverage(b.avg_overall, b.review_count, globalAvg)
      : 0;
    return scoreB - scoreA;
  });
}

/**
 * Calculate guess accuracy for a tasting participant.
 * Primary correct = 2 points, alternate correct = 1 point.
 */
export function calculateGuessScore(
  responses: { blind_number: number; guess_primary: string | null; guess_alternate: string | null }[],
  correctMapping: Map<number, string> // blind_number → fish_id
): { total: number; max: number; primaryCorrect: number; alternateCorrect: number } {
  let primaryCorrect = 0;
  let alternateCorrect = 0;

  for (const r of responses) {
    const correctFishId = correctMapping.get(r.blind_number);
    if (!correctFishId) continue;

    if (r.guess_primary === correctFishId) {
      primaryCorrect++;
    } else if (r.guess_alternate === correctFishId) {
      alternateCorrect++;
    }
  }

  return {
    total: primaryCorrect * 2 + alternateCorrect * 1,
    max: responses.length * 2,
    primaryCorrect,
    alternateCorrect,
  };
}
