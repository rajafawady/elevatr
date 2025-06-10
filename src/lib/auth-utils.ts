// Custom authentication utilities for handling mobile browser limitations
import { Auth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, AuthError, getRedirectResult } from 'firebase/auth';

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
 * Enhanced Google Sign-In with mobile-optimized authentication flow
 */
export const signInWithGoogleEnhanced = async (auth: Auth, provider: GoogleAuthProvider) => {
  const mobileInfo = getMobileInfo();
  
  console.log('🚀 Starting enhanced Google sign-in...');
  console.log('📱 Device info:', {
    isMobile: mobileInfo.isMobile,
    isInAppBrowser: mobileInfo.isInAppBrowser,
    isPWA: mobileInfo.isPWA,
    userAgent: mobileInfo.userAgent.substring(0, 100) + '...'
  });
  
  // For mobile browsers, always use redirect (more reliable)
  if (mobileInfo.isMobile || mobileInfo.isInAppBrowser || mobileInfo.isPWA) {
    console.log('📱 Mobile browser detected, using redirect authentication');
    return await signInWithRedirect(auth, provider);
  }

  // For desktop, try popup first with fallback to redirect
  try {
    console.log('🖥️ Desktop browser detected, attempting popup authentication');
    
    // Check if popup is blocked before attempting
    const testPopup = window.open('about:blank', '_blank', 'width=1,height=1');
    if (!testPopup || testPopup.closed) {
      console.log('🚫 Popup blocked, falling back to redirect');
      throw new Error('Popup blocked');
    }
    testPopup.close();

    console.log('✅ Popup test successful, proceeding with popup auth');
    const result = await signInWithPopup(auth, provider);
    console.log('✅ Popup authentication successful:', result.user.email);
    return result;
  } catch (error: any) {
    console.error('❌ Popup authentication failed:', error);
    console.error('❌ Error code:', error.code);
    
    // Handle specific popup issues
    if (error.code === 'auth/popup-blocked' || 
        error.code === 'auth/popup-closed-by-user' ||
        error.message?.includes('Cross-Origin-Opener-Policy') ||
        error.message?.includes('Popup blocked')) {
      console.log('🔄 Popup blocked or closed, falling back to redirect...');
      return await signInWithRedirect(auth, provider);
    }
    
    // For other errors, still try redirect as fallback
    if (error.code !== 'auth/cancelled-popup-request') {
      console.log('🔄 Popup failed with error, trying redirect as fallback...');
      try {
        return await signInWithRedirect(auth, provider);
      } catch (redirectError) {
        console.error('❌ Both popup and redirect failed:', redirectError);
        throw redirectError;
      }
    }
    
    throw error;
  }
};

/**
 * Enhanced redirect result handler with mobile optimizations
 */
export const handleRedirectResult = async (auth: Auth): Promise<any> => {
  try {
    console.log('🔍 Checking for redirect result...');
    
    // Add a small delay to ensure auth state is stable
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const result = await getRedirectResult(auth);
    
    if (result?.user) {      console.log('✅ Redirect authentication successful:', result.user.email);
      console.log('🔥 User UID:', result.user.uid);
      return result;
    } else {
      console.log('ℹ️ No redirect result found (this is normal for non-redirect flows)');
      return null;
    }
  } catch (error: any) {
    console.error('❌ Error handling redirect result:', error);
    console.error('❌ Error code:', error.code);
    console.error('❌ Error message:', error.message);
    console.error('❌ Full error object:', JSON.stringify(error, null, 2));
    
    // Critical errors that should be thrown
    if (error.code === 'auth/web-storage-unsupported') {
      throw new Error('Browser storage is disabled. Please enable cookies and local storage.');
    } else if (error.code === 'auth/operation-not-allowed') {
      throw new Error('Google sign-in is not enabled. Please contact support.');
    } else if (error.code === 'auth/unauthorized-domain') {
      throw new Error('This domain is not authorized for authentication.');
    } else if (error.code === 'auth/invalid-api-key' || error.code === 'auth/app-not-authorized') {
      throw new Error('Firebase configuration error. Please check your API keys.');
    }
    
    // Network and temporary errors - log but continue
    if (error.code === 'auth/network-request-failed' || 
        error.code === 'auth/timeout' || 
        error.code === 'auth/too-many-requests') {
      console.log('⚠️ Temporary error during redirect result check, continuing with normal flow');
      return null;
    }
    
    // For unknown errors, throw them to get proper debugging info
    console.error('🚨 Unknown redirect error, this needs investigation');
    throw error;
  }
};

/**
 * Check if popup sign-in is supported in the current environment
 */
export const isPopupSupported = (): boolean => {
  try {
    const mobileInfo = getMobileInfo();
    
    // Mobile browsers generally don't support popup authentication reliably
    if (mobileInfo.isMobile || mobileInfo.isInAppBrowser || mobileInfo.isPWA) {
      return false;
    }
    
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
  const mobileInfo = getMobileInfo();
  
  if ('code' in error) {
    switch (error.code) {
      case 'auth/popup-blocked':
        return mobileInfo.isMobile 
          ? 'Please allow popups and redirects in your browser settings.'
          : 'Popup was blocked by your browser. Please allow popups and try again.';
      case 'auth/popup-closed-by-user':
        return 'Sign-in was cancelled. Please try again.';
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
      case 'auth/cancelled-popup-request':
        return 'Multiple sign-in attempts detected. Please wait and try again.';
      default:
        return mobileInfo.isMobile 
          ? 'Sign-in failed. Try refreshing the page and signing in again.'
          : 'Sign-in failed. Please try again.';
    }
  }
  
  if (error.message?.includes('Cross-Origin-Opener-Policy')) {
    return mobileInfo.isMobile 
      ? 'Browser security settings are blocking sign-in. Try refreshing the page.'
      : 'Browser security settings are blocking sign-in. Please try the redirect method.';
  }
  
  return error.message || 'An unexpected error occurred. Please try again.';
};
