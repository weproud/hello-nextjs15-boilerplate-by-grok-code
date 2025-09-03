import localFont from "next/font/local";

// Pretendard 폰트 로드 (한글 최적화) - 로컬 파일 사용
export const Pretendard = localFont({
  src: "../../../public/fonts/woff2/Pretendard-Regular.woff2",
  display: "swap",
  preload: true,
  variable: "--font-pretendard",
  fallback: [
    "system-ui",
    "-apple-system",
    "BlinkMacSystemFont",
    "Segoe UI",
    "Roboto",
    "Apple SD Gothic Neo",
    "Noto Sans KR",
    "Malgun Gothic",
    "sans-serif",
  ],
});

// Pretendard 폰트 클래스
export const pretendardClass = "font-pretendard";

// 폰트 로딩 상태 관리
export function usePretendardFont() {
  if (typeof window !== "undefined") {
    const fontFace = new FontFace(
      "Pretendard",
      "url(https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.6/dist/web/variable/woff2/PretendardVariable.woff2)"
    );

    fontFace.load().then((loadedFace) => {
      document.fonts.add(loadedFace);
      document.documentElement.classList.add("pretendard-loaded");
    });
  }

  return pretendardClass;
}

// CSS 변수로 Pretendard 적용
export const pretendardCSS = `
  :root {
    --font-pretendard: 'Pretendard', system-ui, -apple-system, sans-serif;
  }

  .font-pretendard {
    font-family: var(--font-pretendard);
  }

  .pretendard-loaded * {
    font-family: 'Pretendard', var(--fallback-font);
  }
`;
