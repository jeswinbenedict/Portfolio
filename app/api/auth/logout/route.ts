// ─────────────────────────────────────────────────────────────
// POST /api/auth/logout
// Clears the session cookie
// ─────────────────────────────────────────────────────────────
//
// POST, not GET, on purpose. A GET logout can be triggered by anything that
// loads a URL — an <img src="/api/auth/logout"> on another site would sign
// the user out. Requiring POST means a deliberate form submission.

import { NextRequest, NextResponse } from "next/server";
import { deleteSession } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  await deleteSession();
  return NextResponse.redirect(new URL("/login", req.nextUrl.origin), {
    // 303 makes the browser follow up with a GET, which is the correct
    // status for "POST succeeded, now go look at this other page".
    status: 303,
  });
}
