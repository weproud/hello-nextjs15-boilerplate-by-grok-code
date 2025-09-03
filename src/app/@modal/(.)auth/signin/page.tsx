"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, useTransition } from "react";

function SignInWithSearchParams({ isModal = true }: { isModal?: boolean }) {
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const searchParams = useSearchParams();
  const message = searchParams.get("message");

  const handleGoogleSignIn = async () => {
    setError("");
    startTransition(async () => {
      try {
        await signIn("google", { callbackUrl: "/" });
      } catch (_error) {
        setError("Google 로그인 중 오류가 발생했습니다.");
      }
    });
  };

  const handleClose = () => {
    router.back();
  };

  // 공통 컨텐츠
  const formContent = (
    <>
      {error && (
        <div className="text-sm text-red-600 bg-red-50 dark:bg-red-950 dark:text-red-300 p-3 rounded-md border border-red-200 dark:border-red-800">
          {error}
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        className="w-full h-11"
        onClick={handleGoogleSignIn}
        disabled={isPending}
      >
        <svg
          className="mr-2 h-4 w-4"
          viewBox="0 0 24 24"
          aria-label="Google 로고"
          role="img"
        >
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        {isPending ? "로그인 중..." : "Google로 로그인"}
      </Button>

      <div className="mt-6 text-center text-sm space-y-2">
        {isModal ? (
          <div>
            <Link
              href="/auth/signin"
              className="text-muted-foreground hover:text-primary text-xs"
            >
              전체 페이지에서 로그인
            </Link>
          </div>
        ) : (
          <div>
            <Link href="/" className="text-muted-foreground hover:text-primary">
              홈으로 돌아가기
            </Link>
          </div>
        )}
      </div>
    </>
  );

  if (isModal) {
    return (
      <Dialog open onOpenChange={() => {}}>
        <DialogContent
          className="sm:max-w-[425px]"
          onEscapeKeyDown={handleClose}
        >
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">로그인</DialogTitle>
            <DialogDescription className="text-center">
              계정에 로그인하여 서비스를 이용하세요
            </DialogDescription>
            {message && (
              <div className="text-sm text-green-600 bg-green-50 dark:bg-green-950 dark:text-green-300 p-3 rounded-md border border-green-200 dark:border-green-800">
                {message}
              </div>
            )}
          </DialogHeader>
          <div className="space-y-4">{formContent}</div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl md:text-3xl">로그인</CardTitle>
          <CardDescription className="text-sm md:text-base">
            계정에 로그인하여 서비스를 이용하세요
          </CardDescription>
          {message && (
            <div className="text-sm text-green-600 bg-green-50 dark:bg-green-950 dark:text-green-300 p-3 rounded-md border border-green-200 dark:border-green-800">
              {message}
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">{formContent}</CardContent>
      </Card>
    </div>
  );
}

export default function SignIn() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInWithSearchParams isModal={true} />
    </Suspense>
  );
}
