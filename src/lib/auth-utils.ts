// Custom authentication utilities for handling COOP issues
import { Auth, GoogleAuthProvider, signInWithPopup, AuthError } from 'firebase/auth';

/**
 * Enhanced Google Sign-In with better error handling and COOP policy workarounds
 */
export const signInWithGoogleEnhanced = async (auth: Auth, provider: GoogleAuthProvider) => {
  try {
    // Configure popup with specific parameters to handle COOP
    const popup = window.open('about:blank', '_blank', 'width=500,height=600,scrollbars=no,resizable=no');
    
    if (!popup) {
      throw new Error('Popup blocked by browser');
    }

    // Use signInWithPopup with enhanced error handling
    const result = await signInWithPopup(auth, provider);
    
    // Close popup manually if still open
    if (popup && !popup.closed) {
      popup.close();
    }
    
    return result;
  } catch (error: any) {
    console.error('Enhanced Google Sign-In error:', error);
    
    // Handle specific COOP-related errors
    if (error.code === 'auth/popup-blocked') {
      throw new Error('Popup was blocked. Please allow popups and try again.');
    } else if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Sign-in was cancelled.');
    } else if (error.message?.includes('Cross-Origin-Opener-Policy')) {
      throw new Error('Browser security settings are blocking the sign-in. Please try the redirect method.');
    }
    
    throw error;
  }
};

/**
 * Check if popup sign-in is supported in the current environment
 */
export const isPopupSupported = (): boolean => {
  try {
    // Check if we're in a browser environment and not in a testing environment
    return typeof window !== 'undefined' && 
           typeof window.open === 'function' && 
           !window.navigator.userAgent.includes('Chrome-Lighthouse');
  } catch {
    return false;
  }
};

/**
 * Get user-friendly error message for authentication errors
 */
export const getAuthErrorMessage = (error: AuthError | Error): string => {
  if ('code' in error) {
    switch (error.code) {
      case 'auth/popup-blocked':
        return 'Popup was blocked by your browser. Please allow popups and try again.';
      case 'auth/popup-closed-by-user':
        return 'Sign-in was cancelled. Please try again.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection and try again.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'auth/user-disabled':
        return 'This account has been disabled. Please contact support.';
      default:
        return 'Sign-in failed. Please try again.';
    }
  }
  
  if (error.message?.includes('Cross-Origin-Opener-Policy')) {
    return 'Browser security settings are blocking sign-in. Please try the redirect method.';
  }
  
  return error.message || 'An unexpected error occurred. Please try again.';
};
