// Quick fixes for common redirect authentication issues
import { auth, googleProvider } from '@/lib/firebase';
import { signInWithRedirect, signInWithPopup, getRedirectResult } from 'firebase/auth';

export const authQuickFixes = {
  // Fix 1: Clear all auth state and retry
  clearAndRetry: async () => {
    console.log('🔄 Clearing auth state...');
    localStorage.removeItem('firebase:authUser:' + auth.app.options.apiKey + ':[DEFAULT]');
    sessionStorage.clear();
    
    // Clear any pending auth operations
    try {
      await auth.signOut();
    } catch (e) {
      // Ignore errors if not signed in
    }
    
    console.log('✅ Auth state cleared, you can try signing in again');
  },

  // Fix 2: Force popup mode (for desktop testing)
  forcePopup: async () => {
    console.log('🔄 Attempting popup authentication...');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.log('✅ Popup authentication successful:', result.user.email);
      return result;
    } catch (error) {
      console.error('❌ Popup authentication failed:', error);
      throw error;
    }
  },

  // Fix 3: Force redirect mode
  forceRedirect: async () => {
    console.log('🔄 Attempting redirect authentication...');
    try {
      await signInWithRedirect(auth, googleProvider);
      console.log('🔄 Redirect initiated, page will reload...');
    } catch (error) {
      console.error('❌ Redirect authentication failed:', error);
      throw error;
    }
  },

  // Fix 4: Check for pending redirect result
  checkRedirectResult: async () => {
    console.log('🔍 Checking for redirect result...');
    try {
      const result = await getRedirectResult(auth);
      if (result) {
        console.log('✅ Found redirect result:', result.user.email);
        return result;
      } else {
        console.log('ℹ️ No redirect result found');
        return null;
      }
    } catch (error) {
      console.error('❌ Error checking redirect result:', error);
      throw error;
    }
  },

  // Fix 5: Comprehensive reset
  fullReset: async () => {
    console.log('🔄 Performing full auth reset...');
    
    // Clear all storage
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear cookies (best effort)
    document.cookie.split(";").forEach((c) => {
      const eqPos = c.indexOf("=");
      const name = eqPos > -1 ? c.substr(0, eqPos) : c;
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    });
    
    // Sign out from Firebase
    try {
      await auth.signOut();
    } catch (e) {
      // Ignore errors
    }
    
    console.log('✅ Full reset complete, reloading page...');
    window.location.reload();
  }
};

// Make fixes available globally in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).authFixes = authQuickFixes;
  console.log('🔧 Auth fixes available at window.authFixes');
  console.log('   - authFixes.clearAndRetry()');
  console.log('   - authFixes.forcePopup()');
  console.log('   - authFixes.forceRedirect()');
  console.log('   - authFixes.checkRedirectResult()');
  console.log('   - authFixes.fullReset()');
}
