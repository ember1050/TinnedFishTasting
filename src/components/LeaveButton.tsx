"use client";

import { useState, useTransition } from "react";
import { leaveTasting } from "@/app/actions/tasting";

export function LeaveButton({ tastingId }: { tastingId: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <span>
      <button
        onClick={() => {
          if (!window.confirm("Leave this tasting?")) return;
          startTransition(async () => {
            const res = await leaveTasting(tastingId);
            if (res?.error) setError(res.error);
          });
        }}
        disabled={pending}
        className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-50"
      >
        {pending ? "Leaving…" : "Leave tasting"}
      </button>
      {error && <span className="ml-2 text-sm text-red-600">{error}</span>}
    </span>
  );
}
