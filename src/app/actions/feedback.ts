"use server";

import { createClient } from "@/lib/supabase/server";

type FeedbackType = "bug" | "feature";

type FeedbackResult = {
  error?: string;
  success?: boolean;
};

function getString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function submitFeedback(
  formData: FormData
): Promise<FeedbackResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to send feedback." };
  }

  const type = getString(formData, "type");
  const message = getString(formData, "message");
  const pageUrl = getString(formData, "page_url");

  if (type !== "bug" && type !== "feature") {
    return { error: "Choose bug or feature request." };
  }

  if (!message) {
    return { error: "Feedback message is required." };
  }

  if (message.length > 4000) {
    return { error: "Feedback must be 4,000 characters or fewer." };
  }

  const { error } = await supabase.from("feedback").insert({
    user_id: user.id,
    type: type as FeedbackType,
    message,
    page_url: pageUrl || null,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
