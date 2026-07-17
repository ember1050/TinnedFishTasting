import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getTastingContext,
  getTastingFish,
  getMyBlindResponses,
} from "@/lib/tastings";
import { TastingRealtime } from "@/components/TastingRealtime";
import { GuessGame } from "@/components/GuessGame";
import { createClient } from "@/lib/supabase/server";

export default async function GuessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ctx = await getTastingContext(id);
  if (!ctx) notFound();

  const { tasting, isParticipant, userId } = ctx;

  if (!isParticipant || !userId) {
    return <Gate id={id} message="You need to join this tasting to take part." />;
  }
  if (tasting.state !== "guessing_active") {
    return (
      <Gate
        id={id}
        message={
          tasting.state === "blind_active" || tasting.state === "blind_locked"
            ? "Guessing hasn't opened yet."
            : "Guessing is closed."
        }
      />
    );
  }

  const fish = await getTastingFish(id);
  const myResponses = await getMyBlindResponses(id, userId);
  const byNumber = new Map(myResponses.map((r) => [r.blind_number, r]));

  // Has this participant locked their guesses?
  const supabase = await createClient();
  const { data: meRow } = await supabase
    .from("tasting_participants")
    .select("guesses_submitted_at")
    .eq("tasting_id", id)
    .eq("user_id", userId)
    .maybeSingle();
  const submitted = Boolean(meRow?.guesses_submitted_at);

  // Candidate pool — sorted alphabetically so order doesn't leak the mapping.
  const candidates = fish
    .map((f) => ({
      fish_id: f.fish.id,
      name: f.fish.name,
      brand: f.fish.brand,
      image_url: f.fish.image_url,
    }))
    .sort((a, b) =>
      `${a.name} ${a.brand}`.localeCompare(`${b.name} ${b.brand}`)
    );

  const tins = fish.map((f) => {
    const r = byNumber.get(f.blind_number);
    return {
      blind_number: f.blind_number,
      notes: (r?.notes as string) ?? "",
      primary: (r?.guess_primary as string) ?? "",
      alternate: (r?.guess_alternate as string) ?? "",
    };
  });

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      <TastingRealtime tastingId={id} />
      <Link
        href={`/tastings/${id}`}
        className="text-sm text-blue-600 hover:underline mb-4 inline-block"
      >
        ← Back to tasting
      </Link>

      <h1 className="text-3xl font-bold mb-1">Guess the Fish</h1>
      <p className="text-gray-500 mb-8">
        Match each numbered tin to a fish — a first guess and an optional backup.
        Your notes from the blind round are shown to jog your memory. Guesses
        save automatically.
      </p>

      <GuessGame
        tastingId={id}
        tins={tins}
        candidates={candidates}
        submitted={submitted}
      />
    </div>
  );
}

function Gate({ id, message }: { id: string; message: string }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <p className="text-gray-600 mb-4">{message}</p>
      <Link
        href={`/tastings/${id}`}
        className="text-blue-600 hover:underline text-sm"
      >
        ← Back to tasting
      </Link>
    </div>
  );
}
