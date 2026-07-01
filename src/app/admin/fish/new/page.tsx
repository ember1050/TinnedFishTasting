"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createFish } from "@/app/actions/fish";

export default function AdminFishEditPage() {
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string } | undefined, formData: FormData) => {
      return await createFish(formData);
    },
    undefined
  );

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href="/fish"
        className="text-sm text-blue-600 hover:underline mb-4 inline-block"
      >
        ← Back to fish list
      </Link>

      <h1 className="text-3xl font-bold mb-8">Add New Fish</h1>

      {state?.error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              name="name"
              type="text"
              required
              placeholder="e.g. Wild Sardines in Extra Virgin Olive Oil"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Brand *
            </label>
            <input
              name="brand"
              type="text"
              required
              placeholder="e.g. Wild Planet"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fish Type *
            </label>
            <select
              name="fish_type"
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">Select type...</option>
              <option value="sardine">Sardine</option>
              <option value="tuna">Tuna</option>
              <option value="mackerel">Mackerel</option>
              <option value="salmon">Salmon</option>
              <option value="anchovy">Anchovy</option>
              <option value="trout">Trout</option>
              <option value="herring">Herring</option>
              <option value="cod">Cod</option>
              <option value="mussel">Mussel</option>
              <option value="oyster">Oyster</option>
              <option value="clam">Clam</option>
              <option value="squid">Squid</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price (USD) *
            </label>
            <input
              name="price_usd"
              type="number"
              step="0.01"
              min="0"
              required
              placeholder="4.99"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <h2 className="text-lg font-semibold pt-4 border-t">Nutrition Facts</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Weight (g) *
            </label>
            <input
              name="weight_g"
              type="number"
              min="0"
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Calories *
            </label>
            <input
              name="calories"
              type="number"
              min="0"
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Protein (g) *
            </label>
            <input
              name="protein_g"
              type="number"
              min="0"
              step="0.1"
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fat (g)
            </label>
            <input
              name="fat_g"
              type="number"
              min="0"
              step="0.1"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sodium (mg)
          </label>
          <input
            name="sodium_mg"
            type="number"
            min="0"
            className="w-full max-w-xs rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Salt Level
          </label>
          <select
            name="salt_level"
            defaultValue="salted"
            className="w-full max-w-xs rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="salted">Salted (default)</option>
            <option value="low_sodium">Low sodium</option>
            <option value="no_salt">No salt</option>
          </select>
          <p className="text-xs text-gray-400 mt-1">
            Kept out of the product name; only low-sodium / no-salt are badged.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            rows={3}
            placeholder="Brief description of the product..."
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sourcing Notes
          </label>
          <input
            name="sourcing_notes"
            type="text"
            placeholder="e.g. Pacific Ocean, sustainably caught"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product Image
          </label>
          <input
            name="image"
            type="file"
            accept="image/*"
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        <div className="pt-4 border-t flex gap-3">
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
          >
            {pending ? "Saving..." : "Add Fish"}
          </button>
          <Link
            href="/fish"
            className="rounded-md px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
