"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/providers/session-provider";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // 로그인되지 않은 경우 로그인 페이지로 리다이렉트
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  // 로딩 중일 때
  if (status === "loading") {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-12 w-64 mb-6" />
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-48" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // 로그인되지 않은 경우
  if (status === "unauthenticated" || !session?.user) {
    return null; // 리다이렉트 중
  }

  const userName = session.user.name || session.user.email || "사용자";
  const userRole = (session.user as { role?: string })?.role || "USER";

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">안녕하세요! {userName}님!</h1>

        <div className="grid gap-6 md:grid-cols-2">
          {/* 사용자 정보 카드 */}
          <Card>
            <CardHeader>
              <CardTitle>사용자 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">이름</span>
                <span className="font-medium">
                  {session.user.name || "이름 없음"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">이메일</span>
                <span className="font-medium">{session.user.email || "-"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">권한</span>
                <span className="font-medium">{userRole}</span>
              </div>
            </CardContent>
          </Card>

          {/* 빠른 액션 카드 */}
          <Card>
            <CardHeader>
              <CardTitle>빠른 액션</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full">
                <Link href="/posts">게시글 보기</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/me">내 프로필</Link>
              </Button>
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => {
                  signOut({ callbackUrl: "/" });
                }}
              >
                로그아웃
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* 환영 메시지 카드 */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">🎉 환영합니다!</h2>
              <p className="text-muted-foreground">
                WeProud 대시보드에 로그인하셨습니다.
                <br />
                원하는 기능을 선택하여 시작해보세요.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
