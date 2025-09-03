"use client";

import {
  FontMetricsOptimizer,
  FontOptimizer,
  FontPreloader,
} from "@/components/font-optimizer";
import { AppProvider } from "@/contexts/app-context";
import { captureError, initErrorMonitoring } from "@/lib/error-monitoring";
import { initPerformanceMonitoring } from "@/lib/performance-monitoring";
import { useEffect } from "react";
import { AnalyticsProvider } from "./analytics-provider";
import { QueryProvider } from "./query-provider";
import { SessionProvider } from "./session-provider";
import { ThemeProvider } from "./theme-provider";
import { UIProvider } from "./ui-provider";

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  // 에러 모니터링 초기화
  useEffect(() => {
    initErrorMonitoring({
      enabled: process.env.NODE_ENV === "production",
      environment: (process.env.NODE_ENV as any) || "development",
      sampleRate: 0.1, // 10% 샘플링
      beforeSend: (error) => {
        // 민감한 정보 필터링
        if (
          error.message.includes("password") ||
          error.message.includes("token")
        ) {
          return null; // 민감한 에러는 전송하지 않음
        }
        return error;
      },
      onError: (error) => {
        // 개발 환경에서 추가 로깅
        if (process.env.NODE_ENV === "development") {
          console.log("📊 Error sent to monitoring:", error);
        }
      },
    });

    // 성능 모니터링 초기화
    initPerformanceMonitoring();
  }, []);

  // 전역 에러 핸들링
  useEffect(() => {
    const handleUnhandledError = (event: ErrorEvent) => {
      captureError(event.error || new Error(event.message), {
        type: "global_error",
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error =
        event.reason instanceof Error
          ? event.reason
          : new Error(String(event.reason));

      captureError(error, {
        type: "unhandled_promise_rejection",
        severity: "high",
      });
    };

    window.addEventListener("error", handleUnhandledError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleUnhandledError);
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection
      );
    };
  }, []);

  return (
    <SessionProvider>
      <QueryProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <UIProvider>
            <AnalyticsProvider>
              <AppProvider>
                {/* 폰트 최적화 컴포넌트들 */}
                <FontPreloader />
                <FontMetricsOptimizer />
                <FontOptimizer>{children}</FontOptimizer>
              </AppProvider>
            </AnalyticsProvider>
          </UIProvider>
        </ThemeProvider>
      </QueryProvider>
    </SessionProvider>
  );
}
