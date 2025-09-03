"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertTriangle, Bug, Home, RefreshCw } from "lucide-react";
import { useEffect } from "react";

// 에러 타입별 분류
const getErrorType = (error: Error) => {
  if (error.message?.includes("Network")) return "network";
  if (error.message?.includes("auth")) return "auth";
  if (error.message?.includes("permission")) return "permission";
  return "unknown";
};

// 환경별 에러 로깅
const logError = (error: Error & { digest?: string }) => {
  const errorInfo = {
    message: error.message,
    stack: error.stack,
    digest: error.digest,
    timestamp: new Date().toISOString(),
    userAgent:
      typeof window !== "undefined" ? window.navigator.userAgent : "server",
    url: typeof window !== "undefined" ? window.location.href : "server",
  };

  // 개발 환경에서는 콘솔에 자세한 정보 출력
  if (process.env.NODE_ENV === "development") {
    console.group("🚨 Global Error");
    console.error("Error details:", errorInfo);
    console.error("Original error:", error);
    console.groupEnd();
  }

  // 프로덕션 환경에서는 에러 리포팅 서비스로 전송 (준비)
  if (process.env.NODE_ENV === "production") {
    // TODO: 에러 리포팅 서비스 연동 (Sentry, LogRocket 등)
    console.error("Production error:", {
      message: error.message,
      digest: error.digest,
      timestamp: errorInfo.timestamp,
    });
  }
};

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const errorType = getErrorType(error);
  const isDevelopment = process.env.NODE_ENV === "development";

  useEffect(() => {
    logError(error);
  }, [error]);

  const getErrorMessage = () => {
    switch (errorType) {
      case "network":
        return "네트워크 연결에 문제가 있습니다.";
      case "auth":
        return "인증에 문제가 발생했습니다.";
      case "permission":
        return "접근 권한이 없습니다.";
      default:
        return "예상치 못한 오류가 발생했습니다.";
    }
  };

  const getErrorIcon = () => {
    switch (errorType) {
      case "network":
        return <AlertTriangle className="h-12 w-12 text-orange-500" />;
      case "auth":
      case "permission":
        return <Bug className="h-12 w-12 text-red-500" />;
      default:
        return <AlertTriangle className="h-12 w-12 text-red-600" />;
    }
  };

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
          <Card className="w-full max-w-lg">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">{getErrorIcon()}</div>
              <CardTitle className="text-2xl font-bold text-red-600">
                심각한 오류가 발생했습니다
              </CardTitle>
              <CardDescription className="text-base">
                {getErrorMessage()}
              </CardDescription>

              {/* 개발 환경에서만 자세한 에러 정보 표시 */}
              {isDevelopment && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-left">
                  <details>
                    <summary className="cursor-pointer font-medium text-red-800">
                      🔍 개발자 정보 (클릭하여 펼치기)
                    </summary>
                    <div className="mt-2 text-sm text-red-700">
                      <p>
                        <strong>메시지:</strong> {error.message}
                      </p>
                      {error.digest && (
                        <p>
                          <strong>Digest:</strong> {error.digest}
                        </p>
                      )}
                      <p>
                        <strong>타임스탬프:</strong> {new Date().toISOString()}
                      </p>
                    </div>
                  </details>
                </div>
              )}
            </CardHeader>
            <CardContent className="flex flex-col space-y-3">
              <Button onClick={reset} variant="default" className="w-full">
                <RefreshCw className="mr-2 h-4 w-4" />
                페이지 새로고침
              </Button>
              <Button
                onClick={() => (window.location.href = "/")}
                variant="outline"
                className="w-full"
              >
                <Home className="mr-2 h-4 w-4" />
                홈으로 이동
              </Button>

              {isDevelopment && (
                <Button
                  onClick={() => window.location.reload()}
                  variant="ghost"
                  className="w-full text-xs"
                >
                  💡 하드 리프레시 (캐시 클리어)
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </body>
    </html>
  );
}
