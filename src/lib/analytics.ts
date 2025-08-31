import posthog from "posthog-js";
import type { PostHogConfig } from "posthog-js";

// PostHog 타입 확장
declare global {
  interface Window {
    posthog?: typeof posthog;
  }
}

// Analytics configuration
const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST =
  process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com";

// Initialize PostHog
export function initAnalytics() {
  if (typeof window === "undefined" || !POSTHOG_KEY) {
    return;
  }

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    capture_pageview: true,
    capture_pageleave: true,
    persistence: "localStorage",
    loaded: (posthog) => {
      if (process.env.NODE_ENV === "development") {
        console.log("PostHog loaded:", posthog);
      }
    },
  } as PostHogConfig);
}

// Analytics tracking functions
export const analytics = {
  // User identification
  identify: (userId: string, properties?: Record<string, any>) => {
    if (typeof window === "undefined" || !POSTHOG_KEY) return;
    posthog.identify(userId, properties);
  },

  // User properties update
  setUserProperties: (properties: Record<string, any>) => {
    if (typeof window === "undefined" || !POSTHOG_KEY) return;
    posthog.people.set(properties);
  },

  // Track events
  track: (eventName: string, properties?: Record<string, any>) => {
    if (typeof window === "undefined" || !POSTHOG_KEY) return;
    posthog.capture(eventName, properties);
  },

  // Page view tracking
  trackPageView: (pageName?: string) => {
    if (typeof window === "undefined" || !POSTHOG_KEY) return;
    posthog.capture("$pageview", { page: pageName });
  },

  // Feature usage tracking
  trackFeatureUsage: (
    featureName: string,
    properties?: Record<string, any>
  ) => {
    if (typeof window === "undefined" || !POSTHOG_KEY) return;
    posthog.capture("feature_used", {
      feature: featureName,
      ...properties,
    });
  },

  // Error tracking
  trackError: (error: Error, context?: Record<string, any>) => {
    if (typeof window === "undefined" || !POSTHOG_KEY) return;
    posthog.capture("error_occurred", {
      error: error.message,
      stack: error.stack,
      ...context,
    });
  },

  // Performance tracking
  trackPerformance: (
    metricName: string,
    value: number,
    properties?: Record<string, any>
  ) => {
    if (typeof window === "undefined" || !POSTHOG_KEY) return;
    posthog.capture("performance_metric", {
      metric: metricName,
      value,
      ...properties,
    });
  },

  // User logout
  reset: () => {
    if (typeof window === "undefined" || !POSTHOG_KEY) return;
    posthog.reset();
  },
};

// Export PostHog instance for advanced usage
export { posthog };
