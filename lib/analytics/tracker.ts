// ─────────────────────────────────────────────────────────────
// Stealth Analytics — Client‑Side Tracker
// Completely invisible · no cookies · no visible UI
// ─────────────────────────────────────────────────────────────

const BOT_PATTERNS =
  /bot|crawl|spider|headless|lighthouse|pagespeed|preview|prerender|slurp|mediapartners/i;

interface InteractionRecord {
  type: string;
  target: string;
}

/**
 * Initialise the invisible tracker.
 * Call once from a client component — it sets up all listeners
 * and handles the full lifecycle (pageview → session_end).
 */
export function initTracker(): () => void {
  // ── Guards ───────────────────────────────────────────────
  if (typeof window === "undefined") return () => {};
  if (typeof navigator !== "undefined" && navigator.doNotTrack === "1") return () => {};
  if (BOT_PATTERNS.test(navigator.userAgent)) return () => {};

  // ── Session identity ────────────────────────────────────
  let sessionId = sessionStorage.getItem("_a_sid");
  if (!sessionId) {
    sessionId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    sessionStorage.setItem("_a_sid", sessionId);
  }

  const startTime = Date.now();
  const sectionsViewed = new Set<string>();
  const interactions: InteractionRecord[] = [];
  let sessionEndSent = false;

  // ── Resolve the API endpoint ────────────────────────────
  const trackUrl = "/api/analytics/track";

  // ── 1. Send initial pageview (delayed 2s to skip bots) ──
  const pageviewTimer = window.setTimeout(() => {
    sendBeacon(trackUrl, {
      type: "pageview" as const,
      sessionId,
      timestamp: startTime,
      page: window.location.pathname + window.location.search,
      referrer: document.referrer || "",
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
    });
  }, 2000);

  // ── 2. Observe sections entering viewport ───────────────
  let observer: IntersectionObserver | null = null;
  const observeTimer = window.setTimeout(() => {
    const sections = document.querySelectorAll("section[id]");
    if (sections.length === 0) return;

    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.target.id) {
            sectionsViewed.add(entry.target.id);
          }
        }
      },
      { threshold: 0.3 }
    );

    sections.forEach((s) => observer!.observe(s));
  }, 3000);

  // ── 3. Track meaningful interactions via delegation ─────
  function handleClick(e: MouseEvent) {
    const el = (e.target as HTMLElement).closest(
      "a, button, [role='button']"
    ) as HTMLElement | null;
    if (!el) return;

    const label = getLabel(el);
    if (label && interactions.length < 100) {
      interactions.push({ type: "click", target: label });
    }
  }
  document.addEventListener("click", handleClick, { passive: true, capture: true });

  // ── 4. Send session_end on unload ───────────────────────
  function sendSessionEnd() {
    if (sessionEndSent) return;
    sessionEndSent = true;

    sendBeacon(trackUrl, {
      type: "session_end" as const,
      sessionId,
      timestamp: Date.now(),
      page: window.location.pathname + window.location.search,
      referrer: document.referrer || "",
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      sessionDuration: Math.round((Date.now() - startTime) / 1000),
      sectionsViewed: [...sectionsViewed],
      interactions,
    });
  }

  // Use both events for maximum reliability
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") sendSessionEnd();
  });
  window.addEventListener("pagehide", sendSessionEnd);

  // ── Cleanup function for React useEffect ────────────────
  return () => {
    clearTimeout(pageviewTimer);
    clearTimeout(observeTimer);
    observer?.disconnect();
    document.removeEventListener("click", handleClick, true);
  };
}

// ── Helpers ──────────────────────────────────────────────────

function sendBeacon(url: string, data: Record<string, unknown>): void {
  try {
    const body = JSON.stringify(data);
    // navigator.sendBeacon is reliable during unload
    if (navigator.sendBeacon) {
      const sent = navigator.sendBeacon(
        url,
        new Blob([body], { type: "application/json" })
      );
      if (sent) return;
    }
    // Fallback to fetch with keepalive
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Silent fail — never disrupt the user experience
  }
}

function getLabel(el: HTMLElement): string | null {
  // aria‑label is most descriptive
  const aria = el.getAttribute("aria-label");
  if (aria) return aria;

  // Text content (trimmed, max 60 chars)
  const text = el.textContent?.trim().replace(/\s+/g, " ").slice(0, 60);
  if (text && text.length > 1) return text;

  // Link href (without domain)
  if (el instanceof HTMLAnchorElement && el.href) {
    try {
      const u = new URL(el.href);
      if (u.origin !== window.location.origin) return `External: ${u.hostname}`;
      return u.pathname;
    } catch {
      return el.href.slice(0, 60);
    }
  }

  // ID as last resort
  return el.id || null;
}
