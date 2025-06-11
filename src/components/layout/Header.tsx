'use client';

import React from 'react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useAppStore } from '@/stores/appStore';
import { ElevatrButton } from '@/components/ui/ElevatrButton';
import { ElevatrCard } from '@/components/ui/ElevatrCard';
import { cn } from '@/lib/utils';
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
  Search,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';
import { SyncIndicator } from '@/components/ui/SyncIndicator';
import { HeaderSyncIndicator } from '@/components/ui/HeaderSyncIndicator';

export function Header() {
  const { user, signOut, isLocalUser, isGuest, signInWithGoogle, clearDataAndStartFresh } = useAuth();
  const { theme, setTheme } = useTheme();
  const { toggleMobileMenu, navigation } = useAppStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  const themeOptions = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ];

  const currentThemeIcon = themeOptions.find(option => option.value === theme)?.icon || Monitor;  return (
    <header className="backdrop-blur-xl bg-background/85 border-b border-border/40 sticky top-0 z-[60] elevatr-animate-slide-in-down shadow-sm dark:shadow-md">
      <div className="w-full max-w-full px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between min-w-0">          {/* Left Section: Mobile Menu + Logo */}
          <div className="flex items-center gap-3 min-w-0">            
            <div className="flex items-center min-w-0">
              <div className="flex items-center gap-3">                
                {/* <div className="relative group">
                  <div className="hidden sm:block w-8 h-8 rounded-xl bg-white dark:bg-gray-900 shadow-lg border border-border/20 flex items-center justify-center transition-colors duration-200 shrink-0">
                    <Image
                      src="/icons/icon.svg"
                      alt="Elevatr"
                      width={20}
                      height={20}
                      className="transition-opacity duration-200 group-hover:opacity-80"
                    />
                  </div>
                </div> */}
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent cursor-default truncate"
                    style={{ backgroundSize: '200% 100%' }}>
                  Elevatr
                </h1>
              </div>
            </div>
          </div>          {/* Center Section: Search Bar (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
              <input
                type="search"
                placeholder="Search sprints, tasks, or journal entries..."                className="w-full pl-10 pr-4 py-2.5 bg-white/50 dark:bg-muted/30 border border-border/30 dark:border-border/50 rounded-xl text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60 focus:bg-white dark:focus:bg-muted/40 transition-all duration-200 shadow-sm hover:shadow-md"
              />
            </div>
          </div>          {/* Right Section: Actions */}
          <div className="flex items-center gap-2 shrink-0">            {/* Sync Progress Indicator */}
            <div className="hidden sm:block">
              <HeaderSyncIndicator />
            </div>
            
            {/* Search Button - Mobile only */}            <ElevatrButton 
              variant="secondary" 
              size="sm" 
              className="md:hidden p-2 transition-colors duration-200 hover:bg-accent/10 shrink-0"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </ElevatrButton>{/* Notifications */}
            <div className="relative hidden sm:block">              <ElevatrButton 
                variant="secondary" 
                size="sm" 
                className="relative p-2 transition-colors duration-200 hover:bg-accent/10 group"
              >
                <Bell className="h-5 w-5 transition-colors group-hover:text-primary" />
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-r from-red-500 to-red-600 text-[10px] text-white flex items-center justify-center font-bold shadow-lg ring-2 ring-background">
                  3
                </span>
              </ElevatrButton>
            </div>

            {/* Theme Toggle */}
            <div className="relative">              <ElevatrButton
                variant="secondary"
                size="sm"
                onClick={() => setShowThemeMenu(!showThemeMenu)}
                className="p-2 transition-colors duration-200 hover:bg-accent/10 group"
              >
                {React.createElement(currentThemeIcon, { 
                  className: "h-5 w-5 transition-colors group-hover:text-primary" 
                })}
              </ElevatrButton>
              
              {showThemeMenu && (
                <>
                  {/* Backdrop */}
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowThemeMenu(false)}
                  />
                  <ElevatrCard 
                    variant="glass" 
                    className="absolute right-0 top-full mt-2 w-44 z-50 shadow-xl border border-border/10 elevatr-animate-fade-in bg-white/95 dark:bg-background/95 backdrop-blur-xl"
                  >
                    <div className="p-2">
                      <div className="text-xs font-medium text-muted-foreground px-3 py-2 border-b border-border/20 mb-1">
                        Choose Theme
                      </div>
                      {themeOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setTheme(option.value as 'light' | 'dark' | 'system');
                            setShowThemeMenu(false);
                          }}
                          className={cn(
                            'w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-all duration-200 hover:bg-accent/30 hover:scale-[1.02] group/item',
                            theme === option.value 
                              ? 'bg-primary/15 text-primary font-medium shadow-sm border border-primary/20' 
                              : 'text-muted-foreground hover:text-foreground'
                          )}
                        >
                          <option.icon className="h-4 w-4 transition-transform group-hover/item:scale-110" />
                          <span className="flex-1 text-left">{option.label}</span>
                          {theme === option.value && (
                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                          )}
                        </button>
                      ))}
                    </div>
                  </ElevatrCard>
                </>
              )}
            </div>

            {/* User Menu */}
            <div className="relative">              
              <ElevatrButton
                variant="primary"
                size="sm"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-3 py-2 transition-colors duration-200 hover:bg-accent/10"
              >
                <div className="relative">
                  {user?.photoURL ? (
                    <Image
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      width={28}
                      height={28}
                      className="rounded-full ring-2 ring-primary/30 shadow-sm"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  )}
                  
                  {/* Status indicator */}
                  <div className={cn(
                    'absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background shadow-sm',
                    isGuest ? 'bg-yellow-500' : isLocalUser ? 'bg-blue-500' : 'bg-green-500'
                  )} />
                </div>                <div className="hidden md:block text-left">
                  <div className="text-sm font-medium leading-none">
                    {isGuest ? 'Guest' : isLocalUser ? 'Local' : user?.displayName?.split(' ')[0] || 'User'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {isGuest ? 'Temporary' : isLocalUser ? 'Local only' : 'Synced'}
                  </div>
                </div>
              </ElevatrButton>

              {showUserMenu && (
                <>
                  {/* Backdrop */}
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowUserMenu(false)}
                  />                  <ElevatrCard 
                    variant="glass" 
                    className="absolute right-0 top-full mt-2 w-64 z-50 shadow-xl border border-border/10 elevatr-animate-fade-in bg-white/95 dark:bg-background/95 backdrop-blur-xl"
                  >
                    <div className="p-4">
                      {/* User Info Header */}
                      <div className="flex items-center gap-3 pb-3 border-b border-border/20">
                        <div className="relative">
                          {user?.photoURL ? (
                            <Image
                              src={user.photoURL}
                              alt={user.displayName || 'User'}
                              width={40}
                              height={40}
                              className="rounded-full ring-2 ring-primary/30 shadow-md"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                              <User className="h-5 w-5 text-white" />
                            </div>
                          )}
                          <div className={cn(
                            'absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background flex items-center justify-center shadow-sm',
                            isGuest ? 'bg-yellow-500' : isLocalUser ? 'bg-blue-500' : 'bg-green-500'
                          )}>
                            <div className="w-2 h-2 rounded-full bg-white"></div>
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">
                            {isGuest ? 'Guest User' : isLocalUser ? 'Local User' : user?.displayName || 'User'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {isGuest ? 'Data stored temporarily' : isLocalUser ? 'Data stored locally only' : user?.email || 'Authenticated user'}
                          </div>
                        </div>
                      </div>                      {/* Action Buttons */}
                      <div className="pt-3 space-y-2">
                        {/* Sign In Actions for Guest/Local Users */}
                        {isGuest && (
                          <div className="space-y-2">
                            <button
                              onClick={async () => {
                                setShowUserMenu(false);
                                try {
                                  await signInWithGoogle();
                                } catch (error) {
                                  console.error('Error signing in:', error);
                                }
                              }}
                              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg hover:scale-[1.02]"
                            >
                              <LogIn className="h-4 w-4" />
                              Sign In to Save Data
                            </button>
                            <div className="text-xs text-center text-muted-foreground bg-yellow-50 dark:bg-yellow-950/20 p-2 rounded-lg border border-yellow-200 dark:border-yellow-800/30">
                              <span className="font-medium text-yellow-600 dark:text-yellow-400">⚠️ Guest Mode:</span> Data will be lost when you close the browser
                            </div>
                          </div>
                        )}
                        
                        {isLocalUser && (
                          <div className="space-y-2">
                            <button
                              onClick={async () => {
                                setShowUserMenu(false);
                                try {
                                  await signInWithGoogle();
                                } catch (error) {
                                  console.error('Error signing in:', error);
                                }
                              }}
                              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg hover:scale-[1.02]"
                            >
                              <LogIn className="h-4 w-4" />
                              Sign In to Sync
                            </button>
                            <div className="text-xs text-center text-muted-foreground bg-blue-50 dark:bg-blue-950/20 p-2 rounded-lg border border-blue-200 dark:border-blue-800/30">
                              <span className="font-medium text-blue-600 dark:text-blue-400">💾 Local Mode:</span> Data stored only on this device
                            </div>
                          </div>
                        )}
                        
                        {!isGuest && !isLocalUser && (
                          <div className="text-xs text-center text-muted-foreground bg-green-50 dark:bg-green-950/20 p-2 rounded-lg border border-green-200 dark:border-green-800/30">
                            <span className="font-medium text-green-600 dark:text-green-400">☁️ Synced:</span> Data backed up to cloud
                          </div>
                        )}
                        
                        {/* Settings */}
                        <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/30 transition-all duration-200 hover:scale-[1.02] group">
                          <Settings className="h-4 w-4 transition-transform group-hover:rotate-45" />
                          Settings
                        </button>

                        {/* Sign Out / Clear Data */}
                        <button 
                          onClick={async () => {
                            setShowUserMenu(false);
                            try {
                              if (isGuest) {
                                await clearDataAndStartFresh();
                              } else {
                                await signOut();
                              }
                            } catch (error) {
                              console.error('Error during sign out/clear data:', error);
                            }
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-200 border border-red-200 dark:border-red-800/30 font-medium hover:scale-[1.02] hover:shadow-md group"
                        >
                          {isGuest || isLocalUser ? (
                            <Trash2 className="h-4 w-4 transition-transform group-hover:scale-110" />
                          ) : (
                            <LogOut className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                          )}
                          {isGuest ? 'Clear Data & Start Fresh' : isLocalUser ? 'Clear Local Data' : 'Sign Out'}
                        </button>
                      </div>
                    </div>
                  </ElevatrCard>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
