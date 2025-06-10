'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/stores/appStore';

interface NavigationState {
  currentRoute: string;
  sidebarCollapsed: boolean;
  navigationHistory: string[];
  timestamp: number;
}

const STORAGE_KEY = 'elevatr_navigation_state';
const STATE_VERSION = '1.0';

export function NavigationStatePersistence() {
  const { 
    navigation, 
    sidebarCollapsed, 
    setSidebarCollapsed, 
    addToNavigationHistory 
  } = useAppStore();
  // Load navigation state on app start
  useEffect(() => {
    // Only run on client-side
    if (typeof window === 'undefined') return;

    const loadNavigationState = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return;

        const parsedState: NavigationState & { version?: string } = JSON.parse(stored);
        
        // Check if state is from current version
        if (parsedState.version !== STATE_VERSION) {
          localStorage.removeItem(STORAGE_KEY);
          return;
        }

        // Check if state is not too old (24 hours)
        if (Date.now() - parsedState.timestamp > 24 * 60 * 60 * 1000) {
          localStorage.removeItem(STORAGE_KEY);
          return;
        }

        // Restore navigation state
        setSidebarCollapsed(parsedState.sidebarCollapsed);
        
        // Restore navigation history
        parsedState.navigationHistory.forEach(route => {
          addToNavigationHistory(route);
        });

        console.log('Navigation state restored from storage');
      } catch (error) {
        console.warn('Failed to load navigation state:', error);
        localStorage.removeItem(STORAGE_KEY);
      }
    };

    loadNavigationState();
  }, [setSidebarCollapsed, addToNavigationHistory]);
  // Save navigation state when it changes
  useEffect(() => {
    // Only run on client-side
    if (typeof window === 'undefined') return;

    const saveNavigationState = () => {
      try {
        const stateToSave: NavigationState & { version: string } = {
          currentRoute: navigation.currentRoute,
          sidebarCollapsed,
          navigationHistory: navigation.navigationHistory,
          timestamp: Date.now(),
          version: STATE_VERSION,
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
      } catch (error) {
        console.warn('Failed to save navigation state:', error);
      }
    };

    // Debounce saves to avoid excessive writes
    const timeoutId = setTimeout(saveNavigationState, 500);
    return () => clearTimeout(timeoutId);
  }, [navigation.currentRoute, navigation.navigationHistory, sidebarCollapsed]);
  // Handle app lifecycle events for PWA
  useEffect(() => {
    // Only run on client-side
    if (typeof window === 'undefined') return;

    const handleBeforeUnload = () => {
      // Force save state before app closes
      try {
        const stateToSave: NavigationState & { version: string } = {
          currentRoute: navigation.currentRoute,
          sidebarCollapsed,
          navigationHistory: navigation.navigationHistory,
          timestamp: Date.now(),
          version: STATE_VERSION,
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
      } catch (error) {
        console.warn('Failed to save navigation state on unload:', error);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // App going to background, save state
        handleBeforeUnload();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [navigation.currentRoute, navigation.navigationHistory, sidebarCollapsed]);

  return null; // This component only handles persistence
}
