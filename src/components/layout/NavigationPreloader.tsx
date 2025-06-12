'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/stores/appStore';

// Routes that should be aggressively preloaded for instant navigation
const CRITICAL_ROUTES = [
  '/',
  '/sprint',
  '/tasks',
  '/calendar',
  '/journal',
  '/progress',
];

// Routes that should be preloaded on idle
const SECONDARY_ROUTES = [
  '/login',
  '/landing',
  '/sprint/new',
  '/upload',
  '/settings',
];

export function NavigationPreloader() {
  const router = useRouter();
  const { preloadRoute } = useAppStore();

  useEffect(() => {
    // Only run preloading on client-side
    if (typeof window === 'undefined') return;

    // Preload critical routes immediately
    const preloadCriticalRoutes = () => {
      CRITICAL_ROUTES.forEach(route => {
        router.prefetch(route);
        preloadRoute(route);
      });
    };

    // Preload secondary routes when browser is idle
    const preloadSecondaryRoutes = () => {      if ('requestIdleCallback' in window) {
        (window as typeof window & { requestIdleCallback: (callback: () => void) => void }).requestIdleCallback(() => {
          SECONDARY_ROUTES.forEach(route => {
            router.prefetch(route);
            preloadRoute(route);
          });
        });
      } else {
        // Fallback for browsers without requestIdleCallback
        setTimeout(() => {
          SECONDARY_ROUTES.forEach(route => {
            router.prefetch(route);
            preloadRoute(route);
          });
        }, 2000);
      }
    };

    // Preload on component mount
    preloadCriticalRoutes();
    preloadSecondaryRoutes();

    // Preload routes on mouse hover over navigation links
    const handleLinkHover = (event: Event) => {
      const target = event.target as HTMLElement;
      const link = target.closest('a[href]') as HTMLAnchorElement;
      
      if (link && link.href) {
        const url = new URL(link.href);
        if (url.origin === window.location.origin) {
          router.prefetch(url.pathname);
          preloadRoute(url.pathname);
        }
      }
    };

    // Add hover listeners to navigation elements
    const navigationElements = document.querySelectorAll('nav, aside');
    navigationElements.forEach(nav => {
      nav.addEventListener('mouseover', handleLinkHover);
    });

    // Preload on link focus (keyboard navigation)
    const handleLinkFocus = (event: Event) => {
      const target = event.target as HTMLAnchorElement;
      if (target.tagName === 'A' && target.href) {
        const url = new URL(target.href);
        if (url.origin === window.location.origin) {
          router.prefetch(url.pathname);
          preloadRoute(url.pathname);
        }
      }
    };

    document.addEventListener('focusin', handleLinkFocus);

    // Cleanup
    return () => {
      navigationElements.forEach(nav => {
        nav.removeEventListener('mouseover', handleLinkHover);
      });
      document.removeEventListener('focusin', handleLinkFocus);
    };
  }, [router, preloadRoute]);

  // Preload based on user behavior patterns
  useEffect(() => {    const handleUserInteraction = () => {
      // If user is active, preload more aggressively
      const timeBasedRoutes = {
        morning: ['/tasks', '/calendar'],
        evening: ['/progress', '/settings'],
      };

      const hour = new Date().getHours();
      const routesToPreload = hour < 12 ? timeBasedRoutes.morning : timeBasedRoutes.evening;

      routesToPreload.forEach(route => {
        router.prefetch(route);
        preloadRoute(route);
      });
    };

    // Listen for user interactions
    const events = ['click', 'keydown', 'scroll'];
    events.forEach(event => {
      document.addEventListener(event, handleUserInteraction, { once: true, passive: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserInteraction);
      });
    };
  }, [router, preloadRoute]);

  return null; // This component only handles preloading
}







