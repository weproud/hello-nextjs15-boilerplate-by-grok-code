import { create } from "zustand";
import { persist } from "zustand/middleware";

interface NotificationState {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
  duration?: number;
  timestamp: number;
}

interface ModalState {
  id: string;
  type: "confirm" | "alert" | "custom";
  title: string;
  message?: string;
  isOpen: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface UIState {
  // Sidebar & Layout
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;

  // Modals
  modals: ModalState[];
  activeModal: string | null;

  // Notifications
  notifications: NotificationState[];

  // Loading states
  globalLoading: boolean;
  loadingStates: Record<string, boolean>;

  // Actions
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setSidebarOpen: (open: boolean) => void;

  // Modal actions
  openModal: (modal: Omit<ModalState, "isOpen">) => void;
  closeModal: (id: string) => void;
  closeAllModals: () => void;

  // Notification actions
  addNotification: (
    notification: Omit<NotificationState, "id" | "timestamp">
  ) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;

  // Loading actions
  setGlobalLoading: (loading: boolean) => void;
  setLoadingState: (key: string, loading: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      // Initial state
      sidebarOpen: false,
      sidebarCollapsed: false,
      modals: [],
      activeModal: null,
      notifications: [],
      globalLoading: false,
      loadingStates: {},

      // Sidebar actions
      toggleSidebar: () =>
        set((state) => ({
          sidebarOpen: !state.sidebarOpen,
        })),

      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      // Modal actions
      openModal: (modal) => {
        const newModal: ModalState = {
          ...modal,
          isOpen: true,
        };

        set((state) => ({
          modals: [...state.modals, newModal],
          activeModal: modal.id,
        }));
      },

      closeModal: (id) =>
        set((state) => ({
          modals: state.modals.filter((modal) => modal.id !== id),
          activeModal: state.activeModal === id ? null : state.activeModal,
        })),

      closeAllModals: () =>
        set({
          modals: [],
          activeModal: null,
        }),

      // Notification actions
      addNotification: (notification) => {
        const newNotification: NotificationState = {
          ...notification,
          id: crypto.randomUUID(),
          timestamp: Date.now(),
        };

        set((state) => ({
          notifications: [...state.notifications, newNotification],
        }));

        // Auto remove after duration
        if (notification.duration !== 0) {
          setTimeout(() => {
            get().removeNotification(newNotification.id);
          }, notification.duration || 4000);
        }
      },

      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),

      clearNotifications: () => set({ notifications: [] }),

      // Loading actions
      setGlobalLoading: (loading) => set({ globalLoading: loading }),

      setLoadingState: (key, loading) =>
        set((state) => ({
          loadingStates: {
            ...state.loadingStates,
            [key]: loading,
          },
        })),
    }),
    {
      name: "ui-storage",
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);

// Helper hooks for specific UI operations
export const useSidebar = () => {
  const {
    sidebarOpen,
    sidebarCollapsed,
    toggleSidebar,
    setSidebarOpen,
    setSidebarCollapsed,
  } = useUIStore();
  return {
    isOpen: sidebarOpen,
    isCollapsed: sidebarCollapsed,
    toggle: toggleSidebar,
    open: () => setSidebarOpen(true),
    close: () => setSidebarOpen(false),
    collapse: () => setSidebarCollapsed(true),
    expand: () => setSidebarCollapsed(false),
  };
};

export const useNotifications = () => {
  const {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
  } = useUIStore();
  return {
    notifications,
    add: addNotification,
    remove: removeNotification,
    clear: clearNotifications,
  };
};

export const useModals = () => {
  const { modals, activeModal, openModal, closeModal, closeAllModals } =
    useUIStore();
  return {
    modals,
    activeModal,
    open: openModal,
    close: closeModal,
    closeAll: closeAllModals,
  };
};

export const useLoading = () => {
  const { globalLoading, loadingStates, setGlobalLoading, setLoadingState } =
    useUIStore();
  return {
    isGlobalLoading: globalLoading,
    loadingStates,
    setGlobal: setGlobalLoading,
    setState: setLoadingState,
    isLoading: (key: string) => loadingStates[key] || false,
  };
};
