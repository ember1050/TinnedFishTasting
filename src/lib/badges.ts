import { createClient } from "@/lib/supabase/server";
import type { EarnedBadge } from "@/components/BadgeShelf";

/** Aggregate a single user's achievements into distinct kinds with counts. */
export async function getBadgesForUser(userId: string): Promise<EarnedBadge[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_achievements")
    .select("kind")
    .eq("user_id", userId);
  return aggregate((data ?? []).map((r) => ({ user_id: userId, kind: r.kind })));
}

/**
 * Batch version for lists (e.g. reviews on a fish page): one query for many
 * users, returning a map of user_id → their distinct badges with counts.
 */
export async function getBadgesForUsers(
  userIds: string[]
): Promise<Map<string, EarnedBadge[]>> {
  const result = new Map<string, EarnedBadge[]>();
  const unique = [...new Set(userIds)].filter(Boolean);
  if (unique.length === 0) return result;

  const supabase = await createClient();
  const { data } = await supabase
    .from("user_achievements")
    .select("user_id, kind")
    .in("user_id", unique);

  const byUser = new Map<string, { user_id: string; kind: string }[]>();
  for (const row of data ?? []) {
    const arr = byUser.get(row.user_id) ?? [];
    arr.push(row);
    byUser.set(row.user_id, arr);
  }
  for (const [uid, rows] of byUser) result.set(uid, aggregate(rows));
  return result;
}

function aggregate(rows: { user_id: string; kind: string }[]): EarnedBadge[] {
  const counts = new Map<string, number>();
  for (const r of rows) counts.set(r.kind, (counts.get(r.kind) ?? 0) + 1);
  return [...counts.entries()].map(([kind, count]) => ({ kind, count }));
}
