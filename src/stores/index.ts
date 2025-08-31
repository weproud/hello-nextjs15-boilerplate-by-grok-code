// Central store exports for easy importing
export { useUserStore } from "./user-store";
export { useUIStore } from "./ui-store";

// Re-export specialized hooks
export {
  useSidebar,
  useNotifications,
  useModals,
  useLoading,
} from "./ui-store";

// Store types for TypeScript - define them here since they're not exported from individual files
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
  updatedAt?: Date;
  createdAt: Date;
}

export interface UserState {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  updateUser: (updates: Partial<UserProfile>) => void;
  updatePreferences: (preferences: Partial<UserProfile["preferences"]>) => void;
  clearUser: () => void;
  displayName: string;
  avatarUrl?: string;
  isAdmin: boolean;
}

export interface NotificationState {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
  duration?: number;
  timestamp: number;
}

export interface ModalState {
  id: string;
  type: "confirm" | "alert" | "custom";
  title: string;
  message?: string;
  isOpen: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export interface UIState {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  modals: ModalState[];
  activeModal: string | null;
  notifications: NotificationState[];
  globalLoading: boolean;
  loadingStates: Record<string, boolean>;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setSidebarOpen: (open: boolean) => void;
  openModal: (modal: Omit<ModalState, "isOpen">) => void;
  closeModal: (id: string) => void;
  closeAllModals: () => void;
  addNotification: (
    notification: Omit<NotificationState, "id" | "timestamp">
  ) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  setGlobalLoading: (loading: boolean) => void;
  setLoadingState: (key: string, loading: boolean) => void;
}
