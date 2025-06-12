// Custom authentication utilities for popup-only authentication
import { 
  Auth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  AuthError 
} from 'firebase/auth';

/**
 * Detect mobile browser type and capabilities
 */
export const getMobileInfo = () => {
  const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : '';
  const isIOS = /iPad|iPhone|iPod/.test(userAgent);
  const isAndroid = /Android/.test(userAgent);
  const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
  const isChrome = /Chrome/.test(userAgent);
  const isMobile = /Mobi|Android/i.test(userAgent) || isIOS;
  const isInAppBrowser = /FBAN|FBAV|Instagram|Twitter|Line|WeChat|Snapchat/.test(userAgent);
  const isPWA = typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches;
  
  return {
    isIOS,
    isAndroid,
    isSafari,
    isChrome,
    isMobile,
    isInAppBrowser,
    isPWA,
    userAgent
  };
};

/**
 * Check if popups are supported and allowed
 */
export const checkPopupSupport = (): { supported: boolean; blocked: boolean; message?: string } => {
  if (typeof window === 'undefined') {
    return { supported: false, blocked: false, message: 'Not in browser environment' };
  }

  try {
    // Test if we can open a popup
    const testPopup = window.open('about:blank', '_blank', 'width=1,height=1');
    
    if (!testPopup) {
      return { 
        supported: true, 
        blocked: true, 
        message: 'Popups are blocked by your browser. Please allow popups for this site.' 
      };
    }
    
    if (testPopup.closed) {
      return { 
        supported: true, 
        blocked: true, 
        message: 'Popups are being blocked. Please check your browser settings.' 
      };
    }
    
    // Close the test popup
    testPopup.close();
    
    return { supported: true, blocked: false };
  } catch (error) {
    return { 
      supported: false, 
      blocked: true, 
      message: 'Browser does not support popups or they are blocked.' 
    };
  }
};

/**
 * Show popup permission instructions to user
 */
export const showPopupInstructions = (): string => {
  const mobileInfo = getMobileInfo();
  const userAgent = mobileInfo.userAgent.toLowerCase();
  
  if (mobileInfo.isChrome) {
    return `To allow popups in Chrome:
1. Click the popup blocked icon in the address bar
2. Select "Always allow popups from this site"
3. Click "Done" and try signing in again`;
  } else if (mobileInfo.isSafari) {
    return `To allow popups in Safari:
1. Go to Safari → Preferences → Websites
2. Select "Pop-up Windows" on the left
3. Set this site to "Allow"
4. Try signing in again`;
  } else if (userAgent.includes('firefox')) {
    return `To allow popups in Firefox:
1. Click the shield icon in the address bar
2. Turn off "Enhanced Tracking Protection" for this site
3. Or go to Settings → Privacy & Security → Permissions
4. Try signing in again`;
  } else if (userAgent.includes('edge')) {
    return `To allow popups in Edge:
1. Click the popup blocked icon in the address bar
2. Select "Always allow" for this site
3. Try signing in again`;
  }
  
  return `To allow popups:
1. Look for a popup blocked icon in your address bar
2. Click it and allow popups for this site
3. Try signing in again`;
};

/**
 * Popup-only Google Sign-In with proper error handling
 */
export const signInWithGoogleEnhanced = async (auth: Auth, provider: GoogleAuthProvider) => {
  const mobileInfo = getMobileInfo();
  
  console.log('🚀 Starting popup-only Google sign-in...');
  console.log('📱 Device info:', {
    isMobile: mobileInfo.isMobile,
    isInAppBrowser: mobileInfo.isInAppBrowser,
    isPWA: mobileInfo.isPWA,
    userAgent: mobileInfo.userAgent.substring(0, 100) + '...'
  });

  // Check popup support first
  const popupCheck = checkPopupSupport();
  console.log('🔍 Popup support check:', popupCheck);
  
  if (popupCheck.blocked) {
    const error = new Error(popupCheck.message || 'Popups are blocked');
    (error as any).code = 'auth/popup-blocked';
    (error as any).instructions = showPopupInstructions();
    throw error;
  }

  if (!popupCheck.supported) {
    const error = new Error('Your browser does not support popup authentication');
    (error as any).code = 'auth/popup-not-supported';
    throw error;
  }

  try {
    console.log('✅ Popup support confirmed, proceeding with popup authentication');
    const result = await signInWithPopup(auth, provider);
    console.log('✅ Popup authentication successful:', result.user.email);
    return result;
  } catch (error: any) {
    console.error('❌ Popup authentication failed:', error);
    console.error('❌ Error code:', error.code);
    
    // Handle specific popup issues with user-friendly messages
    if (error.code === 'auth/popup-blocked') {
      error.instructions = showPopupInstructions();
      throw error;
    }
    
    if (error.code === 'auth/popup-closed-by-user') {
      const userError = new Error('Sign-in was cancelled. Please try again.');
      (userError as any).code = 'auth/popup-closed-by-user';
      throw userError;
    }
    
    if (error.code === 'auth/cancelled-popup-request') {
      const userError = new Error('Multiple sign-in attempts detected. Please wait a moment and try again.');
      (userError as any).code = 'auth/cancelled-popup-request';
      throw userError;
    }
    
    // For any other popup-related errors, provide instructions
    if (error.message?.includes('popup') || error.message?.includes('Cross-Origin-Opener-Policy')) {
      error.instructions = showPopupInstructions();
      (error as any).code = 'auth/popup-blocked';
    }
    
    throw error;
  }
};

