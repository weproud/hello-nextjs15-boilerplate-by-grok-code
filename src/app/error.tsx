"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, ArrowLeft, Home, RefreshCw } from "lucide-react";
import { useEffect } from "react";

// 에러 로깅 헬퍼
const logError = (error: Error & { digest?: string }, context: string) => {
  const errorInfo = {
    message: error.message,
    stack: error.stack,
    digest: error.digest,
    context,
    timestamp: new Date().toISOString(),
    url: typeof window !== "undefined" ? window.location.href : "server",
  };

  if (process.env.NODE_ENV === "development") {
    console.group(`🚨 ${context} Error`);
    console.error("Error details:", errorInfo);
    console.error("Original error:", error);
    console.groupEnd();
  } else {
    // 프로덕션에서는 간단한 정보만 로깅
    console.error(`${context} error:`, {
      message: error.message,
      digest: error.digest,
      timestamp: errorInfo.timestamp,
    });
  }
};

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isDevelopment = process.env.NODE_ENV === "development";

  useEffect(() => {
    logError(error, "Page");
  }, [error]);

  const handleGoBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = "/";
    }
  };

  return (
    <div className="min-h-[400px] flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertCircle className="h-12 w-12 text-amber-500" />
          </div>
          <CardTitle className="text-xl font-semibold">
            페이지를 불러올 수 없습니다
          </CardTitle>
          <CardDescription className="text-base">
            일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
          </CardDescription>

          {/* 개발 환경에서만 자세한 에러 정보 표시 */}
          {isDevelopment && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-left">
              <details>
                <summary className="cursor-pointer font-medium text-amber-800 text-sm">
                  🔍 개발자 정보 (펼치기)
                </summary>
                <div className="mt-2 text-xs text-amber-700">
                  <p>
                    <strong>메시지:</strong> {error.message}
                  </p>
                  {error.digest && (
                    <p>
                      <strong>Digest:</strong> {error.digest}
                    </p>
                  )}
                </div>
              </details>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          <Button onClick={reset} className="w-full">
            <RefreshCw className="mr-2 h-4 w-4" />
            다시 시도
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={handleGoBack} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              뒤로가기
            </Button>
            <Button
              onClick={() => (window.location.href = "/")}
              variant="outline"
            >
              <Home className="mr-2 h-4 w-4" />
              홈으로
            </Button>
          </div>

          {/* 추가 도움말 */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>💡 팁:</strong> 문제가 지속되면 페이지를 새로고침하거나
              잠시 후 다시 시도해주세요.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
