import { capturePerformanceIssue } from "./error-monitoring";

// Web Vitals 메트릭 타입
export interface WebVitalsMetric {
  name: string;
  value: number;
  id: string;
  delta: number;
}

// 성능 메트릭 타입
export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  context?: Record<string, any>;
}

// 성능 임계값
export const PERFORMANCE_THRESHOLDS = {
  // Core Web Vitals (Google 권장)
  LCP: { good: 2500, needsImprovement: 4000 }, // Largest Contentful Paint
  FID: { good: 100, needsImprovement: 300 }, // First Input Delay
  CLS: { good: 0.1, needsImprovement: 0.25 }, // Cumulative Layout Shift
  FCP: { good: 1800, needsImprovement: 3000 }, // First Contentful Paint
  TTFB: { good: 800, needsImprovement: 1800 }, // Time to First Byte

  // 추가 메트릭
  TBT: { good: 200, needsImprovement: 600 }, // Total Blocking Time
  SI: { good: 3400, needsImprovement: 5800 }, // Speed Index
} as const;

// 성능 등급 계산
export function getPerformanceRating(
  metricName: string,
  value: number
): "good" | "needs-improvement" | "poor" {
  const thresholds =
    PERFORMANCE_THRESHOLDS[metricName as keyof typeof PERFORMANCE_THRESHOLDS];
  if (!thresholds) return "good";

  if (value <= thresholds.good) return "good";
  if (value <= thresholds.needsImprovement) return "needs-improvement";
  return "poor";
}

// Web Vitals 추적 함수
export function trackWebVitals(metric: WebVitalsMetric): void {
  const rating = getPerformanceRating(metric.name, metric.value);

  // 성능 메트릭 로깅
  const metricData = {
    name: metric.name,
    value: metric.value,
    rating,
    id: metric.id,
    delta: metric.delta,
    timestamp: Date.now(),
    url: typeof window !== "undefined" ? window.location.href : "",
    userAgent: typeof window !== "undefined" ? window.navigator.userAgent : "",
  };

  // 콘솔 로깅 (개발 환경)
  if (process.env.NODE_ENV === "development") {
    console.group(`📊 Web Vital: ${metric.name}`);
    console.log(`Value: ${metric.value}ms`);
    console.log(`Rating: ${rating}`);
    console.log(`Delta: ${metric.delta}`);
    console.groupEnd();
  }

  // 성능 이슈 감지 및 리포팅
  if (rating === "poor") {
    capturePerformanceIssue(
      {
        name: metric.name,
        value: metric.value,
        threshold:
          PERFORMANCE_THRESHOLDS[
            metric.name as keyof typeof PERFORMANCE_THRESHOLDS
          ]?.good || 0,
      },
      metricData
    );
  }

  // 분석 서비스로 전송 (실제 구현 시)
  sendMetricToAnalytics(metricData);
}

// 커스텀 성능 메트릭 추적
export function trackCustomMetric(
  name: string,
  value: number,
  context?: Record<string, any>
): void {
  const metric: PerformanceMetric = {
    name,
    value,
    timestamp: Date.now(),
    context,
  };

  // 콘솔 로깅 (개발 환경)
  if (process.env.NODE_ENV === "development") {
    console.log(`📈 Custom Metric: ${name} = ${value}`, context);
  }

  // 분석 서비스로 전송
  sendMetricToAnalytics(metric);
}

// 페이지 로드 성능 추적
export function trackPageLoad(): void {
  if (typeof window === "undefined") return;

  // Navigation Timing API 사용
  window.addEventListener("load", () => {
    setTimeout(() => {
      const navigation = performance.getEntriesByType(
        "navigation"
      )[0] as PerformanceNavigationTiming;

      if (navigation) {
        trackCustomMetric(
          "page_load_time",
          navigation.loadEventEnd - navigation.loadEventStart
        );
        trackCustomMetric(
          "dom_content_loaded",
          navigation.domContentLoadedEventEnd -
            navigation.domContentLoadedEventStart
        );
        trackCustomMetric(
          "first_paint",
          performance.getEntriesByName("first-paint")[0]?.startTime || 0
        );
        trackCustomMetric(
          "first_contentful_paint",
          performance.getEntriesByName("first-contentful-paint")[0]
            ?.startTime || 0
        );
      }
    }, 0);
  });
}

// 리소스 로딩 성능 추적
export function trackResourceLoading(): void {
  if (typeof window === "undefined") return;

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const resourceEntry = entry as PerformanceResourceTiming;

      // 큰 리소스 파일 추적
      if (resourceEntry.transferSize > 100000) {
        // 100KB 이상
        trackCustomMetric(
          `large_resource_${resourceEntry.name.split("/").pop()}`,
          resourceEntry.duration,
          {
            url: resourceEntry.name,
            size: resourceEntry.transferSize,
            type: resourceEntry.initiatorType,
          }
        );
      }

      // 느린 리소스 추적
      if (resourceEntry.duration > 2000) {
        // 2초 이상
        trackCustomMetric(
          `slow_resource_${resourceEntry.name.split("/").pop()}`,
          resourceEntry.duration,
          {
            url: resourceEntry.name,
            type: resourceEntry.initiatorType,
          }
        );
      }
    }
  });

  observer.observe({ entryTypes: ["resource"] });
}

