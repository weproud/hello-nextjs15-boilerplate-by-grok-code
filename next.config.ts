import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next.js 15 새로운 기능들 적용
  experimental: {
    // Partial Prerendering은 canary 버전에서만 사용 가능하므로 주석 처리
    // ppr: true,

    // React Compiler는 별도 플러그인 설치 필요하므로 비활성화
    // reactCompiler: true,

    // Server Actions 보안 설정
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },

    // 새로운 캐싱 라이프사이클
    cacheLife: {
      // 정적 리소스 캐시
      static: {
        revalidate: 86400, // 24시간
      },
      // 동적 컨텐츠 캐시
      dynamic: {
        revalidate: 3600, // 1시간
      },
    },

    // Web Vitals 속성 추적
    webVitalsAttribution: ["CLS", "FID", "FCP", "LCP", "TTFB"],

    // 서버 컴포넌트 HMR 캐시
    serverComponentsHmrCache: true,
  },

  images: {
    // 보안: 외부 이미지 제한 강화
    domains: ["localhost"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
        port: "",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "*.kakaocdn.net",
        port: "",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "*.githubusercontent.com",
        port: "",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "*.gravatar.com",
        port: "",
        pathname: "**",
      },
    ],

    // Next.js 15 최적화 설정
    formats: ["image/avif", "image/webp"], // AVIF 우선순위
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 512, 1024],

    // 캐시 최적화
    minimumCacheTTL: 31536000, // 1년 (프로덕션용)
    dangerouslyAllowSVG: false,

    // 성능 최적화
    unoptimized: false, // 최적화 활성화

    // Content Security Policy 강화
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  typescript: {
    ignoreBuildErrors: false,
  },

  eslint: {
    ignoreDuringBuilds: false,
  },

  // 캐싱 설정 최적화 (staleTimes는 아직 지원되지 않음)
  // staleTimes: {
  //   dynamic: 30, // 30초
  //   static: 300, // 5분
  // },

  // 보안 헤더 설정
  async headers() {
    return [
      {
        // 모든 경로에 적용
        source: "/(.*)",
        headers: [
          // 클릭재킹 방지
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          // MIME 타입 스니핑 방지
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // XSS 필터링 강화
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          // Referrer Policy
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // HSTS (HTTPS 강제)
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          // CSP (Content Security Policy)
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self'",
              "connect-src 'self'",
              "frame-ancestors 'none'",
              "form-action 'self'",
              "upgrade-insecure-requests",
            ].join("; "),
          },
        ],
      },
      {
        // API 라우트에 대한 추가 보안
        source: "/api/(.*)",
        headers: [
          {
            key: "X-API-Key",
            value: process.env.API_KEY || "",
          },
        ],
      },
    ];
  },

  // 보안 관련 설정
  poweredByHeader: false, // X-Powered-By 헤더 제거

  // 컴파일러 옵션
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? {
            exclude: ["error"],
          }
        : false,
  },

  // 출력 설정 (Docker 배포용)
  output: "standalone",

  // 캐싱 및 성능 최적화
  generateEtags: true, // ETag 생성
  compress: true, // gzip 압축 활성화

  // Turbopack 설정 (Next.js 15 새로운 번들러)
  turbopack: {
    // Turbopack에 대한 기본 설정 (필요시 확장 가능)
  },
};

export default nextConfig;
