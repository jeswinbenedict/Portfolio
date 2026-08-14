"use client";

import { useEffect } from "react";
import { initTracker } from "@/lib/analytics/tracker";

/**
 * Invisible analytics provider.
 * Renders absolutely nothing in the DOM.
 * Initialises the tracker on mount and cleans up on unmount.
 */
export default function AnalyticsProvider() {
  useEffect(() => {
    const cleanup = initTracker();
    return cleanup;
  }, []);

  return null;
}
