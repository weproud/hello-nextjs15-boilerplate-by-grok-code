"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSession } from "@/providers/session-provider";

export default function Home() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">WeProud</h1>
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (session?.user) {
    // 로그인된 사용자에게 greeting 메시지 및 사용자 정보 표시
    const role = (session.user as { role?: string })?.role || "USER";

    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <Avatar className="w-20 h-20 mx-auto mb-4">
                <AvatarImage
                  src={session.user.image || ""}
                  alt={session.user.name || ""}
                />
                <AvatarFallback className="text-lg">
                  {session.user.name?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <h1 className="text-3xl font-bold mb-2">
                환영합니다, {session.user.name}님! 🎉
              </h1>
              <p className="text-lg text-muted-foreground">
                WeProud에 오신 것을 환영합니다.
              </p>
            </div>

            {/* 사용자 정보 요약 */}
            <div className="mt-6 space-y-3 text-left">
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
                <span className="font-medium">{role}</span>
              </div>
            </div>

            <div className="space-y-4 mt-8">
              <Button asChild className="w-full">
                <Link href="/dashboard">대시보드로 이동</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/me">내 프로필로 이동</Link>
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
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 로그인되지 않은 사용자에게 로그인 옵션 표시
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">weproud</h1>
        <p className="text-xl text-muted-foreground mb-8">
          환영합니다! 서버가 정상적으로 실행되고 있습니다.
        </p>
        <div className="space-x-4">
          <Button asChild>
            <Link href="/auth/signin">로그인</Link>
          </Button>
        </div>
        <div className="mt-6 text-sm text-muted-foreground">
          <p>링크를 클릭하면 모달로 열립니다.</p>
          <p>전체 페이지로 이동하려면 브라우저에서 직접 URL을 입력하세요.</p>
        </div>
      </div>
    </div>
  );
}
