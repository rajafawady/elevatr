import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface AppState {
  // Global loading states
  globalLoading: boolean;
  
  // UI states
  sidebarCollapsed: boolean;
  
  // Cache states
  lastDataRefresh: number;
  
  // Actions
  setGlobalLoading: (loading: boolean) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  updateLastDataRefresh: () => void;
  shouldRefreshData: (maxAgeMs?: number) => boolean;
}

export const useAppStore = create<AppState>()(
  devtools(
    (set, get) => ({
      // Initial state
      globalLoading: false,
      sidebarCollapsed: false,
      lastDataRefresh: 0,

      // Set global loading state
      setGlobalLoading: (loading: boolean) => {
        set({ globalLoading: loading });
      },

      // Toggle sidebar
      toggleSidebar: () => {
        set(state => ({ sidebarCollapsed: !state.sidebarCollapsed }));
      },

      // Set sidebar state
      setSidebarCollapsed: (collapsed: boolean) => {
        set({ sidebarCollapsed: collapsed });
      },

      // Update last data refresh timestamp
      updateLastDataRefresh: () => {
        set({ lastDataRefresh: Date.now() });
      },

      // Check if data should be refreshed
      shouldRefreshData: (maxAgeMs = 5 * 60 * 1000) => { // Default 5 minutes
        const state = get();
        return Date.now() - state.lastDataRefresh > maxAgeMs;
      },
    }),
    { name: 'AppStore' }
  )
);
