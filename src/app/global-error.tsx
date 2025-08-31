"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global error:", error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-red-600">
                오류가 발생했습니다
              </CardTitle>
              <CardDescription>
                예상치 못한 오류가 발생했습니다. 페이지를 새로고침해 보세요.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center space-x-2">
              <Button onClick={reset} variant="default">
                다시 시도
              </Button>
              <Button
                onClick={() => (window.location.href = "/")}
                variant="outline"
              >
                홈으로 이동
              </Button>
            </CardContent>
          </Card>
        </div>
      </body>
    </html>
  );
}
