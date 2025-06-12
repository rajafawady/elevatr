'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { auth, googleProvider, db } from '@/lib/firebase';
import { User } from '@/types';
import { signInWithGoogleEnhanced, isPopupSupported, getAuthErrorMessage, getMobileInfo, checkPopupSupport, showPopupInstructions, signInWithEmailAndPasswordEnhanced, createUserWithEmailAndPasswordEnhanced } from '@/lib/auth-utils';
import * as localStorageService from '@/services/localStorage';
import * as dataSync from '@/services/dataSync';
import * as guestService from '@/services/guestService';
import * as dataMigration from '@/services/dataMigration';
import * as syncService from '@/services/syncService';
import { handleAuthError, AppError } from '@/services/errorHandling';
import { useSprintStore, useTaskStore, useUserProgressStore } from '@/stores';
import { set } from 'date-fns';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  isLocalUser: boolean;
  isGuest: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmailAndPassword: (email: string, password: string) => Promise<void>;
  signUpWithEmailAndPassword: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  continueAsGuest: () => void;
  clearDataAndStartFresh: () => Promise<void>;
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
  // Popup permission handling
  showPopupDialog: boolean;
  popupInstructions: string;
  setShowPopupDialog: (show: boolean) => void;
  retrySignIn: () => Promise<void>;
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
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasLocalDataToSync, setHasLocalDataToSync] = useState(false);
  const [guestDataSummary, setGuestDataSummary] = useState<any | null>(null);
  const [showLogoutOptions, setShowLogoutOptions] = useState(false);
  const [showMigrationPrompt, setShowMigrationPrompt] = useState(false);
  const [showPopupDialog, setShowPopupDialog] = useState(false);
  const [popupInstructions, setPopupInstructions] = useState('');
  
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
  };  
    // Always configure Google provider before use (idempotent)
  function ensureGoogleProviderConfig() {
    try {
      // Clear existing configuration first
      googleProvider.setCustomParameters({});
      
      // Add scopes
      googleProvider.addScope('email');
      googleProvider.addScope('profile');
      
      // Set custom parameters optimized for mobile
      googleProvider.setCustomParameters({
        prompt: 'select_account',
        access_type: 'online',
        include_granted_scopes: 'true',
      });
      
      console.log('✅ Google provider configured successfully');
    } catch (error) {
      console.error('❌ Error configuring Google provider:', error);
    }
  }
  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);      // Set up auth state listener first
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        console.log('🔥 Auth state changed. Firebase user:', firebaseUser?.email || 'none');
        
        setLoading(true);
        
        if (firebaseUser) {
          try {
            console.log('👤 Creating/updating user data for:', firebaseUser.email);
            const userData = await createOrUpdateUser(firebaseUser);
            setUser(userData);            setFirebaseUser(firebaseUser);
            console.log('✅ User data set successfully:', userData.uid);
            
            // Check for guest data to migrate
            try {
              const guestDataSummary = await dataMigration.getGuestDataSummary();
              if (guestDataSummary) {
                setGuestDataSummary(guestDataSummary);
                setShowMigrationPrompt(true);
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
                
                const cachedFirebaseUid = localStorage.getItem('elevatr_cached_firebase_uid');
                console.log('🔍 Cached Firebase UID:', cachedFirebaseUid);
                console.log('🔍 Current Firebase UID:', firebaseUser.uid);
                
                if (cachedFirebaseUid === firebaseUser.uid) {
                  console.log('🎯 Detected returning user with cached data, syncing changes...');
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
                }
              } catch (error) {
                console.error('❌ Error during data sync:', error);
              }
            }
          } catch (error) {
            console.error('❌ Error creating/updating user:', error);
            setUser(null);
            setFirebaseUser(null);
          }        } else {
          console.log('👤 No Firebase user, checking for guest/local user...');
          
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
      });      try {
        ensureGoogleProviderConfig();
        
        console.log('✅ Popup-only authentication initialized');
      } catch (error) {
        console.error('❌ Error configuring Google provider:', error);
      }
      
      // Check for local data that needs syncing
      setHasLocalDataToSync(dataSync.hasLocalDataToSync());
      
      // Check if there's an existing guest or local user (only if no Firebase user)
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          const existingGuestUser = await guestService.getCurrentGuestUser();
          if (existingGuestUser) {
            setUser(existingGuestUser);
            console.log('👤 Restored guest user session:', existingGuestUser.uid);
          } else {
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
        // Only set loading to false if no current user
      if (!auth.currentUser) {
        setLoading(false);
      }

      return () => unsubscribe();
    };

    const cleanup = initializeAuth();
    return () => {
      cleanup.then(unsubscribe => unsubscribe?.());
    };
  }, []);
    const signInWithGoogle = async () => {
    try {
      setLoading(true);
      ensureGoogleProviderConfig();
      console.log('🚀 Starting popup-only Google sign-in process...');
      
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
      
      // Use popup-only enhanced sign-in
      const result = await signInWithGoogleEnhanced(auth, googleProvider);
      
      if (result) {
        console.log('✅ Sign-in completed successfully:', result.user.email);
      }
      
      // onAuthStateChanged will handle setting loading to false
    } catch (error: any) {
      console.error('❌ Error signing in with Google:', error);
      console.error('❌ Error details:', {
        code: error.code,
        message: error.message,
        instructions: error.instructions
      });
      setLoading(false);
      
      // Handle popup-specific errors
      if (error.code === 'auth/popup-blocked' && error.instructions) {
        setPopupInstructions(error.instructions);
        setShowPopupDialog(true);
        return; // Don't throw, let user retry
      }
      
      // Convert to user-friendly error for other cases
      const appError = handleAuthError(error);
      throw appError;
    }
  };

  const signInWithEmailAndPassword = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log('🚀 Starting email/password sign-in process...');
      
      const result = await signInWithEmailAndPasswordEnhanced(auth, email, password);
      
      if (result) {
        console.log('✅ Email/password sign-in completed successfully:', result.user.email);
      }
      
      // onAuthStateChanged will handle setting loading to false
    } catch (error: any) {
      console.error('❌ Error signing in with email/password:', error);
      setLoading(false);
      
      // Convert to user-friendly error
      const appError = handleAuthError(error);
      throw appError;
    }
  };

  const signUpWithEmailAndPassword = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log('🚀 Starting email/password sign-up process...');
      
      const result = await createUserWithEmailAndPasswordEnhanced(auth, email, password);
      
      if (result) {
        console.log('✅ Email/password sign-up completed successfully:', result.user.email);
      }
      
      // onAuthStateChanged will handle setting loading to false
    } catch (error: any) {
      console.error('❌ Error signing up with email/password:', error);
      setLoading(false);
      
      // Convert to user-friendly error
      const appError = handleAuthError(error);
      throw appError;
    }
  };

  const retrySignIn = async () => {
    setShowPopupDialog(false);
    await signInWithGoogle();
  };
  
  const continueAsGuest = async () => {
    try {
      // Create or get existing guest user
      setLoading(true);
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
    }finally{
      setLoading(false);
      router.push('/');
    }
  };  
    
    const clearDataAndStartFresh = async () => {
    try {
      console.log('🧹 Starting clear data and start fresh process...');
      
      // Clear all store data first
      console.log('🗑️ Clearing store data...');
      const { clearSprints } = useSprintStore.getState();
      const { clearTasks } = useTaskStore.getState();
      const { clearUserProgress } = useUserProgressStore.getState();
      
      clearSprints();
      clearTasks();
      clearUserProgress();
      
      // Use guest service to clear data and create fresh session
      const freshGuestUser = await guestService.clearGuestDataAndStartFresh();
      
      // Update the user state
      setUser(freshGuestUser);
      setFirebaseUser(null);
        console.log('✅ Successfully cleared data and started fresh:', freshGuestUser.uid);
    } catch (error) {
      console.error('❌ Error clearing data and starting fresh:', error);
      throw error;
    }
  };
  const handleSignOut = async () => {
    try {
      console.log('🚪 Starting sign-out process...');
      console.log('📊 Current user:', user?.uid);
      console.log('🔥 Firebase user:', firebaseUser?.uid);
      
      if (firebaseUser && user && !localStorageService.isLocalUser(user.uid) && !guestService.isGuestUser(user.uid)) {
        // Show logout options to let user choose what to do with their data
        setShowLogoutOptions(true);
      } else if (user && guestService.isGuestUser(user.uid)) {
        console.log('👤 Guest user clearing data and starting fresh...');
        // For guest users, clear data and start fresh
        await clearDataAndStartFresh();
      } else {
        console.log('👤 Local user sign out');
        // For local users, sign out and continue as guest
        await signOut(auth);        
        await continueAsGuest();
        
        // Redirect to login page for clean state
        router.push('/login');
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
        } else if (option === 'delete') {
          // For delete option, clear user completely and redirect to login          setUser(null);
          setFirebaseUser(null);
          console.log('🗑️ All data deleted, redirecting to login...');
          setShowLogoutOptions(false);
          router.push('/login');
          return;
        } else {
          // For keep option, create a new guest session
          await continueAsGuest();
        }
        
        setShowLogoutOptions(false);        console.log('✅ Sign-out completed successfully');
        
        // Redirect to login page for clean state
        router.push('/login');
      } else {
        console.error('❌ Failed to process logout option:', result.error);
        // Fallback to regular sign out
        await signOut(auth);
        await continueAsGuest();        setShowLogoutOptions(false);
        
        // Still redirect to login page even on error
        router.push('/login');
      }
    } catch (error) {
      console.error('❌ Error processing logout choice:', error);      setShowLogoutOptions(false);
      
      // Redirect to login page even on error for consistency
      router.push('/login');
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
    signInWithEmailAndPassword,
    signUpWithEmailAndPassword,
    signOut: handleSignOut,
    continueAsGuest,
    clearDataAndStartFresh,
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
    showPopupDialog,
    popupInstructions,
    setShowPopupDialog,
    retrySignIn,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
