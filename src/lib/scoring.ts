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
 * Compute a "value score" on a 0-10 scale by combining two notions of value:
 *   - protein per dollar  (nutritional efficiency)
 *   - grams per dollar     (sheer quantity of food)
 * Each component is normalized to 0-10 against a reference rate, then blended
 * with the weights below. Higher is better. Weights/refs are tunable.
 */
const PROTEIN_PER_DOLLAR_REF = 15; // g protein per $1 that scores a 10
const GRAMS_PER_DOLLAR_REF = 50; // g drained weight per $1 that scores a 10
const PROTEIN_WEIGHT = 0.5;
const QUANTITY_WEIGHT = 0.5;

export function computeValueMetric(fish: {
  protein_g: number;
  weight_g: number;
  price_usd: number;
}): number {
  if (fish.price_usd <= 0) return 0;

  const proteinScore = Math.min(
    10,
    (fish.protein_g / fish.price_usd / PROTEIN_PER_DOLLAR_REF) * 10
  );
  const quantityScore = Math.min(
    10,
    (fish.weight_g / fish.price_usd / GRAMS_PER_DOLLAR_REF) * 10
  );

  const combined =
    PROTEIN_WEIGHT * proteinScore + QUANTITY_WEIGHT * quantityScore;
  return Math.round(combined * 10) / 10;
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
