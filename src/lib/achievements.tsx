import type { ReactNode } from "react";

export type AchievementKind = "perfect_taste";

export type AchievementMeta = {
  kind: AchievementKind;
  label: string;
  description: string;
  icon: (props: { size?: number }) => ReactNode;
};

/** A gold rosette/medal used for the Perfect Taste badge. */
function PerfectTasteIcon({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
    >
      {/* ribbon tails */}
      <path d="M18 30 L14 46 L20 42 L24 46 L24 30 Z" fill="#2563eb" />
      <path d="M30 30 L34 46 L28 42 L24 46 L24 30 Z" fill="#1d4ed8" />
      {/* medal */}
      <circle cx="24" cy="20" r="15" fill="url(#pt-gold)" stroke="#b45309" strokeWidth="1.5" />
      <circle cx="24" cy="20" r="10.5" fill="none" stroke="#fde68a" strokeWidth="1.5" />
      {/* star */}
      <path
        d="M24 12 l2.6 5.3 5.8 0.8 -4.2 4.1 1 5.8 -5.2 -2.7 -5.2 2.7 1 -5.8 -4.2 -4.1 5.8 -0.8 Z"
        fill="#fffbeb"
        stroke="#f59e0b"
        strokeWidth="0.75"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient id="pt-gold" x1="9" y1="6" x2="39" y2="35" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fde047" />
          <stop offset="1" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export const ACHIEVEMENTS: Record<AchievementKind, AchievementMeta> = {
  perfect_taste: {
    kind: "perfect_taste",
    label: "Perfect Taste",
    description:
      "Matched every fish in a blind tasting correctly on the first guess.",
    icon: PerfectTasteIcon,
  },
};

export function getAchievementMeta(kind: string): AchievementMeta | null {
  return ACHIEVEMENTS[kind as AchievementKind] ?? null;
}
