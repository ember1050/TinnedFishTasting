import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  getTastingContext,
  getParticipants,
  getTastingFish,
  STATE_LABELS,
} from "@/lib/tastings";
import { TastingRealtime } from "@/components/TastingRealtime";
import { JoinPublicButton } from "@/components/JoinPublicButton";
import { LeaveButton } from "@/components/LeaveButton";
import { FishBaseballCards } from "@/components/FishBaseballCards";
import type { Fish } from "@/lib/types";

export default async function TastingLobbyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ctx = await getTastingContext(id);
  if (!ctx) notFound();

  // The host's default view is the control panel, not the participant lobby.
  if (ctx.isHost) {
    redirect(`/tastings/${id}/host`);
  }

  const { tasting, isHost, isParticipant, userId } = ctx;
  const [participants, fish] = await Promise.all([
    getParticipants(id),
    getTastingFish(id),
  ]);

  const canSeeCode = (isHost || isParticipant) && tasting.event_code;

  // Candidate pool for the interlude — names only, sorted so the order doesn't
  // leak the blind-number mapping.
  const candidateFish = [...fish]
    .map((f) => f.fish)
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      <TastingRealtime tastingId={id} />

      <Link
        href="/tastings"
        className="text-sm text-blue-600 hover:underline mb-4 inline-block"
      >
        ← Back to tastings
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">{tasting.title}</h1>
          <p className="text-gray-500 mt-1">
            {tasting.is_public ? "Public" : "Private"} • {fish.length} fish •{" "}
            {participants.length} participant
            {participants.length !== 1 && "s"}
          </p>
        </div>
        <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20">
          {STATE_LABELS[tasting.state]}
        </span>
      </div>

      {canSeeCode && (
        <div className="mb-6 inline-flex items-center gap-2 rounded-md bg-gray-50 border px-4 py-2">
          <span className="text-sm text-gray-500">Event code:</span>
          <span className="font-mono text-lg font-bold tracking-widest">
            {tasting.event_code}
          </span>
        </div>
      )}

      {/* Join prompt for non-participants on a public tasting */}
      {!isParticipant && userId && (
        <div className="mb-8 p-5 bg-blue-50 border border-blue-100 rounded-lg">
          <p className="text-sm text-blue-900 mb-3">
            You haven&apos;t joined this tasting yet.
          </p>
          <JoinPublicButton tastingId={id} />
        </div>
      )}
      {!userId && (
        <div className="mb-8 p-5 bg-gray-50 border rounded-lg">
          <p className="text-sm text-gray-700">
            <Link href="/auth/login" className="text-blue-600 hover:underline">
              Log in
            </Link>{" "}
            to join this tasting.
          </p>
        </div>
      )}

      {/* Participants */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Participants</h2>
        <div className="flex flex-wrap gap-2">
          {participants.map((p) => (
            <span
              key={p.user_id}
              className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm"
            >
              {p.display_name}
              {p.user_id === tasting.host_user_id && (
                <span className="ml-1 text-xs text-gray-400">(host)</span>
              )}
            </span>
          ))}
        </div>
      </section>

      {/* State-driven action */}
      {isParticipant && (
        <section className="mb-8">
          <StageAction
            state={tasting.state}
            tastingId={id}
            candidateFish={candidateFish}
          />
        </section>
      )}

      {/* Host controls */}
      {isHost && (
        <div className="mt-8 p-4 bg-amber-50 rounded-lg border border-amber-200">
          <p className="text-sm text-amber-800">
            <strong>You&apos;re the host.</strong>{" "}
            <Link
              href={`/tastings/${id}/host`}
              className="text-amber-700 underline hover:text-amber-900"
            >
              Open the host control panel →
            </Link>
          </p>
        </div>
      )}

      {/* Leave (participants only; the host can't abandon their tasting) */}
      {isParticipant && !isHost && (
        <div className="mt-8 pt-4 border-t">
          <LeaveButton tastingId={id} />
        </div>
      )}
    </div>
  );
}

function StageAction({
  state,
  tastingId,
  candidateFish,
}: {
  state: string;
  tastingId: string;
  candidateFish: Fish[];
}) {
  const card = "block border-2 rounded-xl p-6 transition-all";

  switch (state) {
    case "setup":
      return (
        <div className="rounded-lg bg-gray-50 border p-6 text-center text-gray-500">
          The host is still setting up. Hang tight — this page updates
          automatically.
        </div>
      );
    case "blind_active":
      return (
        <Link
          href={`/tastings/${tastingId}/blind`}
          className={`${card} border-blue-200 hover:border-blue-400 hover:shadow-md`}
        >
          <div className="text-3xl mb-3">🙈</div>
          <h3 className="text-xl font-bold mb-1">Blind Tasting</h3>
          <p className="text-sm text-gray-500">
            Score each numbered tin and write your review — all blind. Open it
            and go.
          </p>
          <span className="mt-4 inline-flex text-sm font-medium text-blue-600">
            Start →
          </span>
        </Link>
      );
    case "blind_locked":
      return (
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-6">
          <div className="text-center text-amber-800">
            <div className="text-3xl mb-2">👂</div>
            Blind scoring is locked. Here are the fish in this tasting — follow
            along as the host introduces them. Guessing opens next.
          </div>
          <FishBaseballCards fish={candidateFish} />
        </div>
      );
    case "guessing_active":
      return (
        <Link
          href={`/tastings/${tastingId}/guess`}
          className={`${card} border-purple-200 hover:border-purple-400 hover:shadow-md`}
        >
          <div className="text-3xl mb-3">🔍</div>
          <h3 className="text-xl font-bold mb-1">Guess the Fish</h3>
          <p className="text-sm text-gray-500">
            Match each numbered tin to a fish — a first pick and a backup. Your
            notes are there to help.
          </p>
          <span className="mt-4 inline-flex text-sm font-medium text-purple-600">
            Start →
          </span>
        </Link>
      );
    case "guessing_locked":
      return (
        <div className="rounded-lg bg-gray-50 border p-6 text-center text-gray-500">
          Guesses are in! Waiting for the host to publish the results.
        </div>
      );
    case "published":
      return (
        <Link
          href={`/tastings/${tastingId}/results`}
          className={`${card} border-green-200 hover:border-green-400 hover:shadow-md`}
        >
          <div className="text-3xl mb-3">🏆</div>
          <h3 className="text-xl font-bold mb-1">Results</h3>
          <p className="text-sm text-gray-500">
            See how you did and the group&apos;s final rankings.
          </p>
          <span className="mt-4 inline-flex text-sm font-medium text-green-600">
            View results →
          </span>
        </Link>
      );
    default:
      return null;
  }
}
