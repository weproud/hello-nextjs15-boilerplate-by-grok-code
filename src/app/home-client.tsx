"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export function HomeClient() {
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

