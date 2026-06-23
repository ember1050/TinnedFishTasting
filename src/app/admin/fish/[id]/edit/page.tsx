"use client";

import { useActionState } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { updateFish } from "@/app/actions/fish";
import { createBrowserClient } from "@supabase/ssr";

interface FishData {
  id: string;
  name: string;
  brand: string;
  fish_type: string;
  price_usd: number;
  weight_g: number;
  calories: number;
  protein_g: number;
  fat_g: number | null;
  sodium_mg: number | null;
  description: string | null;
  sourcing_notes: string | null;
  image_url: string | null;
}

export default function AdminFishEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [fishId, setFishId] = useState<string>("");
  const [fish, setFish] = useState<FishData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then(({ id }) => {
      setFishId(id);
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      supabase
        .from("fish")
        .select("*")
        .eq("id", id)
        .single()
        .then(({ data }) => {
          setFish(data);
          setLoading(false);
        });
    });
  }, [params]);

  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string } | undefined, formData: FormData) => {
      return await updateFish(fishId, formData);
    },
    undefined
  );

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <p className="text-gray-500">Loading fish data...</p>
      </div>
    );
  }

  if (!fish) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <p className="text-red-600">Fish not found.</p>
        <Link href="/fish" className="text-sm text-blue-600 hover:underline">
          ← Back to fish list
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href={`/fish/${fishId}`}
        className="text-sm text-blue-600 hover:underline mb-4 inline-block"
      >
        ← Back to fish detail
      </Link>

      <h1 className="text-3xl font-bold mb-8">Edit Fish</h1>

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
              defaultValue={fish.name}
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
              defaultValue={fish.brand}
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
              defaultValue={fish.fish_type}
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
              defaultValue={fish.price_usd}
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
              defaultValue={fish.weight_g}
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
              defaultValue={fish.calories}
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
              defaultValue={fish.protein_g}
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
              defaultValue={fish.fat_g ?? ""}
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
            defaultValue={fish.sodium_mg ?? ""}
            className="w-full max-w-xs rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            rows={3}
            defaultValue={fish.description ?? ""}
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
            defaultValue={fish.sourcing_notes ?? ""}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        {/* Image upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product Image
          </label>
          {fish.image_url && (
            <div className="mb-3">
              <img
                src={fish.image_url}
                alt={fish.name}
                className="w-32 h-32 object-cover rounded-lg border"
              />
              <p className="text-xs text-gray-400 mt-1">Current image</p>
            </div>
          )}
          <input
            name="image"
            type="file"
            accept="image/*"
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <p className="text-xs text-gray-400 mt-1">Upload a new image to replace the current one</p>
        </div>

        <div className="pt-4 border-t flex gap-3">
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
          >
            {pending ? "Saving..." : "Save Changes"}
          </button>
          <Link
            href={`/fish/${fishId}`}
            className="rounded-md px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
