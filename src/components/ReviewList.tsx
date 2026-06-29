"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ReviewVotes } from "./ReviewVotes";

type Review = {
  id: string;
  user_id: string;
  user_name: string;
  is_from_tasting?: boolean;
  created_at?: string;
  overall_score: number;
  notes?: string | null;
  flavor_score: number;
  texture_score: number;
  value_score?: number | null;
  net_votes?: number;
  my_vote?: number;
};

const PAGE_SIZE = 5;

export function ReviewList({
  reviews,
  canVote,
}: {
  reviews: Review[];
  canVote: boolean;
}) {
  const [sort, setSort] = useState<"newest" | "popular">("newest");
  const [page, setPage] = useState(1);

  const sorted = useMemo(() => {
    const copy = [...reviews];
    if (sort === "popular") {
      copy.sort(
        (a, b) =>
          (b.net_votes ?? 0) - (a.net_votes ?? 0) ||
          +new Date(b.created_at ?? 0) - +new Date(a.created_at ?? 0)
      );
    } else {
      copy.sort((a, b) => +new Date(b.created_at ?? 0) - +new Date(a.created_at ?? 0));
    }
    return copy;
  }, [reviews, sort]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const slice = sorted.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  function changeSort(s: "newest" | "popular") {
    setSort(s);
    setPage(1);
  }

  return (
    <>
      {reviews.length > 1 && (
        <div className="mb-4 flex items-center gap-2 text-sm">
          <span className="text-gray-500">Sort:</span>
          <button
            onClick={() => changeSort("newest")}
            className={
              sort === "newest"
                ? "font-semibold text-blue-700"
                : "text-gray-500 hover:underline"
            }
          >
            Newest
          </button>
          <span className="text-gray-300">·</span>
          <button
            onClick={() => changeSort("popular")}
            className={
              sort === "popular"
                ? "font-semibold text-blue-700"
                : "text-gray-500 hover:underline"
            }
          >
            Most popular
          </button>
        </div>
      )}

      <div className="space-y-4">
        {slice.map((review) => (
          <div key={review.id} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Link
                  href={`/users/${review.user_id}`}
                  className="font-medium text-sm text-blue-600 hover:underline"
                >
                  {review.user_name}
                </Link>
                {review.is_from_tasting && (
                  <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                    ✓ Verified Tasting
                  </span>
                )}
                {review.created_at && (
                  <span className="text-xs text-gray-400">
                    {new Date(review.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                )}
              </div>
              <span className="text-lg font-bold text-blue-700">
                {review.overall_score}/10
              </span>
            </div>
            {review.notes && (
              <p className="text-sm text-gray-600 mb-3">{review.notes}</p>
            )}
            <div className="flex items-center justify-between">
              <div className="flex gap-4 text-xs text-gray-400">
                <span>Flavor: {review.flavor_score}</span>
                <span>Texture: {review.texture_score}</span>
                {review.value_score !== null &&
                  review.value_score !== undefined && (
                    <span>Value: {review.value_score}</span>
                  )}
              </div>
              <ReviewVotes
                reviewId={review.id}
                net={review.net_votes ?? 0}
                mine={review.my_vote ?? 0}
                canVote={canVote}
              />
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-4 text-sm">
          <button
            onClick={() => setPage(current - 1)}
            disabled={current <= 1}
            className="text-blue-600 hover:underline disabled:text-gray-300 disabled:no-underline"
          >
            ← Previous
          </button>
          <span className="text-gray-500">
            Page {current} of {totalPages}
          </span>
          <button
            onClick={() => setPage(current + 1)}
            disabled={current >= totalPages}
            className="text-blue-600 hover:underline disabled:text-gray-300 disabled:no-underline"
          >
            Next →
          </button>
        </div>
      )}
    </>
  );
}
