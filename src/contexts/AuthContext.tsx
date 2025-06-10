'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged, signInWithRedirect, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '@/lib/firebase';
import { User } from '@/types';
import { signInWithGoogleEnhanced, isPopupSupported, getAuthErrorMessage, handleRedirectResult, getMobileInfo } from '@/lib/auth-utils';
import * as localStorageService from '@/services/localStorage';
import * as dataSync from '@/services/dataSync';
import * as guestService from '@/services/guestService';
import * as dataMigration from '@/services/dataMigration';
import * as syncService from '@/services/syncService';
import { handleAuthError, AppError } from '@/services/errorHandling';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  isLocalUser: boolean;
  isGuest: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  continueAsGuest: () => void;
  updateUserPreferences: (preferences: Partial<User['preferences']>) => Promise<void>;
  isMobile: boolean;
  hasLocalDataToSync: boolean;
  guestDataSummary: any | null;
  migrateGuestData: (importData: boolean) => Promise<void>;
  showLogoutOptions: boolean;
  showMigrationPrompt: boolean;
  setShowLogoutOptions: (show: boolean) => void;
  setShowMigrationPrompt: (show: boolean) => void;
  handleLogoutChoice: (option: 'delete' | 'convert' | 'keep') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);  const [hasLocalDataToSync, setHasLocalDataToSync] = useState(false);
  const [guestDataSummary, setGuestDataSummary] = useState<any | null>(null);
  const [showLogoutOptions, setShowLogoutOptions] = useState(false);
  const [showMigrationPrompt, setShowMigrationPrompt] = useState(false);
  
  // Detect mobile browser
  const mobileInfo = getMobileInfo();
  const isMobile = mobileInfo.isMobile;
  
  // Check if user is using local storage or guest mode
  const isLocalUser = user ? localStorageService.isLocalUser(user.uid) : false;
  const isGuest = user ? guestService.isGuestUser(user.uid) : false;
  const isAuthenticated = !!user;

  const createOrUpdateUser = async (firebaseUser: FirebaseUser): Promise<User> => {
    const userRef = doc(db, 'users', firebaseUser.uid);
    const userSnap = await getDoc(userRef);

    const now = new Date().toISOString();

    if (userSnap.exists()) {
      // Update existing user
      const userData = userSnap.data() as User;
      await updateDoc(userRef, {
        lastLoginAt: now,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
      });

      return {
        ...userData,
        lastLoginAt: now,
        email: firebaseUser.email || userData.email,
        displayName: firebaseUser.displayName || userData.displayName,
        photoURL: firebaseUser.photoURL || userData.photoURL,
      };
    } else {
      // Create new user
      const newUser: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || '',
        photoURL: firebaseUser.photoURL || undefined,
        createdAt: now,
        lastLoginAt: now,
        preferences: {
          darkMode: false,
          notifications: true,
          notificationTime: '09:00',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      };

      await setDoc(userRef, newUser);
      return newUser;
    }
  };  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      try {
        // First, check for redirect result before setting up auth state listener
        console.log('🔄 Checking for redirect authentication result...');
        console.log('🌐 Current URL:', typeof window !== 'undefined' ? window.location.href : 'SSR');
        console.log('🔗 Referrer:', typeof window !== 'undefined' ? document.referrer : 'none');
        
        const redirectResult = await handleRedirectResult(auth);
        
        if (redirectResult?.user) {
          console.log('✅ Redirect sign-in successful for:', redirectResult.user.email);
          console.log('🔑 User authenticated via redirect');
          // Don't call setLoading(false) here - let onAuthStateChanged handle it
          return; // Exit early, onAuthStateChanged will handle the rest
        } else {
          console.log('ℹ️ No redirect result found, proceeding with normal auth check');
        }
      } catch (error) {
        console.error('❌ Error handling redirect result:', error);
        // Show user-friendly error message for redirect failures
        if (error instanceof Error && error.message.includes('Firebase configuration')) {
          console.error('🔥 Firebase configuration issue detected');
          // You might want to show a user notification here
        }
        // Continue with normal auth flow even if redirect fails
      }
      
      // Check for local data that needs syncing
      setHasLocalDataToSync(dataSync.hasLocalDataToSync());
      
      // Check if there's an existing guest or local user (only if no Firebase user)
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          // Check for guest user first
          const existingGuestUser = await guestService.getCurrentGuestUser();
          if (existingGuestUser) {
            setUser(existingGuestUser);
            console.log('👤 Restored guest user session:', existingGuestUser.uid);
          } else {
            // Fallback to local user
            const existingLocalUser = localStorageService.getLocalUser();
            if (existingLocalUser) {
              setUser(existingLocalUser);
              console.log('👤 Restored local user session:', existingLocalUser.uid);
            }
          }
        }
      } catch (error) {
        console.error('❌ Error checking for guest/local user:', error);
      }
      
      // Only set loading to false if we're not waiting for a redirect result
      if (!auth.currentUser) {
        setLoading(false);
      }
    };

    initializeAuth();

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('🔥 Auth state changed. Firebase user:', firebaseUser?.email || 'none');
      setLoading(true);
      
      if (firebaseUser) {
        try {
          console.log('👤 Creating/updating user data for:', firebaseUser.email);
          const userData = await createOrUpdateUser(firebaseUser);
          setUser(userData);
          setFirebaseUser(firebaseUser);
            console.log('✅ User data set successfully:', userData.uid);          // Check for guest data to migrate
          try {
            const guestDataSummary = await dataMigration.getGuestDataSummary();
            if (guestDataSummary) {
              setGuestDataSummary(guestDataSummary);
              setShowMigrationPrompt(true); // Show the migration prompt UI
              console.log('📊 Found guest data to potentially migrate:', guestDataSummary);
            }
          } catch (error) {
            console.error('❌ Error checking for guest data:', error);
          }

          // Check if there's local data to sync
          console.log('🔍 Checking for local data to sync...');
          const hasDataToSync = dataSync.hasLocalDataToSync();
          console.log('📊 Has local data to sync:', hasDataToSync);
          
          if (hasDataToSync) {
            try {
              console.log('🔄 Starting sync process...');
              
              // Check if this is a returning user with cached data
              const cachedFirebaseUid = localStorage.getItem('elevatr_cached_firebase_uid');
              console.log('🔍 Cached Firebase UID:', cachedFirebaseUid);
              console.log('🔍 Current Firebase UID:', firebaseUser.uid);
              
              if (cachedFirebaseUid === firebaseUser.uid) {
                console.log('🎯 Detected returning user with cached data, syncing changes...');
                // Remove the cache flag since we're syncing now
                localStorage.removeItem('elevatr_cached_firebase_uid');
              } else if (cachedFirebaseUid) {
                console.log('⚠️ Different Firebase UID detected. Cached:', cachedFirebaseUid, 'Current:', firebaseUser.uid);
              } else {
                console.log('ℹ️ No cached Firebase UID found, proceeding with normal sync');
              }
              
              const syncResult = await dataSync.syncLocalDataToFirebase(userData);
              if (syncResult.success) {
                console.log('✅ Successfully synced local data to Firebase:', syncResult);
                setHasLocalDataToSync(false);
              } else {
                console.error('❌ Sync failed:', syncResult.errors);
                // TODO: Show user notification about sync issues
              }
            } catch (error) {
              console.error('❌ Error during data sync:', error);
            }
          }
        } catch (error) {
          console.error('❌ Error creating/updating user:', error);
          setUser(null);
          setFirebaseUser(null);
        }      } else {
        console.log('👤 No Firebase user, checking for guest/local user...');
        // No Firebase user, check for guest user first, then local user
        try {
          const existingGuestUser = await guestService.getCurrentGuestUser();
          if (existingGuestUser) {
            console.log('👤 Using existing guest user:', existingGuestUser.uid);
            setUser(existingGuestUser);
          } else {
            const localUser = localStorageService.getLocalUser();
            if (localUser) {
              console.log('👤 Using local user:', localUser.uid);
              setUser(localUser);
            } else {
              console.log('👤 No guest or local user found, user is null');
              setUser(null);
            }
          }
        } catch (error) {
          console.error('❌ Error checking for guest user:', error);
          // Fallback to local user
          const localUser = localStorageService.getLocalUser();
          if (localUser) {
            console.log('👤 Using local user:', localUser.uid);
            setUser(localUser);
          } else {
            console.log('👤 No local user found, user is null');
            setUser(null);
          }
        }
        setFirebaseUser(null);
      }
      
      setLoading(false);
      console.log('✅ Auth state change processing complete');
    });

    return () => unsubscribe();
  }, []);  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      console.log('🚀 Starting Google sign-in process...');
      
      const mobileInfo = getMobileInfo();
      console.log('📱 Mobile info:', { 
        isMobile: mobileInfo.isMobile, 
        isInAppBrowser: mobileInfo.isInAppBrowser,
        isPWA: mobileInfo.isPWA 
      });
      
      // Log Firebase config status (without exposing secrets)
      console.log('🔥 Firebase config status:', {
        hasApiKey: !!auth.app.options.apiKey,
        authDomain: auth.app.options.authDomain,
        projectId: auth.app.options.projectId,
      });
      
      // Use enhanced sign-in which handles mobile vs desktop automatically
      const result = await signInWithGoogleEnhanced(auth, googleProvider);
      
      // For redirect method, the result will be handled by onAuthStateChanged
      // and handleRedirectResult on page reload
      if (result) {
        console.log('✅ Sign-in completed immediately with result:', result.user.email);
      } else {
        console.log('✅ Sign-in request initiated successfully (redirect mode)');
      }
      
      // For redirect flows, we don't set loading to false here as the page will reload
      // For popup flows, onAuthStateChanged will handle setting loading to false
    } catch (error: any) {
      console.error('❌ Error signing in with Google:', error);
      console.error('❌ Error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      setLoading(false);
      
      // Convert to user-friendly error
      const appError = handleAuthError(error);
      throw appError;
    }
  };const continueAsGuest = async () => {
    try {
      // Create or get existing guest user
      let guestUser = await guestService.getCurrentGuestUser();
      if (!guestUser) {
        guestUser = guestService.createGuestUser();
        console.log('Created new guest user:', guestUser.uid);
        
        // Save initial guest data to IndexedDB
        await guestService.saveGuestProgress(guestUser.uid, [], [], guestUser);
        console.log('💾 Saved initial guest data to IndexedDB');
      } else {
        // Update last login time
        guestUser = { ...guestUser, lastLoginAt: new Date().toISOString() };
        console.log('Restored existing guest user:', guestUser.uid);
        
        // Update the guest data with new login time
        const existingData = await guestService.loadGuestData(guestUser.uid);
        if (existingData) {
          await guestService.saveGuestProgress(
            guestUser.uid, 
            existingData.sprints, 
            existingData.userProgress, 
            guestUser
          );
        }
      }
      
      setUser(guestUser);
      setFirebaseUser(null);
    } catch (error) {
      console.error('Error creating guest user:', error);
    }  };const handleSignOut = async () => {
    try {
      console.log('🚪 Starting sign-out process...');
      console.log('📊 Current user:', user?.uid);
      console.log('🔥 Firebase user:', firebaseUser?.uid);
      
      if (firebaseUser && user && !localStorageService.isLocalUser(user.uid)) {
        console.log('🤔 Authenticated user signing out - showing logout options...');
        
        // Show logout options to let user choose what to do with their data
        setShowLogoutOptions(true);
      } else {
        console.log('👤 Local/guest user sign out');
        // Already local/guest user, just sign out
        await signOut(auth);
        await continueAsGuest();
      }
      
    } catch (error) {
      console.error('❌ Error signing out:', error);
      throw error;
    }
  };

  // Handle logout option choice
  const handleLogoutChoice = async (option: 'delete' | 'convert' | 'keep') => {
    try {
      if (!user) return;
      
      console.log('🔄 Processing logout option:', option);
      
      // Use the sync service to handle logout with the chosen option
      const result = await syncService.handleUserLogout(user, option);
      
      if (result.success) {
        console.log('✅ Logout option processed successfully:', option);
        
        // Sign out from Firebase
        await signOut(auth);
        
        if (option === 'convert' && result.newGuestId) {
          // Load the newly created guest user
          const guestData = await guestService.loadGuestData(result.newGuestId);
          if (guestData) {
            setUser(guestData.user);
            setFirebaseUser(null);
            console.log('👤 Now using converted guest user:', guestData.user.uid);
          } else {
            await continueAsGuest();
          }
        } else {
          // For delete or keep options, create a new guest session
          await continueAsGuest();
        }
        
        setShowLogoutOptions(false);
        console.log('✅ Sign-out completed successfully');
      } else {
        console.error('❌ Failed to process logout option:', result.error);
        // Fallback to regular sign out
        await signOut(auth);
        await continueAsGuest();
        setShowLogoutOptions(false);
      }
    } catch (error) {
      console.error('❌ Error processing logout choice:', error);
      setShowLogoutOptions(false);
      throw error;
    }
  };
  const updateUserPreferences = async (preferences: Partial<User['preferences']>) => {
    if (!user) throw new Error('No user logged in');

    if (guestService.isGuestUser(user.uid)) {
      // Update guest user preferences in IndexedDB
      const updatedUser = { ...user, preferences: { ...user.preferences, ...preferences } };
      setUser(updatedUser);
      
      // Save to IndexedDB if guest data exists
      try {
        const guestData = await guestService.loadGuestData(user.uid);
        if (guestData) {
          await guestService.saveGuestProgress(
            user.uid,
            guestData.sprints,
            guestData.userProgress,
            updatedUser
          );
        }
      } catch (error) {
        console.error('Error updating guest preferences:', error);
      }
    } else if (localStorageService.isLocalUser(user.uid)) {
      // Update local user preferences
      const updatedUser = localStorageService.updateLocalUser({
        preferences: { ...user.preferences, ...preferences }
      });
      if (updatedUser) {
        setUser(updatedUser);
      }
    } else {
      // Update Firebase user preferences
      const userRef = doc(db, 'users', user.uid);
      const updatedPreferences = { ...user.preferences, ...preferences };

      await updateDoc(userRef, {
        preferences: updatedPreferences,
      });

      setUser({
        ...user,
        preferences: updatedPreferences,
      });
    }
  };
  const migrateGuestData = async (importData: boolean) => {
    try {
      if (!user || !firebaseUser) {
        throw new Error('No authenticated user to migrate to');
      }

      if (importData && guestDataSummary) {
        // Migrate guest data to authenticated user
        await dataMigration.migrateGuestDataToUser(user);
        console.log('✅ Guest data migrated to authenticated user');
      } else {
        // Just clear guest data without migrating
        if (guestDataSummary) {
          await dataMigration.clearGuestData(guestDataSummary.guestId);
          console.log('✅ Guest data cleared');
        }
      }

      // Clear the guest data summary
      setGuestDataSummary(null);
    } catch (error) {
      console.error('❌ Error migrating guest data:', error);
      throw error;
    }
  };  const value = {
    user,
    firebaseUser,
    loading,
    isAuthenticated,
    isLocalUser,
    isGuest,
    signInWithGoogle,
    signOut: handleSignOut,
    continueAsGuest,
    updateUserPreferences,
    isMobile,
    hasLocalDataToSync,
    guestDataSummary,
    migrateGuestData,
    showLogoutOptions,
    showMigrationPrompt,
    setShowLogoutOptions,
    setShowMigrationPrompt,
    handleLogoutChoice,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
