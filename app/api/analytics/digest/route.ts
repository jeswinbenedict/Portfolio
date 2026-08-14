// ─────────────────────────────────────────────────────────────
// GET /api/analytics/digest
// Called by Vercel Cron every 24 hours at 9 PM IST (3:30 PM UTC)
// Aggregates yesterday's visits → sends email digest
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { getVisitsForDate } from "@/lib/analytics/store";
import { aggregateDigest, sendDigestEmail } from "@/lib/analytics/email";

export async function GET(request: NextRequest) {
  // ── Verify cron secret (Vercel sets this header) ──────────
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get yesterday's date in UTC
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    const dateStr = yesterday.toISOString().split("T")[0];

    // Also include today's visits so far (in case cron fires mid-day)
    const todayStr = now.toISOString().split("T")[0];

    const [yesterdayVisits, todayVisits] = await Promise.all([
      getVisitsForDate(dateStr),
      getVisitsForDate(todayStr),
    ]);

    const allVisits = [...yesterdayVisits, ...todayVisits];

    // Build the digest
    const digest = aggregateDigest(allVisits, dateStr);

    // Send the email
    const sent = await sendDigestEmail(digest);

    return NextResponse.json({
      ok: true,
      sent,
      date: dateStr,
      totalVisits: digest.totalVisits,
      uniqueSessions: digest.uniqueSessions,
      avgSessionDuration: digest.avgSessionDuration,
      referrers: digest.referrerBreakdown,
      countries: digest.countryBreakdown,
      sections: digest.sectionViews,
      topInteractions: digest.topInteractions,
    });
  } catch (err) {
    console.error("[Analytics] Digest error:", err);
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 }
    );
  }
}
