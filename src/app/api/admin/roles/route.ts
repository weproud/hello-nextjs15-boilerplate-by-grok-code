import { type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApiResponses, withErrorHandler } from "@/lib/api-response";
import { z } from "zod";
import type { UserRole } from "@prisma/client";

// 역할 업데이트 스키마
const updateRoleSchema = z.object({
  userId: z.string().min(1, "사용자 ID가 필요합니다"),
  role: z.enum(["USER", "ADMIN", "OPERATOR"]).transform((val) => {
    if (!["USER", "ADMIN", "OPERATOR"].includes(val)) {
      throw new Error("유효하지 않은 역할입니다");
    }
    return val;
  }),
});

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: UserRole;
    };
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ nextauth: string[] }> }
) {
  return withErrorHandler(async () => {
    const session = await auth();

    if (!session?.user) {
      return ApiResponses.unauthorized();
    }

    const userRole = session.user.role;
    if (userRole !== "ADMIN") {
      return ApiResponses.forbidden();
    }

    // 모든 사용자 목록 가져오기 (ADMIN 권한 필요)
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return ApiResponses.success(users, "사용자 목록을 성공적으로 조회했습니다");
  });
}

export async function PATCH(request: NextRequest) {
  return withErrorHandler(async () => {
    const session = await auth();

    if (!session?.user) {
      return ApiResponses.unauthorized();
    }

    const userRole = session.user.role;
    if (userRole !== "ADMIN") {
      return ApiResponses.forbidden();
    }

    const body = await request.json();
    const validationResult = updateRoleSchema.safeParse(body);

    if (!validationResult.success) {
      return ApiResponses.validationError(validationResult.error);
    }

    const { userId, role } = validationResult.data;

    // 사용자 존재 확인
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true },
    });

    if (!existingUser) {
      return ApiResponses.notFound("사용자를 찾을 수 없습니다");
    }

    // 자기 자신의 역할을 변경하려는 경우 방지
    if (userId === session.user.id && role !== "ADMIN") {
      return ApiResponses.badRequest("자신의 관리자 권한을 해제할 수 없습니다");
    }

    // 사용자 role 업데이트
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    return ApiResponses.success(
      updatedUser,
      "사용자 역할이 성공적으로 업데이트되었습니다"
    );
  });
}
