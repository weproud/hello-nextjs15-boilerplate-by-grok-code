import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import {
  adminRateLimiter,
  apiRateLimiter,
  authRateLimiter,
  createRateLimitResponse,
  getClientIP,
} from "@/lib/rate-limit";

// 보호된 경로들
const protectedRoutes = ["/posts", "/me", "/dashboard"];

// 공개 경로들 (로그인한 사용자가 접근하면 리다이렉트)
const publicOnlyRoutes = ["/auth/signin", "/auth/signup"];

// 관리자 전용 경로들
const adminRoutes = ["/admin"];

// 정적 파일 및 API 경로 제외
const excludePatterns = [
  /^\/_next\//,
  /^\/api\//,
  /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2)$/,
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const clientIP = getClientIP(request);

  // 제외 패턴 확인
  if (excludePatterns.some((pattern) => pattern.test(pathname))) {
    return NextResponse.next();
  }

  // Rate Limiting 적용
  // API 요청 제한
  if (pathname.startsWith("/api/")) {
    if (apiRateLimiter.isRateLimited(clientIP)) {
      const remaining = apiRateLimiter.getRemainingRequests(clientIP);
      const resetTime = apiRateLimiter.getResetTime(clientIP);
      return createRateLimitResponse(resetTime, remaining);
    }
  }

  // 인증 관련 요청 제한 (더 엄격)
  if (pathname.includes("/auth") || pathname.includes("/api/auth")) {
    if (authRateLimiter.isRateLimited(clientIP)) {
      const remaining = authRateLimiter.getRemainingRequests(clientIP);
      const resetTime = authRateLimiter.getResetTime(clientIP);
      return createRateLimitResponse(resetTime, remaining);
    }
  }

  // 관리자 요청 제한
  if (pathname.startsWith("/admin") || pathname.includes("/api/admin")) {
    if (adminRateLimiter.isRateLimited(clientIP)) {
      const remaining = adminRateLimiter.getRemainingRequests(clientIP);
      const resetTime = adminRateLimiter.getResetTime(clientIP);
      return createRateLimitResponse(resetTime, remaining);
    }
  }

  // NextAuth JWT 토큰에서 사용자 정보 가져오기
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
  });

  const isAuthenticated = !!token;
  const userRole = (token?.role as string) || "USER";

  // 보호된 경로 접근 제어
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!isAuthenticated) {
      const signInUrl = new URL("/auth/signin", request.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  // 공개 전용 경로 접근 제어 (로그인한 사용자는 dashboard로 리다이렉트)
  if (publicOnlyRoutes.some((route) => pathname.startsWith(route))) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // 관리자 경로 접근 제어
  if (adminRoutes.some((route) => pathname.startsWith(route))) {
    if (!isAuthenticated) {
      const signInUrl = new URL("/auth/signin", request.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }

    if (userRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/403", request.url));
    }
  }

  // 요청 로깅 (개발 환경에서만)
  if (process.env.NODE_ENV === "development") {
    console.log(`[${new Date().toISOString()}] ${request.method} ${pathname}`, {
      userId: token?.sub,
      userAgent: request.headers.get("user-agent"),
    });
  }

  // 응답 헤더 추가
  const response = NextResponse.next();

  // 보안 헤더 추가
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // 캐시 제어 (민감한 페이지의 경우)
  if (pathname.startsWith("/admin") || pathname.includes("/profile")) {
    response.headers.set("Cache-Control", "private, no-cache");
  }

  return response;
}

// 미들웨어가 실행될 경로 설정
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
