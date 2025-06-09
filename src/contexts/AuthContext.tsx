'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged, signInWithRedirect, signInWithPopup, signOut, getRedirectResult } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '@/lib/firebase';
import { User } from '@/types';
import { signInWithGoogleEnhanced, isPopupSupported, getAuthErrorMessage } from '@/lib/auth-utils';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithGooglePopup: () => Promise<void>;
  signOut: () => Promise<void>;
  updateUserPreferences: (preferences: Partial<User['preferences']>) => Promise<void>;
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
  const [loading, setLoading] = useState(true);

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
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      
      if (firebaseUser) {
        try {
          const userData = await createOrUpdateUser(firebaseUser);
          setUser(userData);
          setFirebaseUser(firebaseUser);
        } catch (error) {
          console.error('Error creating/updating user:', error);
          setUser(null);
          setFirebaseUser(null);
        }
      } else {
        setUser(null);
        setFirebaseUser(null);
      }
      
      setLoading(false);
    });

    // Handle redirect result on component mount
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          // User will be handled by onAuthStateChanged
          console.log('Redirect sign-in successful');
        }
      } catch (error) {
        console.error('Error handling redirect result:', error);
        setLoading(false);
      }
    };

    handleRedirectResult();

    return () => unsubscribe();
  }, []);  const signInWithGoogle = async () => {
    try {
      await signInWithRedirect(auth, googleProvider);
    } catch (error: any) {
      console.error('Error signing in with Google (redirect):', error);
      throw error;
    }
  };
  const signInWithGooglePopup = async () => {
    try {
      // Check if popup is supported first
      if (!isPopupSupported()) {
        throw new Error('Popup sign-in is not supported in this environment');
      }
      
      // Use enhanced sign-in with better COOP handling
      await signInWithGoogleEnhanced(auth, googleProvider);
    } catch (error: any) {
      console.error('Error signing in with Google (popup):', error);
      const errorMessage = getAuthErrorMessage(error);
      
      // If popup fails due to COOP or other issues, fall back to redirect
      if (error.code === 'auth/popup-blocked' || 
          error.code === 'auth/popup-closed-by-user' ||
          error.message?.includes('Cross-Origin-Opener-Policy')) {
        console.log('Popup blocked or COOP issue, falling back to redirect...');
        await signInWithRedirect(auth, googleProvider);
      } else {
        throw new Error(errorMessage);
      }
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const updateUserPreferences = async (preferences: Partial<User['preferences']>) => {
    if (!user) throw new Error('No user logged in');

    const userRef = doc(db, 'users', user.uid);
    const updatedPreferences = { ...user.preferences, ...preferences };

    await updateDoc(userRef, {
      preferences: updatedPreferences,
    });

    setUser({
      ...user,
      preferences: updatedPreferences,
    });
  };
  const value = {
    user,
    firebaseUser,
    loading,
    signInWithGoogle,
    signInWithGooglePopup,
    signOut: handleSignOut,
    updateUserPreferences,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
