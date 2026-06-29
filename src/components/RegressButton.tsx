"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { regressTastingState } from "@/app/actions/tasting";

export function RegressButton({ tastingId }: { tastingId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  return (
    <span>
      <button
        onClick={() => {
          if (!window.confirm("Go back one stage? Participants can edit again.")) return;
          start(async () => {
            const res = await regressTastingState(tastingId);
            if (res?.error) setError(res.error);
            else router.refresh();
          });
        }}
        disabled={pending}
        className="rounded-md border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
      >
        {pending ? "…" : "← Back a stage"}
      </button>
      {error && <span className="ml-2 text-sm text-red-600">{error}</span>}
    </span>
  );
}