/**
 * Check if popup sign-in is supported in the current environment
 */
export const isPopupSupported = (): boolean => {
  const popupCheck = checkPopupSupport();
  return popupCheck.supported && !popupCheck.blocked;
};

/**
 * Get user-friendly error message for authentication errors
 */
export const getAuthErrorMessage = (error: AuthError | Error): string => {
  if ('code' in error) {
    switch (error.code) {
      case 'auth/popup-blocked':
        return (error as any).instructions || 'Popups are blocked. Please allow popups for this site and try again.';
      case 'auth/popup-closed-by-user':
        return 'Sign-in was cancelled. Please try again.';
      case 'auth/popup-not-supported':
        return 'Your browser does not support popup authentication. Please try a different browser.';
      case 'auth/cancelled-popup-request':
        return 'Multiple sign-in attempts detected. Please wait a moment and try again.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection and try again.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'auth/user-disabled':
        return 'This account has been disabled. Please contact support.';
      case 'auth/web-storage-unsupported':
        return 'Browser storage is disabled. Please enable cookies and local storage in your browser settings.';
      case 'auth/operation-not-allowed':
        return 'Google sign-in is not enabled. Please contact support.';
      case 'auth/unauthorized-domain':
        return 'This domain is not authorized for authentication.';
      // Email/Password specific errors
      case 'auth/user-not-found':
        return 'No account found with this email address. Please check your email or sign up for a new account.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists. Please sign in instead.';
      case 'auth/weak-password':
        return 'Password is too weak. Please choose a stronger password.';
      case 'auth/invalid-credential':
        return 'Invalid email or password. Please check your credentials and try again.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later or reset your password.';
      default:
        return 'Sign-in failed. Please try again.';
    }
  }
  
  if (error.message?.includes('popup') || error.message?.includes('Cross-Origin-Opener-Policy')) {
    return (error as any).instructions || 'Popup authentication failed. Please allow popups for this site and try again.';
  }
  
  return error.message || 'An unexpected error occurred. Please try again.';
};

/**
 * Email/Password Sign-In with proper error handling
 */
export const signInWithEmailAndPasswordEnhanced = async (auth: Auth, email: string, password: string) => {
  try {
    console.log('🚀 Starting email/password sign-in...');
    
    const result = await signInWithEmailAndPassword(auth, email, password);
    console.log('✅ Email/password authentication successful:', result.user.email);
    return result;
  } catch (error: any) {
    console.error('❌ Email/password authentication failed:', error);
    throw error;
  }
};

/**
 * Email/Password Sign-Up with proper error handling
 */
export const createUserWithEmailAndPasswordEnhanced = async (auth: Auth, email: string, password: string) => {
  try {
    console.log('🚀 Starting email/password sign-up...');
    
    const result = await createUserWithEmailAndPassword(auth, email, password);
    console.log('✅ Email/password registration successful:', result.user.email);
    return result;
  } catch (error: any) {
    console.error('❌ Email/password registration failed:', error);
    throw error;
  }
};

/**
 * Validate email format
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 */
export const validatePassword = (password: string): { isValid: boolean; message?: string } => {
  if (password.length < 6) {
    return { isValid: false, message: 'Password must be at least 6 characters long' };
  }
  
  if (password.length > 128) {
    return { isValid: false, message: 'Password must be less than 128 characters' };
  }
  
  return { isValid: true };
};


