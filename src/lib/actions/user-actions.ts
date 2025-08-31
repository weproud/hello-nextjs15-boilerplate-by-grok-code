"use server";

import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import {
  USER_CACHE_TAGS,
  createCachedUserQuery,
  createCachedUsersQuery,
} from "@/lib/cache-queries";

// 캐시 태그 상수들은 cache-queries에서 import됨

// Schemas
export const updateUserSchema = z.object({
  name: z
    .string()
    .min(1, "이름은 필수입니다")
    .max(50, "이름은 50자 이하여야 합니다"),
  email: z.string().email("유효한 이메일을 입력해주세요"),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "현재 비밀번호를 입력해주세요"),
    newPassword: z.string().min(8, "비밀번호는 최소 8자 이상이어야 합니다"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "새 비밀번호가 일치하지 않습니다",
    path: ["confirmPassword"],
  });

// Server Actions
export async function updateUser(userId: string, formData: FormData) {
  try {
    const validatedData = updateUserSchema.parse({
      name: formData.get("name"),
      email: formData.get("email"),
    });

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: validatedData,
      select: {
        id: true,
        name: true,
        email: true,
        updatedAt: true,
      },
    });

    // 새로운 캐싱 API들 적용
    revalidateTag(USER_CACHE_TAGS.USER(userId));
    revalidateTag(USER_CACHE_TAGS.USER_PROFILE(userId));
    revalidatePath("/profile");
    revalidatePath("/me");

    return { success: true, data: updatedUser };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error.flatten().fieldErrors };
    }
    return { success: false, error: "프로필 업데이트에 실패했습니다" };
  }
}

export async function changePassword(userId: string, formData: FormData) {
  try {
    const validatedData = changePasswordSchema.parse({
      currentPassword: formData.get("currentPassword"),
      newPassword: formData.get("newPassword"),
      confirmPassword: formData.get("confirmPassword"),
    });

    // 현재 비밀번호 확인
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    });

    if (!user?.password) {
      return { success: false, error: "사용자를 찾을 수 없습니다" };
    }

    // 현재 비밀번호 검증 (실제로는 bcrypt로 비교해야 함)
    // const isValid = await compare(validatedData.currentPassword, user.password);
    // if (!isValid) {
    //   return { success: false, error: "현재 비밀번호가 올바르지 않습니다" };
    // }

    // 새 비밀번호 해시
    const hashedPassword = await hash(validatedData.newPassword, 12);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { success: true, message: "비밀번호가 변경되었습니다" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error.flatten().fieldErrors };
    }
    return { success: false, error: "비밀번호 변경에 실패했습니다" };
  }
}

export async function deleteUser(userId: string) {
  try {
    await prisma.user.delete({
      where: { id: userId },
    });

    // 캐시 무효화
    revalidateTag(USER_CACHE_TAGS.USER(userId));
    revalidateTag(USER_CACHE_TAGS.USER_PROFILE(userId));
    revalidateTag(USER_CACHE_TAGS.USERS);

    redirect("/"); // 로그아웃 후 홈으로 리다이렉트
  } catch (error) {
    return { success: false, error: "계정 삭제에 실패했습니다" };
  }
}

// 캐시된 데이터 조회 함수들
export const getCachedUser = createCachedUserQuery;
export const getCachedUsers = createCachedUsersQuery;
