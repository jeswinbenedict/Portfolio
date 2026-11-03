// ─────────────────────────────────────────────────────────────
// Auth — Stateless Session Management
// Signed JWT stored in an httpOnly cookie (jose)
// ─────────────────────────────────────────────────────────────

import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

// ── Types ────────────────────────────────────────────────────

/** The identity fields we store. Kept separate from SessionPayload so it can
 *  be passed around without the index signature swallowing the field types. */
export interface SessionUser {
  userId: string;
  login: string;
  name: string | null;
  avatarUrl: string | null;
}

export interface SessionPayload extends SessionUser {
  expiresAt: string; // ISO string — JWT claims must be JSON-serialisable
  [key: string]: unknown; // jose requires an index signature on the payload
}

export const SESSION_COOKIE = "portfolio_session";
const SESSION_DAYS = 7;

// ── Secret key ───────────────────────────────────────────────
// Read lazily so a missing env var fails at request time with a clear
// message, rather than crashing the whole build.

function getKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error(
      "SESSION_SECRET is not set. Generate one with: openssl rand -base64 32"
    );
  }
  return new TextEncoder().encode(secret);
}

// ── Encrypt / decrypt ────────────────────────────────────────

export async function encrypt(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(getKey());
}

export async function decrypt(
  token: string | undefined
): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getKey(), {
      algorithms: ["HS256"], // pin the algorithm — never trust the token's own header
    });
    return payload as unknown as SessionPayload;
  } catch {
    // Expired, tampered with, or signed by a different secret.
    return null;
  }
}

// ── Cookie lifecycle ─────────────────────────────────────────

export async function createSession(user: SessionUser): Promise<void> {
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86_400_000);
  const token = await encrypt({ ...user, expiresAt: expiresAt.toISOString() });

  // `cookies()` is ASYNC in Next.js 16 — it must be awaited.
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true, // JavaScript on the page cannot read it (blocks XSS theft)
    secure: process.env.NODE_ENV === "production", // https only in prod; http allowed on localhost
    sameSite: "lax", // sent on top-level navigation, blocks most CSRF
    expires: expiresAt,
    path: "/",
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  return decrypt(cookieStore.get(SESSION_COOKIE)?.value);
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
