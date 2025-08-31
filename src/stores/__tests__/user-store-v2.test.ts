import { act, renderHook } from "@testing-library/react";
import { useUserStoreV2 } from "../user-store-v2";

// localStorage 모킹
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// console 모킹 (로깅 테스트용)
const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});

describe("useUserStoreV2", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // 스토어 초기화
    const { result } = renderHook(() => useUserStoreV2());
    act(() => {
      result.current.clearUser();
    });
  });

  describe("initial state", () => {
    it("should have correct initial state", () => {
      const { result } = renderHook(() => useUserStoreV2());

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.displayName).toBe("사용자");
      expect(result.current.isAdmin).toBe(false);
      expect(result.current.canAccessAdmin).toBe(false);
    });
  });

  describe("setUser", () => {
    it("should set user and mark as authenticated", () => {
      const { result } = renderHook(() => useUserStoreV2());

      const testUser = {
        id: "1",
        name: "테스트 사용자",
        email: "test@example.com",
        role: "USER" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      act(() => {
        result.current.setUser(testUser);
      });

      expect(result.current.user).toEqual(testUser);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.displayName).toBe("테스트 사용자");
    });

    it("should handle user without name", () => {
      const { result } = renderHook(() => useUserStoreV2());

      const testUser = {
        id: "1",
        name: null,
        email: "test@example.com",
        role: "USER" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      act(() => {
        result.current.setUser(testUser);
      });

      expect(result.current.displayName).toBe("test");
    });
  });

  describe("updateUser", () => {
    it("should update user properties", () => {
      const { result } = renderHook(() => useUserStoreV2());

      const initialUser = {
        id: "1",
        name: "초기 이름",
        email: "test@example.com",
        role: "USER" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      act(() => {
        result.current.setUser(initialUser);
      });

      act(() => {
        result.current.updateUser({
          name: "업데이트된 이름",
          bio: "새로운 바이오",
        });
      });

      expect(result.current.user?.name).toBe("업데이트된 이름");
      expect(result.current.user?.bio).toBe("새로운 바이오");
      expect(result.current.user?.email).toBe("test@example.com"); // 변경되지 않은 필드
    });

    it("should not update when no user is set", () => {
      const { result } = renderHook(() => useUserStoreV2());

      act(() => {
        result.current.updateUser({ name: "새 이름" });
      });

      expect(result.current.user).toBeNull();
    });
  });

  describe("updatePreferences", () => {
    it("should update user preferences", () => {
      const { result } = renderHook(() => useUserStoreV2());

      const testUser = {
        id: "1",
        name: "테스트",
        email: "test@example.com",
        role: "USER" as const,
        preferences: {
          theme: "light" as const,
          notifications: true,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      act(() => {
        result.current.setUser(testUser);
      });

      act(() => {
        result.current.updatePreferences({
          theme: "dark",
          language: "ko",
        });
      });

      expect(result.current.user?.preferences?.theme).toBe("dark");
      expect(result.current.user?.preferences?.language).toBe("ko");
      expect(result.current.user?.preferences?.notifications).toBe(true); // 기존 값 유지
    });
  });

  describe("clearUser", () => {
    it("should clear user and reset authentication", () => {
      const { result } = renderHook(() => useUserStoreV2());

      const testUser = {
        id: "1",
        name: "테스트",
        email: "test@example.com",
        role: "USER" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      act(() => {
        result.current.setUser(testUser);
      });

      expect(result.current.isAuthenticated).toBe(true);

      act(() => {
        result.current.clearUser();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe("permissions", () => {
    it("should correctly identify admin users", () => {
      const { result } = renderHook(() => useUserStoreV2());

      const adminUser = {
        id: "1",
        name: "관리자",
        email: "admin@example.com",
        role: "ADMIN" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      act(() => {
        result.current.setUser(adminUser);
      });

      expect(result.current.isAdmin).toBe(true);
      expect(result.current.canAccessAdmin).toBe(true);
    });

    it("should correctly identify operator users", () => {
      const { result } = renderHook(() => useUserStoreV2());

      const operatorUser = {
        id: "1",
        name: "운영자",
        email: "operator@example.com",
        role: "OPERATOR" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      act(() => {
        result.current.setUser(operatorUser);
      });

      expect(result.current.isOperator).toBe(true);
      expect(result.current.canAccessAdmin).toBe(true);
    });

    it("should deny admin access for regular users", () => {
      const { result } = renderHook(() => useUserStoreV2());

      const regularUser = {
        id: "1",
        name: "일반사용자",
        email: "user@example.com",
        role: "USER" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      act(() => {
        result.current.setUser(regularUser);
      });

      expect(result.current.isAdmin).toBe(false);
      expect(result.current.canAccessAdmin).toBe(false);
    });
  });

  describe("loading states", () => {
    it("should handle loading state", () => {
      const { result } = renderHook(() => useUserStoreV2());

      expect(result.current.isLoading).toBe(false);

      act(() => {
        result.current.setLoading(true);
      });

      expect(result.current.isLoading).toBe(true);

      act(() => {
        result.current.setLoading(false);
      });

      expect(result.current.isLoading).toBe(false);
    });
  });
});

// console 모킹 해제
afterAll(() => {
  consoleSpy.mockRestore();
});
