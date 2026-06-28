"use client";

import { useActionState } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { submitReview } from "@/app/actions/fish";
import { createBrowserClient } from "@supabase/ssr";
import { RatingSlider } from "@/components/RatingSlider";

interface FishBasic {
  id: string;
  name: string;
  brand: string;
  fish_type: string;
}

export default function ReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [fishId, setFishId] = useState("");
  const [fish, setFish] = useState<FishBasic | null>(null);
  const [hasExisting, setHasExisting] = useState(false);
  const [loading, setLoading] = useState(true);

  const [flavor, setFlavor] = useState<number | null>(null);
  const [texture, setTexture] = useState<number | null>(null);
  const [value, setValue] = useState<number | null>(null);
  const [overall, setOverall] = useState<number | null>(null);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    let cancelled = false;

    params.then(({ id }) => {
      setFishId(id);
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      async function loadPageData() {
        const [{ data: fishData }, { data: userData }] = await Promise.all([
          supabase
            .from("fish")
            .select("id, name, brand, fish_type")
            .eq("id", id)
            .single(),
          supabase.auth.getUser(),
        ]);

        if (cancelled) return;
        setFish(fishData);

        const user = userData.user;
        if (user) {
          const { data: reviewData } = await supabase
            .from("reviews")
            .select("flavor_score, texture_score, value_score, overall_score, notes")
            .eq("fish_id", id)
            .eq("user_id", user.id)
            .maybeSingle();

          if (cancelled) return;

          if (reviewData) {
            setHasExisting(true);
            setFlavor(reviewData.flavor_score ?? null);
            setTexture(reviewData.texture_score ?? null);
            setValue(reviewData.value_score ?? null);
            setOverall(reviewData.overall_score ?? null);
            setNotes(reviewData.notes ?? "");
          }
        }

        setLoading(false);
      }

      loadPageData();
    });

    return () => {
      cancelled = true;
    };
  }, [params]);

  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string } | undefined, formData: FormData) => {
      return await submitReview(formData);
    },
    undefined
  );

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!fish) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <p className="text-red-600">Fish not found.</p>
      </div>
    );
  }

  const allSet =
    flavor !== null && texture !== null && value !== null && overall !== null;

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href={`/fish/${fishId}`}
        className="text-sm text-blue-600 hover:underline mb-4 inline-block"
      >
        ← Back to {fish.name}
      </Link>

      <h1 className="text-2xl font-bold mb-1">Review</h1>
      <p className="text-gray-500 mb-6">
        {fish.name} • {fish.brand}
      </p>

      {state?.error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      {hasExisting && (
        <div className="mb-6 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          You already have a review for this fish. Submitting will replace your
          existing review.
        </div>
      )}

      <form action={formAction} className="space-y-6">
        <input type="hidden" name="fish_id" value={fishId} />
        <input type="hidden" name="flavor_score" value={flavor ?? ""} />
        <input type="hidden" name="texture_score" value={texture ?? ""} />
        <input type="hidden" name="value_score" value={value ?? ""} />
        <input type="hidden" name="overall_score" value={overall ?? ""} />

        {/* Score sliders */}
        <div className="space-y-5 bg-gray-50 rounded-lg p-6">
          <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wide mb-2">
            Scores
          </h2>
          <RatingSlider label="Flavor" value={flavor} onChange={setFlavor} />
          <RatingSlider label="Texture" value={texture} onChange={setTexture} />
          <RatingSlider
            label="Value for Money"
            value={value}
            onChange={setValue}
          />
          <div className="pt-3 border-t">
            <RatingSlider label="Overall" value={overall} onChange={setOverall} />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes (optional)
          </label>
          <textarea
            name="notes"
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="What stood out? How did you enjoy it? Any pairing suggestions?"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        {!allSet && (
          <p className="text-sm text-amber-700">
            Move every slider to set all four scores before submitting.
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={pending || !allSet}
            className="rounded-md bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
          >
            {pending
              ? "Submitting..."
              : hasExisting
                ? "Update Review"
                : "Submit Review"}
          </button>
          <Link
            href={`/fish/${fishId}`}
            className="rounded-md px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
