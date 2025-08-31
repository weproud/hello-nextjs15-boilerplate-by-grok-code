import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <ShieldAlert className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-600">
            접근 권한이 없습니다
          </CardTitle>
          <CardDescription>
            이 페이지에 접근하려면 관리자 권한이 필요합니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            관리자 권한이 있는 계정으로 로그인해주세요.
          </p>
          <div className="space-y-2">
            <Button asChild className="w-full">
              <Link href="/auth/signin">로그인하기</Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/">홈으로 돌아가기</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
