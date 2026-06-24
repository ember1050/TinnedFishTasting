"use server";

import { createHash } from "node:crypto";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const FISH_IMAGE_BUCKET = "fish-images";

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

/**
 * Upload an image using a content-addressed path (sha256 of the bytes).
 * If identical content already exists in the bucket, it is reused rather than
 * re-uploaded. Returns the public URL, or null on failure.
 */
async function uploadFishImage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  file: File
): Promise<string | null> {
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in." };
  }

  // Check admin status
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    return { error: "Admin access required." };
  }

  const name = formData.get("name") as string;
  const brand = formData.get("brand") as string;
  const fish_type = formData.get("fish_type") as string;
  const price_usd = parseFloat(formData.get("price_usd") as string);
  const weight_g = parseFloat(formData.get("weight_g") as string);
  const calories = parseFloat(formData.get("calories") as string);
  const protein_g = parseFloat(formData.get("protein_g") as string);
  const fat_g = formData.get("fat_g") ? parseFloat(formData.get("fat_g") as string) : null;
  const sodium_mg = formData.get("sodium_mg") ? parseFloat(formData.get("sodium_mg") as string) : null;
  const description = (formData.get("description") as string) || null;
  const sourcing_notes = (formData.get("sourcing_notes") as string) || null;

  if (!name || !brand || !fish_type || !price_usd || !weight_g || !calories || !protein_g) {
    return { error: "Required fields: name, brand, type, price, weight, calories, protein." };
  }

  // Upload image first (content-addressed + deduplicated), then store its URL.
  const imageFile = formData.get("image") as File | null;
  let image_url: string | null = null;
  if (imageFile && imageFile.size > 0) {
    image_url = await uploadFishImage(supabase, imageFile);
  }

  const { error } = await supabase.from("fish").insert({
    name,
    brand,
    fish_type,
    price_usd,
    weight_g,
    calories,
    protein_g,
    fat_g,
    sodium_mg,
    description,
    sourcing_notes,
    image_url,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/fish");
}

export async function updateFish(fishId: string, formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    return { error: "Admin access required." };
  }

  const name = formData.get("name") as string;
  const brand = formData.get("brand") as string;
  const fish_type = formData.get("fish_type") as string;
  const price_usd = parseFloat(formData.get("price_usd") as string);
  const weight_g = parseFloat(formData.get("weight_g") as string);
  const calories = parseFloat(formData.get("calories") as string);
  const protein_g = parseFloat(formData.get("protein_g") as string);
  const fat_g = formData.get("fat_g") ? parseFloat(formData.get("fat_g") as string) : null;
  const sodium_mg = formData.get("sodium_mg") ? parseFloat(formData.get("sodium_mg") as string) : null;
  const description = (formData.get("description") as string) || null;
  const sourcing_notes = (formData.get("sourcing_notes") as string) || null;

  if (!name || !brand || !fish_type || !price_usd || !weight_g || !calories || !protein_g) {
    return { error: "Required fields: name, brand, type, price, weight, calories, protein." };
  }

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
    const url = await uploadFishImage(supabase, imageFile);
    if (url) image_url = url;
  }

  const { error } = await supabase
    .from("fish")
    .update({
      name,
      brand,
      fish_type,
      price_usd,
      weight_g,
      calories,
      protein_g,
      fat_g,
      sodium_mg,
      description,
      sourcing_notes,
      ...(image_url ? { image_url } : {}),
    })
    .eq("id", fishId);

  if (error) {
    return { error: error.message };
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

  const fish_id = formData.get("fish_id") as string;
  const flavor_score = parseInt(formData.get("flavor_score") as string);
  const texture_score = parseInt(formData.get("texture_score") as string);
  const aesthetics_score = parseInt(formData.get("aesthetics_score") as string);
  const value_score = parseInt(formData.get("value_score") as string);
  const overall_score = parseInt(formData.get("overall_score") as string);
  const notes = (formData.get("notes") as string) || null;

  if (!fish_id || !flavor_score || !texture_score || !aesthetics_score || !value_score || !overall_score) {
    return { error: "All score fields are required." };
  }

  const { error } = await supabase.from("reviews").insert({
    user_id: user.id,
    fish_id,
    flavor_score,
    texture_score,
    aesthetics_score,
    value_score,
    overall_score,
    notes,
    is_from_tasting: false,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "You've already reviewed this fish." };
    }
    return { error: error.message };
  }

  redirect(`/fish/${fish_id}`);
}
