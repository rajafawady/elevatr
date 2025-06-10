'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/stores/appStore';

export function NavigationSync() {
  const router = useRouter();
  const { setNavigating, setGlobalLoading } = useAppStore();

  useEffect(() => {
    // Only run on client-side
    if (typeof window === 'undefined') return;

    // Handle browser back/forward navigation
    const handlePopState = () => {
      setNavigating(true);
      // Reset after a short delay to show loading state
      setTimeout(() => setNavigating(false), 150);
    };

    // Handle page visibility changes for better PWA experience
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // App came back into focus, might need to refresh data
        setGlobalLoading(false);
        setNavigating(false);
      }
    };

    // Handle online/offline status for PWA
    const handleOnline = () => {
      console.log('App is online');
      // Could trigger data sync here
    };

    const handleOffline = () => {
      console.log('App is offline');
      // Could show offline indicator here
    };

    window.addEventListener('popstate', handlePopState);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setNavigating, setGlobalLoading]);

  // Preload critical routes on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const criticalRoutes = ['/sprint', '/tasks', '/calendar'];
      criticalRoutes.forEach(route => {
        router.prefetch(route);
      });
    }
  }, [router]);

  return null; // This component only handles side effects
}
