// ─────────────────────────────────────────────────────────────
// Stealth Analytics — Email Digest
// Beautiful HTML email + Resend integration
// ─────────────────────────────────────────────────────────────

import { Resend } from "resend";
import type { StoredVisit, DigestData } from "./types";

const RECIPIENT_EMAIL = "jeswinbenedict7@gmail.com";

// ── Aggregation ──────────────────────────────────────────────

export function aggregateDigest(
  visits: StoredVisit[],
  date: string
): DigestData {
  const total = visits.length;
  const uniqueIds = new Set(visits.map((v) => v.sessionId));

  // Average & max session duration
  const durations = visits.map((v) => v.sessionDuration).filter((d) => d > 0);
  const avgDuration =
    durations.length > 0
      ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
      : 0;
  const maxDuration = durations.length > 0 ? Math.max(...durations) : 0;

  // Helper to build a breakdown
  function breakdown(
    field: keyof StoredVisit
  ): { source: string; count: number; percentage: number }[] {
    const counts = new Map<string, number>();
    for (const v of visits) {
      const val = String(v[field] || "Unknown");
      counts.set(val, (counts.get(val) || 0) + 1);
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([source, count]) => ({
        source,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      }));
  }

  // Section views (across all visits)
  const sectionCounts = new Map<string, number>();
  for (const v of visits) {
    for (const s of v.sectionsViewed) {
      sectionCounts.set(s, (sectionCounts.get(s) || 0) + 1);
    }
  }
  const sectionViews = [...sectionCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([section, views]) => ({
      section,
      views,
      percentage: total > 0 ? Math.round((views / total) * 100) : 0,
    }));

  // Interactions
  const interactionCounts = new Map<string, number>();
  for (const v of visits) {
    for (const i of v.interactions) {
      interactionCounts.set(i, (interactionCounts.get(i) || 0) + 1);
    }
  }
  const topInteractions = [...interactionCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([action, count]) => ({ action, count }));

  // Peak hours
  const hourCounts = new Map<number, number>();
  for (const v of visits) {
    const hour = new Date(v.timestamp).getHours();
    hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
  }
  const peakHours = [...hourCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([hour, count]) => ({ hour, count }));

  const referrerBreakdown = breakdown("referrerSource");
  const countryBreakdown = breakdown("country");
  const browserBreakdown = breakdown("browser");
  const deviceBreakdown = breakdown("device");
  const osBreakdown = breakdown("os");

  // City breakdown
  const cityCounts = new Map<string, number>();
  for (const v of visits) {
    const city = v.city || "Unknown";
    cityCounts.set(city, (cityCounts.get(city) || 0) + 1);
  }
  const cityBreakdown = [...cityCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([city, count]) => ({ city, count }));

  return {
    date,
    period: "Last 24 hours",
    totalVisits: total,
    uniqueSessions: uniqueIds.size,
    avgSessionDuration: avgDuration,
    maxSessionDuration: maxDuration,
    referrerBreakdown,
    countryBreakdown,
    cityBreakdown,
    browserBreakdown,
    deviceBreakdown,
    osBreakdown,
    sectionViews,
    topInteractions,
    peakHours,
  };
}

// ── Email Sending ────────────────────────────────────────────

export async function sendDigestEmail(digest: DigestData): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.log("[Analytics] No RESEND_API_KEY set — logging digest to console");
    console.log("═══════════════════════════════════════════════════");
    console.log(`📊 PORTFOLIO ANALYTICS DIGEST — ${digest.date}`);
    console.log(`   Total visits: ${digest.totalVisits}`);
    console.log(`   Unique sessions: ${digest.uniqueSessions}`);
    console.log(`   Avg duration: ${formatDuration(digest.avgSessionDuration)}`);
    console.log("───────────────────────────────────────────────────");
    if (digest.referrerBreakdown.length > 0) {
      console.log("   Referrers:");
      for (const r of digest.referrerBreakdown)
        console.log(`     ${r.source}: ${r.count} (${r.percentage}%)`);
    }
    if (digest.countryBreakdown.length > 0) {
      console.log("   Countries:");
      for (const c of digest.countryBreakdown)
        console.log(`     ${c.source}: ${c.count} (${c.percentage}%)`);
    }
    if (digest.sectionViews.length > 0) {
      console.log("   Sections:");
      for (const s of digest.sectionViews)
        console.log(`     ${s.section}: ${s.views} (${s.percentage}%)`);
    }
    console.log("═══════════════════════════════════════════════════");
    return true;
  }

  const resend = new Resend(apiKey);
  const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

  try {
    await resend.emails.send({
      from: `Portfolio Analytics <${fromEmail}>`,
      to: [RECIPIENT_EMAIL],
      subject: `📊 Portfolio Digest — ${digest.totalVisits} visitors on ${digest.date}`,
      html: buildEmailHTML(digest),
    });
    console.log(`[Analytics] Digest email sent to ${RECIPIENT_EMAIL}`);
    return true;
  } catch (err) {
    console.error("[Analytics] Failed to send digest email:", err);
    return false;
  }
}

