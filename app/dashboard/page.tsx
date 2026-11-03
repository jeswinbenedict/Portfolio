// ─────────────────────────────────────────────────────────────
// /dashboard — protected page
// ─────────────────────────────────────────────────────────────
//
// Two layers guard this route:
//   1. proxy.ts does an OPTIMISTIC check (cookie present and decryptable)
//      and redirects early, before this component renders.
//   2. This page re-checks the session itself.
//
// The second check is not redundant. The Next.js docs are explicit that proxy
// checks are optimistic: proxy runs on prefetched routes too, so it must stay
// cheap and must not be the only thing standing between a user and the data.
// Always verify again close to where the data is actually used.

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Dashboard — Jeswin Karunya Benedict",
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  const session = await getSession();

  // Layer 2 — the authoritative check.
  if (!session) redirect("/login");

  const expires = new Date(session.expiresAt);

  return (
    <main className="min-h-screen px-4 py-16">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white dark:bg-[#2a2a2a] border-4 border-neo-black dark:border-neo-mint shadow-neo-lg rounded-2xl p-8 space-y-6">
          {/* ── Identity ─────────────────────────────────── */}
          <div className="flex items-center gap-4">
            {session.avatarUrl && (
              <Image
                src={session.avatarUrl}
                alt={`${session.login} avatar`}
                width={64}
                height={64}
                className="rounded-xl border-3 border-neo-black"
                unoptimized // avatars come from a remote host not in next.config
              />
            )}
            <div>
              <h1 className="font-display font-black text-2xl text-neo-black dark:text-white tracking-tight">
                {session.name ?? session.login}
              </h1>
              <p className="font-mono text-sm font-bold text-blue-600 dark:text-neo-yellow">
                @{session.login}
              </p>
            </div>
          </div>

          <div className="px-4 py-3 bg-neo-mint/40 border-2 border-neo-black rounded-lg font-mono text-xs font-bold text-neo-black">
            ✓ Authenticated via GitHub OAuth 2.0
          </div>

          {/* ── Session details ──────────────────────────── */}
          <div className="space-y-2">
            <h2 className="font-display font-extrabold text-sm uppercase tracking-wide text-neo-black/70 dark:text-gray-400">
              Session
            </h2>
            <dl className="font-mono text-xs space-y-1 text-neo-black dark:text-gray-200">
              <div className="flex justify-between gap-4 border-b border-neo-black/10 dark:border-white/10 py-1">
                <dt className="font-bold">GitHub user ID</dt>
                <dd>{session.userId}</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-neo-black/10 dark:border-white/10 py-1">
                <dt className="font-bold">Expires</dt>
                <dd>{expires.toUTCString()}</dd>
              </div>
              <div className="flex justify-between gap-4 py-1">
                <dt className="font-bold">Stored as</dt>
                <dd>httpOnly · signed JWT</dd>
              </div>
            </dl>
          </div>

          {/* ── Logout ───────────────────────────────────── */}
          {/* A form POST, not a link — see the comment in the logout route. */}
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="w-full px-6 py-3 bg-neo-yellow text-neo-black font-display font-extrabold text-sm border-3 border-neo-black shadow-neo hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-neo-lg transition-all rounded-xl cursor-pointer"
            >
              Sign out
            </button>
          </form>

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
