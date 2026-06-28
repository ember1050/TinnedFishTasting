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
        className="text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
      >
        {pending ? "Leaving…" : "Leave tasting"}
      </button>
      {error && <span className="ml-2 text-sm text-red-600">{error}</span>}
    </span>
  );
}
