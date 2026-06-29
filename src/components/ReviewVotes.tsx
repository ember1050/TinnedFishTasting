"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { voteReview } from "@/app/actions/reviews";

/**
 * Up/down vote control for a review. Optimistically updates the net score;
 * re-clicking the active direction clears the vote. Anonymous users are nudged
 * to log in.
 */
export function ReviewVotes({
  reviewId,
  net,
  mine,
  canVote,
}: {
  reviewId: string;
  net: number;
  mine: number; // -1, 0, 1
  canVote: boolean;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [vote, setVote] = useState(mine);
  const [score, setScore] = useState(net);

  function cast(dir: 1 | -1) {
    if (!canVote) {
      router.push("/auth/login");
      return;
    }
    const next = vote === dir ? 0 : dir;
    setScore((s) => s - vote + next);
    setVote(next);
    startTransition(() => {
      void voteReview(reviewId, next);
    });
  }

  const base =
    "flex h-7 w-7 items-center justify-center rounded-full text-sm transition-colors";
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        aria-label="Upvote"
        onClick={() => cast(1)}
        className={`${base} ${vote === 1 ? "bg-green-100 text-green-700" : "text-gray-400 hover:bg-gray-100"}`}
      >
        ▲
      </button>
      <span className="min-w-5 text-center text-sm font-semibold text-gray-700">
        {score}
      </span>
      <button
        type="button"
        aria-label="Downvote"
        onClick={() => cast(-1)}
        className={`${base} ${vote === -1 ? "bg-red-100 text-red-700" : "text-gray-400 hover:bg-gray-100"}`}
      >
        ▼
      </button>
    </div>
  );
}
