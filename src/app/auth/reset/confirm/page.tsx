"use client";

import { Suspense } from "react";
import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { setRecoveryPassword } from "@/app/actions/auth";

function ResetConfirmForm() {
  const linkError = useSearchParams().get("error");
  const [state, action, pending] = useActionState(
    async (_p: { error?: string; success?: string } | undefined, fd: FormData) =>
      setRecoveryPassword(fd),
    undefined
  );

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-bold mb-2">Set a new password</h1>
      <p className="text-sm text-gray-500 mb-6">
        Choose a new password for your account.
      </p>

      {linkError && !state?.success && (
        <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          This reset link is invalid or has expired.{" "}
          <Link href="/auth/reset" className="underline">
            Request a new one
          </Link>
          .
        </div>
      )}

      <form action={action} className="space-y-4">
        <input
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="New password"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <input
          name="confirm_password"
          type="password"
          autoComplete="new-password"
          placeholder="Confirm new password"
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
            {state.success}{" "}
            <Link href="/profile" className="underline">
              Go to profile
            </Link>
          </p>
        )}
      </form>

      <p className="mt-6 text-sm text-gray-500">
        Need a new link?{" "}
        <Link href="/auth/reset" className="text-blue-600 hover:underline">
          Reset again
        </Link>
      </p>
    </div>
  );
}

export default function ResetConfirmPage() {
  return (
    <Suspense>
      <ResetConfirmForm />
    </Suspense>
  );
}
