"use client";

import { useActionState } from "react";
import { resetPassword } from "@/app/actions/auth";
import Link from "next/link";

export default function ResetPasswordPage() {
  const [state, formAction, pending] = useActionState(
    async (
      _prev: { error?: string; success?: string } | undefined,
      formData: FormData
    ) => {
      return await resetPassword(formData);
    },
    undefined
  );

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Reset Password</h1>
          <p className="text-sm text-gray-600 mt-1">
            Enter your email and we&apos;ll send you a reset link
          </p>
        </div>
        {state?.error && (
          <div className="bg-red-50 border border-red-200 rounded-md px-4 py-3 text-sm text-red-700">
            {state.error}
          </div>
        )}
        {state?.success && (
          <div className="bg-green-50 border border-green-200 rounded-md px-4 py-3 text-sm text-green-700">
            {state.success}
          </div>
        )}
        <form action={formAction} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
          >
            {pending ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500">
          <Link href="/auth/login" className="text-blue-600 hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
