"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

function str(fd: FormData, k: string): string {
  const v = fd.get(k);
  return typeof v === "string" ? v : "";
}

const usernameSchema = z
  .string()
  .trim()
  .min(3, "Username must be at least 3 characters.")
  .max(30, "Username is too long.")
  .regex(/^[A-Za-z0-9_ ]+$/, "Letters, numbers, spaces, and underscores only.");

export async function updateUsername(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const parsed = usernameSchema.safeParse(str(formData, "display_name"));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: parsed.data })
      .eq("id", user.id);
    if (error) {
      if (error.code === "23505") return { error: "That username is taken." };
      return { error: error.message };
    }
  } catch {
    return { error: "Couldn't reach the server. Please try again." };
  }
  revalidatePath("/profile");
  return { success: "Username updated." };
}

export async function updateEmail(formData: FormData) {
  const supabase = await createClient();
  const parsed = z.string().trim().email("Enter a valid email.").safeParse(str(formData, "email"));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  try {
    const { error } = await supabase.auth.updateUser({ email: parsed.data });
    if (error) return { error: error.message };
  } catch {
    return { error: "Couldn't reach the server. Please try again." };
  }
  return { success: "Check your new email to confirm the change." };
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient();
  const parsed = z.string().min(8, "Password must be at least 8 characters.").safeParse(str(formData, "password"));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  try {
    const { error } = await supabase.auth.updateUser({ password: parsed.data });
    if (error) return { error: error.message };
  } catch {
    return { error: "Couldn't reach the server. Please try again." };
  }
  return { success: "Password updated." };
}

export async function uploadAvatar(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const file = formData.get("avatar") as File | null;
  if (!file || file.size === 0) return { error: "Choose an image." };
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    return { error: "Avatar must be a JPEG, PNG, or WebP." };
  }
  if (file.size > 3 * 1024 * 1024) return { error: "Avatar must be under 3 MB." };

  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `${user.id}/avatar.${ext}`;
  try {
    const bytes = Buffer.from(await file.arrayBuffer());
    const { error: upErr } = await supabase.storage
      .from("avatars")
      .upload(path, bytes, { contentType: file.type, upsert: true });
    if (upErr) return { error: upErr.message };
    const url = supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl;
    // Cache-bust so the new image shows immediately.
    const { error } = await supabase
      .from("profiles")
      .update({ avatar_url: `${url}?v=${Date.now()}` })
      .eq("id", user.id);
    if (error) return { error: error.message };
  } catch {
    return { error: "Couldn't upload. Please try again." };
  }
  revalidatePath("/profile");
  return { success: "Avatar updated." };
}
