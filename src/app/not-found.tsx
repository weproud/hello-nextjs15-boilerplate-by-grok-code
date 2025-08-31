import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Home, Search } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-blue-600">
            페이지를 찾을 수 없습니다
          </CardTitle>
          <CardDescription>
            요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            URL을 다시 확인하시거나 아래 버튼을 클릭해주세요.
          </p>
          <div className="space-y-2">
            <Button asChild className="w-full">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                홈으로 돌아가기
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/posts">게시글 보기</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
