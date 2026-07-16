"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { parse, signupSchema, loginSchema, resetSchema, passwordSchema } from "@/lib/validation";

/** Read a form field as a string (empty string when missing or a file). */
function str(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === "string" ? v : "";
}

/**
 * Only allow same-origin relative paths as post-login redirect targets,
 * to prevent open-redirect / phishing via ?redirect=https://evil.com.
 */
function safeRedirectPath(value: FormDataEntryValue | null): string {
  const fallback = "/profile";
  if (typeof value !== "string" || value.length === 0) return fallback;
  if (!value.startsWith("/")) return fallback; // must be a relative path
  if (value.startsWith("//") || value.startsWith("/\\")) return fallback; // protocol-relative
  if (value.includes("://") || value.includes("\\")) return fallback; // scheme / backslash tricks
  if (/[\u0000-\u001f\s]/.test(value)) return fallback; // control chars / whitespace
  return value;
}

export async function signup(formData: FormData) {
  const parsed = parse(signupSchema, {
    email: str(formData, "email"),
    password: str(formData, "password"),
    name: str(formData, "name"),
  });
  if (!parsed.ok) return { error: parsed.error };

  const supabase = await createClient();

  // Usernames are unique (case-insensitive, enforced by a DB index). Check up
  // front so a taken name gets a clean message instead of a raw DB error.
  const { data: taken } = await supabase
    .from("profiles")
    .select("id")
    .ilike("display_name", parsed.data.name.replace(/([\\%_])/g, "\\$1"))
    .limit(1);
  if (taken && taken.length > 0) {
    return { error: "That username is taken. Please choose another." };
  }

  try {
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: { data: { display_name: parsed.data.name } },
    });
    if (error) {
      // The profile-creation trigger enforces uniqueness; map its failure
      // (in case of a race with the pre-check) to a friendly message.
      if (/duplicate|unique|already|saving new user/i.test(error.message)) {
        return { error: "That username is taken. Please choose another." };
      }
      return { error: error.message };
    }
  } catch {
    return { error: "Couldn't reach the server. Please try again." };
  }

  redirect("/profile");
}

export async function login(formData: FormData) {
  const redirectTo = safeRedirectPath(formData.get("redirect"));
  const parsed = parse(loginSchema, {
    email: str(formData, "email"),
    password: str(formData, "password"),
  });
  if (!parsed.ok) return { error: parsed.error };

  const supabase = await createClient();
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });
    if (error) return { error: error.message };
  } catch {
    return { error: "Couldn't reach the server. Please try again." };
  }

  redirect(redirectTo);
}

export async function logout() {
  const supabase = await createClient();
  try {
    await supabase.auth.signOut();
  } catch {
    // Even if sign-out fails server-side, send the user home.
  }
  redirect("/");
}

export async function resetPassword(formData: FormData) {
  const parsed = parse(resetSchema, { email: str(formData, "email") });
  if (!parsed.ok) return { error: parsed.error };

  // Send the recovery link back to OUR app's confirm page, not Supabase.
  const hdrs = await headers();
  const origin =
    hdrs.get("origin") ||
    (hdrs.get("host") ? `https://${hdrs.get("host")}` : "");

  const supabase = await createClient();
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(
      parsed.data.email,
      { redirectTo: `${origin}/auth/callback?next=/auth/reset/confirm` }
    );
    if (error) return { error: error.message };
  } catch {
    return { error: "Couldn't reach the server. Please try again." };
  }

  return { success: "Check your email for a reset link." };
}

/**
 * Set a new password from a recovery link. Unlike the logged-in "change
 * password" flow (which requires the current password), this trusts the
 * recovery session established by the emailed link, so it only needs the new
 * password plus a confirmation. Requires a valid session or it refuses.
 */
export async function setRecoveryPassword(formData: FormData) {
  const password = str(formData, "password");
  const confirm = str(formData, "confirm_password");

  const parsed = passwordSchema.safeParse(password);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  if (password !== confirm) return { error: "New passwords don't match." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      error: "This reset link is invalid or has expired. Request a new one.",
    };
  }

  try {
    const { error } = await supabase.auth.updateUser({ password: parsed.data });
    if (error) return { error: error.message };
  } catch {
    return { error: "Couldn't reach the server. Please try again." };
  }
  return { success: "Password updated. You're signed in." };
}
