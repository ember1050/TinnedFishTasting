"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { TastingState } from "@/lib/types";

const STATE_FLOW: TastingState[] = [
  "setup",
  "blind_active",
  "blind_locked",
  "guessing_active",
  "guessing_locked",
  "published",
];

function nextState(current: TastingState): TastingState | null {
  const i = STATE_FLOW.indexOf(current);
  return i >= 0 && i < STATE_FLOW.length - 1 ? STATE_FLOW[i + 1] : null;
}

function generateEventCode(): string {
  // Unambiguous alphabet (no 0/O/1/I) for easy verbal sharing.
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

/**
 * Create a tasting. `fish_ids` is an ordered, comma-separated list — the order
 * defines each tin's blind number (index + 1). The host is enrolled as the
 * first participant. Private tastings get a shareable event code.
 */
export async function createTasting(formData: FormData) {
  const { supabase, user } = await requireUser();
  if (!user) return { error: "You must be logged in to host a tasting." };

  const title = (formData.get("title") as string)?.trim();
  const visibility = (formData.get("visibility") as string) || "private";
  const isPublic = visibility === "public";
  const fishIdsRaw = (formData.get("fish_ids") as string) || "";
  const fishIds = fishIdsRaw.split(",").map((s) => s.trim()).filter(Boolean);

  if (!title) return { error: "Please give your tasting a name." };
  if (fishIds.length < 2) {
    return { error: "Pick at least two fish for the tasting." };
  }
  if (new Set(fishIds).size !== fishIds.length) {
    return { error: "Each fish can only be added once." };
  }

  const eventCode = isPublic ? null : generateEventCode();

  const { data: tasting, error: tErr } = await supabase
    .from("tastings")
    .insert({
      host_user_id: user.id,
      title,
      is_public: isPublic,
      event_code: eventCode,
      state: "setup",
    })
    .select("id")
    .single();

  if (tErr || !tasting) {
    return { error: tErr?.message || "Could not create the tasting." };
  }

  const fishRows = fishIds.map((fish_id, i) => ({
    tasting_id: tasting.id,
    fish_id,
    blind_number: i + 1,
  }));

  const { error: fErr } = await supabase.from("tasting_fish").insert(fishRows);
  if (fErr) {
    // Roll back the orphaned tasting so we don't leave a half-created event.
    await supabase.from("tastings").delete().eq("id", tasting.id);
    return { error: fErr.message };
  }

  await supabase
    .from("tasting_participants")
    .insert({ tasting_id: tasting.id, user_id: user.id });

  redirect(`/tastings/${tasting.id}`);
}

/** Join a public tasting the user can already see. */
export async function joinPublicTasting(tastingId: string) {
  const { supabase, user } = await requireUser();
  if (!user) return { error: "You must be logged in to join." };

  const { error } = await supabase
    .from("tasting_participants")
    .insert({ tasting_id: tastingId, user_id: user.id });

  // Ignore duplicate-participant errors (already joined).
  if (error && error.code !== "23505") return { error: error.message };

  revalidatePath(`/tastings/${tastingId}`);
  return { success: true };
}

/** Join a private tasting by its event code (via SECURITY DEFINER RPC). */
export async function joinTastingByCode(formData: FormData) {
  const { supabase, user } = await requireUser();
  if (!user) return { error: "You must be logged in to join." };

  const code = (formData.get("code") as string)?.trim();
  if (!code) return { error: "Enter an event code." };

  const { data, error } = await supabase.rpc("join_tasting_by_code", {
    p_code: code,
  });

  if (error || !data) {
    return { error: "That event code didn't match any tasting." };
  }

  redirect(`/tastings/${data}`);
}

/** Host advances the tasting to the next state in the flow. */
export async function advanceTastingState(tastingId: string) {
  const { supabase, user } = await requireUser();
  if (!user) return { error: "Not authenticated." };

  const { data: tasting, error } = await supabase
    .from("tastings")
    .select("state, host_user_id")
    .eq("id", tastingId)
    .single();

  if (error || !tasting) return { error: "Tasting not found." };
  if (tasting.host_user_id !== user.id) {
    return { error: "Only the host can advance the tasting." };
  }

  const next = nextState(tasting.state as TastingState);
  if (!next) return { error: "The tasting is already complete." };

  // Publishing is a distinct operation (writes reviews); don't auto-advance into it here.
  if (next === "published") {
    return publishResults(tastingId);
  }

  const { error: uErr } = await supabase
    .from("tastings")
    .update({ state: next })
    .eq("id", tastingId);

  if (uErr) return { error: uErr.message };

  revalidatePath(`/tastings/${tastingId}`);
  revalidatePath(`/tastings/${tastingId}/host`);
  return { success: true, state: next };
}

/**
 * Upsert the current user's blind response for one tin. Allowed only while the
 * blind stage is active.
 */
export async function saveBlindResponse(
  tastingId: string,
  blindNumber: number,
  payload: {
    flavor_score?: number | null;
    texture_score?: number | null;
    aesthetics_score?: number | null;
    overall_score?: number | null;
    notes?: string | null;
    review_text?: string | null;
  }
) {
  const { supabase, user } = await requireUser();
  if (!user) return { error: "Not authenticated." };

  const { data: tasting } = await supabase
    .from("tastings")
    .select("state")
    .eq("id", tastingId)
    .single();

  if (tasting?.state !== "blind_active") {
    return { error: "The blind tasting is not open for edits." };
  }

  const { error } = await supabase.from("blind_responses").upsert(
    {
      tasting_id: tastingId,
      user_id: user.id,
      blind_number: blindNumber,
      ...payload,
    },
    { onConflict: "tasting_id,user_id,blind_number" }
  );

  if (error) return { error: error.message };
  return { success: true };
}

/** Save the current user's guesses for one tin. Allowed only while guessing is active. */
export async function saveGuess(
  tastingId: string,
  blindNumber: number,
  guessPrimary: string | null,
  guessAlternate: string | null
) {
  const { supabase, user } = await requireUser();
  if (!user) return { error: "Not authenticated." };

  const { data: tasting } = await supabase
    .from("tastings")
    .select("state")
    .eq("id", tastingId)
    .single();

  if (tasting?.state !== "guessing_active") {
    return { error: "Guessing is not currently open." };
  }

  const { error } = await supabase.from("blind_responses").upsert(
    {
      tasting_id: tastingId,
      user_id: user.id,
      blind_number: blindNumber,
      guess_primary: guessPrimary,
      guess_alternate: guessAlternate,
    },
    { onConflict: "tasting_id,user_id,blind_number" }
  );

  if (error) return { error: error.message };
  return { success: true };
}

/**
 * Host publishes results: a SECURITY DEFINER function turns each participant's
 * blind response into a live review (verified tasting, value omitted) and flips
 * the tasting to published. It must be a definer function because the host
 * can't read others' blind responses or write reviews on their behalf via RLS.
 */
export async function publishResults(tastingId: string) {
  const { supabase, user } = await requireUser();
  if (!user) return { error: "Not authenticated." };

  const { error } = await supabase.rpc("publish_tasting_results", {
    p_tasting: tastingId,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/tastings/${tastingId}`);
  revalidatePath(`/tastings/${tastingId}/host`);
  revalidatePath(`/tastings/${tastingId}/results`);
  return { success: true };
}
