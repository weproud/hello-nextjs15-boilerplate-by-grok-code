import {
  hasGoogleAuth,
  hasKakaoAuth,
  isProduction,
  isDevelopment,
  isTest,
} from "../env";

// 환경 변수 모킹
const originalEnv = process.env;

beforeEach(() => {
  // 각 테스트 전에 환경 변수 초기화
  process.env = { ...originalEnv };
});

afterEach(() => {
  // 각 테스트 후에 환경 변수 복원
  process.env = originalEnv;
});

describe("OAuth authentication checks", () => {
  describe("hasGoogleAuth", () => {
    it("should return true when Google credentials are properly set", () => {
      process.env.AUTH_GOOGLE_ID = "test-google-id";
      process.env.AUTH_GOOGLE_SECRET = "test-google-secret";

      expect(hasGoogleAuth()).toBe(true);
    });

    it("should return false when Google client ID is dummy", () => {
      process.env.AUTH_GOOGLE_ID = "dummy-google-client-id";
      process.env.AUTH_GOOGLE_SECRET = "test-google-secret";

      expect(hasGoogleAuth()).toBe(false);
    });

    it("should return false when Google client secret is dummy", () => {
      process.env.AUTH_GOOGLE_ID = "test-google-id";
      process.env.AUTH_GOOGLE_SECRET = "dummy-google-client-secret";

      expect(hasGoogleAuth()).toBe(false);
    });

    it("should return false when Google credentials are missing", () => {
      delete process.env.AUTH_GOOGLE_ID;
      delete process.env.AUTH_GOOGLE_SECRET;

      expect(hasGoogleAuth()).toBe(false);
    });
  });

  describe("hasKakaoAuth", () => {
    it("should return true when Kakao credentials are properly set", () => {
      process.env.AUTH_KAKAO_ID = "test-kakao-id";
      process.env.AUTH_KAKAO_SECRET = "test-kakao-secret";

      expect(hasKakaoAuth()).toBe(true);
    });

    it("should return false when Kakao client ID is dummy", () => {
      process.env.AUTH_KAKAO_ID = "dummy-kakao-client-id";
      process.env.AUTH_KAKAO_SECRET = "test-kakao-secret";

      expect(hasKakaoAuth()).toBe(false);
    });

    it("should return false when Kakao credentials are missing", () => {
      delete process.env.AUTH_KAKAO_ID;
      delete process.env.AUTH_KAKAO_SECRET;

      expect(hasKakaoAuth()).toBe(false);
    });
  });
});

describe("Environment checks", () => {
  describe("isProduction", () => {
    it("should return true when NODE_ENV is production", () => {
      process.env.NODE_ENV = "production";
      expect(isProduction()).toBe(true);
    });

    it("should return false when NODE_ENV is not production", () => {
      process.env.NODE_ENV = "development";
      expect(isProduction()).toBe(false);
    });
  });

  describe("isDevelopment", () => {
    it("should return true when NODE_ENV is development", () => {
      process.env.NODE_ENV = "development";
      expect(isDevelopment()).toBe(true);
    });

    it("should return false when NODE_ENV is not development", () => {
      process.env.NODE_ENV = "production";
      expect(isDevelopment()).toBe(false);
    });
  });

  describe("isTest", () => {
    it("should return true when NODE_ENV is test", () => {
      process.env.NODE_ENV = "test";
      expect(isTest()).toBe(true);
    });

    it("should return false when NODE_ENV is not test", () => {
      process.env.NODE_ENV = "development";
      expect(isTest()).toBe(false);
    });
  });
});
