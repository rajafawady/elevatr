'use client';

import { useAppStore } from '@/stores/appStore';
import { cn } from '@/lib/utils';

export function NavigationProgress() {
  const { navigation, globalLoading } = useAppStore();

  const isLoading = navigation.isNavigating || globalLoading;

  if (!isLoading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div className="h-1 bg-muted">
        <div 
          className={cn(
            "h-full bg-primary transition-all duration-300 ease-out",
            "animate-pulse"
          )}
          style={{
            width: '100%',
            background: 'linear-gradient(90deg, transparent, hsl(var(--primary)), transparent)',
            backgroundSize: '200% 100%',
            animation: 'loading-bar 1.5s ease-in-out infinite'
          }}
        />
      </div>
      <style jsx>{`
        @keyframes loading-bar {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </div>
  );
}
