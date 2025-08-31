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
import { ShieldX, ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin page error:", error);
  }, [error]);

  return (
    <div className="min-h-[400px] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <ShieldX className="h-12 w-12 text-red-500" />
          </div>
          <CardTitle className="text-xl font-semibold">
            관리자 페이지 오류
          </CardTitle>
          <CardDescription>
            관리자 페이지를 불러오는 중 오류가 발생했습니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button onClick={reset} className="w-full">
            <RefreshCw className="mr-2 h-4 w-4" />
            다시 시도
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              대시보드로 돌아가기
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
