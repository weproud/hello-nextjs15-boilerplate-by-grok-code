import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  BaseState,
  createActions,
  StateHistory,
  withErrorHandling,
  withLogging,
  withValidation,
} from "./store-utils";

// 개선된 유저 인터페이스
export interface UserProfile {
  id: string;
  name?: string | null;
  email: string | null;
  image?: string | null;
  role?: "USER" | "ADMIN" | "OPERATOR";
  bio?: string | null;
  website?: string | null;
  location?: string | null;
  preferences?: {
    theme?: "light" | "dark" | "system";
    language?: string;
    notifications?: boolean;
    emailUpdates?: boolean;
  };
  emailVerified?: Date | null;
  lastLoginAt?: Date;
  updatedAt: Date;
  createdAt: Date;
  // 메타데이터
  isActive?: boolean;
  loginCount?: number;
}

// 개선된 상태 인터페이스
interface UserState extends BaseState {
  // 코어 데이터
  user: UserProfile | null;
  isAuthenticated: boolean;

  // 세션 정보
  sessionId?: string;
  sessionExpires?: Date;

  // 액션들
  setUser: (user: UserProfile | null) => void;
  updateUser: (updates: Partial<UserProfile>) => void;
  updatePreferences: (preferences: Partial<UserProfile["preferences"]>) => void;
  clearUser: () => void;
  refreshSession: () => Promise<void>;

  // 컴퓨티드 값들
  displayName: string;
  avatarUrl?: string;
  isAdmin: boolean;
  isOperator: boolean;
  canAccessAdmin: boolean;

  // 유틸리티
  isOnline: boolean;
  lastActivity: Date;
}

// 상태 검증 함수
const validateUserState = (state: UserState): boolean => {
  if (state.user) {
    return !!(
      state.user.id &&
      state.user.email &&
      state.user.createdAt &&
      state.user.updatedAt
    );
  }
  return true; // user가 null일 때는 유효
};

// 상태 히스토리
const userHistory = new StateHistory<UserState>();

// 개선된 유저 스토어
export const useUserStoreV2 = create<UserState>()(
  withLogging(
    withErrorHandling(
      withValidation(
        (persist as any)(
          (set: any, get: any) => {
            const actions = createActions<UserState>({ setState: set } as any);

            return {
              // 초기 상태
              user: null,
              isAuthenticated: false,
              isLoading: false,
              lastUpdated: Date.now(),
              isOnline: true,
              lastActivity: new Date(),

              // 기본 액션들
              ...actions,

              setUser: (user: UserProfile | null) => {
                const newState = {
                  user,
                  isAuthenticated: !!user,
                  isLoading: false,
                  lastUpdated: Date.now(),
                  lastActivity: new Date(),
                };

                set(newState);
                userHistory.push({ ...get(), ...newState });
              },

              updateUser: (updates: Partial<UserProfile>) => {
                const currentUser = get().user;
                if (!currentUser) return;

                const updatedUser = {
                  ...currentUser,
                  ...updates,
                  updatedAt: updates.updatedAt || new Date(),
                };

                set({
                  user: updatedUser,
                  lastUpdated: Date.now(),
                  lastActivity: new Date(),
                });
              },

              updatePreferences: (
                preferences: Partial<UserProfile["preferences"]>
              ) => {
                const currentUser = get().user;
                if (!currentUser) return;

                const updatedUser = {
                  ...currentUser,
                  preferences: {
                    ...currentUser.preferences,
                    ...preferences,
                  },
                  updatedAt: new Date(),
                };

                set({
                  user: updatedUser,
                  lastUpdated: Date.now(),
                });
              },

              clearUser: () => {
                set({
                  user: null,
                  isAuthenticated: false,
                  isLoading: false,
                  sessionId: undefined,
                  sessionExpires: undefined,
                  lastUpdated: Date.now(),
                });
              },

              refreshSession: async () => {
                // 세션 갱신 로직 (실제로는 API 호출)
                set({ isLoading: true });

                try {
                  // 여기서는 시뮬레이션
                  await new Promise((resolve) => setTimeout(resolve, 1000));

                  const newExpires = new Date();
                  newExpires.setHours(newExpires.getHours() + 24); // 24시간 연장

                  set({
                    sessionExpires: newExpires,
                    isLoading: false,
                    lastUpdated: Date.now(),
                  });
                } catch (error) {
                  console.error("Session refresh failed:", error);
                  set({ isLoading: false });
                }
              },

              // 컴퓨티드 값들 (getter로 구현)
              get displayName() {
                const user = get().user;
                return user?.name || user?.email?.split("@")[0] || "사용자";
              },

              get avatarUrl() {
                return get().user?.image || undefined;
              },

              get isAdmin() {
                return get().user?.role === "ADMIN";
              },

              get isOperator() {
                return get().user?.role === "OPERATOR";
              },

              get canAccessAdmin() {
                const user = get().user;
                return user?.role === "ADMIN" || user?.role === "OPERATOR";
              },
            };
          },
          {
            name: "user-storage-v2",
            storage: createJSONStorage(() => localStorage),
            partialize: (state: Partial<UserState>) => ({
              user: state.user,
              isAuthenticated: state.isAuthenticated,
              sessionExpires: state.sessionExpires,
              lastActivity: state.lastActivity,
            }),
            // 마이그레이션 함수
            version: 2,
            migrate: (persistedState: unknown, version: number) => {
              if (version === 0 || version === 1) {
                // v1에서 v2로 마이그레이션
                return {
                  ...persistedState,
                  lastActivity: new Date(),
                  isOnline: true,
                };
              }
              return persistedState;
            },
          }
        ),
        validateUserState
      )
    )
  )
);

// 추가 유틸리티 훅들
export const useUserActions = () => {
  const store = useUserStoreV2();

  return {
    login: (user: UserProfile) => store.setUser(user),
    logout: () => store.clearUser(),
    updateProfile: (updates: Partial<UserProfile>) => store.updateUser(updates),
    updateSettings: (preferences: Partial<UserProfile["preferences"]>) =>
      store.updatePreferences(preferences),
    refreshSession: () => store.refreshSession(),
  };
};

export const useUserPermissions = () => {
  const { isAdmin, isOperator, canAccessAdmin } = useUserStoreV2();

  return {
    isAdmin,
    isOperator,
    canAccessAdmin,
    canEdit: (resourceOwnerId?: string) => {
      if (isAdmin) return true;
      if (isOperator) return true;
      return resourceOwnerId === useUserStoreV2.getState().user?.id;
    },
    canDelete: (resourceOwnerId?: string) => {
      if (isAdmin) return true;
      if (isOperator) return true;
      return resourceOwnerId === useUserStoreV2.getState().user?.id;
    },
  };
};

export const useUserActivity = () => {
  const { lastActivity, isOnline } = useUserStoreV2();

  return {
    lastActivity,
    isOnline,
    isActiveRecently: () => {
      const fiveMinutesAgo = new Date();
      fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);
      return lastActivity > fiveMinutesAgo;
    },
  };
};
