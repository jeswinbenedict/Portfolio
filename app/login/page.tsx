// ─────────────────────────────────────────────────────────────
// /login — OAuth entry point
// ─────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { isGitHubConfigured } from "@/lib/auth/github";

export const metadata: Metadata = {
  title: "Sign in — Jeswin Karunya Benedict",
  robots: { index: false, follow: false }, // keep auth pages out of search results
};

// Human-readable text for the ?error= codes set by the callback route.
const ERRORS: Record<string, string> = {
  access_denied: "You cancelled the GitHub sign-in.",
  missing_code: "GitHub did not send an authorization code. Please try again.",
  state_mismatch:
    "Security check failed — the login did not start from this site. Please try again.",
  token_exchange_failed:
    "Could not exchange the code for an access token. Check the client secret.",
  profile_fetch_failed: "Signed in, but your GitHub profile could not be read.",
};

export default async function LoginPage({
  searchParams,
}: {
  // In Next.js 16 searchParams is a Promise and must be awaited.
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Already signed in? Skip the login screen.
  const session = await getSession();
  if (session) redirect("/dashboard");

  const params = await searchParams;
  const errorCode = typeof params.error === "string" ? params.error : null;
  const errorMessage = errorCode
    ? (ERRORS[errorCode] ?? "Sign-in failed. Please try again.")
    : null;

  const configured = isGitHubConfigured();

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md space-y-6">
        <div className="bg-white dark:bg-[#2a2a2a] border-4 border-neo-black dark:border-neo-mint shadow-neo-lg rounded-2xl p-8 space-y-6">
          <div className="space-y-2">
            <h1 className="font-display font-black text-3xl text-neo-black dark:text-white tracking-tight">
              Sign in
            </h1>
            <p className="font-sans text-sm text-neo-black/75 dark:text-gray-300">
              Authenticate with GitHub to view the private dashboard. Your
              password is never shared with this site.
            </p>
          </div>

          {errorMessage && (
            <div
              role="alert"
              className="px-4 py-3 bg-red-100 dark:bg-red-950/40 border-2 border-red-600 rounded-lg font-mono text-xs font-bold text-red-800 dark:text-red-300"
            >
              {errorMessage}
            </div>
          )}

          {configured ? (
            <a
              href="/api/auth/github"
              className="flex items-center justify-center gap-3 w-full px-6 py-4 bg-neo-black text-white dark:bg-white dark:text-neo-black font-display font-extrabold text-base border-3 border-neo-black dark:border-white shadow-neo hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-neo-lg transition-all rounded-xl cursor-pointer"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              Sign in with GitHub
            </a>
          ) : (
            <div className="px-4 py-3 bg-neo-yellow/30 border-2 border-neo-black rounded-lg font-mono text-xs font-bold text-neo-black dark:text-neo-yellow space-y-1">
              <p>GitHub OAuth is not configured.</p>
              <p className="font-normal">
                Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in .env.local —
                see devops/docs/09-oauth.md
              </p>
            </div>
          )}

          <Link
            href="/"
            className="block text-center font-mono text-xs font-bold text-neo-black/60 dark:text-gray-400 hover:underline"
          >
            ← back to portfolio
          </Link>
        </div>
      </div>
    </main>
  );
}
