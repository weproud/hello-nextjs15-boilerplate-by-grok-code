"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import React from "react";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{
    error: Error;
    reset: () => void;
    errorInfo?: React.ErrorInfo;
  }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });

    // 개발 환경에서 상세 로깅
    if (process.env.NODE_ENV === "development") {
      console.group("🚨 Component Error Boundary");
      console.error("Error:", error);
      console.error("Error Info:", errorInfo);
      console.error("Component Stack:", errorInfo.componentStack);
      console.groupEnd();
    }

    // 커스텀 에러 핸들러 호출
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  reset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return (
          <FallbackComponent
            error={this.state.error!}
            reset={this.reset}
            errorInfo={this.state.errorInfo}
          />
        );
      }

      return (
        <DefaultErrorFallback error={this.state.error!} reset={this.reset} />
      );
    }

    return this.props.children;
  }
}

interface DefaultErrorFallbackProps {
  error: Error;
  reset: () => void;
}

function DefaultErrorFallback({ error, reset }: DefaultErrorFallbackProps) {
  const isDevelopment = process.env.NODE_ENV === "development";

  return (
    <div className="min-h-[300px] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-10 w-10 text-red-500" />
          </div>
          <CardTitle className="text-lg font-semibold text-red-600">
            컴포넌트 오류
          </CardTitle>
          <CardDescription>
            이 컴포넌트에서 오류가 발생했습니다.
          </CardDescription>

          {/* 개발 환경에서만 상세 정보 표시 */}
          {isDevelopment && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-left">
              <details>
                <summary className="cursor-pointer font-medium text-red-800 text-sm">
                  🔍 오류 상세 정보
                </summary>
                <div className="mt-2 text-xs text-red-700 font-mono">
                  <p>
                    <strong>메시지:</strong> {error.message}
                  </p>
                  <p>
                    <strong>이름:</strong> {error.name}
                  </p>
                  {error.stack && (
                    <div className="mt-2">
                      <p>
                        <strong>스택 트레이스:</strong>
                      </p>
                      <pre className="whitespace-pre-wrap mt-1 text-xs">
                        {error.stack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          <Button onClick={reset} className="w-full">
            <RefreshCw className="mr-2 h-4 w-4" />
            컴포넌트 재시도
          </Button>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="w-full"
          >
            <Home className="mr-2 h-4 w-4" />
            페이지 새로고침
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// HOC for easier usage
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, "children">
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${
    Component.displayName || Component.name
  })`;

  return WrappedComponent;
}

// Hook for programmatic error handling (React 19+)
export function useErrorHandler() {
  return (error: Error, errorInfo?: { componentStack?: string }) => {
    if (process.env.NODE_ENV === "development") {
      console.group("🚨 Programmatic Error");
      console.error("Error:", error);
      if (errorInfo) {
        console.error("Component Stack:", errorInfo.componentStack);
      }
      console.groupEnd();
    }

    // 에러 리포팅 서비스로 전송 (프로덕션)
    if (process.env.NODE_ENV === "production") {
      // TODO: 에러 리포팅 서비스 연동
      console.error("Production component error:", error.message);
    }
  };
}
