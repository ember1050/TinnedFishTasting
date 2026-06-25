"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

/**
 * Subscribes to Realtime changes for a tasting (state transitions + participant
 * joins) and refreshes the server component so every screen reacts live to the
 * host advancing the flow.
 */
export function TastingRealtime({ tastingId }: { tastingId: string }) {
  const router = useRouter();

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const channel = supabase
      .channel(`tasting:${tastingId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tastings",
          filter: `id=eq.${tastingId}`,
        },
        () => router.refresh()
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tasting_participants",
          filter: `tasting_id=eq.${tastingId}`,
        },
        () => router.refresh()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tastingId, router]);

  return null;
}
