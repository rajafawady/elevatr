import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface NavigationState {
  currentRoute: string;
  previousRoute: string | null;
  navigationHistory: string[];
  isNavigating: boolean;
  mobileMenuOpen: boolean;
  routeCache: Record<string, { timestamp: number; data?: any }>;
}

interface AppState {
  // Global loading states
  globalLoading: boolean;
  
  // UI states
  sidebarCollapsed: boolean;
  
  // Navigation states
  navigation: NavigationState;
  
  // Cache states
  lastDataRefresh: number;
  
  // Actions
  setGlobalLoading: (loading: boolean) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  updateLastDataRefresh: () => void;
  shouldRefreshData: (maxAgeMs?: number) => boolean;
  
  // Navigation actions
  setCurrentRoute: (route: string) => void;
  setNavigating: (navigating: boolean) => void;
  toggleMobileMenu: () => void;
  setMobileMenuOpen: (open: boolean) => void;
  addToNavigationHistory: (route: string) => void;
  cacheRouteData: (route: string, data: any) => void;
  getCachedRouteData: (route: string, maxAgeMs?: number) => any | null;
  preloadRoute: (route: string) => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    (set, get) => ({
      // Initial state
      globalLoading: false,
      sidebarCollapsed: false,
      lastDataRefresh: 0,
      navigation: {
        currentRoute: '/',
        previousRoute: null,
        navigationHistory: ['/'],
        isNavigating: false,
        mobileMenuOpen: false,
        routeCache: {},
      },

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

      // Navigation actions
      setCurrentRoute: (route: string) => {
        set(state => ({
          navigation: {
            ...state.navigation,
            previousRoute: state.navigation.currentRoute,
            currentRoute: route,
          }
        }));
      },

      setNavigating: (navigating: boolean) => {
        set(state => ({
          navigation: {
            ...state.navigation,
            isNavigating: navigating,
          }
        }));
      },

      toggleMobileMenu: () => {
        set(state => ({
          navigation: {
            ...state.navigation,
            mobileMenuOpen: !state.navigation.mobileMenuOpen,
          }
        }));
      },

      setMobileMenuOpen: (open: boolean) => {
        set(state => ({
          navigation: {
            ...state.navigation,
            mobileMenuOpen: open,
          }
        }));
      },

      addToNavigationHistory: (route: string) => {
        set(state => {
          const history = [...state.navigation.navigationHistory];
          // Remove if already exists to avoid duplicates
          const existingIndex = history.indexOf(route);
          if (existingIndex > -1) {
            history.splice(existingIndex, 1);
          }
          // Add to end (most recent)
          history.push(route);
          // Keep only last 20 routes
          if (history.length > 20) {
            history.shift();
          }
          
          return {
            navigation: {
              ...state.navigation,
              navigationHistory: history,
            }
          };
        });
      },

      cacheRouteData: (route: string, data: any) => {
        set(state => ({
          navigation: {
            ...state.navigation,
            routeCache: {
              ...state.navigation.routeCache,
              [route]: {
                timestamp: Date.now(),
                data,
              },
            },
          }
        }));
      },      getCachedRouteData: (route: string, maxAgeMs = 5 * 60 * 1000) => {
        const state = get();
        const cached = state.navigation.routeCache[route];
        if (!cached) return null;
        
        if (Date.now() - cached.timestamp > maxAgeMs) {
          // Remove expired cache
          set(state => {
            const newCache = { ...state.navigation.routeCache };
            delete newCache[route];
            return {
              navigation: {
                ...state.navigation,
                routeCache: newCache,
              }
            };
          });
          return null;
        }
        
        return cached.data;
      },

      preloadRoute: (route: string) => {
        // Preload route for faster navigation
        if (typeof window !== 'undefined') {
          // Use Next.js 13+ navigation for prefetching
          const link = document.createElement('link');
          link.rel = 'prefetch';
          link.href = route;
          document.head.appendChild(link);
          
          // Also cache route metadata for faster navigation
          set(state => ({
            navigation: {
              ...state.navigation,
              routeCache: {
                ...state.navigation.routeCache,
                [route]: {
                  timestamp: Date.now(),
                  data: null, // Will be populated when route is visited
                },
              },
            }
          }));
        }
      },
    }),
    { name: 'AppStore' }
  )
);
