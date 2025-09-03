"use client";

import { Geist, Geist_Mono } from "next/font/google";
import { useEffect, useState } from "react";

// 클라이언트 사이드 폰트 최적화
const geistSans = Geist({
  subsets: ["latin"],
  display: "swap",
  preload: true,
  variable: "--client-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
  preload: true,
  variable: "--client-geist-mono",
});

interface FontOptimizerProps {
  children: React.ReactNode;
}

export function FontOptimizer({ children }: FontOptimizerProps) {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    // 폰트 로딩 상태 추적
    const checkFontsLoaded = async () => {
      try {
        // FontFace API를 사용하여 폰트 로딩 상태 확인
        const fonts = document.fonts;

        // Geist Sans 폰트 로딩 대기
        await Promise.all([
          fonts.load("400 1em Geist"),
          fonts.load("500 1em Geist"),
          fonts.load("600 1em Geist"),
          fonts.load("400 1em Geist Mono"),
        ]);

        setFontsLoaded(true);

        // 폰트 로딩 완료 후 body 클래스 업데이트
        document.body.classList.remove("font-loading");
        document.body.classList.add("font-loaded");
      } catch (error) {
        console.warn("Font loading check failed:", error);
        // 폰트 로딩 실패 시에도 UI 표시
        setFontsLoaded(true);
      }
    };

    checkFontsLoaded();

    // 폰트 로딩 이벤트 리스너 추가 (폴백)
    const handleFontLoad = () => {
      setFontsLoaded(true);
    };

    document.fonts.addEventListener("loadingdone", handleFontLoad);

    return () => {
      document.fonts.removeEventListener("loadingdone", handleFontLoad);
    };
  }, []);

  return (
    <>
      {/* 폰트 로딩 중 스타일 */}
      <style jsx global>{`
        .font-loading {
          font-family: var(--fallback-geist-sans), system-ui, -apple-system,
            sans-serif;
          visibility: visible;
        }

        .font-loaded {
          font-family: var(--client-geist-sans), var(--fallback-geist-sans);
          visibility: visible;
        }

        /* FOIT(Flash of Invisible Text) 방지 */
        .font-loading * {
          opacity: 1 !important;
          visibility: visible !important;
        }
      `}</style>

      {/* 폰트 변수 설정 */}
      <div
        style={
          {
            "--client-geist-sans": geistSans.style.fontFamily,
            "--client-geist-mono": geistMono.style.fontFamily,
          } as React.CSSProperties
        }
        className={fontsLoaded ? "font-loaded" : "font-loading"}
      >
        {children}
      </div>
    </>
  );
}

// 폰트 메트릭 최적화 컴포넌트
export function FontMetricsOptimizer() {
  useEffect(() => {
    // 폰트 메트릭을 사용하여 CLS(누적 레이아웃 이동) 방지
    const adjustFontMetrics = () => {
      const body = document.body;
      const computedStyle = getComputedStyle(body);

      // 폰트 메트릭 기반으로 line-height 조정
      const fontSize = parseFloat(computedStyle.fontSize);
      const lineHeight = fontSize * 1.5; // 1.5배 라인 높이

      body.style.setProperty("--optimized-line-height", `${lineHeight}px`);
    };

    adjustFontMetrics();

    // 윈도우 리사이즈 시 재계산
    window.addEventListener("resize", adjustFontMetrics);

    return () => {
      window.removeEventListener("resize", adjustFontMetrics);
    };
  }, []);

  return null;
}

// 폰트 프리로딩 컴포넌트
export function FontPreloader() {
  useEffect(() => {
    // 중요 폰트 파일 프리로딩
    const preloadFonts = () => {
      const fontLinks = [
        {
          href: "https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&display=swap",
          rel: "preload",
          as: "style",
          onload: "this.onload=null;this.rel='stylesheet'",
        },
        {
          href: "https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400&display=swap",
          rel: "preload",
          as: "style",
          onload: "this.onload=null;this.rel='stylesheet'",
        },
      ];

      fontLinks.forEach(({ href, rel, as, onload }) => {
        const link = document.createElement("link");
        link.href = href;
        link.rel = rel;
        link.as = as;
        if (onload) link.setAttribute("onload", onload);
        document.head.appendChild(link);
      });
    };

    preloadFonts();
  }, []);

  return null;
}