// ── HTML Email Template ──────────────────────────────────────

function buildEmailHTML(d: DigestData): string {
  const bar = (pct: number, color: string) => {
    const width = Math.max(pct, 4);
    return `<div style="background:${color};height:22px;width:${width}%;border-radius:4px;border:2px solid #1a1a1a;"></div>`;
  };

  const statCard = (value: string, label: string, bg: string) => `
    <td style="width:33%;padding:6px;">
      <div style="background:${bg};border:3px solid #1a1a1a;border-radius:12px;padding:16px 12px;text-align:center;box-shadow:4px 4px 0 #1a1a1a;">
        <div style="font-family:'Courier New',monospace;font-size:32px;font-weight:900;color:#1a1a1a;line-height:1;">${value}</div>
        <div style="font-family:Arial,sans-serif;font-size:11px;font-weight:700;color:#1a1a1a;text-transform:uppercase;margin-top:6px;letter-spacing:1px;">${label}</div>
      </div>
    </td>`;

  const sectionTitle = (emoji: string, title: string) => `
    <tr><td style="padding:24px 0 8px 0;">
      <div style="font-family:'Courier New',monospace;font-size:16px;font-weight:900;color:#1a1a1a;text-transform:uppercase;border-bottom:3px solid #1a1a1a;padding-bottom:6px;">${emoji} ${title}</div>
    </td></tr>`;

  const breakdownRows = (
    items: { source: string; count: number; percentage: number }[],
    color: string
  ) =>
    items
      .slice(0, 8)
      .map(
        (item) => `
      <tr>
        <td style="padding:4px 0;">
          <div style="display:flex;align-items:center;gap:8px;">
            <div style="flex:1;">
              <div style="font-family:Arial,sans-serif;font-size:13px;font-weight:600;color:#1a1a1a;">${item.source}</div>
              <div style="margin-top:3px;">${bar(item.percentage, color)}</div>
            </div>
            <div style="font-family:'Courier New',monospace;font-size:13px;font-weight:700;color:#1a1a1a;min-width:60px;text-align:right;">${item.count} (${item.percentage}%)</div>
          </div>
        </td>
      </tr>`
      )
      .join("");

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0f0f0;font-family:Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f0f0f0;padding:24px 0;">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border:4px solid #1a1a1a;border-radius:16px;box-shadow:8px 8px 0 #1a1a1a;overflow:hidden;">

<!-- Header -->
<tr><td style="background:#FFD93D;padding:24px 32px;border-bottom:4px solid #1a1a1a;">
  <div style="font-family:'Courier New',monospace;font-size:24px;font-weight:900;color:#1a1a1a;">📊 PORTFOLIO ANALYTICS</div>
  <div style="font-family:Arial,sans-serif;font-size:14px;color:#1a1a1a;margin-top:4px;">${d.date} · ${d.period}</div>
</td></tr>

<!-- Stats Cards -->
<tr><td style="padding:20px 24px 0;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
    ${statCard(String(d.totalVisits), "Total Visits", "#FFD93D")}
    ${statCard(formatDuration(d.avgSessionDuration), "Avg Duration", "#67E8F9")}
    ${statCard(String(d.uniqueSessions), "Sessions", "#6FEDD6")}
  </tr></table>
</td></tr>

${
  d.totalVisits === 0
    ? `<tr><td style="padding:32px;text-align:center;">
        <div style="font-family:Arial,sans-serif;font-size:16px;color:#666;">No visitors recorded in this period.</div>
       </td></tr>`
    : `
<!-- Referrers -->
<tr><td style="padding:0 32px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    ${sectionTitle("🔗", "Traffic Sources")}
    ${breakdownRows(d.referrerBreakdown, "#FFD93D")}
  </table>
</td></tr>

<!-- Countries -->
<tr><td style="padding:0 32px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    ${sectionTitle("🌍", "Geographic Breakdown")}
    ${breakdownRows(d.countryBreakdown, "#6FEDD6")}
  </table>
</td></tr>

<!-- Browsers -->
<tr><td style="padding:0 32px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    ${sectionTitle("🌐", "Browsers")}
    ${breakdownRows(d.browserBreakdown, "#67E8F9")}
  </table>
</td></tr>

<!-- Devices -->
<tr><td style="padding:0 32px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    ${sectionTitle("📱", "Devices")}
    ${breakdownRows(d.deviceBreakdown, "#FF6B9D")}
  </table>
</td></tr>

<!-- OS -->
<tr><td style="padding:0 32px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    ${sectionTitle("💻", "Operating Systems")}
    ${breakdownRows(d.osBreakdown, "#C4B5FD")}
  </table>
</td></tr>

<!-- Sections Viewed -->
${
  d.sectionViews.length > 0
    ? `<tr><td style="padding:0 32px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    ${sectionTitle("📄", "Sections Viewed")}
    ${d.sectionViews
      .map(
        (s) => `
      <tr><td style="padding:3px 0;">
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <span style="font-family:Arial,sans-serif;font-size:13px;font-weight:600;color:#1a1a1a;text-transform:capitalize;">${s.section.replace(/-/g, " ")}</span>
          <span style="font-family:'Courier New',monospace;font-size:12px;color:#666;">${s.views} views (${s.percentage}%)</span>
        </div>
        <div style="margin-top:2px;">${bar(s.percentage, "#FFD93D")}</div>
      </td></tr>`
      )
      .join("")}
  </table>
</td></tr>`
    : ""
}

<!-- Top Interactions -->
${
  d.topInteractions.length > 0
    ? `<tr><td style="padding:0 32px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    ${sectionTitle("👆", "Top Interactions")}
    ${d.topInteractions
      .map(
        (item, i) => `
      <tr><td style="padding:3px 0;">
        <div style="font-family:Arial,sans-serif;font-size:13px;color:#1a1a1a;">
          <strong style="font-family:'Courier New',monospace;">${i + 1}.</strong> ${item.action}
          <span style="font-family:'Courier New',monospace;color:#666;float:right;">${item.count}×</span>
        </div>
      </td></tr>`
      )
      .join("")}
  </table>
</td></tr>`
    : ""
}

<!-- Peak Hours -->
${
  d.peakHours.length > 0
    ? `<tr><td style="padding:0 32px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    ${sectionTitle("⏰", "Peak Hours (UTC)")}
    <tr><td style="padding:4px 0;">
      <div style="font-family:'Courier New',monospace;font-size:12px;color:#1a1a1a;">
        ${d.peakHours
          .slice(0, 5)
          .map((h) => `${String(h.hour).padStart(2, "0")}:00 → ${h.count} visits`)
          .join(" · ")}
      </div>
    </td></tr>
  </table>
</td></tr>`
    : ""
}
`
}

<!-- Footer -->
<tr><td style="padding:24px 32px;border-top:3px solid #1a1a1a;margin-top:16px;background:#f9f9f9;">
  <div style="font-family:Arial,sans-serif;font-size:11px;color:#999;text-align:center;">
    Jeswin Karunya Benedict · Portfolio Analytics<br>
    This is an automated digest. Data is anonymous and no personal information is stored.
  </div>
</td></tr>

</table>
</td></tr></table>
</body>
</html>`;
}

// ── Utility ──────────────────────────────────────────────────

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m${s > 0 ? `${s}s` : ""}`;
}
