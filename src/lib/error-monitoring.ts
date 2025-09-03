import { z } from "zod";

// 에러 정보 스키마
const ErrorInfoSchema = z.object({
  message: z.string(),
  stack: z.string().optional(),
  name: z.string().optional(),
  cause: z.any().optional(),
  timestamp: z.string(),
  url: z.string(),
  userAgent: z.string(),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
  context: z.record(z.string(), z.any()).optional(),
  severity: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  tags: z.array(z.string()).default([]),
});

type ErrorInfo = z.infer<typeof ErrorInfoSchema>;

// 에러 모니터링 설정
interface ErrorMonitoringConfig {
  enabled: boolean;
  dsn?: string;
  environment: "development" | "staging" | "production";
  sampleRate: number;
  ignoreErrors: string[];
  beforeSend?: (error: ErrorInfo) => ErrorInfo | null;
  onError?: (error: ErrorInfo) => void;
}

// 기본 설정
const defaultConfig: ErrorMonitoringConfig = {
  enabled: process.env.NODE_ENV === "production",
  environment: (process.env.NODE_ENV as any) || "development",
  sampleRate: 1.0,
  ignoreErrors: [
    "Network request failed",
    "Failed to fetch",
    "Load failed",
    "Script error",
    "ResizeObserver loop limit exceeded",
  ],
};

// 설정 관리
let monitoringConfig = { ...defaultConfig };

// 설정 업데이트
export function updateErrorMonitoringConfig(
  config: Partial<ErrorMonitoringConfig>
) {
  monitoringConfig = { ...monitoringConfig, ...config };
}

// 에러 정보 수집
function collectErrorInfo(
  error: Error,
  context?: Record<string, any>
): ErrorInfo {
  const errorInfo = {
    message: error.message,
    stack: error.stack,
    name: error.name,
    timestamp: new Date().toISOString(),
    url: typeof window !== "undefined" ? window.location.href : "server",
    userAgent:
      typeof window !== "undefined" ? window.navigator.userAgent : "server",
    context,
  };

  return ErrorInfoSchema.parse(errorInfo);
}

// 샘플링 결정
function shouldSampleError(): boolean {
  return Math.random() < monitoringConfig.sampleRate;
}

// 에러 필터링
function shouldIgnoreError(error: ErrorInfo): boolean {
  return monitoringConfig.ignoreErrors.some(
    (ignorePattern) =>
      error.message.includes(ignorePattern) ||
      error.name?.includes(ignorePattern)
  );
}

