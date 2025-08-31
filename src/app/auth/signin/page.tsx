"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useTracking } from "@/hooks/use-analytics";
import { useSession } from "@/providers/session-provider";

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const router = useRouter();
  const { data: session, status } = useSession();
  const { trackEvent } = useTracking();

  const handleSocialSignIn = async (provider: "google" | "kakao") => {
    try {
      setIsLoading(provider);
      trackEvent("social_signin_attempt", { provider });

      const result = await signIn(provider, {
        callbackUrl: "/dashboard",
        redirect: false,
      });

      if (result?.error) {
        console.error("Sign in failed:", result.error);
        trackEvent("social_signin_failed", {
          provider,
          error: result.error,
        });
      } else if (result?.url) {
        trackEvent("social_signin_redirect", { provider });
        window.location.href = result.url;
      } else if (result?.ok) {
        trackEvent("social_signin_success", { provider });
        setTimeout(() => {
          router.push("/dashboard");
        }, 500);
      }
    } catch (error) {
      console.error("Sign in failed:", error);
      trackEvent("social_signin_failed", {
        provider,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsLoading(null);
    }
  };

  // 이미 로그인된 경우 리다이렉트 (dashboard로)
  if (status === "authenticated" && session?.user) {
    router.push("/dashboard");
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">로그인</CardTitle>
          <CardDescription>소셜 계정으로 간편하게 로그인하세요</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={() => handleSocialSignIn("google")}
            disabled={isLoading !== null}
            className="w-full"
            variant="outline"
          >
            {isLoading === "google" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <svg
                className="mr-2 h-4 w-4"
                viewBox="0 0 24 24"
                role="img"
                aria-label="Google 로그인"
              >
                <title>Google 로그인</title>
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            Google로 로그인
          </Button>

          <Button
            onClick={() => handleSocialSignIn("kakao")}
            disabled={isLoading !== null}
            className="w-full bg-[#FEE500] text-black hover:bg-[#FEE500]/90"
            variant="outline"
          >
            {isLoading === "kakao" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <svg
                className="mr-2 h-4 w-4"
                viewBox="0 0 24 24"
                fill="currentColor"
                role="img"
                aria-label="Kakao 로그인"
              >
                <title>Kakao 로그인</title>
                <path d="M12 1C5.373 1 0 5.373 0 12s5.373 11 12 11 12-4.373 12-11S18.627 1 12 1zm-.037 17.036c-2.423 0-4.387-1.651-4.387-3.69 0-.858.48-1.62 1.265-2.189-.088-.589-.331-2.089.707-2.099.973 0 .828 1.396.828 1.396-.478-.317-.828-.479-.828-.796 0-.479.372-.858.828-.858.828 0 1.265.766 1.265 1.733 0 .331-.059.62-.177.881.766.177 1.323.707 1.323 1.396 0 2.049-1.972 3.701-4.395 3.701zm4.395-6.87c-.372 0-.707-.331-.707-.766 0-.372.331-.707.707-.707.372 0 .707.331.707.707 0 .435-.331.766-.707.766z" />
              </svg>
            )}
            카카오로 로그인
          </Button>

          <Separator />

          <div className="text-center text-sm text-gray-600">
            로그인하면 이용약관과 개인정보 처리방침에 동의하게 됩니다.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
