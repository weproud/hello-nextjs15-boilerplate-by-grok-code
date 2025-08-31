"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

// Schemas - Social login only, no email/password forms needed
export const socialAuthSchema = z.object({
  provider: z.enum(["google", "kakao"]),
});

// Server Actions for Social Authentication
export async function handleSocialAuth(provider: "google" | "kakao") {
  try {
    const validatedData = socialAuthSchema.parse({ provider });

    // NextAuth를 통한 소셜 로그인 리다이렉트
    // 실제 구현에서는 NextAuth의 signIn 함수를 사용
    // 여기서는 URL 생성만 처리

    const authUrl = `/api/auth/signin/${provider}`;

    return {
      success: true,
      redirectUrl: authUrl
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error.errors };
    }
    return { success: false, error: "소셜 로그인 처리에 실패했습니다" };
  }
}

export async function signOutAction() {
  try {
    // NextAuth signOut - 실제 구현에서는 signOut 함수 사용
    redirect("/");
  } catch (error) {
    return { success: false, error: "로그아웃에 실패했습니다" };
  }
}

// Helper function for creating/updating user from social provider
export async function upsertSocialUser(providerData: {
  provider: string;
  providerId: string;
  email: string;
  name?: string;
  image?: string;
}) {
  try {
    const user = await prisma.user.upsert({
      where: {
        email: providerData.email,
      },
      update: {
        name: providerData.name,
        image: providerData.image,
        // 소셜 로그인 정보 업데이트
        accounts: {
          upsert: {
            where: {
              provider_providerAccountId: {
                provider: providerData.provider,
                providerAccountId: providerData.providerId,
              },
            },
            update: {
              // 기존 계정 정보 업데이트
            },
            create: {
              provider: providerData.provider,
              providerAccountId: providerData.providerId,
              type: "oauth",
            },
          },
        },
      },
      create: {
        email: providerData.email,
        name: providerData.name,
        image: providerData.image,
        accounts: {
          create: {
            provider: providerData.provider,
            providerAccountId: providerData.providerId,
            type: "oauth",
          },
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        role: true,
      },
    });

    return { success: true, user };
  } catch (error) {
    console.error("Social user upsert error:", error);
    return { success: false, error: "사용자 정보 저장에 실패했습니다" };
  }
}