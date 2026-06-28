"use server";

import { createHash } from "node:crypto";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { parse, fishSchema, reviewSchema } from "@/lib/validation";

/** Read a form field as a string (empty when missing or a file). */
function str(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === "string" ? v : "";
}

/** Optional numeric field — empty string becomes undefined for the schema. */
function optNum(formData: FormData, key: string): string | undefined {
  const v = str(formData, key);
  return v === "" ? undefined : v;
}

/** Confirm the current user is an admin. */
async function requireAdmin(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<{ ok: true } | { ok: false; error: string }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You must be logged in." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) return { ok: false, error: "Admin access required." };
  return { ok: true };
}

const FISH_IMAGE_BUCKET = "fish-images";
const MAX_FISH_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_FISH_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

/** Derive a stable extension from the file's MIME type so identical bytes
 * always map to the same storage path (content-addressing). Falls back to the
 * filename extension for unknown types. */
function extensionFor(mime: string, fileName: string): string {
  const byMime: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/avif": "avif",
  };
  return byMime[mime] || fileName.split(".").pop()?.toLowerCase() || "jpg";
}

/** Extract the in-bucket object path from a Supabase public URL. */
function storagePathFromUrl(url: string): string | null {
  const marker = `/${FISH_IMAGE_BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return url.slice(idx + marker.length);
}

function isDuplicateError(error: unknown): boolean {
  const e = error as { status?: number; statusCode?: string | number; message?: string };
  const status = String(e?.statusCode ?? e?.status ?? "");
  const message = (e?.message ?? "").toLowerCase();
  return status === "409" || message.includes("already exists") || message.includes("duplicate");
}

function fishImageRejectionReason(file: File): string | null {
  if (!ALLOWED_FISH_IMAGE_TYPES.has(file.type)) {
    return "Image must be a JPEG, PNG, WebP, GIF, or AVIF file.";
  }

  if (file.size > MAX_FISH_IMAGE_BYTES) {
    return "Image must be 5 MB or smaller.";
  }

  return null;
}

/**
 * Upload an image using a content-addressed path (sha256 of the bytes).
 * If identical content already exists in the bucket, it is reused rather than
 * re-uploaded. Returns the public URL, or null on failure.
 */
async function uploadFishImage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  file: File
): Promise<string | null> {
  if (fishImageRejectionReason(file)) {
    return null;
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const hash = createHash("sha256").update(bytes).digest("hex");
  const path = `${hash}.${extensionFor(file.type, file.name)}`;

  const storage = supabase.storage.from(FISH_IMAGE_BUCKET);
  const publicUrl = storage.getPublicUrl(path).data.publicUrl;

  // Dedup: skip the upload entirely if this exact content already exists.
  const { data: alreadyExists } = await storage.exists(path);
  if (alreadyExists) {
    return publicUrl;
  }

  const { error } = await storage.upload(path, bytes, {
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    // A concurrent upload may have created it between exists() and upload().
    if (isDuplicateError(error)) return publicUrl;
    console.error("Image upload error:", error.message);
    return null;
  }

  return publicUrl;
}

/**
 * Delete an image from storage only if no fish row still references it.
 * Safe to call after a row's image_url has already been updated/cleared.
 */
async function deleteImageIfOrphaned(
  supabase: Awaited<ReturnType<typeof createClient>>,
  url: string
): Promise<void> {
  const { count } = await supabase
    .from("fish")
    .select("id", { count: "exact", head: true })
    .eq("image_url", url);

  if ((count ?? 0) > 0) return; // still in use by at least one fish

  const path = storagePathFromUrl(url);
  if (!path) return;
  await supabase.storage.from(FISH_IMAGE_BUCKET).remove([path]);
}

export async function createFish(formData: FormData) {
  const supabase = await createClient();

  const admin = await requireAdmin(supabase);
  if (!admin.ok) return { error: admin.error };

  const parsed = parse(fishSchema, {
    name: str(formData, "name"),
    brand: str(formData, "brand"),
    fish_type: str(formData, "fish_type"),
    price_usd: str(formData, "price_usd"),
    weight_g: str(formData, "weight_g"),
    calories: str(formData, "calories"),
    protein_g: str(formData, "protein_g"),
    fat_g: optNum(formData, "fat_g"),
    sodium_mg: optNum(formData, "sodium_mg"),
    salt_level: str(formData, "salt_level") || "salted",
    description: str(formData, "description"),
    sourcing_notes: str(formData, "sourcing_notes"),
  });
  if (!parsed.ok) return { error: parsed.error };

  // Upload image first (content-addressed + deduplicated), then store its URL.
  const imageFile = formData.get("image") as File | null;
  let image_url: string | null = null;
  if (imageFile && imageFile.size > 0) {
    const imageError = fishImageRejectionReason(imageFile);
    if (imageError) {
      return { error: imageError };
    }

    image_url = await uploadFishImage(supabase, imageFile);
    if (!image_url) {
      return { error: "Image upload failed. Please try again." };
    }
  }

  try {
    const { error } = await supabase
      .from("fish")
      .insert({ ...parsed.data, image_url });
    if (error) return { error: error.message };
  } catch {
    return { error: "Couldn't reach the server. Please try again." };
  }

  redirect("/fish");
}

export async function updateFish(fishId: string, formData: FormData) {
  const supabase = await createClient();

  const admin = await requireAdmin(supabase);
  if (!admin.ok) return { error: admin.error };

  const parsed = parse(fishSchema, {
    name: str(formData, "name"),
    brand: str(formData, "brand"),
    fish_type: str(formData, "fish_type"),
    price_usd: str(formData, "price_usd"),
    weight_g: str(formData, "weight_g"),
    calories: str(formData, "calories"),
    protein_g: str(formData, "protein_g"),
    fat_g: optNum(formData, "fat_g"),
    sodium_mg: optNum(formData, "sodium_mg"),
    salt_level: str(formData, "salt_level") || "salted",
    description: str(formData, "description"),
    sourcing_notes: str(formData, "sourcing_notes"),
  });
  if (!parsed.ok) return { error: parsed.error };

  // Capture the current image so we can clean it up if it gets replaced.
  const { data: existing } = await supabase
    .from("fish")
    .select("image_url")
    .eq("id", fishId)
    .single();
  const oldImageUrl: string | null = existing?.image_url ?? null;

  // Handle image upload if provided (content-addressed + deduplicated).
  const imageFile = formData.get("image") as File | null;
  let image_url: string | undefined;
  if (imageFile && imageFile.size > 0) {
    const imageError = fishImageRejectionReason(imageFile);
    if (imageError) {
      return { error: imageError };
    }

    const url = await uploadFishImage(supabase, imageFile);
    if (!url) {
      return { error: "Image upload failed. Please try again." };
    }
    image_url = url;
  }

  try {
    const { error } = await supabase
      .from("fish")
      .update({
        ...parsed.data,
        ...(image_url ? { image_url } : {}),
      })
      .eq("id", fishId);
    if (error) return { error: error.message };
  } catch {
    return { error: "Couldn't reach the server. Please try again." };
  }

  // If the image was replaced with a different one, delete the old file —
  // but only when no other fish still references it.
  if (image_url && oldImageUrl && oldImageUrl !== image_url) {
    await deleteImageIfOrphaned(supabase, oldImageUrl);
  }

  redirect(`/fish/${fishId}`);
}

export async function submitReview(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to submit a review." };
  }

  const parsed = parse(reviewSchema, {
    fish_id: str(formData, "fish_id"),
    flavor_score: str(formData, "flavor_score"),
    texture_score: str(formData, "texture_score"),
    value_score: str(formData, "value_score"),
    overall_score: str(formData, "overall_score"),
    notes: str(formData, "notes"),
  });
  if (!parsed.ok) return { error: parsed.error };

  try {
    const { error } = await supabase.from("reviews").upsert(
      {
        user_id: user.id,
        ...parsed.data,
        is_from_tasting: false,
        tasting_id: null,
      },
      { onConflict: "user_id,fish_id" }
    );
    if (error) return { error: error.message };
  } catch {
    return { error: "Couldn't reach the server. Please try again." };
  }

  redirect(`/fish/${parsed.data.fish_id}`);
}
