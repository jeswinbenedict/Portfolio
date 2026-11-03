// ─────────────────────────────────────────────────────────────
// GET /api/auth/callback/github
// Steps 5-8 — verify state, swap code for token, create our session
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  exchangeCodeForToken,
  fetchGitHubUser,
  OAUTH_STATE_COOKIE,
} from "@/lib/auth/github";
import { createSession } from "@/lib/auth/session";

/** Send the user back to /login with a readable reason in the query string. */
function fail(req: NextRequest, reason: string) {
  const url = new URL("/login", req.nextUrl.origin);
  url.searchParams.set("error", reason);
  return NextResponse.redirect(url);
}

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");

  // The user pressed "Cancel" on GitHub's consent screen.
  if (req.nextUrl.searchParams.get("error")) {
    return fail(req, "access_denied");
  }

  if (!code || !state) {
    return fail(req, "missing_code");
  }

  // ── Step 5: CSRF check ────────────────────────────────────
  // Without this, an attacker could feed you a callback URL carrying THEIR
  // code, logging you into their account (session fixation).
  const cookieStore = await cookies();
  const expectedState = cookieStore.get(OAUTH_STATE_COOKIE)?.value;

  if (!expectedState || expectedState !== state) {
    return fail(req, "state_mismatch");
  }

  // One-time value: burn it immediately so it cannot be replayed.
  cookieStore.delete(OAUTH_STATE_COOKIE);

  // ── Step 6: code → access token (server-side only) ────────
  const accessToken = await exchangeCodeForToken(code);
  if (!accessToken) {
    return fail(req, "token_exchange_failed");
  }

  // ── Step 7: read the profile ──────────────────────────────
  const user = await fetchGitHubUser(accessToken);
  if (!user) {
    return fail(req, "profile_fetch_failed");
  }

  // ── Step 8: mint OUR session ──────────────────────────────
  // GitHub's access token is deliberately discarded here. We only needed it
  // to learn who the user is; keeping it would mean storing a credential that
  // can act on their GitHub account.
  await createSession({
    userId: String(user.id),
    login: user.login,
    name: user.name,
    avatarUrl: user.avatar_url,
  });

  return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
}
