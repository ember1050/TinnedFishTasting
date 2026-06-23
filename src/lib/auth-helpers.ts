import { createClient } from "@/lib/supabase/server";

/**
 * Check if the current user is an admin.
 * Returns { isAdmin, userId } — safe to call from any server component.
 */
export async function getAdminStatus(): Promise<{
  isAdmin: boolean;
  userId: string | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { isAdmin: false, userId: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  return { isAdmin: !!profile?.is_admin, userId: user.id };
}
