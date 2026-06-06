import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  let next = searchParams.get("next") ?? "/dashboard";
  if (!next.startsWith("/")) {
    next = "/dashboard";
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const [profileRes, facultyRes, claimsRes] = await Promise.all([
          supabase.from("user_profiles").select("home_masjid_id").eq("id", session.user.id).single(),
          supabase.from("masjid_faculty").select("*", { count: "exact", head: true }).eq("user_id", session.user.id),
          supabase.from("masjid_claims").select("*", { count: "exact", head: true }).eq("user_id", session.user.id),
        ]);

        const needsOnboarding = !profileRes.data?.home_masjid_id && !facultyRes.count && !claimsRes.count;
        
        if (needsOnboarding) {
          next = "/onboarding";
        } else if (!facultyRes.count && !claimsRes.count && next === "/dashboard") {
          next = "/masjids";
        }
      }

      const forwardedHost = request.headers.get('x-forwarded-host'); // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === 'development';
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // If there's no code or the exchange failed, redirect to login with an error
  return NextResponse.redirect(new URL("/login?error=auth", origin));
}