// 사용자 인터랙션 성능 추적
export function trackUserInteractions(): void {
  if (typeof window === "undefined") return;

  let clickCount = 0;
  let lastClickTime = 0;

  const handleClick = (event: MouseEvent) => {
    clickCount++;
    const now = Date.now();
    const timeSinceLastClick = now - lastClickTime;

    // 빠른 연속 클릭 감지 (잠재적 성능 문제)
    if (timeSinceLastClick < 100 && clickCount > 3) {
      trackCustomMetric("rapid_clicks_detected", clickCount, {
        timeSinceLastClick,
        target: (event.target as Element)?.tagName,
      });
    }

    lastClickTime = now;

    // 클릭 지연 시간 추적
    requestAnimationFrame(() => {
      const clickDelay = Date.now() - now;
      if (clickDelay > 100) {
        trackCustomMetric("click_delay", clickDelay, {
          target: (event.target as Element)?.tagName,
        });
      }
    });
  };

  window.addEventListener("click", handleClick, { passive: true });
}

// 메모리 사용량 추적
export function trackMemoryUsage(): void {
  if (typeof window === "undefined") return;

  // performance.memory는 Chrome에서만 사용 가능
  const performanceMemory = (performance as any).memory;
  if (!performanceMemory) return;

  const trackMemory = () => {
    const memory = performanceMemory;

    trackCustomMetric("memory_used", memory.usedJSHeapSize / 1024 / 1024, {
      total: memory.totalJSHeapSize / 1024 / 1024,
      limit: memory.jsHeapSizeLimit / 1024 / 1024,
    });

    // 메모리 누수 감지
    if (memory.usedJSHeapSize / memory.jsHeapSizeLimit > 0.8) {
      trackCustomMetric(
        "high_memory_usage",
        memory.usedJSHeapSize / memory.jsHeapSizeLimit
      );
    }
  };

  // 30초마다 메모리 사용량 추적
  setInterval(trackMemory, 30000);
  trackMemory(); // 초기 추적
}

// 네트워크 상태 추적
export function trackNetworkStatus(): void {
  if (typeof window === "undefined") return;

  const updateNetworkStatus = () => {
    const connection = (navigator as any).connection;

    if (connection) {
      trackCustomMetric("network_effective_type", 0, {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
      });

      // 느린 연결 감지
      if (
        connection.effectiveType === "slow-2g" ||
        connection.effectiveType === "2g"
      ) {
        trackCustomMetric("slow_network_detected", connection.downlink);
      }
    }
  };

  updateNetworkStatus();

  // 네트워크 상태 변경 감지
  if ((navigator as any).connection) {
    (navigator as any).connection.addEventListener(
      "change",
      updateNetworkStatus
    );
  }
}

// 분석 서비스로 메트릭 전송 (실제 구현 시 교체)
function sendMetricToAnalytics(metric: PerformanceMetric | any): void {
  // 실제 분석 서비스 (Google Analytics, Mixpanel 등)로 전송
  if (process.env.NODE_ENV === "production") {
    try {
      // Google Analytics 4
      if (typeof window !== "undefined" && (window as any).gtag) {
        (window as any).gtag("event", "performance_metric", {
          custom_parameter_1: metric.name,
          custom_parameter_2: metric.value,
          custom_parameter_3: metric.timestamp,
        });
      }

      // Custom analytics endpoint
      fetch("/api/analytics/performance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(metric),
      }).catch(() => {
        // 전송 실패 시 무시
      });
    } catch (error) {
      console.warn("Failed to send metric to analytics:", error);
    }
  }
}

// Long Task API를 통한 블로킹 작업 추적
export function trackLongTasks(): void {
  if (typeof window === "undefined" || !window.PerformanceObserver) return;

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.duration > 50) {
        // 50ms 이상의 긴 작업
        trackCustomMetric("long_task", entry.duration, {
          startTime: entry.startTime,
          name: entry.name,
        });
      }
    }
  });

  observer.observe({ entryTypes: ["longtask"] });
}

// 성능 모니터링 초기화
export function initPerformanceMonitoring(): void {
  if (typeof window === "undefined") return;

  // Web Vitals 로드 (실제 프로젝트에서는 web-vitals 패키지 사용)
  try {
    import("web-vitals")
      .then(({ getCLS, getFID, getFCP, getLCP, getTTFB }: any) => {
        getCLS(trackWebVitals);
        getFID(trackWebVitals);
        getFCP(trackWebVitals);
        getLCP(trackWebVitals);
        getTTFB(trackWebVitals);
      })
      .catch(() => {
        console.warn("web-vitals package not available");
      });
  } catch (error) {
    console.warn("Failed to load web-vitals:", error);
  }

  // 기타 성능 모니터링 시작
  trackPageLoad();
  trackResourceLoading();
  trackUserInteractions();
  trackMemoryUsage();
  trackNetworkStatus();
  trackLongTasks();

  console.log("🚀 Performance monitoring initialized");
}

// 성능 리포트 생성
export function generatePerformanceReport(): {
  metrics: PerformanceMetric[];
  summary: Record<string, number>;
  recommendations: string[];
} {
  const metrics: PerformanceMetric[] = [];
  const summary = {
    totalMetrics: 0,
    poorMetrics: 0,
    goodMetrics: 0,
    averageResponseTime: 0,
  };

  const recommendations: string[] = [];

  // 메트릭 분석 및 추천사항 생성
  if (summary.poorMetrics > 5) {
    recommendations.push(
      "성능 최적화가 필요합니다. 큰 리소스 파일을 압축하거나 CDN을 고려해보세요."
    );
  }

  if (summary.averageResponseTime > 2000) {
    recommendations.push(
      "API 응답 시간이 느립니다. 캐싱 전략이나 데이터베이스 최적화를 고려해보세요."
    );
  }

  return { metrics, summary, recommendations };
}
