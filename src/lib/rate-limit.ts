import { NextRequest, NextResponse } from "next/server";

// 간단한 인메모리 Rate Limiting
// 프로덕션에서는 Redis 같은 외부 저장소를 사용해야 합니다
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private windowMs: number;
  private maxRequests: number;

  constructor(windowMs: number = 60 * 1000, maxRequests: number = 100) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  isRateLimited(identifier: string): boolean {
    const now = Date.now();
    const entry = this.store.get(identifier);

    if (!entry || now > entry.resetTime) {
      // 새로운 윈도우 시작
      this.store.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs,
      });
      return false;
    }

    if (entry.count >= this.maxRequests) {
      return true;
    }

    entry.count++;
    return false;
  }

  getRemainingRequests(identifier: string): number {
    const entry = this.store.get(identifier);
    if (!entry) return this.maxRequests;
    return Math.max(0, this.maxRequests - entry.count);
  }

  getResetTime(identifier: string): number {
    const entry = this.store.get(identifier);
    return entry?.resetTime || 0;
  }

  // 주기적으로 오래된 항목들 정리
  cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key);
      }
    }
  }
}

// API 요청 제한
export const apiRateLimiter = new RateLimiter(60 * 1000, 100); // 1분에 100회

// 인증 요청 제한 (더 엄격)
export const authRateLimiter = new RateLimiter(15 * 60 * 1000, 5); // 15분에 5회

// 관리자 요청 제한
export const adminRateLimiter = new RateLimiter(60 * 1000, 50); // 1분에 50회

// IP 주소 추출 함수
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");
  const clientIP = request.headers.get("x-client-ip");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  if (realIP) {
    return realIP;
  }
  if (clientIP) {
    return clientIP;
  }

  // 로컬 개발 환경에서는 기본값 사용
  return "127.0.0.1";
}

// Rate Limiting 응답 생성
export function createRateLimitResponse(
  resetTime: number,
  remaining: number
): NextResponse {
  const resetInSeconds = Math.ceil((resetTime - Date.now()) / 1000);

  return new NextResponse(
    JSON.stringify({
      error: "Too Many Requests",
      message: `요청 횟수가 너무 많습니다. ${resetInSeconds}초 후에 다시 시도해주세요.`,
      retryAfter: resetInSeconds,
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "X-RateLimit-Remaining": remaining.toString(),
        "X-RateLimit-Reset": resetTime.toString(),
        "Retry-After": resetInSeconds.toString(),
      },
    }
  );
}

// Rate Limiting 미들웨어 함수
export function withRateLimit(
  handler: (request: NextRequest) => Promise<NextResponse> | NextResponse,
  limiter: RateLimiter,
  identifierFn?: (request: NextRequest) => string
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const identifier = identifierFn
      ? identifierFn(request)
      : getClientIP(request);

    if (limiter.isRateLimited(identifier)) {
      const remaining = limiter.getRemainingRequests(identifier);
      const resetTime = limiter.getResetTime(identifier);
      return createRateLimitResponse(resetTime, remaining);
    }

    return handler(request);
  };
}

// 주기적 정리 (프로덕션에서는 별도 프로세스로 실행)
if (typeof globalThis !== "undefined") {
  setInterval(() => {
    apiRateLimiter.cleanup();
    authRateLimiter.cleanup();
    adminRateLimiter.cleanup();
  }, 5 * 60 * 1000); // 5분마다 정리
}
