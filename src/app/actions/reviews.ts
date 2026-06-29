"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/**
 * Cast or change a vote on a review. value: 1 (up), -1 (down), or 0 to clear.
 * Re-clicking the current direction also clears it. One vote per user/review.
 */
export async function voteReview(reviewId: string, value: -1 | 0 | 1) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Log in to vote." };

  try {
    if (value === 0) {
      const { error } = await supabase
        .from("review_votes")
        .delete()
        .eq("review_id", reviewId)
        .eq("user_id", user.id);
      if (error) return { error: error.message };
    } else {
      const { error } = await supabase.from("review_votes").upsert(
        { review_id: reviewId, user_id: user.id, value },
        { onConflict: "review_id,user_id" }
      );
      if (error) return { error: error.message };
    }
  } catch {
    return { error: "Couldn't reach the server. Please try again." };
  }

  revalidatePath("/fish/[id]", "page");
  return { success: true };
}
