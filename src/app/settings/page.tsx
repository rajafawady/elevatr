'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
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
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import * as localStorageService from '@/services/localStorage';
import * as dataSync from '@/services/dataSync';

export default function SettingsPage() {
  const { user, isLocalUser, signInWithGoogle } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [storageStats, setStorageStats] = useState<any>(null);
  
  // User preferences state
  const [preferences, setPreferences] = useState({
    darkMode: false,
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
          setPreferences(localPrefs);
        }
      } else if ('preferences' in user) {
        setPreferences((user as { preferences: typeof preferences }).preferences);
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
  };

  const handleSignOut = async () => {
    try {
      if (isLocalUser) {
        // For local users, just clear session
        window.location.reload();
      } else {
        await signOut(auth);
      }
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your account and preferences
          </p>
        </div>

        {saveMessage && (
          <div className={`mb-6 p-4 rounded-lg ${
            saveMessage.includes('Error') 
              ? 'bg-red-100 text-red-700 border border-red-200' 
              : 'bg-green-100 text-green-700 border border-green-200'
          }`}>
            {saveMessage}
          </div>
        )}        <div className="space-y-8">
          {/* Local User Storage Info */}
          {isLocalUser && (
            <Card className="p-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <div className="flex items-center mb-4">
                <Database className="w-5 h-5 mr-2 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Local Storage</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <AlertTriangle className="w-5 h-5 mr-2 text-amber-500 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Working Locally</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Your data is stored on this device only. Sign in with Google to sync your progress across devices.
                    </p>
                  </div>
                </div>
                
                {storageStats && (
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Storage Usage</h4>
                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
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
          <Card className="p-6">
            <div className="flex items-center mb-4">
              <User className="w-5 h-5 mr-2 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Profile</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={profile.displayName}
                  onChange={(e) => setProfile(prev => ({ ...prev, displayName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your display name"
                  disabled={isLocalUser}
                />
                {isLocalUser && (
                  <p className="text-xs text-gray-500 mt-1">
                    Profile changes are not available for local users. Sign in to edit your profile.
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {isLocalUser ? 'User Type' : 'Email'}
                </label>
                <input
                  type={isLocalUser ? "text" : "email"}
                  value={isLocalUser ? 'Local User (No Email)' : profile.email}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {isLocalUser 
                    ? 'Local users don\'t have email addresses' 
                    : 'Email cannot be changed from this interface'
                  }
                </p>
              </div>
            </div>
          </Card>

          {/* Notification Settings */}
          <Card className="p-6">
            <div className="flex items-center mb-4">
              <Bell className="w-5 h-5 mr-2 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Notifications</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Enable Notifications</h3>
                  <p className="text-sm text-gray-500">Receive daily reminders and updates</p>
                </div>
                <button
                  onClick={() => setPreferences(prev => ({ ...prev, notifications: !prev.notifications }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    preferences.notifications ? 'bg-blue-600' : 'bg-gray-200'
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Notification Time
                  </label>
                  <input
                    type="time"
                    value={preferences.notificationTime}
                    onChange={(e) => setPreferences(prev => ({ ...prev, notificationTime: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>
          </Card>

          {/* Appearance Settings */}
          <Card className="p-6">
            <div className="flex items-center mb-4">
              {preferences.darkMode ? (
                <Moon className="w-5 h-5 mr-2 text-blue-600" />
              ) : (
                <Sun className="w-5 h-5 mr-2 text-blue-600" />
              )}
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Appearance</h2>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Dark Mode</h3>
                <p className="text-sm text-gray-500">Use dark theme across the application</p>
              </div>
              <button
                onClick={() => setPreferences(prev => ({ ...prev, darkMode: !prev.darkMode }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.darkMode ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.darkMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </Card>

          {/* Timezone Settings */}
          <Card className="p-6">
            <div className="flex items-center mb-4">
              <Globe className="w-5 h-5 mr-2 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Timezone</h2>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Current Timezone
              </label>
              <select
                value={preferences.timezone}
                onChange={(e) => setPreferences(prev => ({ ...prev, timezone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="flex items-center"
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
              className="flex items-center text-red-600 border-red-600 hover:bg-red-50"
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
