// ─────────────────────────────────────────────────────────────
// POST /api/analytics/track
// Receives visitor beacon data, parses UA + geo, stores visit
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { UAParser } from "ua-parser-js";
import type { TrackingPayload } from "@/lib/analytics/types";
import { upsertVisit, mergeSessionEnd } from "@/lib/analytics/store";

// Classify referrer into a human-readable source
function classifyReferrer(referrer: string): string {
  if (!referrer) return "Direct";
  try {
    const host = new URL(referrer).hostname.toLowerCase();
    if (host.includes("google")) return "Google";
    if (host.includes("linkedin")) return "LinkedIn";
    if (host.includes("github")) return "GitHub";
    if (host.includes("twitter") || host.includes("x.com")) return "Twitter/X";
    if (host.includes("facebook") || host.includes("fb.com")) return "Facebook";
    if (host.includes("bing")) return "Bing";
    if (host.includes("reddit")) return "Reddit";
    if (host.includes("youtube")) return "YouTube";
    if (host.includes("t.co")) return "Twitter/X";
    return host;
  } catch {
    return "Direct";
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload: TrackingPayload = await request.json();

    // Basic validation
    if (!payload.sessionId || !payload.type) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    if (payload.type === "session_end") {
      // Merge session-end data into existing visit
      await mergeSessionEnd(payload.sessionId, {
        sessionDuration: payload.sessionDuration ?? 0,
        sectionsViewed: payload.sectionsViewed ?? [],
        interactions: (payload.interactions ?? []).map(
          (i) => `${i.type}: ${i.target}`
        ),
      });
      return NextResponse.json({ ok: true });
    }

    // ── Parse User Agent ────────────────────────────────────
    const ua = request.headers.get("user-agent") || "";
    const parser = new UAParser(ua);
    const browser = parser.getBrowser();
    const os = parser.getOS();
    const device = parser.getDevice();

    // ── Geolocation from Vercel headers ─────────────────────
    const country =
      decodeURIComponent(request.headers.get("x-vercel-ip-country") || "") ||
      "Local";
    const city =
      decodeURIComponent(request.headers.get("x-vercel-ip-city") || "") ||
      "Local";
    const region =
      decodeURIComponent(
        request.headers.get("x-vercel-ip-country-region") || ""
      ) || "";

    // ── Store the visit ─────────────────────────────────────
    await upsertVisit({
      sessionId: payload.sessionId,
      timestamp: payload.timestamp || Date.now(),
      page: payload.page || "/",
      referrer: payload.referrer || "",
      referrerSource: classifyReferrer(payload.referrer),
      browser: browser.name || "Unknown",
      browserVersion: browser.version || "",
      os: os.name || "Unknown",
      device: device.type || "desktop",
      country,
      city,
      region,
      screenWidth: payload.screenWidth || 0,
      screenHeight: payload.screenHeight || 0,
      sessionDuration: 0,
      sectionsViewed: [],
      interactions: [],
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[Analytics] Track error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

// Allow CORS preflight (for cross-origin deployments if needed)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
