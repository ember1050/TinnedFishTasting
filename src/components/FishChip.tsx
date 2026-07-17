import type { ReactNode } from "react";

/**
 * A size-normalized fish thumbnail. Images are already downscaled on upload
 * (≤1024px WebP); `object-contain` inside a fixed square keeps any dimensions
 * from blowing up the layout. Falls back to a fish emoji when there's no image.
 */
export function FishThumb({
  imageUrl,
  name,
  size = 40,
}: {
  imageUrl?: string | null;
  name?: string;
  size?: number;
}) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center overflow-hidden rounded-md border bg-white"
      style={{ width: size, height: size }}
    >
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={name ?? ""}
          className="h-full w-full object-contain p-0.5"
        />
      ) : (
        <span className="text-lg" aria-hidden="true">
          🐟
        </span>
      )}
    </span>
  );
}

/**
 * Compact fish identity: thumbnail + name + brand. Used wherever a fish is
 * listed (tasting report card, reveal, host views) so similar-named fish are
 * distinguishable at a glance.
 */
export function FishChip({
  name,
  brand,
  imageUrl,
  thumbSize = 40,
  trailing,
}: {
  name: string;
  brand?: string | null;
  imageUrl?: string | null;
  thumbSize?: number;
  trailing?: ReactNode;
}) {
  return (
    <span className="flex min-w-0 items-center gap-3">
      <FishThumb imageUrl={imageUrl} name={name} size={thumbSize} />
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium text-gray-900">
          {name}
        </span>
        {brand && (
          <span className="block truncate text-xs text-gray-500">{brand}</span>
        )}
      </span>
      {trailing}
    </span>
  );
}
