// ─────────────────────────────────────────────────────────────
// Stealth Analytics — Storage Layer
// Upstash Redis in production · in‑memory Map for local dev
// ─────────────────────────────────────────────────────────────

import { Redis } from "@upstash/redis";
import type { StoredVisit } from "./types";

// ── Redis singleton ──────────────────────────────────────────
let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (redis) return redis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    redis = new Redis({ url, token });
    return redis;
  }
  return null;
}

// ── In‑memory fallback (dev only) ────────────────────────────
const memSessions = new Map<string, StoredVisit>();
const memDateIndex = new Map<string, Set<string>>();

const TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

// ── Public API ───────────────────────────────────────────────

/** Create or update a visit record keyed by sessionId */
export async function upsertVisit(visit: StoredVisit): Promise<void> {
  const dateKey = new Date(visit.timestamp).toISOString().split("T")[0];
  const r = getRedis();

  if (r) {
    // Store as a Redis hash
    const key = `analytics:visit:${visit.sessionId}`;
    await r.hset(key, {
      ...visit,
      sectionsViewed: JSON.stringify(visit.sectionsViewed),
      interactions: JSON.stringify(visit.interactions),
    });
    await r.expire(key, TTL_SECONDS);

    // Add session to the date index
    const indexKey = `analytics:index:${dateKey}`;
    await r.sadd(indexKey, visit.sessionId);
    await r.expire(indexKey, TTL_SECONDS);
  } else {
    // In‑memory fallback
    memSessions.set(visit.sessionId, visit);
    if (!memDateIndex.has(dateKey)) memDateIndex.set(dateKey, new Set());
    memDateIndex.get(dateKey)!.add(visit.sessionId);
    console.log(
      `[Analytics·Dev] Stored visit ${visit.sessionId} — ${visit.browser} / ${visit.os} / ${visit.country}`
    );
  }
}

/** Merge session‑end data into an existing visit */
export async function mergeSessionEnd(
  sessionId: string,
  data: {
    sessionDuration: number;
    sectionsViewed: string[];
    interactions: string[];
  }
): Promise<void> {
  const r = getRedis();

  if (r) {
    const key = `analytics:visit:${sessionId}`;
    const exists = await r.exists(key);
    if (exists) {
      await r.hset(key, {
        sessionDuration: data.sessionDuration,
        sectionsViewed: JSON.stringify(data.sectionsViewed),
        interactions: JSON.stringify(data.interactions),
      });
    }
  } else {
    const existing = memSessions.get(sessionId);
    if (existing) {
      existing.sessionDuration = data.sessionDuration;
      existing.sectionsViewed = data.sectionsViewed;
      existing.interactions = data.interactions;
    }
  }
}

/** Retrieve all visits for a given date (YYYY‑MM‑DD) */
export async function getVisitsForDate(date: string): Promise<StoredVisit[]> {
  const r = getRedis();

  if (r) {
    const indexKey = `analytics:index:${date}`;
    const sessionIds = await r.smembers(indexKey);
    if (!sessionIds || sessionIds.length === 0) return [];

    const visits: StoredVisit[] = [];
    for (const sid of sessionIds) {
      const raw = await r.hgetall(`analytics:visit:${sid}`);
      if (raw) {
        visits.push({
          ...(raw as Record<string, unknown>),
          sessionDuration: Number(raw.sessionDuration ?? 0),
          screenWidth: Number(raw.screenWidth ?? 0),
          screenHeight: Number(raw.screenHeight ?? 0),
          timestamp: Number(raw.timestamp ?? 0),
          sectionsViewed: parseJSON(raw.sectionsViewed as string, []),
          interactions: parseJSON(raw.interactions as string, []),
        } as unknown as StoredVisit);
      }
    }
    return visits;
  } else {
    const ids = memDateIndex.get(date);
    if (!ids) return [];
    return [...ids]
      .map((id) => memSessions.get(id))
      .filter(Boolean) as StoredVisit[];
  }
}

/** Clear visits for a given date (after sending digest) */
export async function clearVisitsForDate(date: string): Promise<void> {
  const r = getRedis();

  if (r) {
    const indexKey = `analytics:index:${date}`;
    const sessionIds = await r.smembers(indexKey);
    if (sessionIds && sessionIds.length > 0) {
      const pipeline = r.pipeline();
      for (const sid of sessionIds) {
        pipeline.del(`analytics:visit:${sid}`);
      }
      pipeline.del(indexKey);
      await pipeline.exec();
    }
  } else {
    const ids = memDateIndex.get(date);
    if (ids) {
      for (const id of ids) memSessions.delete(id);
      memDateIndex.delete(date);
    }
  }
}

// ── Helpers ──────────────────────────────────────────────────

function parseJSON<T>(str: unknown, fallback: T): T {
  if (typeof str !== "string") return fallback;
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}
