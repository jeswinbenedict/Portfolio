// ─────────────────────────────────────────────────────────────
// Stealth Analytics — Shared Types
// ─────────────────────────────────────────────────────────────

/** Payload sent from the client tracker to the server API */
export interface TrackingPayload {
  type: "pageview" | "session_end";
  sessionId: string;
  timestamp: number;
  page: string;
  referrer: string;
  screenWidth: number;
  screenHeight: number;
  // Session‑end enrichment
  sessionDuration?: number;
  sectionsViewed?: string[];
  interactions?: { type: string; target: string }[];
}

/** Normalised visit record persisted in the store */
export interface StoredVisit {
  sessionId: string;
  timestamp: number;
  page: string;
  referrer: string;
  referrerSource: string;
  browser: string;
  browserVersion: string;
  os: string;
  device: string;
  country: string;
  city: string;
  region: string;
  screenWidth: number;
  screenHeight: number;
  sessionDuration: number;
  sectionsViewed: string[];
  interactions: string[];
}

/** Aggregated daily digest sent via email */
export interface DigestData {
  date: string;
  period: string;
  totalVisits: number;
  uniqueSessions: number;
  avgSessionDuration: number;
  maxSessionDuration: number;
  referrerBreakdown: { source: string; count: number; percentage: number }[];
  countryBreakdown: { source: string; count: number; percentage: number }[];
  cityBreakdown: { city: string; count: number }[];
  browserBreakdown: { source: string; count: number; percentage: number }[];
  deviceBreakdown: { source: string; count: number; percentage: number }[];
  osBreakdown: { source: string; count: number; percentage: number }[];
  sectionViews: { section: string; views: number; percentage: number }[];
  topInteractions: { action: string; count: number }[];
  peakHours: { hour: number; count: number }[];
}
