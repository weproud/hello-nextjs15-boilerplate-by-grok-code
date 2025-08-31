"use client";

import { Home, LogOut, Settings, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession } from "@/providers/session-provider";

export function NavigationHeader() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  // (app) 그룹의 페이지들에서는 NavigationHeader를 표시하지 않음
  // (app) 그룹: /posts, /dashboard, /me 등의 경로
  const isAppRoute =
    pathname?.startsWith("/posts") ||
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/me");

  if (isAppRoute || pathname?.startsWith("/admin")) {
    return null;
  }

  if (status === "loading") {
    return (
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">
                  N
                </span>
              </div>
              <span className="font-bold text-xl">WeProud</span>
            </Link>
          </div>
          <div className="w-8 h-8 bg-muted rounded-full animate-pulse"></div>
        </div>
      </header>
    );
  }

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto px-4 h-14 flex items-center justify-between">
        {/* 로고 */}
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">
                N
              </span>
            </div>
            <span className="font-bold text-xl">WEPROUD</span>
          </Link>
        </div>

        {/* 우측 메뉴 */}
        <div className="flex items-center space-x-4">
          {session?.user ? (
            // 로그인된 사용자 - 아바타 드롭다운
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={session.user.image || ""}
                      alt={session.user.name || ""}
                    />
                    <AvatarFallback>
                      {session.user.name?.charAt(0)?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {session.user.name || "사용자"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {session.user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/" className="flex items-center">
                    <Home className="mr-2 h-4 w-4" />
                    <span>홈</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/posts" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>게시글</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>설정</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600"
                  onClick={() => {
                    // 임시 로그아웃 로직
                    window.location.reload();
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>로그아웃</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            // 로그인되지 않은 사용자 - 로그인 버튼
            <Button asChild>
              <Link href="/auth/signin">로그인</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
