'use client';

import { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ElevatrButton } from '@/components/ui/ElevatrButton';
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
  
  const { isActive, preloadRoutes } = useNavigation();

  // Preload common routes on component mount for better performance
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
      // Prevent scroll on body when mobile menu is open
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

  // Close mobile menu when navigating
  const handleNavigation = () => {
    if (navigation.mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  };
  // Force the mobile state to re-render whenever navigation.mobileMenuOpen changes
  const mobileState = navigation.mobileMenuOpen;

  // Debug monitor - log state changes
  useEffect(() => {
    console.log("Mobile menu state changed:", navigation.mobileMenuOpen);
  }, [navigation.mobileMenuOpen]);
  
  return (
    <>
      
      {/* Fixed Mobile Menu Toggle Button - Always visible on small screens */}
      <button
        onClick={() => {
          console.log("FAB clicked, current state:", navigation.mobileMenuOpen);
          setMobileMenuOpen(!navigation.mobileMenuOpen); // Use direct setter instead of toggle
        }}
        className="md:hidden fixed bottom-4 right-4 w-14 h-14 rounded-full bg-primary hover:bg-primary/90 active:bg-primary/80 shadow-xl hover:shadow-2xl transition-all duration-200 flex items-center justify-center z-[100] border border-2 border-white backdrop-blur-sm before:absolute before:inset-0 before:bg-primary/95 before:rounded-full before:-z-10"
        aria-label="Toggle navigation"
      >
        {navigation.mobileMenuOpen ? (
          <X className="h-6 w-6 text-primary-foreground" />
        ) : (
          <Menu className="h-6 w-6 text-primary-foreground" />
        )}
      </button>
      
      {/* Sidebar */}
      <aside 
        data-mobile-open={navigation.mobileMenuOpen ? "true" : "false"}
        className={cn(        // Base styles
        'fixed flex flex-col glass-panel border-r shadow-lg overflow-hidden',
        'transition-all duration-300 ease-in-out h-screen',
        
        // Mobile styles - simplify for debugging
        'top-0 left-0 w-72',
        'z-[90]',
        
        // Mobile visibility controlled directly
        navigation.mobileMenuOpen ? 'translate-x-0' : '-translate-x-full',
        
        // Desktop styles - always visible, width based on collapsed state
        'md:translate-x-0',
        'md:z-[80]',
        sidebarCollapsed ? 'md:w-20' : 'md:w-64',
      )}>
        <div className="flex flex-col h-full">          
          {/* Mobile Header - Only visible on mobile */}
          <div className="flex md:hidden items-center justify-between p-4 border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <Target className="h-4 w-4 text-primary" />
              </div>
              <span className="font-semibold text-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Elevatr
              </span>
            </div>
          </div>

          {/* Desktop Toggle Button - Only visible on desktop */}
          <div className="hidden md:flex justify-end p-3 border-b border-border/50">
            <button
              onClick={toggleSidebar}
              className="relative h-10 w-10 rounded-xl transition-colors duration-200 flex items-center justify-center group overflow-hidden bg-gradient-to-br from-primary/10 to-accent/10 hover:from-primary/20 hover:to-accent/20 border border-primary/20 hover:border-primary/30 shadow-lg"
            >
              <div className="relative z-10 transition-colors duration-200">
                {sidebarCollapsed ? (
                  <ChevronRight className="h-5 w-5 text-primary" />
                ) : (
                  <ChevronLeft className="h-5 w-5 text-primary" />
                )}
              </div>
            </button>
          </div>

          {/* Content Area */}
          <div className="flex flex-col flex-1 min-h-0">
            {/* New Sprint Button */}
            <div className="p-4 border-b border-border/50">
              <ElevatrButton 
                variant="motivation"
                className={cn(
                  'w-full relative overflow-hidden group',
                  'bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70',
                  'text-white font-semibold shadow-lg transition-colors duration-200',
                  'before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/0 before:via-white/20 before:to-white/0',
                  sidebarCollapsed && 'md:px-0 md:aspect-square md:flex md:items-center md:justify-center'
                )}
              >
                <FastLink 
                  href="/sprint/new"
                  onHover={() => handleLinkHover('/sprint/new')}
                  onClick={handleNavigation}
                  className={cn(
                    'flex items-center justify-center w-full relative z-10',
                    sidebarCollapsed && 'md:flex-col md:h-full'
                  )}
                >
                  <div className={cn(
                    'flex items-center justify-center transition-colors duration-200',
                    sidebarCollapsed && 'md:w-12 md:h-12 md:rounded-full'
                  )}>
                    <Plus className={cn(
                      'transition-colors duration-200',
                      sidebarCollapsed ? 'md:h-7 md:w-7' : 'h-5 w-5'
                    )} />
                  </div>
                  
                  {/* Text with fade animation */}
                  <div className={cn(
                    'ml-2 overflow-hidden',
                    sidebarCollapsed && 'md:opacity-0 md:w-0 md:ml-0'
                  )}>
                    <span className="font-semibold whitespace-nowrap">New Sprint</span>
                  </div>
                  
                  {/* Mini label for collapsed state */}
                  {sidebarCollapsed && (
                    <span className="hidden md:block text-[9px] font-bold mt-1 opacity-90 tracking-wider">NEW</span>
                  )}
                </FastLink>
              </ElevatrButton>
            </div>
            
            {/* Navigation Links */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto min-h-0">
              {navigationItems.map((item, index) => {
                const isActiveItem = isActive(item.href);
                return (
                  <FastLink 
                    key={item.href}
                    href={item.href}
                    onHover={() => handleLinkHover(item.href)}
                    onClick={handleNavigation}
                    className={cn(
                      'flex items-center w-full px-3 py-2.5 rounded-lg transition-all duration-300 group hover:bg-accent/50 relative',
                      sidebarCollapsed && 'md:px-2 md:justify-center',
                      isActiveItem 
                        ? 'bg-primary/10 text-primary border-l-2 border-primary shadow-sm' 
                        : 'text-muted-foreground hover:text-foreground',
                      'elevatr-animate-slide-in-up nav-link-smooth btn-ripple',
                      `nav-item-${index + 1}`
                    )}
                  >
                    <div className={cn(
                      'flex items-center justify-center transition-all duration-300',
                      sidebarCollapsed && 'md:w-8 md:h-8 md:rounded-lg md:mx-auto',
                      isActiveItem && sidebarCollapsed && 'md:bg-primary/20'
                    )}>
                      <item.icon className={cn(
                        'transition-all duration-300',
                        sidebarCollapsed ? 'md:h-5 md:w-5' : 'h-4 w-4',
                        isActiveItem 
                        ? 'text-primary' 
                        : 'text-muted-foreground group-hover:text-foreground'
                      )} />
                    </div>
                    
                    {/* Text with smooth fade animation */}
                    <div className={cn(
                      'ml-3 transition-all duration-300 overflow-hidden',
                      sidebarCollapsed && 'md:opacity-0 md:w-0 md:ml-0'
                    )}>
                      <span className={cn(
                        'font-medium transition-colors whitespace-nowrap',
                        isActiveItem 
                          ? 'text-primary' 
                          : 'text-muted-foreground group-hover:text-foreground'
                      )}>
                        {item.label}
                      </span>
                    </div>

                    {/* Tooltip for collapsed state */}
                    {sidebarCollapsed && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 hidden md:block">
                        {item.label}
                      </div>
                    )}
                  </FastLink>
                );
              })}
            </nav>
          </div>

          {/* Settings at the bottom, always visible */}
          <div className="p-4 border-t border-border/50 bg-background/80">
            <FastLink 
              href="/settings"
              onHover={() => handleLinkHover('/settings')}
              onClick={handleNavigation}
              className={cn(
                'flex items-center w-full px-3 py-2.5 rounded-lg transition-all duration-300 group hover:bg-accent/50 relative transform hover:scale-[1.02]',
                sidebarCollapsed && 'md:px-2 md:justify-center',
                'text-muted-foreground hover:text-foreground'
              )}
            >
              <div className={cn(
                'flex items-center justify-center transition-all duration-300',
                sidebarCollapsed && 'md:w-8 md:h-8 md:rounded-lg'
              )}>
                <Settings className={cn(
                  'text-muted-foreground group-hover:text-foreground transition-all duration-300',
                  sidebarCollapsed ? 'md:h-5 md:w-5' : 'h-4 w-4'
                )} />
              </div>
              
              {/* Text with smooth fade animation */}
              <div className={cn(
                'ml-3 transition-all duration-300 overflow-hidden',
                sidebarCollapsed && 'md:opacity-0 md:w-0 md:ml-0'
              )}>
                <span className="font-medium text-muted-foreground group-hover:text-foreground transition-colors whitespace-nowrap">
                  Settings
                </span>
              </div>

              {/* Tooltip for collapsed state */}
              {sidebarCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 hidden md:block">
                  Settings
                </div>
              )}
            </FastLink>
          </div>
        </div>
      </aside>
    </>
  );
}
