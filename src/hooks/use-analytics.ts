import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { analytics } from "@/lib/analytics";
import { useAuth } from "./use-auth";

// Analytics hook for React components
export function useAnalytics() {
  const { user } = useAuth();
  const router = useRouter();

  // Track page views automatically
  useEffect(() => {
    if (typeof window !== "undefined") {
      analytics.trackPageView(window.location.pathname);
    }
  }, [router]);

  // Identify user when authenticated
  useEffect(() => {
    if (user?.id) {
      analytics.identify(user.id, {
        email: user.email,
        name: user.name,
        role: user.role,
      });
    }
  }, [user]);

  const trackEvent = useCallback(
    (eventName: string, properties?: Record<string, any>) => {
      analytics.track(eventName, {
        ...properties,
        userId: user?.id,
        timestamp: new Date().toISOString(),
      });
    },
    [user?.id]
  );

  const trackFeatureUsage = useCallback(
    (featureName: string, properties?: Record<string, any>) => {
      analytics.trackFeatureUsage(featureName, {
        ...properties,
        userId: user?.id,
      });
    },
    [user?.id]
  );

  const trackError = useCallback(
    (error: Error, context?: Record<string, any>) => {
      analytics.trackError(error, {
        ...context,
        userId: user?.id,
        userAgent:
          typeof navigator !== "undefined" ? navigator.userAgent : undefined,
      });
    },
    [user?.id]
  );

  return {
    trackEvent,
    trackFeatureUsage,
    trackError,
    trackPerformance: analytics.trackPerformance,
    setUserProperties: analytics.setUserProperties,
  };
}

// Specific tracking hooks for common events
export function useTracking() {
  const { trackEvent, trackFeatureUsage } = useAnalytics();

  return {
    // Direct tracking
    trackEvent,

    // Auth events
    trackSignIn: (method: string) => trackEvent("user_signed_in", { method }),

    trackSignUp: (method: string) => trackEvent("user_signed_up", { method }),

    trackSignOut: () => trackEvent("user_signed_out"),

    // Post events
    trackPostCreated: (postId: string) =>
      trackEvent("post_created", { postId }),

    trackPostViewed: (postId: string) => trackEvent("post_viewed", { postId }),

    trackPostEdited: (postId: string) => trackEvent("post_edited", { postId }),

    trackPostDeleted: (postId: string) =>
      trackEvent("post_deleted", { postId }),

    // Comment events
    trackCommentAdded: (postId: string, commentId: string) =>
      trackEvent("comment_added", { postId, commentId }),

    trackCommentDeleted: (commentId: string) =>
      trackEvent("comment_deleted", { commentId }),

    // Feature usage
    trackSearchUsed: (query: string) => trackFeatureUsage("search", { query }),

    trackFilterApplied: (filterType: string, value: string) =>
      trackFeatureUsage("filter", { filterType, value }),

    trackExportUsed: (exportType: string) =>
      trackFeatureUsage("export", { exportType }),

    // UI interactions
    trackButtonClick: (buttonName: string, context?: string) =>
      trackEvent("button_clicked", { buttonName, context }),

    trackModalOpened: (modalName: string) =>
      trackEvent("modal_opened", { modalName }),

    trackModalClosed: (modalName: string) =>
      trackEvent("modal_closed", { modalName }),

    // Navigation
    trackNavigation: (from: string, to: string) =>
      trackEvent("navigation", { from, to }),
  };
}