// 에러 전송
async function sendErrorToService(errorInfo: ErrorInfo): Promise<void> {
  if (!monitoringConfig.enabled || !monitoringConfig.dsn) {
    return;
  }

  try {
    const payload = {
      ...errorInfo,
      environment: monitoringConfig.environment,
      version: process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0",
      platform: "nextjs",
    };

    // 실제 서비스로 전송 (Sentry, LogRocket 등)
    if (monitoringConfig.dsn.startsWith("https://")) {
      await fetch(monitoringConfig.dsn, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
    } else {
      // 개발 환경에서는 콘솔에 로깅
      console.group("🚨 Error Monitoring");
      console.error("Error captured:", payload);
      console.groupEnd();
    }

    // 커스텀 콜백 실행
    monitoringConfig.onError?.(errorInfo);
  } catch (sendError) {
    console.warn("Failed to send error to monitoring service:", sendError);
  }
}

// 메인 에러 캡처 함수
export function captureError(
  error: Error,
  context?: Record<string, any>
): void {
  try {
    const errorInfo = collectErrorInfo(error, context);

    // 샘플링 및 필터링
    if (!shouldSampleError() || shouldIgnoreError(errorInfo)) {
      return;
    }

    // beforeSend 후크
    const processedError = monitoringConfig.beforeSend
      ? monitoringConfig.beforeSend(errorInfo)
      : errorInfo;

    if (processedError) {
      sendErrorToService(processedError);
    }
  } catch (captureError) {
    console.error("Error in error monitoring:", captureError);
  }
}

// React 에러 바운더리용 에러 캡처
export function captureReactError(
  error: Error,
  errorInfo: { componentStack: string }
): void {
  captureError(error, {
    componentStack: errorInfo.componentStack,
    framework: "react",
    type: "react_error_boundary",
  });
}

// API 에러 캡처
export function captureApiError(
  error: Error,
  context: {
    url: string;
    method: string;
    statusCode?: number;
    requestBody?: any;
    responseBody?: any;
  }
): void {
  captureError(error, {
    ...context,
    type: "api_error",
    severity:
      context.statusCode && context.statusCode >= 500 ? "high" : "medium",
  });
}

// 사용자 액션 에러 캡처
export function captureUserActionError(
  error: Error,
  action: string,
  metadata?: Record<string, any>
): void {
  captureError(error, {
    action,
    type: "user_action_error",
    ...metadata,
  });
}

// 성능 이슈 캡처
export function capturePerformanceIssue(
  issue: {
    name: string;
    value: number;
    threshold: number;
  },
  context?: Record<string, any>
): void {
  const error = new Error(
    `${issue.name} exceeded threshold: ${issue.value}ms (limit: ${issue.threshold}ms)`
  );

  captureError(error, {
    ...context,
    type: "performance_issue",
    metric: issue.name,
    value: issue.value,
    threshold: issue.threshold,
    severity: "low",
  });
}

// 에러 모니터링 초기화
export function initErrorMonitoring(
  config?: Partial<ErrorMonitoringConfig>
): void {
  if (config) {
    updateErrorMonitoringConfig(config);
  }

  // 전역 에러 핸들러 설정
  if (typeof window !== "undefined") {
    window.addEventListener("error", (event) => {
      captureError(event.error || new Error(event.message), {
        type: "global_error",
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });

    window.addEventListener("unhandledrejection", (event) => {
      const error =
        event.reason instanceof Error
          ? event.reason
          : new Error(String(event.reason));

      captureError(error, {
        type: "unhandled_promise_rejection",
        severity: "high",
      });
    });
  }

  console.log(
    `📊 Error monitoring ${
      monitoringConfig.enabled ? "enabled" : "disabled"
    } for ${monitoringConfig.environment}`
  );
}

// 유틸리티 함수들
export const errorMonitoringUtils = {
  // 에러 심각도 계산
  calculateSeverity: (
    error: Error,
    context?: Record<string, any>
  ): ErrorInfo["severity"] => {
    if (context?.statusCode && context.statusCode >= 500) return "critical";
    if (
      error.message.includes("TypeError") ||
      error.message.includes("ReferenceError")
    )
      return "high";
    if (context?.type === "api_error") return "medium";
    return "low";
  },

  // 에러 그룹화 키 생성
  generateErrorKey: (error: Error): string => {
    return `${error.name}:${error.message.split(" ").slice(0, 3).join(" ")}`;
  },

  // 사용자 친화적인 에러 메시지 생성
  getUserFriendlyMessage: (error: Error): string => {
    if (error.message.includes("Network"))
      return "네트워크 연결에 문제가 있습니다.";
    if (error.message.includes("timeout")) return "요청 시간이 초과되었습니다.";
    if (error.message.includes("404"))
      return "요청한 페이지를 찾을 수 없습니다.";
    if (error.message.includes("500")) return "서버 오류가 발생했습니다.";
    return "알 수 없는 오류가 발생했습니다.";
  },
};

// 모니터링 메트릭 수집
export const monitoringMetrics = {
  errors: 0,
  apiErrors: 0,
  performanceIssues: 0,
  userActionErrors: 0,

  increment: (
    type: "errors" | "apiErrors" | "performanceIssues" | "userActionErrors"
  ) => {
    if (typeof monitoringMetrics[type] === "number") {
      (monitoringMetrics[type] as number)++;
    }
  },

  reset: () => {
    monitoringMetrics.errors = 0;
    monitoringMetrics.apiErrors = 0;
    monitoringMetrics.performanceIssues = 0;
    monitoringMetrics.userActionErrors = 0;
  },

  getSummary: () => ({
    ...monitoringMetrics,
    timestamp: new Date().toISOString(),
  }),
};
