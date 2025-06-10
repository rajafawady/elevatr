'use client';

import { useCallback, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppStore } from '@/stores/appStore';

export function useNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  
  const {
    navigation,
    setCurrentRoute,
    setNavigating,
    setMobileMenuOpen,
    addToNavigationHistory,
    preloadRoute,
  } = useAppStore();

  // Update current route when pathname changes
  useEffect(() => {
    if (pathname !== navigation.currentRoute) {
      setCurrentRoute(pathname);
      addToNavigationHistory(pathname);
      setNavigating(false);
      
      // Persist navigation state to sessionStorage for PWA
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.setItem('elevatr_last_route', pathname);
          sessionStorage.setItem('elevatr_navigation_timestamp', Date.now().toString());
        } catch (error) {
          console.warn('Failed to persist navigation state:', error);
        }
      }
    }
  }, [pathname, navigation.currentRoute, setCurrentRoute, addToNavigationHistory, setNavigating]);

  // Auto-close mobile menu on route change
  useEffect(() => {
    if (navigation.mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  }, [pathname, navigation.mobileMenuOpen, setMobileMenuOpen]);
  const navigateTo = useCallback((href: string, options?: { replace?: boolean }) => {
    if (href === pathname) return;
    
    setNavigating(true);
    setMobileMenuOpen(false);
    
    // Add loading delay for better UX feedback
    setTimeout(() => {
      if (options?.replace) {
        router.replace(href);
      } else {
        router.push(href);
      }
    }, 50); // Small delay to show loading state
  }, [router, pathname, setNavigating, setMobileMenuOpen]);

  const navigateBack = useCallback(() => {
    if (navigation.navigationHistory.length > 1) {
      setNavigating(true);
      router.back();
    }
  }, [router, navigation.navigationHistory, setNavigating]);

  const preloadRoutes = useCallback((routes: string[]) => {
    routes.forEach(route => {
      preloadRoute(route);
    });
  }, [preloadRoute]);

  const isActive = useCallback((href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  }, [pathname]);

  return {
    currentRoute: navigation.currentRoute,
    previousRoute: navigation.previousRoute,
    isNavigating: navigation.isNavigating,
    navigationHistory: navigation.navigationHistory,
    navigateTo,
    navigateBack,
    preloadRoutes,
    isActive,
    canGoBack: navigation.navigationHistory.length > 1,
  };
}
