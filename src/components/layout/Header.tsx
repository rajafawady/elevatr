'use client';

import React from 'react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { 
  User, 
  Settings, 
  LogOut, 
  LogIn,
  Trash2,
  Sun, 
  Moon, 
  Monitor,
  Bell,
  Search
} from 'lucide-react';
import { useState } from 'react';
import { SyncIndicator } from '@/components/ui/SyncIndicator';
import { HeaderSyncIndicator } from '@/components/ui/HeaderSyncIndicator';

export function Header() {
  const { user, signOut, isLocalUser, isGuest, signInWithGoogle } = useAuth();
  const { theme, setTheme } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  const themeOptions = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ];

  const currentThemeIcon = themeOptions.find(option => option.value === theme)?.icon || Monitor;
  return (
    <header className="border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="flex h-16 items-center px-4 md:px-6">
        {/* Logo */}
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-foreground">Elevatr</h1>
        </div>

        {/* Search Bar - Hidden on mobile */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search sprints, tasks, or journal entries..."
              className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            />
          </div>
        </div>

        {/* Spacer for mobile */}
        <div className="flex-1 md:hidden"></div>        {/* Right Side Actions */}
        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Sync Progress Indicator */}
          <HeaderSyncIndicator />

          {/* Search Button - Mobile only */}
          <Button variant="ghost" size="icon" className="md:hidden">
            <Search className="h-5 w-5" />
          </Button>

          {/* Sync Status Indicator */}
          <SyncIndicator className="hidden md:flex" />

          {/* Notifications - Hidden on mobile */}
          <Button variant="ghost" size="icon" className="relative hidden sm:flex">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-xs text-destructive-foreground flex items-center justify-center">
              3
            </span>
          </Button>

          {/* Theme Toggle */}
          <div className="relative"><Button
              variant="ghost"
              size="icon"
              onClick={() => setShowThemeMenu(!showThemeMenu)}
            >
              {React.createElement(currentThemeIcon, { className: "h-5 w-5" })}
            </Button>
            
            {showThemeMenu && (
              <Card className="absolute right-0 top-full mt-2 w-36 z-50">
                <div className="p-2">
                  {themeOptions.map((option) => (
                    <Button
                      key={option.value}
                      variant="ghost"
                      size="sm"
                      className={`w-full justify-start ${theme === option.value ? 'bg-accent' : ''}`}                      onClick={() => {
                        setTheme(option.value as 'light' | 'dark' | 'system');
                        setShowThemeMenu(false);
                      }}
                    >
                      <option.icon className="h-4 w-4 mr-2" />
                      {option.label}
                    </Button>
                  ))}
                </div>
              </Card>
            )}
          </div>          {/* User Menu */}
          <div className="relative">
            <Button
              variant="ghost"
              className="flex items-center space-x-2 px-2 md:px-3"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >              {user?.photoURL ? (
                <Image
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              ) : (
                <User className="h-5 w-5" />
              )}              <span className="hidden md:block text-sm font-medium">
                {isGuest ? 'Guest User' : isLocalUser ? 'Local User' : user?.displayName?.split(' ')[0] || 'User'}
              </span>
            </Button>            {showUserMenu && (
              <Card className="absolute right-0 top-full mt-2 w-48 z-50">
                <div className="p-2">
                  <div className="px-3 py-2 border-b border-border mb-2">
                    <p className="text-sm font-medium">
                      {isGuest ? 'Guest User' : isLocalUser ? 'Local User' : user?.displayName || 'User'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {isGuest ? 'Data stored temporarily' : isLocalUser ? 'Data stored locally only' : user?.email || 'No email'}
                    </p>
                  </div>
                    {/* For Guest Users: Show Sign In option */}
                  {isGuest && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full justify-start mb-1"
                      onClick={async () => {
                        setShowUserMenu(false);
                        try {
                          await signInWithGoogle();
                        } catch (error) {
                          console.error('Error signing in:', error);
                        }
                      }}
                    >
                      <LogIn className="h-4 w-4 mr-2" />
                      Sign In to Save Data
                    </Button>
                  )}
                  
                  {/* For Local Users: Show Sign In to Sync option */}
                  {isLocalUser && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full justify-start mb-1"
                      onClick={async () => {
                        setShowUserMenu(false);
                        try {
                          await signInWithGoogle();
                        } catch (error) {
                          console.error('Error signing in:', error);
                        }
                      }}
                    >
                      <LogIn className="h-4 w-4 mr-2" />
                      Sign In to Sync
                    </Button>
                  )}
                  
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                    {/* Different button text/actions based on user type */}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full justify-start text-destructive hover:text-destructive"
                    onClick={() => {
                      setShowUserMenu(false);
                      signOut();
                    }}
                  >
                    {isGuest || isLocalUser ? (
                      <Trash2 className="h-4 w-4 mr-2" />
                    ) : (
                      <LogOut className="h-4 w-4 mr-2" />
                    )}
                    {isGuest ? 'Clear Data & Start Fresh' : isLocalUser ? 'Clear Local Data' : 'Sign Out'}
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close menus */}
      {(showUserMenu || showThemeMenu) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowUserMenu(false);
            setShowThemeMenu(false);
          }}
        />
      )}
    </header>
  );
}
