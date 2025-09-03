import { hasGoogleAuth, hasKakaoAuth } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { NextAuthConfig, Session } from "next-auth";
import NextAuth from "next-auth";
import type { JWT } from "next-auth/jwt";
import GoogleProvider from "next-auth/providers/google";
import KakaoProvider from "next-auth/providers/kakao";

export const authOptions: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [
    ...(hasGoogleAuth()
      ? [
          GoogleProvider({
            clientId: process.env.AUTH_GOOGLE_ID || "",
            clientSecret: process.env.AUTH_GOOGLE_SECRET || "",
          }),
        ]
      : []),
    ...(hasKakaoAuth()
      ? [
          KakaoProvider({
            clientId: process.env.AUTH_KAKAO_ID || "",
            clientSecret: process.env.AUTH_KAKAO_SECRET || "",
          }),
        ]
      : []),
  ],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  debug: process.env.NODE_ENV === "development",
  callbacks: {
    async session({ session, token }: { session: Session; token: JWT }) {
      // 세션에 사용자 ID 추가
      if (token.sub) {
        session.user.id = token.sub;
      }

      // 세션에 사용자 역할 추가
      if (token.role) {
        session.user.role = token.role as any;
      }

      return session;
    },

    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      // 로그인 성공 시 항상 dashboard로 리다이렉트
      if (url.startsWith("/")) return `${baseUrl}/dashboard`;
      // 상대 경로가 아니면 그대로 반환
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },

    async jwt({ token, user }: { token: JWT; user?: any }) {
      // 사용자 정보 토큰에 추가
      if (user) {
        token.sub = user.id;
      }

      // 데이터베이스에서 사용자 역할 정보 가져오기
      if (token.sub) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.sub },
            select: { role: true },
          });

          if (dbUser?.role) {
            token.role = dbUser.role;
          } else {
            // 기본 역할 설정 (첫 로그인 시)
            token.role = "USER";
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
          token.role = "USER"; // 에러 시 기본 역할
        }
      }

      return token;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
};

// Next.js 15 / NextAuth v5 호환: handlers, auth, signIn, signOut를 구조 분해하여 export
export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);
