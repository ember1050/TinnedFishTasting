import { redirect } from "next/navigation";

// The comprehensive phase was removed in the v1 tasting rework; the review is
// now captured during the blind stage. Redirect any stale links to the lobby.
export default async function ComprehensiveRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/tastings/${id}`);
}
