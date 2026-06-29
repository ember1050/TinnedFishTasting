"use client";

import { useActionState } from "react";
import Link from "next/link";
import { updatePassword } from "@/app/actions/profile";

export default function ResetConfirmPage() {
  const [state, action, pending] = useActionState(
    async (_p: { error?: string; success?: string } | undefined, fd: FormData) =>
      updatePassword(fd),
    undefined
  );

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-bold mb-2">Set a new password</h1>
      <p className="text-sm text-gray-500 mb-6">
        Choose a new password for your account.
      </p>
      <form action={action} className="space-y-4">
        <input
          name="password"
          type="password"
          placeholder="New password"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <button
          disabled={pending}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
        >
          {pending ? "Saving…" : "Update password"}
        </button>
        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
        {state?.success && (
          <p className="text-sm text-green-600">
            {state.success} <Link href="/profile" className="underline">Go to profile</Link>
          </p>
        )}
      </form>
    </div>
  );
}
