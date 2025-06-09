'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
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
  Plus
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
    label: 'Upload Sprint',
    href: '/upload',
    icon: Upload,
  },
];

export function Navigation() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside className={cn(
      'border-r bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 transition-all duration-300',
      collapsed ? 'w-16' : 'w-64'
    )}>
      <div className="flex flex-col h-[calc(100vh-4rem)]">
        {/* Toggle Button */}
        <div className="flex justify-end p-2 border-b">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-8"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* New Sprint Button */}
        <div className="p-4 border-b">
          <Button 
            className={cn(
              'w-full',
              collapsed && 'p-2'
            )}
            asChild
          >
            <Link href="/sprint/new">
              <Plus className="h-4 w-4" />
              {!collapsed && <span className="ml-2">New Sprint</span>}
            </Link>
          </Button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-2">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            
            return (
              <Button
                key={item.href}
                variant={isActive ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start',
                  collapsed && 'px-2',
                  isActive && 'bg-accent text-accent-foreground'
                )}
                asChild
              >
                <Link href={item.href}>
                  <item.icon className="h-4 w-4" />
                  {!collapsed && <span className="ml-3">{item.label}</span>}
                </Link>
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
              collapsed && 'px-2'
            )}
            asChild
          >
            <Link href="/settings">
              <Settings className="h-4 w-4" />
              {!collapsed && <span className="ml-3">Settings</span>}
            </Link>
          </Button>
        </div>
      </div>
    </aside>
  );
}
