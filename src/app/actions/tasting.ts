"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { TastingState } from "@/lib/types";
import {
  parse,
  createTastingSchema,
  eventCodeSchema,
  blindResponseSchema,
  guessSchema,
  uuidSchema,
} from "@/lib/validation";

function str(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === "string" ? v : "";
}

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

  const fishIds = str(formData, "fish_ids")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const parsed = parse(createTastingSchema, {
    title: str(formData, "title"),
    visibility: str(formData, "visibility") || "private",
    fish_ids: fishIds,
  });
  if (!parsed.ok) return { error: parsed.error };

  const isPublic = parsed.data.visibility === "public";
  const eventCode = isPublic ? null : generateEventCode();

  let tastingId: string;
  try {
    const { data: tasting, error: tErr } = await supabase
      .from("tastings")
      .insert({
        host_user_id: user.id,
        title: parsed.data.title,
        is_public: isPublic,
        event_code: eventCode,
        state: "setup",
      })
      .select("id")
      .single();

    if (tErr || !tasting) {
      return { error: tErr?.message || "Could not create the tasting." };
    }
    tastingId = tasting.id;

    const fishRows = parsed.data.fish_ids.map((fish_id, i) => ({
      tasting_id: tastingId,
      fish_id,
      blind_number: i + 1,
    }));

    const { error: fErr } = await supabase
      .from("tasting_fish")
      .insert(fishRows);
    if (fErr) {
      // Roll back the orphaned tasting so we don't leave a half-created event.
      await supabase.from("tastings").delete().eq("id", tastingId);
      return { error: fErr.message };
    }

    await supabase
      .from("tasting_participants")
      .insert({ tasting_id: tastingId, user_id: user.id });
  } catch {
    return { error: "Couldn't reach the server. Please try again." };
  }

  redirect(`/tastings/${tastingId}`);
}

/** Join a public tasting the user can already see. */
export async function joinPublicTasting(tastingId: string) {
  const { supabase, user } = await requireUser();
  if (!user) return { error: "You must be logged in to join." };
  if (!uuidSchema.safeParse(tastingId).success) {
    return { error: "Invalid tasting." };
  }

  try {
    const { error } = await supabase
      .from("tasting_participants")
      .insert({ tasting_id: tastingId, user_id: user.id });

    // Ignore duplicate-participant errors (already joined).
    if (error && error.code !== "23505") return { error: error.message };
  } catch {
    return { error: "Couldn't reach the server. Please try again." };
  }

  revalidatePath(`/tastings/${tastingId}`);
  return { success: true };
}

/** Leave a tasting (participants only — the host can't abandon their own). */
export async function leaveTasting(tastingId: string) {
  const { supabase, user } = await requireUser();
  if (!user) return { error: "Not authenticated." };
  if (!uuidSchema.safeParse(tastingId).success) {
    return { error: "Invalid tasting." };
  }

  const { data: t } = await supabase
    .from("tastings")
    .select("host_user_id")
    .eq("id", tastingId)
    .single();

  if (t?.host_user_id === user.id) {
    return { error: "The host can't leave their own tasting." };
  }

  try {
    const { error } = await supabase
      .from("tasting_participants")
      .delete()
      .eq("tasting_id", tastingId)
      .eq("user_id", user.id);
    if (error) return { error: error.message };
  } catch {
    return { error: "Couldn't reach the server. Please try again." };
  }

  redirect("/tastings");
}

/** Join a private tasting by its event code (via SECURITY DEFINER RPC). */
export async function joinTastingByCode(formData: FormData) {
  const { supabase, user } = await requireUser();
  if (!user) return { error: "You must be logged in to join." };

  const parsed = parse(eventCodeSchema, { code: str(formData, "code") });
  if (!parsed.ok) return { error: parsed.error };

  let tastingId: string | null = null;
  try {
    const { data, error } = await supabase.rpc("join_tasting_by_code", {
      p_code: parsed.data.code,
    });
    if (error || !data) {
      return { error: "That event code didn't match any tasting." };
    }
    tastingId = data as string;
  } catch {
    return { error: "Couldn't reach the server. Please try again." };
  }

  redirect(`/tastings/${tastingId}`);
}

