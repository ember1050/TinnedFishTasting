"use server";

import { createClient } from "@/lib/supabase/server";
import { parse, feedbackSchema } from "@/lib/validation";

function str(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === "string" ? v : "";
}

type FeedbackResult = {
  error?: string;
  success?: boolean;
};

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

  const parsed = parse(feedbackSchema, {
    type: str(formData, "type"),
    message: str(formData, "message"),
    page_url: str(formData, "page_url"),
  });
  if (!parsed.ok) return { error: parsed.error };

  try {
    const { error } = await supabase.from("feedback").insert({
      user_id: user.id,
      type: parsed.data.type,
      message: parsed.data.message,
      page_url: parsed.data.page_url,
    });
    if (error) return { error: "Couldn't save your feedback. Please try again." };
  } catch {
    return { error: "Couldn't reach the server. Please try again." };
  }

  return { success: true };
}
