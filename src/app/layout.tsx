import { SkipLinks } from "@/components/accessibility-enhancer";
import { NavigationHeader } from "@/components/navigation-header";
import { Pretendard } from "@/lib/fonts/pretendard";
import { defaultMetadata } from "@/lib/seo";
import { AppProviders } from "@/providers/app-providers";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Pretendard를 기본 폰트로 사용 (한글 최적화)
const pretendard = Pretendard;

// Geist 폰트를 대안으로 유지 (영문 최적화)
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap", // FOIT 방지
  preload: true, // 사전 로드
  fallback: [
    "system-ui",
    "-apple-system",
    "BlinkMacSystemFont",
    "Segoe UI",
    "Roboto",
    "sans-serif",
  ],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap", // FOIT 방지
  preload: true, // 사전 로드
  fallback: [
    "SFMono-Regular",
    "Consolas",
    "Liberation Mono",
    "Menlo",
    "monospace",
  ],
});

export const metadata: Metadata = {
  ...defaultMetadata,
};

export default function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal?: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`${pretendard.variable} ${geistSans.variable} ${geistMono.variable} font-pretendard antialiased`}
      >
        <AppProviders>
          {/* 접근성: 스킵 링크 */}
          <SkipLinks />

          <div className="min-h-screen flex flex-col">
            <NavigationHeader />
            <main id="main-content" className="flex-1" role="main">
              {children}
            </main>
          </div>
          {modal}
        </AppProviders>
      </body>
    </html>
  );
}
