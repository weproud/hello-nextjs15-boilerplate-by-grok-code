import { useSession } from "@/providers/session-provider";
import { useUserStore } from "@/stores/user-store";
import { useCallback, useMemo } from "react";
import type { UserProfile } from "@/stores/user-store";

export function useAuth() {
  const { data: session, status } = useSession();
  const { user: storedUser, setUser, clearUser } = useUserStore();

  const isLoading = status === "loading";
  const isAuthenticated = !!session?.user;
  const user = session?.user || storedUser;

  // Memoized values for performance
  const userId = useMemo(() => user?.id, [user]);
  const userEmail = useMemo(() => user?.email, [user]);
  const userName = useMemo(() => user?.name, [user]);

  // Helper functions
  const logout = useCallback(async () => {
    clearUser();
    // Add signOut logic if needed
  }, [clearUser]);

  const updateProfile = useCallback(
    (updates: Partial<UserProfile>) => {
      if (user && updates) {
        // Only update if user has the required UserProfile properties
        if ("createdAt" in user && typeof user.id === "string") {
          const updatedUser: UserProfile = {
            ...user,
            ...updates,
            id: updates.id || user.id,
            email:
              updates.email !== undefined ? updates.email : user.email || null,
            updatedAt: updates.updatedAt || new Date(),
            createdAt: user.createdAt,
          } as UserProfile;
          setUser(updatedUser);
        }
      }
    },
    [user, setUser]
  );

  return {
    // Core auth data
    user,
    session,
    isLoading,
    isAuthenticated,

    // Computed values
    userId,
    userEmail,
    userName,

    // Actions
    setUser,
    clearUser,
    logout,
    updateProfile,
  };
}
