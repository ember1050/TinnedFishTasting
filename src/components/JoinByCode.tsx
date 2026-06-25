"use client";

import { useActionState } from "react";
import { joinTastingByCode } from "@/app/actions/tasting";

export function JoinByCode() {
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string } | undefined, formData: FormData) => {
      return await joinTastingByCode(formData);
    },
    undefined
  );

  return (
    <div>
      <form action={formAction} className="flex gap-2">
        <input
          name="code"
          type="text"
          placeholder="Enter event code..."
          autoCapitalize="characters"
          className="rounded-md border border-gray-300 px-3 py-2 text-sm flex-1 max-w-xs uppercase"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {pending ? "Joining…" : "Join"}
        </button>
      </form>
      {state?.error && (
        <p className="mt-2 text-sm text-red-600">{state.error}</p>
      )}
    </div>
  );
}
