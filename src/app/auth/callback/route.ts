import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Auth callback for emailed links (currently password recovery). Supabase sends
 * the user here with a one-time `?code=`; we exchange it for a session (setting
 * auth cookies) and forward them to the page named in `next`.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next") ?? "/";
  // Only same-origin relative paths — never an open redirect.
  const next =
    nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // No code, or the exchange failed (expired / wrong device). Send them to the
  // confirm page with a flag so it can prompt for a fresh link.
  return NextResponse.redirect(`${origin}/auth/reset/confirm?error=1`);
}
