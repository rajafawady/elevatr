'use client';

import { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { FastLink } from '@/components/ui/FastLink';
import { useAppStore } from '@/stores/appStore';
import { useNavigation } from '@/hooks/useNavigation';
import {
  LayoutDashboard,
  Target,
  Calendar,
  CheckSquare,
  BookOpen,
  BarChart3,
  Upload,
  Settings,
  ChevronLeft,
  ChevronRight,
  Plus,
  Menu,
  X
} from 'lucide-react';

const navigationItems = [
  {
    label: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    label: 'Active Sprint',
    href: '/sprint',
    icon: Target,
  },
  {
    label: 'Calendar',
    href: '/calendar',
    icon: Calendar,
  },
  {
    label: 'Tasks',
    href: '/tasks',
    icon: CheckSquare,
  },
  {
    label: 'Journal',
    href: '/journal',
    icon: BookOpen,
  },
  {
    label: 'Progress',
    href: '/progress',
    icon: BarChart3,
  },
  {
    label: 'Upload Data',
    href: '/upload',
    icon: Upload,
  },
];

export function Navigation() {
  const { 
    navigation, 
    sidebarCollapsed, 
    toggleSidebar, 
    toggleMobileMenu, 
    setMobileMenuOpen,
    preloadRoute 
  } = useAppStore();
  
  const { isActive, preloadRoutes } = useNavigation();  // Preload common routes on component mount for better performance
  useEffect(() => {
    const commonRoutes = ['/sprint', '/tasks', '/calendar', '/journal', '/progress', '/upload'];
    preloadRoutes(commonRoutes);
  }, [preloadRoutes]);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };

    if (navigation.mobileMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [navigation.mobileMenuOpen, setMobileMenuOpen]);

  // Preload route on hover for instant navigation
  const handleLinkHover = (href: string) => {
    preloadRoute(href);
  };

  return (
    <>
      {/* Mobile Menu Button */}      <Button
        variant="ghost"
        size="icon"
        onClick={toggleMobileMenu}
        className="md:hidden fixed top-4 left-4 z-50 h-10 w-10"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Mobile Overlay */}
      {navigation.mobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'border-r bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 transition-all duration-300',
        // Desktop styles
        'hidden md:block',
        sidebarCollapsed ? 'w-16' : 'w-64',
        // Mobile styles
        'md:relative fixed inset-y-0 left-0 z-50',
        navigation.mobileMenuOpen ? 'block' : 'hidden md:block'
      )}>
        <div className="flex flex-col h-screen md:h-[calc(100vh-4rem)]">          {/* Mobile Close Button */}
          <div className="md:hidden flex justify-between items-center p-4 border-b">
            <span className="font-semibold">Menu</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(false)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Desktop Toggle Button */}
          <div className="hidden md:flex justify-end p-2 border-b">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="h-8 w-8"
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* New Sprint Button */}
          <div className="p-4 border-b">            <Button 
              className={cn(
                'w-full',
                (sidebarCollapsed && !navigation.mobileMenuOpen) && 'p-2'
              )}
              asChild
            >
              <FastLink 
                href="/sprint/new"
                onHover={() => handleLinkHover('/sprint/new')}
              >
                <Plus className="h-4 w-4" />
                {(!sidebarCollapsed || navigation.mobileMenuOpen) && <span className="ml-2">New Sprint</span>}
              </FastLink>
            </Button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 p-4 space-y-2">
            {navigationItems.map((item) => {
              const isActiveItem = isActive(item.href);
              
              return (
                <Button
                  key={item.href}
                  variant={isActiveItem ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start',
                    (sidebarCollapsed && !navigation.mobileMenuOpen) && 'px-2',
                    isActiveItem && 'bg-accent text-accent-foreground'
                  )}
                  asChild
                >                  <FastLink 
                    href={item.href}
                    onHover={() => handleLinkHover(item.href)}
                  >
                    <item.icon className="h-4 w-4" />
                    {(!sidebarCollapsed || navigation.mobileMenuOpen) && <span className="ml-3">{item.label}</span>}
                  </FastLink>
                </Button>
              );
            })}
          </nav>

          {/* Settings */}
          <div className="p-4 border-t">
            <Button
              variant="ghost"
              className={cn(
                'w-full justify-start',
                (sidebarCollapsed && !navigation.mobileMenuOpen) && 'px-2'
              )}
              asChild
            >              <FastLink 
                href="/settings"
                onHover={() => handleLinkHover('/settings')}
              >
                <Settings className="h-4 w-4" />
                {(!sidebarCollapsed || navigation.mobileMenuOpen) && <span className="ml-3">Settings</span>}
              </FastLink>
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