/** Host advances the tasting to the next state in the flow. */
export async function advanceTastingState(tastingId: string) {
  const { supabase, user } = await requireUser();
  if (!user) return { error: "Not authenticated." };
  if (!uuidSchema.safeParse(tastingId).success) {
    return { error: "Invalid tasting." };
  }

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

  try {
    const { error: uErr } = await supabase
      .from("tastings")
      .update({ state: next })
      .eq("id", tastingId);
    if (uErr) return { error: uErr.message };
  } catch {
    return { error: "Couldn't reach the server. Please try again." };
  }

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
    overall_score?: number | null;
    notes?: string | null;
    review_text?: string | null;
  }
) {
  const { supabase, user } = await requireUser();
  if (!user) return { error: "Not authenticated." };

  if (!uuidSchema.safeParse(tastingId).success) {
    return { error: "Invalid tasting." };
  }
  const parsed = parse(blindResponseSchema, {
    blind_number: blindNumber,
    flavor_score: payload.flavor_score,
    texture_score: payload.texture_score,
    overall_score: payload.overall_score,
    notes: payload.notes,
    review_text: payload.review_text,
  });
  if (!parsed.ok) return { error: parsed.error };

  const { data: tasting } = await supabase
    .from("tastings")
    .select("state")
    .eq("id", tastingId)
    .single();

  if (tasting?.state !== "blind_active") {
    return { error: "The blind tasting is not open for edits." };
  }

  try {
    const { error } = await supabase.from("blind_responses").upsert(
      {
        tasting_id: tastingId,
        user_id: user.id,
        ...parsed.data,
      },
      { onConflict: "tasting_id,user_id,blind_number" }
    );
    if (error) return { error: error.message };
  } catch {
    return { error: "Couldn't save — check your connection." };
  }
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

  if (!uuidSchema.safeParse(tastingId).success) {
    return { error: "Invalid tasting." };
  }
  const parsed = parse(guessSchema, {
    blind_number: blindNumber,
    guess_primary: guessPrimary,
    guess_alternate: guessAlternate,
  });
  if (!parsed.ok) return { error: parsed.error };
  if (
    parsed.data.guess_primary &&
    parsed.data.guess_primary === parsed.data.guess_alternate
  ) {
    return { error: "Pick two different fish." };
  }

  const { data: tasting } = await supabase
    .from("tastings")
    .select("state")
    .eq("id", tastingId)
    .single();

  if (tasting?.state !== "guessing_active") {
    return { error: "Guessing is not currently open." };
  }

  const { data: participant } = await supabase
    .from("tasting_participants")
    .select("guesses_submitted_at")
    .eq("tasting_id", tastingId)
    .eq("user_id", user.id)
    .single();
  if (participant?.guesses_submitted_at) {
    return { error: "Your guesses are locked in." };
  }

  try {
    const { error } = await supabase.from("blind_responses").upsert(
      {
        tasting_id: tastingId,
        user_id: user.id,
        blind_number: blindNumber,
        guess_primary: parsed.data.guess_primary ?? null,
        guess_alternate: parsed.data.guess_alternate ?? null,
      },
      { onConflict: "tasting_id,user_id,blind_number" }
    );
    if (error) return { error: error.message };
  } catch {
    return { error: "Couldn't save — check your connection." };
  }
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
  if (!uuidSchema.safeParse(tastingId).success) {
    return { error: "Invalid tasting." };
  }

  try {
    const { error } = await supabase.rpc("publish_tasting_results", {
      p_tasting: tastingId,
    });
    if (error) return { error: error.message };
  } catch {
    return { error: "Couldn't reach the server. Please try again." };
  }

  revalidatePath(`/tastings/${tastingId}`);
  revalidatePath(`/tastings/${tastingId}/host`);
  revalidatePath(`/tastings/${tastingId}/results`);
  return { success: true };
}

/** Participant locks in their guesses (no more edits). */
export async function submitGuesses(tastingId: string) {
  const { supabase, user } = await requireUser();
  if (!user) return { error: "Not authenticated." };
  if (!uuidSchema.safeParse(tastingId).success) return { error: "Invalid tasting." };

  const { data: t } = await supabase.from("tastings").select("state").eq("id", tastingId).single();
  if (t?.state !== "guessing_active") return { error: "Guessing is not open." };

  try {
    const { error } = await supabase
      .from("tasting_participants")
      .update({ guesses_submitted_at: new Date().toISOString() })
      .eq("tasting_id", tastingId)
      .eq("user_id", user.id);
    if (error) return { error: error.message };
  } catch {
    return { error: "Couldn't reach the server. Please try again." };
  }
  revalidatePath(`/tastings/${tastingId}`);
  revalidatePath(`/tastings/${tastingId}/host`);
  return { success: true };
}

/** Host moves the tasting back one stage (not allowed once published). */
export async function regressTastingState(tastingId: string) {
  const { supabase, user } = await requireUser();
  if (!user) return { error: "Not authenticated." };
  if (!uuidSchema.safeParse(tastingId).success) return { error: "Invalid tasting." };

  const { data: t } = await supabase
    .from("tastings").select("state, host_user_id").eq("id", tastingId).single();
  if (!t) return { error: "Tasting not found." };
  if (t.host_user_id !== user.id) return { error: "Only the host can do that." };
  if (t.state === "published") return { error: "A published tasting can't be reopened." };

  const i = STATE_FLOW.indexOf(t.state as TastingState);
  if (i <= 0) return { error: "Already at the first stage." };
  const prev = STATE_FLOW[i - 1];

  try {
    const { error } = await supabase.from("tastings").update({ state: prev }).eq("id", tastingId);
    if (error) return { error: error.message };
    // Leaving the guessing stages entirely → unlock submissions so people can re-guess.
    if (!prev.startsWith("guessing")) {
      await supabase
        .from("tasting_participants")
        .update({ guesses_submitted_at: null })
        .eq("tasting_id", tastingId);
    }
  } catch {
    return { error: "Couldn't reach the server. Please try again." };
  }
  revalidatePath(`/tastings/${tastingId}`);
  revalidatePath(`/tastings/${tastingId}/host`);
  return { success: true, state: prev };
}
