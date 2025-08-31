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
import { AlertCircle, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Page error:", error);
  }, [error]);

  return (
    <div className="min-h-[400px] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertCircle className="h-12 w-12 text-red-500" />
          </div>
          <CardTitle className="text-xl font-semibold">
            페이지를 불러올 수 없습니다
          </CardTitle>
          <CardDescription>일시적인 오류가 발생했습니다.</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button onClick={reset} className="w-full">
            <RefreshCw className="mr-2 h-4 w-4" />
            다시 시도
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
