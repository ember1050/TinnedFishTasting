import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getTastingContext,
  getTastingFish,
  STATE_LABELS,
} from "@/lib/tastings";
import { TastingRealtime } from "@/components/TastingRealtime";
import { AdvanceButton } from "@/components/AdvanceButton";
import type { TastingState } from "@/lib/types";

const FLOW: TastingState[] = [
  "setup",
  "blind_active",
  "blind_locked",
  "guessing_active",
  "guessing_locked",
  "published",
];

const ADVANCE: Record<
  TastingState,
  { label: string; confirm?: string } | null
> = {
  setup: { label: "Open blind tasting →" },
  blind_active: {
    label: "Lock blind scoring & start interlude →",
    confirm:
      "Lock blind scoring? Participants will no longer be able to edit their scores or reviews.",
  },
  blind_locked: { label: "Open guessing →" },
  guessing_active: { label: "Lock guessing →" },
  guessing_locked: {
    label: "Publish results →",
    confirm:
      "Publish results? Every participant's blind review goes live on the fish pages and results are revealed.",
  },
  published: null,
};

export default async function HostControlPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ctx = await getTastingContext(id);
  if (!ctx) notFound();
  if (!ctx.isHost) {
    // Non-hosts don't get the control panel.
    notFound();
  }

  const { tasting } = ctx;
  const fish = await getTastingFish(id);

  const supabase = await createClient();
  const { data: progress } = await supabase.rpc("tasting_submission_counts", {
    p_tasting: id,
  });
  const rows =
    (progress as {
      user_id: string;
      display_name: string;
      scored: number;
      guessed: number;
    }[]) ?? [];

  const currentIndex = FLOW.indexOf(tasting.state);
  const advance = ADVANCE[tasting.state];
  const showScored = ["blind_active", "blind_locked"].includes(tasting.state);
  const showGuessed = ["guessing_active", "guessing_locked"].includes(
    tasting.state
  );

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      <TastingRealtime tastingId={id} />

      <Link
        href={`/tastings/${id}`}
        className="text-sm text-blue-600 hover:underline mb-4 inline-block"
      >
        ← Back to tasting
      </Link>

      <h1 className="text-3xl font-bold mb-1">Host Controls</h1>
      <p className="text-gray-500 mb-8">{tasting.title}</p>

      {/* Flow progress */}
      <div className="mb-8 flex flex-wrap items-center gap-2">
        {FLOW.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                i < currentIndex
                  ? "bg-green-100 text-green-700"
                  : i === currentIndex
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-400"
              }`}
            >
              {STATE_LABELS[s]}
            </span>
            {i < FLOW.length - 1 && <span className="text-gray-300">→</span>}
          </div>
        ))}
      </div>

      {/* Current state + advance */}
      <div className="mb-8 rounded-lg border p-6 bg-gray-50">
        <p className="text-sm text-gray-500 mb-1">Current stage</p>
        <p className="text-xl font-bold mb-4">{STATE_LABELS[tasting.state]}</p>
        {advance ? (
          <AdvanceButton
            tastingId={id}
            label={advance.label}
            confirm={advance.confirm}
          />
        ) : (
          <p className="text-sm text-green-700 font-medium">
            ✓ This tasting is published.{" "}
            <Link href={`/tastings/${id}/results`} className="underline">
              View results
            </Link>
          </p>
        )}
        {tasting.state === "blind_locked" && (
          <p className="mt-3 text-sm text-amber-700">
            Interlude: present the candidate fish to the room, then open
            guessing when everyone&apos;s ready.
          </p>
        )}
      </div>

      {/* Answer key — host only */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">
          Answer Key{" "}
          <span className="text-xs font-normal text-gray-400">
            (only you can see this)
          </span>
        </h2>
        <div className="rounded-lg border divide-y">
          {fish.map((tf) => (
            <div
              key={tf.blind_number}
              className="flex items-center gap-3 px-4 py-2 text-sm"
            >
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-xs font-semibold text-white">
                {tf.blind_number}
              </span>
              <span className="font-medium">{tf.fish.name}</span>
              <span className="text-gray-400">{tf.fish.brand}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Participant progress */}
      <section>
        <h2 className="text-lg font-semibold mb-3">
          Participants ({rows.length})
        </h2>
        {rows.length === 0 ? (
          <p className="text-sm text-gray-400">No one has joined yet.</p>
        ) : (
          <div className="rounded-lg border divide-y">
            {rows.map((r) => (
              <div
                key={r.user_id}
                className="flex items-center justify-between px-4 py-2 text-sm"
              >
                <span className="font-medium">{r.display_name}</span>
                <span className="text-gray-500">
                  {showScored && `${r.scored}/${fish.length} scored`}
                  {showGuessed && `${r.guessed}/${fish.length} guessed`}
                  {!showScored && !showGuessed && "—"}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
