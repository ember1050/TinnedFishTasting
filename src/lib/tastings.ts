import { createClient } from "@/lib/supabase/server";
import type { Fish, Tasting, TastingState } from "@/lib/types";

export interface TastingFishEntry {
  blind_number: number;
  fish: Fish;
}

export interface ParticipantEntry {
  user_id: string;
  display_name: string;
  joined_at: string;
}

/** Fetch a tasting row (RLS limits visibility to public ones, host, or participants). */
export async function getTasting(id: string): Promise<Tasting | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tastings")
    .select("*")
    .eq("id", id)
    .single();
  return (data as Tasting) ?? null;
}

/** Fish assigned to a tasting, ordered by blind number. */
export async function getTastingFish(
  tastingId: string
): Promise<TastingFishEntry[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tasting_fish")
    .select("blind_number, fish:fish_id(*)")
    .eq("tasting_id", tastingId)
    .order("blind_number", { ascending: true });

  return (
    (data as unknown as { blind_number: number; fish: Fish }[]) ?? []
  ).map((r) => ({ blind_number: r.blind_number, fish: r.fish }));
}

/** Participants with their display names. */
export async function getParticipants(
  tastingId: string
): Promise<ParticipantEntry[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tasting_participants")
    .select("user_id, joined_at, profiles(display_name)")
    .eq("tasting_id", tastingId)
    .order("joined_at", { ascending: true });

  return (
    (data as unknown as {
      user_id: string;
      joined_at: string;
      profiles: { display_name: string } | null;
    }[]) ?? []
  ).map((r) => ({
    user_id: r.user_id,
    joined_at: r.joined_at,
    display_name: r.profiles?.display_name ?? "Anonymous",
  }));
}

/** The current user's blind responses for a tasting, keyed by blind number. */
export async function getMyBlindResponses(tastingId: string, userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("blind_responses")
    .select("*")
    .eq("tasting_id", tastingId)
    .eq("user_id", userId);
  return data ?? [];
}

/** Public tastings for the hub listing. */
export async function getPublicTastings(): Promise<
  (Tasting & { participant_count: number })[]
> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tastings")
    .select("*, tasting_participants(count)")
    .eq("is_public", true)
    .order("created_at", { ascending: false });

  return (
    (data as unknown as (Tasting & {
      tasting_participants: { count: number }[];
    })[]) ?? []
  ).map((t) => ({
    ...t,
    participant_count: t.tasting_participants?.[0]?.count ?? 0,
  }));
}

/** Tastings the current user is hosting or has joined (most recent first). */
export async function getMyTastings(
  userId: string
): Promise<(Tasting & { is_host: boolean })[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tasting_participants")
    .select("tastings(*)")
    .eq("user_id", userId);

  const tastings = (
    (data as unknown as { tastings: Tasting | null }[]) ?? []
  )
    .map((r) => r.tastings)
    .filter((t): t is Tasting => t !== null)
    .map((t) => ({ ...t, is_host: t.host_user_id === userId }));

  tastings.sort((a, b) => b.created_at.localeCompare(a.created_at));
  return tastings;
}

export interface TastingContext {
  tasting: Tasting;
  isHost: boolean;
  isParticipant: boolean;
  userId: string | null;
}

/** Resolve viewer relationship to a tasting in one call. */
export async function getTastingContext(
  id: string
): Promise<TastingContext | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const tasting = await getTasting(id);
  if (!tasting) return null;

  let isParticipant = false;
  if (user) {
    const { data: p } = await supabase
      .from("tasting_participants")
      .select("user_id")
      .eq("tasting_id", id)
      .eq("user_id", user.id)
      .maybeSingle();
    isParticipant = !!p;
  }

  return {
    tasting,
    isHost: !!user && tasting.host_user_id === user.id,
    isParticipant,
    userId: user?.id ?? null,
  };
}

export const STATE_LABELS: Record<TastingState, string> = {
  setup: "Setup",
  blind_active: "Blind tasting",
  blind_locked: "Interlude",
  guessing_active: "Guessing",
  guessing_locked: "Wrapping up",
  published: "Published",
};
