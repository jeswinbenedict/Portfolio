// ─────────────────────────────────────────────────────────────
// GET /api/auth/github
// Step 2 of the OAuth flow — send the user to GitHub to approve
// ─────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  buildAuthorizeUrl,
  generateState,
  isGitHubConfigured,
  OAUTH_STATE_COOKIE,
} from "@/lib/auth/github";

export async function GET() {
  // Fail loudly and early if the app has not been given OAuth credentials,
  // rather than bouncing the user to a GitHub error page.
  if (!isGitHubConfigured()) {
    return NextResponse.json(
      {
        error: "GitHub OAuth is not configured.",
        hint: "Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in .env.local — see devops/docs/09-oauth.md",
      },
      { status: 503 }
    );
  }

  // Mint a one-time random value and remember it in a short-lived cookie.
  // GitHub will echo it back; the callback compares the two.
  const state = generateState();

  const cookieStore = await cookies();
  cookieStore.set(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 10, // 10 minutes is ample to complete a login
    path: "/",
  });

  return NextResponse.redirect(buildAuthorizeUrl(state));
}
