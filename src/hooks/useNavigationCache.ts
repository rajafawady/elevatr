'use client';

import { useCallback } from 'react';
import { useAppStore } from '@/stores/appStore';

interface NavigationCacheEntry {
  data: any;
  timestamp: number;
  route: string;
}

export function useNavigationCache() {
  const { getCachedRouteData, cacheRouteData } = useAppStore();

  const getCacheKey = useCallback((route: string) => {
    return `elevatr_route_cache_${route.replace(/\//g, '_')}`;
  }, []);

  const persistCacheToStorage = useCallback((route: string, data: any) => {
    if (typeof window === 'undefined') return;

    try {
      const cacheEntry: NavigationCacheEntry = {
        data,
        timestamp: Date.now(),
        route,
      };
      
      localStorage.setItem(getCacheKey(route), JSON.stringify(cacheEntry));
      
      // Also update the Zustand store
      cacheRouteData(route, data);
    } catch (error) {
      console.warn('Failed to persist route cache:', error);
    }
  }, [getCacheKey, cacheRouteData]);

  const getCacheFromStorage = useCallback((route: string, maxAgeMs = 5 * 60 * 1000) => {
    if (typeof window === 'undefined') return null;

    try {
      // First check Zustand store (in-memory)
      const memoryCache = getCachedRouteData(route, maxAgeMs);
      if (memoryCache) return memoryCache;

      // Then check localStorage (persistent)
      const cached = localStorage.getItem(getCacheKey(route));
      if (!cached) return null;

      const cacheEntry: NavigationCacheEntry = JSON.parse(cached);
      
      if (Date.now() - cacheEntry.timestamp > maxAgeMs) {
        localStorage.removeItem(getCacheKey(route));
        return null;
      }

      // Restore to Zustand store
      cacheRouteData(route, cacheEntry.data);
      
      return cacheEntry.data;
    } catch (error) {
      console.warn('Failed to get route cache:', error);
      return null;
    }
  }, [getCacheKey, getCachedRouteData, cacheRouteData]);

  const clearCacheForRoute = useCallback((route: string) => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(getCacheKey(route));
    } catch (error) {
      console.warn('Failed to clear route cache:', error);
    }
  }, [getCacheKey]);

  const clearAllCache = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('elevatr_route_cache_')) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Failed to clear all cache:', error);
    }
  }, []);

  return {
    persistCacheToStorage,
    getCacheFromStorage,
    clearCacheForRoute,
    clearAllCache,
  };
}
