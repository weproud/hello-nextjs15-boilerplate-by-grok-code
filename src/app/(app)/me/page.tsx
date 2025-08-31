"use client";

import { useState } from "react";
import { useSession } from "@/providers/session-provider";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Mail,
  Calendar,
  Shield,
  LogOut,
  Settings,
  Edit,
  Camera,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useTracking } from "@/hooks/use-analytics";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const { trackEvent } = useTracking();
  const [isLoading, setIsLoading] = useState(false);

  if (status === "loading") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-gray-200 rounded-lg"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !session?.user) {
    router.push("/auth/signin");
    return null;
  }

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      trackEvent("sign_out_attempted");
      // 임시 로그아웃 로직
      setTimeout(() => {
        trackEvent("sign_out_completed");
        router.push("/");
      }, 500);
    } catch (error) {
      console.error("Sign out error:", error);
      trackEvent("sign_out_failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditProfile = () => {
    trackEvent("profile_edit_clicked");
    // 프로필 편집 기능은 추후 구현
    console.log("프로필 편집 기능 구현 예정");
  };

  const getProviderBadgeColor = (provider?: string) => {
    switch (provider) {
      case "google":
        return "bg-red-100 text-red-800";
      case "kakao":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getProviderName = (provider?: string) => {
    switch (provider) {
      case "google":
        return "Google";
      case "kakao":
        return "Kakao";
      default:
        return "기타";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 프로필 헤더 카드 */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage
                    src={session.user.image || user?.image || ""}
                    alt={session.user.name || "사용자"}
                  />
                  <AvatarFallback className="text-lg">
                    {session.user.name?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <CardTitle className="text-2xl">
                    {session.user.name || "사용자"}
                  </CardTitle>
                  <CardDescription className="flex items-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <span>{session.user.email}</span>
                  </CardDescription>
                  <div className="flex items-center space-x-2">
                    <Badge
                      className={getProviderBadgeColor(
                        (session.user as any)?.provider
                      )}
                    >
                      {getProviderName((session.user as any)?.provider)}
                    </Badge>
                    <Badge variant="outline">
                      <Shield className="h-3 w-3 mr-1" />
                      {(session.user as any)?.role || "USER"}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={handleEditProfile}>
                  <Edit className="h-4 w-4 mr-2" />
                  편집
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  disabled={isLoading}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  로그아웃
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* 탭 메뉴 */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">개요</TabsTrigger>
            <TabsTrigger value="security">보안</TabsTrigger>
            <TabsTrigger value="activity">활동</TabsTrigger>
          </TabsList>

          {/* 개요 탭 */}
          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  기본 정보
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      이름
                    </label>
                    <p className="text-sm text-gray-900">
                      {session.user.name || "이름 없음"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      이메일
                    </label>
                    <p className="text-sm text-gray-900">
                      {session.user.email}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      계정 권한
                    </label>
                    <p className="text-sm text-gray-900">
                      {(session.user as any)?.role || "USER"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      가입일
                    </label>
                    <p className="text-sm text-gray-900">
                      {new Date().toLocaleDateString("ko-KR")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  계정 설정
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">프로필 사진</p>
                    <p className="text-sm text-gray-600">
                      프로필 사진을 변경할 수 있습니다
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Camera className="h-4 w-4 mr-2" />
                    변경
                  </Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">알림 설정</p>
                    <p className="text-sm text-gray-600">
                      이메일 및 푸시 알림을 설정할 수 있습니다
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    설정
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 보안 탭 */}
          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  로그인 방식
                </CardTitle>
                <CardDescription>
                  현재 사용중인 로그인 방식을 확인할 수 있습니다
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <Badge
                    className={getProviderBadgeColor(
                      (session.user as any)?.provider
                    )}
                  >
                    {getProviderName((session.user as any)?.provider)}
                  </Badge>
                  <span className="text-sm text-gray-600">
                    소셜 로그인을 통해 안전하게 인증됩니다
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>보안 상태</CardTitle>
                <CardDescription>계정의 보안 상태를 확인하세요</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">소셜 로그인 활성화</span>
                  </div>
                  <Badge variant="secondary">안전</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">이메일 인증 완료</span>
                  </div>
                  <Badge variant="secondary">완료</Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 활동 탭 */}
          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  최근 활동
                </CardTitle>
                <CardDescription>최근 계정 활동 내역입니다</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">로그인</p>
                      <p className="text-xs text-gray-600">
                        {new Date().toLocaleString("ko-KR")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">프로필 조회</p>
                      <p className="text-xs text-gray-600">
                        {new Date().toLocaleString("ko-KR")}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
