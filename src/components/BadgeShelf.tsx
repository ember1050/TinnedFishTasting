import { Badge } from "@/components/Badge";

export type EarnedBadge = { kind: string; count: number };

/**
 * A row of a user's distinct earned badges. Each badge stacks via a count
 * bubble when earned more than once. Renders nothing when there are none.
 */
export function BadgeShelf({
  badges,
  size = 28,
  className = "",
}: {
  badges: EarnedBadge[];
  size?: number;
  className?: string;
}) {
  if (!badges || badges.length === 0) return null;
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      {badges.map((b) => (
        <Badge key={b.kind} kind={b.kind} count={b.count} size={size} />
      ))}
    </span>
  );
}
