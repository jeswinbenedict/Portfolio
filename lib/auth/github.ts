// ─────────────────────────────────────────────────────────────
// Auth — GitHub OAuth 2.0 (Authorization Code flow)
// ─────────────────────────────────────────────────────────────
//
// THE FLOW, IN ORDER:
//
//   1. User clicks "Sign in with GitHub"
//   2. We redirect to github.com/login/oauth/authorize with our client_id
//      and a random `state` value
//   3. User approves on GitHub's own page — they never type a password here
//   4. GitHub redirects back to our callback with ?code=...&state=...
//   5. We verify `state` matches what we sent (CSRF protection)
//   6. We exchange the code for an access token SERVER-SIDE, using our
//      client_secret — this is why the secret never reaches the browser
//   7. We call the GitHub API with that token to read the user's profile
//   8. We mint our own session cookie and forget GitHub's token
//
// The password never touches this application. That is the entire point of
// OAuth: delegated authorisation without sharing credentials.

import "server-only";

const GITHUB_AUTHORIZE_URL = "https://github.com/login/oauth/authorize";
const GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token";
const GITHUB_USER_URL = "https://api.github.com/user";

export const OAUTH_STATE_COOKIE = "portfolio_oauth_state";

// ── Config ───────────────────────────────────────────────────

export function getGitHubConfig() {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  // Must match the "Authorization callback URL" registered on GitHub exactly.
  const baseUrl = process.env.APP_BASE_URL ?? "http://localhost:3000";

  return { clientId, clientSecret, baseUrl };
}

export function isGitHubConfigured(): boolean {
  const { clientId, clientSecret } = getGitHubConfig();
  return Boolean(clientId && clientSecret);
}

// ── Step 2: build the authorize URL ──────────────────────────

export function buildAuthorizeUrl(state: string): string {
  const { clientId, baseUrl } = getGitHubConfig();

  const params = new URLSearchParams({
    client_id: clientId ?? "",
    redirect_uri: `${baseUrl}/api/auth/callback/github`,
    // `read:user` is the narrowest scope that returns a profile.
    // Request the least you need — an over-scoped token is a liability.
    scope: "read:user",
    state,
    allow_signup: "true",
  });

  return `${GITHUB_AUTHORIZE_URL}?${params.toString()}`;
}

// ── Step 6: exchange the code for an access token ────────────

export async function exchangeCodeForToken(
  code: string
): Promise<string | null> {
  const { clientId, clientSecret, baseUrl } = getGitHubConfig();

  const res = await fetch(GITHUB_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Without this GitHub replies in form-encoded format, not JSON.
      Accept: "application/json",
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: `${baseUrl}/api/auth/callback/github`,
    }),
    cache: "no-store",
  });

  if (!res.ok) return null;

  const data = (await res.json()) as {
    access_token?: string;
    error?: string;
  };

  return data.access_token ?? null;
}

// ── Step 7: read the user's profile ──────────────────────────

export interface GitHubUser {
  id: number;
  login: string;
  name: string | null;
  avatar_url: string | null;
}

export async function fetchGitHubUser(
  accessToken: string
): Promise<GitHubUser | null> {
  const res = await fetch(GITHUB_USER_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    cache: "no-store",
  });

  if (!res.ok) return null;
  return (await res.json()) as GitHubUser;
}

// ── CSRF state ───────────────────────────────────────────────
//
// A random value sent to GitHub and echoed back. If the value returned does
// not match the one we stored, the callback did not originate from a login
// we started, and we reject it.

export function generateState(): string {
  return crypto.randomUUID();
}
