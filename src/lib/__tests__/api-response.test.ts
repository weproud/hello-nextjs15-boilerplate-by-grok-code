import { NextResponse } from "next/server";
import { ApiResponses } from "../api-response";

// NextResponse 모킹
jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn(),
  },
}));

describe("ApiResponses", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("success", () => {
    it("should return success response with data", () => {
      const mockData = { id: 1, name: "Test" };
      const mockResponse = { success: true, data: mockData };

      (NextResponse.json as jest.Mock).mockReturnValue(mockResponse);

      const result = ApiResponses.success(mockData, "성공 메시지");

      expect(NextResponse.json).toHaveBeenCalledWith(
        {
          success: true,
          data: mockData,
          message: "성공 메시지",
        },
        { status: 200 }
      );
    });
  });

  describe("error", () => {
    it("should return error response with string error", () => {
      const mockResponse = { success: false, error: "테스트 에러" };

      (NextResponse.json as jest.Mock).mockReturnValue(mockResponse);

      const result = ApiResponses.error("테스트 에러");

      expect(NextResponse.json).toHaveBeenCalledWith(
        {
          success: false,
          error: "테스트 에러",
        },
        { status: 500 }
      );
    });

    it("should return error response with ApiError object", () => {
      const mockResponse = {
        success: false,
        error: "상세 에러 메시지",
        code: "VALIDATION_ERROR",
      };

      (NextResponse.json as jest.Mock).mockReturnValue(mockResponse);

      const result = ApiResponses.error({
        code: "VALIDATION_ERROR",
        message: "상세 에러 메시지",
      });

      expect(NextResponse.json).toHaveBeenCalledWith(
        {
          success: false,
          error: "상세 에러 메시지",
          code: "VALIDATION_ERROR",
        },
        { status: 500 }
      );
    });
  });

  describe("unauthorized", () => {
    it("should return 401 unauthorized response", () => {
      const mockResponse = {
        success: false,
        error: "인증이 필요합니다",
        code: "UNAUTHORIZED",
      };

      (NextResponse.json as jest.Mock).mockReturnValue(mockResponse);

      const result = ApiResponses.unauthorized();

      expect(NextResponse.json).toHaveBeenCalledWith(
        {
          success: false,
          error: "인증이 필요합니다",
          code: "UNAUTHORIZED",
        },
        { status: 401 }
      );
    });
  });

  describe("forbidden", () => {
    it("should return 403 forbidden response", () => {
      const mockResponse = {
        success: false,
        error: "접근 권한이 없습니다",
        code: "FORBIDDEN",
      };

      (NextResponse.json as jest.Mock).mockReturnValue(mockResponse);

      const result = ApiResponses.forbidden();

      expect(NextResponse.json).toHaveBeenCalledWith(
        {
          success: false,
          error: "접근 권한이 없습니다",
          code: "FORBIDDEN",
        },
        { status: 403 }
      );
    });
  });

  describe("notFound", () => {
    it("should return 404 not found response", () => {
      const mockResponse = {
        success: false,
        error: "리소스를 찾을 수 없습니다",
        code: "NOT_FOUND",
      };

      (NextResponse.json as jest.Mock).mockReturnValue(mockResponse);

      const result = ApiResponses.notFound();

      expect(NextResponse.json).toHaveBeenCalledWith(
        {
          success: false,
          error: "리소스를 찾을 수 없습니다",
          code: "NOT_FOUND",
        },
        { status: 404 }
      );
    });
  });

  describe("badRequest", () => {
    it("should return 400 bad request response", () => {
      const mockResponse = {
        success: false,
        error: "잘못된 요청입니다",
        code: "BAD_REQUEST",
      };

      (NextResponse.json as jest.Mock).mockReturnValue(mockResponse);

      const result = ApiResponses.badRequest();

      expect(NextResponse.json).toHaveBeenCalledWith(
        {
          success: false,
          error: "잘못된 요청입니다",
          code: "BAD_REQUEST",
        },
        { status: 400 }
      );
    });
  });

  describe("validationError", () => {
    it("should return validation error response", () => {
      const zodError = {
        errors: [
          {
            path: ["email"],
            message: "유효하지 않은 이메일입니다",
          },
          {
            path: ["password"],
            message: "비밀번호는 필수입니다",
          },
        ],
      };

      const mockResponse = {
        success: false,
        error: "입력 데이터가 올바르지 않습니다",
        code: "VALIDATION_ERROR",
        details: [
          {
            field: "email",
            message: "유효하지 않은 이메일입니다",
          },
          {
            field: "password",
            message: "비밀번호는 필수입니다",
          },
        ],
      };

      (NextResponse.json as jest.Mock).mockReturnValue(mockResponse);

      const result = ApiResponses.validationError(zodError as any);

      expect(NextResponse.json).toHaveBeenCalledWith(
        {
          success: false,
          error: "입력 데이터가 올바르지 않습니다",
          code: "VALIDATION_ERROR",
          details: [
            {
              field: "email",
              message: "유효하지 않은 이메일입니다",
            },
            {
              field: "password",
              message: "비밀번호는 필수입니다",
            },
          ],
        },
        { status: 400 }
      );
    });
  });
});
