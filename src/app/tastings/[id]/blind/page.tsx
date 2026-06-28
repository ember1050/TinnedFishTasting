import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getTastingContext,
  getTastingFish,
  getMyBlindResponses,
} from "@/lib/tastings";
import { TastingRealtime } from "@/components/TastingRealtime";
import { BlindTasting } from "@/components/BlindTasting";

export default async function BlindPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ctx = await getTastingContext(id);
  if (!ctx) notFound();

  const { tasting, isParticipant, userId } = ctx;

  // Only participants can score, and only while the blind stage is active.
  if (!isParticipant || !userId) {
    return (
      <Gate id={id} message="You need to join this tasting to take part." />
    );
  }
  if (tasting.state !== "blind_active") {
    return (
      <Gate
        id={id}
        message={
          tasting.state === "setup"
            ? "The host hasn't opened the blind tasting yet."
            : "Blind scoring is closed."
        }
      />
    );
  }

  // Pass ONLY blind numbers to the client — never the fish identities (blind!).
  const fish = await getTastingFish(id);
  const blindNumbers = fish.map((f) => f.blind_number);
  const myResponses = await getMyBlindResponses(id, userId);

  const initial: Record<number, Record<string, unknown>> = {};
  for (const r of myResponses) {
    initial[r.blind_number] = {
      flavor_score: r.flavor_score,
      texture_score: r.texture_score,
      overall_score: r.overall_score,
      notes: r.notes ?? "",
      review_text: r.review_text ?? "",
    };
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      <TastingRealtime tastingId={id} />
      <Link
        href={`/tastings/${id}`}
        className="text-sm text-blue-600 hover:underline mb-4 inline-block"
      >
        ← Back to tasting
      </Link>

      <h1 className="text-3xl font-bold mb-1">Blind Tasting</h1>
      <p className="text-gray-500 mb-8">
        Score each numbered tin and write your review — all without knowing which
        fish is which. Your answers save automatically; come back and tweak them
        until the host locks this stage.
      </p>

      <BlindTasting
        tastingId={id}
        blindNumbers={blindNumbers}
        initial={initial}
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
