import { NextResponse } from "next/server";
import { ZodError } from "zod";

export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

export type ApiError = {
  code: string;
  message: string;
  details?: any;
};

// 표준 API 응답 헬퍼 함수들
export class ApiResponses {
  static success<T>(data: T, message?: string, status = 200) {
    return NextResponse.json(
      {
        success: true,
        data,
        message,
      } as ApiResponse<T>,
      { status }
    );
  }

  static error(error: string | ApiError, status = 500, details?: any) {
    const errorObj =
      typeof error === "string"
        ? { code: "INTERNAL_ERROR", message: error, details }
        : error;

    // 에러 로깅
    console.error(`[${status}] API Error:`, {
      code: errorObj.code,
      message: errorObj.message,
      details: errorObj.details,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        success: false,
        error: errorObj.message,
        code: errorObj.code,
      } as ApiResponse,
      { status }
    );
  }

  static unauthorized(message = "인증이 필요합니다") {
    return this.error({ code: "UNAUTHORIZED", message }, 401);
  }

  static forbidden(message = "접근 권한이 없습니다") {
    return this.error({ code: "FORBIDDEN", message }, 403);
  }

  static notFound(message = "리소스를 찾을 수 없습니다") {
    return this.error({ code: "NOT_FOUND", message }, 404);
  }

  static badRequest(message = "잘못된 요청입니다") {
    return this.error({ code: "BAD_REQUEST", message }, 400);
  }

  static validationError(zodError: ZodError) {
    // Next.js 15의 새로운 ZodError API 활용
    const flattenedErrors = zodError.flatten();

    const details = {
      formErrors: flattenedErrors.formErrors,
      fieldErrors: flattenedErrors.fieldErrors,
    };

    return this.error(
      {
        code: "VALIDATION_ERROR",
        message: "입력 데이터가 올바르지 않습니다",
        details,
      },
      400
    );
  }

  static internalError(message = "서버 내부 오류가 발생했습니다") {
    return this.error({ code: "INTERNAL_ERROR", message }, 500);
  }
}

// 에러 핸들링 래퍼 함수
export async function withErrorHandler<T>(
  handler: () => Promise<NextResponse>,
  fallbackMessage = "요청 처리 중 오류가 발생했습니다"
): Promise<NextResponse> {
  try {
    return await handler();
  } catch (error) {
    console.error("Unhandled API error:", error);

    if (error instanceof ZodError) {
      return ApiResponses.validationError(error);
    }

    if (error instanceof Error) {
      return ApiResponses.internalError(error.message);
    }

    return ApiResponses.internalError(fallbackMessage);
  }
}
