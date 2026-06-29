import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ProfileMenu } from "@/components/ProfileMenu";

export async function NavBar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  let displayName = user?.email?.split("@")[0] ?? "Profile";
  let isAdmin = false;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name, is_admin")
      .eq("id", user.id)
      .single();

    displayName = profile?.display_name || displayName;
    isAdmin = !!profile?.is_admin;
  }

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight">
          🐟 Tinned Fish Rankings
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/fish"
            className="text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Browse Fish
          </Link>
          <Link
            href="/tastings"
            className="text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Tastings
          </Link>
          {user ? (
            <ProfileMenu displayName={displayName} isAdmin={isAdmin} />
          ) : (
            <Link
              href="/auth/login"
              className="text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Sign In
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
