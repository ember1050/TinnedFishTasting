"use client";

import { useActionState, useEffect, useState } from "react";
import { submitFeedback } from "@/app/actions/feedback";

type FeedbackModalProps = {
  open: boolean;
  onClose: () => void;
};

type FeedbackState = {
  error?: string;
  success?: boolean;
};

const initialState: FeedbackState = {};

function FeedbackDialog({ onClose }: { onClose: () => void }) {
  const [pageUrl, setPageUrl] = useState("");
  const [state, formAction, pending] = useActionState(
    async (_prevState: FeedbackState, formData: FormData) => {
      return await submitFeedback(formData);
    },
    initialState
  );

  useEffect(() => {
    setPageUrl(window.location.pathname);
  }, []);

  useEffect(() => {
    if (!state.success) return;

    const timeout = window.setTimeout(onClose, 1200);
    return () => window.clearTimeout(timeout);
  }, [onClose, state.success]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onMouseDown={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="feedback-title"
        className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        {state.success ? (
          <div className="space-y-4 text-center">
            <h2 id="feedback-title" className="text-2xl font-bold">
              Thanks!
            </h2>
            <p className="text-sm text-gray-600">
              Your feedback has been sent.
            </p>
            <button
              type="button"
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 id="feedback-title" className="text-2xl font-bold">
                  Send Feedback
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Report a bug or request a feature.
                </p>
              </div>
              <button
                type="button"
                className="text-2xl leading-none text-gray-400 hover:text-gray-700"
                aria-label="Close feedback modal"
                onClick={onClose}
              >
                ×
              </button>
            </div>

            {state.error && (
              <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {state.error}
              </div>
            )}

            <form action={formAction} className="space-y-5">
              <input type="hidden" name="page_url" value={pageUrl} />

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Type
                </label>
                <select
                  name="type"
                  defaultValue="bug"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="bug">Bug</option>
                  <option value="feature">Feature request</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="feedback-message"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Message
                </label>
                <textarea
                  id="feedback-message"
                  name="message"
                  required
                  maxLength={4000}
                  rows={6}
                  placeholder="What should we fix or build?"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {pending ? "Sending..." : "Submit"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export function FeedbackModal({ open, onClose }: FeedbackModalProps) {
  const [resetKey, setResetKey] = useState(0);

  useEffect(() => {
    if (open) {
      setResetKey((key) => key + 1);
    }
  }, [open]);

  if (!open) return null;

  return <FeedbackDialog key={resetKey} onClose={onClose} />;
}
