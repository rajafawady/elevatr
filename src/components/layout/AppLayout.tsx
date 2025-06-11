'use client';

import { Header } from './Header';
import { Navigation } from './Navigation';
import { useAppStore } from '@/stores/appStore';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { sidebarCollapsed, navigation } = useAppStore();

  return (
    <div className="min-h-screen">
      {/* Mobile Menu Overlay - Add this here for better z-index management */}
      {navigation.mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => useAppStore.getState().setMobileMenuOpen(false)}
        />
      )}
      
      <Header />
      <div className="flex">
        <Navigation />
        <main className={cn(
          // Base styles
          'flex-1 min-h-screen transition-all duration-300 ease-in-out',
          'elevatr-grid-gap elevatr-animate-fade-in',
          
          // Responsive left margin to prevent content overlap with sidebar
          'ml-0', // Default for mobile
          'md:ml-20', // For collapsed sidebar on desktop
          !sidebarCollapsed && 'md:ml-64', // For expanded sidebar on desktop
        )}>
          <div className="elevatr-content-area p-4 md:p-0">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
