"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { advanceTastingState } from "@/app/actions/tasting";

export function AdvanceButton({
  tastingId,
  label,
  confirm,
}: {
  tastingId: string;
  label: string;
  confirm?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <button
        onClick={() => {
          if (confirm && !window.confirm(confirm)) return;
          startTransition(async () => {
            const res = await advanceTastingState(tastingId);
            if (res?.error) setError(res.error);
            else router.refresh();
          });
        }}
        disabled={pending}
        className="rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
      >
        {pending ? "Working…" : label}
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
