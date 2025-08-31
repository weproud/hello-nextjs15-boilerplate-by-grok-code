import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User } from "@/types";

// Base user interface for store
export interface UserProfile {
  id: string;
  name?: string | null;
  email: string | null;
  image?: string | null;
  role?: string;
  preferences?: {
    theme?: "light" | "dark" | "system";
    language?: string;
    notifications?: boolean;
  };
  lastLoginAt?: Date;
  updatedAt: Date;
  createdAt: Date;
}

export interface UserState {
  // Core user data
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Actions
  setUser: (user: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  updateUser: (updates: Partial<UserProfile>) => void;
  updatePreferences: (preferences: Partial<UserProfile["preferences"]>) => void;
  clearUser: () => void;

  // Computed values
  displayName: string;
  avatarUrl?: string;
  isAdmin: boolean;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      isAuthenticated: false,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          isLoading: false,
        }),

      setLoading: (isLoading) => set({ isLoading }),

      updateUser: (updates) =>
        set((state) => ({
          user: state.user
            ? {
                ...state.user,
                ...updates,
                updatedAt: updates.updatedAt || new Date(),
              }
            : null,
        })),

      updatePreferences: (preferences) =>
        set((state) => ({
          user: state.user
            ? {
                ...state.user,
                preferences: {
                  ...state.user.preferences,
                  ...preferences,
                },
                updatedAt: new Date(),
              }
            : null,
        })),

      clearUser: () =>
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        }),

      // Computed getters
      get displayName() {
        const user = get().user;
        return user?.name || user?.email?.split("@")[0] || "사용자";
      },

      get avatarUrl() {
        return get().user?.image || undefined;
      },

      get isAdmin() {
        return get().user?.role === "admin";
      },
    }),
    {
      name: "user-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
