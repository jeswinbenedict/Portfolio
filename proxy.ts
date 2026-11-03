// ─────────────────────────────────────────────────────────────
// proxy.ts — route-level auth guard
// ─────────────────────────────────────────────────────────────
//
// ⚠ NAMING: this file was called `middleware.ts` before Next.js 16. The
// convention was renamed to `proxy.ts` with a default export named `proxy`.
// The functionality is identical. A `middleware.ts` in this project would be
// silently ignored by Next 16. (Codemod: npx @next/codemod@canary
// middleware-to-proxy .)
//
// WHAT THIS DOES
//   Runs before the matched routes render, reads the session cookie, and
//   redirects. It centralises "who may see what" instead of repeating the
//   check in every page.
//
// WHY THE CHECK HERE IS "OPTIMISTIC"
//   This runs on EVERY matched request, including prefetches triggered just by
//   hovering a link. So it must stay cheap: decrypt the cookie, nothing more.
//   No database lookups. The authoritative check lives in the page itself
//   (see app/dashboard/page.tsx), close to the data being protected.

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decrypt, SESSION_COOKIE } from "@/lib/auth/session";

// Routes that require a session.
const protectedRoutes = ["/dashboard"];

// Routes a signed-in user should be bounced away from.
const authRoutes = ["/login"];

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;

  const isProtected = protectedRoutes.some(
    (r) => path === r || path.startsWith(`${r}/`)
  );
  const isAuthRoute = authRoutes.includes(path);

  // Nothing to decide for any other path — skip the cookie work entirely.
  if (!isProtected && !isAuthRoute) {
    return NextResponse.next();
  }

  const cookieStore = await cookies();
  const session = await decrypt(cookieStore.get(SESSION_COOKIE)?.value);

  // Not signed in, asking for a protected page → send to login.
  if (isProtected && !session?.userId) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  // Already signed in, asking for the login page → send to the dashboard.
  if (isAuthRoute && session?.userId) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  return NextResponse.next();
}

// Which requests this runs on. Excluding static assets and the analytics API
// keeps it off the hot path for the vast majority of requests.
export const config = {
  matcher: [
    "/((?!api/analytics|_next/static|_next/image|favicon.ico|icon.svg|.*\\.(?:png|jpg|jpeg|gif|svg|webp)$).*)",
  ],
};
