import { z } from "zod";

// 환경 변수 스키마 정의 (NextAuth v5 호환)
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1, "DATABASE_URL이 필요합니다"),

  // NextAuth v5
  AUTH_SECRET: z.string().min(1, "AUTH_SECRET이 필요합니다"),
  AUTH_URL: z.string().url("유효한 AUTH_URL이 필요합니다"),

  // OAuth Providers (NextAuth v5에서는 AUTH_ 접두사 제거)
  AUTH_GOOGLE_ID: z.string().min(1, "AUTH_GOOGLE_ID 필요합니다"),
  AUTH_GOOGLE_SECRET: z.string().min(1, "AUTH_GOOGLE_SECRET 필요합니다"),
  AUTH_KAKAO_ID: z.string().optional(),
  AUTH_KAKAO_SECRET: z.string().optional(),

  // Analytics (선택)
  NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().optional(),

  // Email (선택)
  RESEND_API_KEY: z.string().optional(),

  // Environment
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

// 환경 변수 파싱 및 검증
const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("❌ 환경 변수 검증 실패:");
  const errors = parsedEnv.error.issues || [];
  errors.forEach((error: any) => {
    const path = error.path?.join(".") || "unknown";
    const message = error.message || "알 수 없는 오류";
    console.error(`  - ${path}: ${message}`);
  });
  process.exit(1);
}

// 타입 안전한 환경 변수 객체
export const env = parsedEnv.data;

// 환경 변수 헬퍼 함수들
export const isProduction = () => env.NODE_ENV === "production";
export const isDevelopment = () => env.NODE_ENV === "development";
export const isTest = () => env.NODE_ENV === "test";

// OAuth 설정 확인 함수들
export const hasGoogleAuth = () =>
  !!(
    env.AUTH_GOOGLE_ID &&
    env.AUTH_GOOGLE_SECRET &&
    env.AUTH_GOOGLE_ID !== "dummy-google-client-id" &&
    env.AUTH_GOOGLE_SECRET !== "dummy-google-client-secret"
  );

export const hasKakaoAuth = () =>
  !!(
    env.AUTH_KAKAO_ID &&
    env.AUTH_KAKAO_SECRET &&
    env.AUTH_KAKAO_ID !== "dummy-kakao-client-id" &&
    env.AUTH_KAKAO_SECRET !== "dummy-kakao-client-secret"
  );

// Analytics 설정 확인
export const hasAnalytics = !!(
  env.NEXT_PUBLIC_POSTHOG_KEY && env.NEXT_PUBLIC_POSTHOG_HOST
);

// Email 설정 확인
export const hasEmailService = !!env.RESEND_API_KEY;

// 환경 변수 검증 결과 로깅
if (isDevelopment()) {
  console.log("✅ 환경 변수 검증 완료");
  console.log(`📊 Analytics: ${hasAnalytics ? "활성화" : "비활성화"}`);
  console.log(`📧 Email: ${hasEmailService ? "활성화" : "비활성화"}`);
  console.log(`🔐 Google OAuth: ${hasGoogleAuth() ? "설정됨" : "미설정"}`);
  console.log(`🔐 Kakao OAuth: ${hasKakaoAuth() ? "설정됨" : "미설정"}`);
}
