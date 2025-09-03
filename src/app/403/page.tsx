import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { Home, LogIn, ShieldAlert, ShieldCheck, UserX } from "lucide-react";
import Link from "next/link";

export default async function ForbiddenPage() {
  const session = await auth();
  const isLoggedIn = !!session?.user;
  const userRole = session?.user?.role || "USER";
  const isAdmin = userRole === "ADMIN";

  // 로그인 상태에 따른 메시지와 아이콘 설정
  const getContent = () => {
    if (!isLoggedIn) {
      return {
        icon: <UserX className="w-8 h-8 text-orange-600" />,
        iconBg: "bg-orange-100",
        title: "로그인이 필요합니다",
        description: "이 페이지에 접근하려면 로그인이 필요합니다.",
        message: "계정을 만들어 보시거나 기존 계정으로 로그인해주세요.",
        primaryButton: {
          text: "로그인하기",
          href: "/auth/signin",
          icon: LogIn,
        },
      };
    }

    if (!isAdmin) {
      return {
        icon: <ShieldAlert className="w-8 h-8 text-red-600" />,
        iconBg: "bg-red-100",
        title: "관리자 권한이 필요합니다",
        description: `현재 권한: ${userRole}`,
        message: "이 페이지에 접근하려면 관리자 권한이 필요합니다.",
        primaryButton: {
          text: "대시보드로 이동",
          href: "/dashboard",
          icon: Home,
        },
      };
    }

    return {
      icon: <ShieldCheck className="w-8 h-8 text-green-600" />,
      iconBg: "bg-green-100",
      title: "권한 확인 중...",
      description: "잠시만 기다려주세요.",
      message: "권한을 확인하는 중입니다.",
      primaryButton: { text: "새로고침", href: "/", icon: Home },
    };
  };

  const content = getContent();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div
            className={`mx-auto w-16 h-16 ${content.iconBg} rounded-full flex items-center justify-center mb-4`}
          >
            {content.icon}
          </div>
          <CardTitle className="text-2xl font-bold">{content.title}</CardTitle>
          <CardDescription className="text-base">
            {content.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">{content.message}</p>

          {/* 사용자 정보 표시 (로그인된 경우) */}
          {isLoggedIn && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>현재 사용자:</strong>{" "}
                {session.user.name || session.user.email}
                <br />
                <strong>권한 레벨:</strong> {userRole}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Button asChild className="w-full">
              <Link href={content.primaryButton.href}>
                <content.primaryButton.icon className="mr-2 h-4 w-4" />
                {content.primaryButton.text}
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                홈으로 돌아가기
              </Link>
            </Button>
          </div>

          {/* 추가 도움말 */}
          <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
            <p className="text-sm text-gray-700">
              <strong>❓ 도움이 필요하신가요?</strong>
              <br />
              권한이 필요하다면 관리자에게 문의해주세요.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
