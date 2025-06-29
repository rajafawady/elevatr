'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { 
  User, 
  Bell, 
  Moon, 
  Sun, 
  Clock, 
  Globe,
  Save,
  LogOut,
  Database,
  Cloud,
  AlertTriangle
} from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import * as localStorageService from '@/services/localStorage';
import * as dataSync from '@/services/dataSync';

export default function SettingsPage() {
  const { user, isLocalUser, signInWithGoogle, signOut } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [storageStats, setStorageStats] = useState<any>(null);
  
  // User preferences state (excluding darkMode as it's handled by ThemeContext)
  const [preferences, setPreferences] = useState({
    notifications: true,
    notificationTime: '09:00',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });

  // Profile state
  const [profile, setProfile] = useState({
    displayName: '',
    email: ''
  });
  useEffect(() => {
    if (user) {
      setProfile({
        displayName: user.displayName || '',
        email: user.email || ''
      });
      
      // Load preferences from user object or localStorage for local users
      if (isLocalUser) {
        const localPrefs = localStorageService.getLocalUserPreferences(user.uid);
        if (localPrefs) {
          // Filter out darkMode as it's handled by ThemeContext
          const { darkMode, ...otherPrefs } = localPrefs;
          setPreferences(otherPrefs);
        }
      } else if ('preferences' in user) {
        const userPrefs = (user as { preferences: any }).preferences;
        // Filter out darkMode as it's handled by ThemeContext
        const { darkMode, ...otherPrefs } = userPrefs;
        setPreferences(otherPrefs);
      }
    }
    
    // Get storage statistics
    setStorageStats(dataSync.getStorageStats());
  }, [user, isLocalUser]);

  const handleSavePreferences = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      if (isLocalUser) {
        // Save preferences locally for local users
        localStorageService.setLocalUserPreferences(user.uid, preferences);
        setSaveMessage('Settings saved locally!');
      } else {
        // Save to Firebase for authenticated users
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          preferences: preferences,
          displayName: profile.displayName,
          updatedAt: new Date().toISOString()
        });
        setSaveMessage('Settings saved successfully!');
      }
      
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveMessage('Error saving settings. Please try again.');
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };  const handleSignOut = async () => {    try {
      // Use the auth context sign out method for all users for consistency
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      // Still redirect on error for consistency
      router.push('/login');
    }
  };

  const handleSignInToSync = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your account and preferences
          </p>
        </div>{saveMessage && (
          <div className={`mb-6 p-4 rounded-lg ${
            saveMessage.includes('Error') 
              ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800' 
              : 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
          }`}>
            {saveMessage}
          </div>
        )}<div className="space-y-8">
          {/* Local User Storage Info */}
          {isLocalUser && (
            <Card className="p-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">              <div className="flex items-center mb-4">
                <Database className="w-5 h-5 mr-2 text-blue-600" />
                <h2 className="text-xl font-semibold text-foreground">Local Storage</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <AlertTriangle className="w-5 h-5 mr-2 text-amber-500 mt-0.5" />                  <div>
                    <h3 className="font-medium text-foreground">Working Locally</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your data is stored on this device only. Sign in with Google to sync your progress across devices.
                    </p>
                  </div>
                </div>
                
                {storageStats && (                  <div className="bg-card p-3 rounded-lg border border-border">
                    <h4 className="text-sm font-medium text-foreground mb-2">Storage Usage</h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>Used: {Math.round(storageStats.localStorage.used / 1024)} KB</div>
                      <div>Available: {Math.round(storageStats.localStorage.available / 1024)} KB</div>
                      <div>Has Local Data: {storageStats.hasLocalData ? 'Yes' : 'No'}</div>
                    </div>
                  </div>
                )}
                
                <Button 
                  onClick={handleSignInToSync}
                  className="flex items-center bg-blue-600 hover:bg-blue-700"
                >
                  <Cloud className="w-4 h-4 mr-2" />
                  Sign In to Enable Cloud Sync
                </Button>
              </div>
            </Card>
          )}          {/* Profile Settings */}
          <Card className="p-6">            <div className="flex items-center mb-4">
              <User className="w-5 h-5 mr-2 text-blue-600" />
              <h2 className="text-xl font-semibold text-foreground">Profile</h2>
            </div>
              <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Display Name
                </label>                <input
                  type="text"
                  value={profile.displayName}
                  onChange={(e) => setProfile(prev => ({ ...prev, displayName: e.target.value }))}
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
                  placeholder="Enter your display name"
                  disabled={isLocalUser}
                />                {isLocalUser && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Profile changes are not available for local users. Sign in to edit your profile.
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  {isLocalUser ? 'User Type' : 'Email'}                </label><input
                  type={isLocalUser ? "text" : "email"}
                  value={isLocalUser ? 'Local User (No Email)' : profile.email}
                  disabled
                  className="w-full px-3 py-2 border border-input rounded-md bg-muted text-muted-foreground"
                />                <p className="text-xs text-muted-foreground mt-1">
                  {isLocalUser 
                    ? 'Local users don\'t have email addresses' 
                    : 'Email cannot be changed from this interface'
                  }
                </p>
              </div>
            </div>
          </Card>

          {/* Notification Settings */}
          <Card className="p-6">            <div className="flex items-center mb-4">
              <Bell className="w-5 h-5 mr-2 text-blue-600" />
              <h2 className="text-xl font-semibold text-foreground">Notifications</h2>
            </div>
            
            <div className="space-y-4">              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-foreground">Enable Notifications</h3>
                  <p className="text-sm text-muted-foreground">Receive daily reminders and updates</p>
                </div>                <button
                  onClick={() => setPreferences(prev => ({ ...prev, notifications: !prev.notifications }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    preferences.notifications ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences.notifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
                {preferences.notifications && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Notification Time
                  </label>                  <input
                    type="time"
                    value={preferences.notificationTime}
                    onChange={(e) => setPreferences(prev => ({ ...prev, notificationTime: e.target.value }))}
                    className="px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
                  />
                </div>
              )}
            </div>
          </Card>          {/* Appearance Settings */}
          <Card className="p-6">
            <div className="flex items-center mb-4">
              {resolvedTheme === 'dark' ? (
                <Moon className="w-5 h-5 mr-2 text-blue-600" />
              ) : (
                <Sun className="w-5 h-5 mr-2 text-blue-600" />
              )}
              <h2 className="text-xl font-semibold text-foreground">Appearance</h2>
            </div>              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-foreground">Theme</h3>
                    <p className="text-sm text-muted-foreground">Choose your preferred theme</p>
                  </div>
                  <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'system')}
                    className="px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
                  >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System</option>
                </select>
              </div>                <div className="text-xs text-muted-foreground">
                  Current theme: {resolvedTheme} {theme === 'system' && '(auto-detected)'}
                </div>
            </div>
          </Card>

          {/* Timezone Settings */}          <Card className="p-6">
            <div className="flex items-center mb-4">
              <Globe className="w-5 h-5 mr-2 text-blue-600" />
              <h2 className="text-xl font-semibold text-foreground">Timezone</h2>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Current Timezone
              </label>              <select
                value={preferences.timezone}
                onChange={(e) => setPreferences(prev => ({ ...prev, timezone: e.target.value }))}
                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
              >
                <option value="America/New_York">Eastern Time (ET)</option>
                <option value="America/Chicago">Central Time (CT)</option>
                <option value="America/Denver">Mountain Time (MT)</option>
                <option value="America/Los_Angeles">Pacific Time (PT)</option>
                <option value="Europe/London">Greenwich Mean Time (GMT)</option>
                <option value="Europe/Paris">Central European Time (CET)</option>
                <option value="Asia/Tokyo">Japan Standard Time (JST)</option>
                <option value="Australia/Sydney">Australian Eastern Time (AET)</option>
                <option value={Intl.DateTimeFormat().resolvedOptions().timeZone}>
                  Auto-detect ({Intl.DateTimeFormat().resolvedOptions().timeZone})
                </option>
              </select>
            </div>
          </Card>          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button 
              onClick={handleSavePreferences}
              disabled={loading}
              className="flex items-center bg-green-600 hover:bg-green-700 text-white"
            >
              {loading ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Changes
            </Button>
            
            <Button 
              onClick={handleSignOut}
              variant="outline"
              className="flex items-center text-red-600 dark:text-red-400 border-red-600 dark:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {isLocalUser ? 'Reset Local Session' : 'Sign Out'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
