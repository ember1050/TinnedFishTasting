import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileSettings } from "@/components/ProfileSettings";

export default async function ProfileSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .single();

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/profile" className="text-sm text-blue-600 hover:underline mb-4 inline-block">
        ← Back to profile
      </Link>
      <h1 className="text-3xl font-bold mb-6">Account Settings</h1>
      <ProfileSettings displayName={profile?.display_name ?? ""} email={user.email ?? ""} />
    </div>
  );
}
