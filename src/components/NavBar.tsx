import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/actions/auth";

export async function NavBar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight">
          🐟 Tinned Fish Tasting
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
            <>
              <Link
                href="/profile"
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Profile
              </Link>
              <form action={logout}>
                <button
                  type="submit"
                  className="text-sm font-medium text-gray-500 hover:text-gray-700"
                >
                  Sign Out
                </button>
              </form>
            </>
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
