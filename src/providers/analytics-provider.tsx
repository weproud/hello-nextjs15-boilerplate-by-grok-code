"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { initAnalytics } from "@/lib/analytics";

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Initialize PostHog on client-side
    initAnalytics();
  }, []);

  // Track page views on route changes
  useEffect(() => {
    if (pathname) {
      // Small delay to ensure PostHog is initialized
      const timer = setTimeout(() => {
        if (typeof window !== "undefined" && window.posthog) {
          window.posthog.capture("$pageview", {
            $current_url: window.location.href,
          });
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams]);

  return <>{children}</>;
}
