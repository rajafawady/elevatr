// Debug utilities for authentication issues
import { auth, googleProvider } from '@/lib/firebase';

export const debugFirebaseConfig = () => {
  console.log('🔥 Firebase Debug Information:');
  console.log('----------------------------');
  
  // Check if Firebase is properly initialized
  console.log('✅ Auth instance:', !!auth);
  console.log('✅ Google provider:', !!googleProvider);
  
  // Check configuration (without exposing secrets)
  const config = auth.app.options;
  console.log('📋 Config status:', {
    hasApiKey: !!config.apiKey && config.apiKey !== 'undefined',
    authDomain: config.authDomain,
    projectId: config.projectId,
    hasStorageBucket: !!config.storageBucket,
    hasMessagingSenderId: !!config.messagingSenderId,
    hasAppId: !!config.appId,
  });
  
  // Check if auth domain is reachable
  if (config.authDomain) {
    console.log('🌐 Auth domain URL:', `https://${config.authDomain}`);
  }
  
  // Check current auth state
  console.log('👤 Current user:', auth.currentUser?.email || 'none');
  console.log('🔗 Auth state ready:', auth.authStateReady);
  
  // Check browser environment
  console.log('🌍 Environment:', {
    isClient: typeof window !== 'undefined',
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent.substring(0, 100) + '...' : 'SSR',
    cookiesEnabled: typeof window !== 'undefined' ? navigator.cookieEnabled : 'unknown',
    localStorage: typeof window !== 'undefined' && typeof window.localStorage !== 'undefined',
  });
  
  console.log('----------------------------');
};

export const testGoogleProviderConfig = () => {
  console.log('🔧 Google Provider Configuration:');
  console.log('----------------------------------');
  
  // Check provider configuration
  const customParams = (googleProvider as any)._customParameters || {};
  console.log('⚙️ Custom parameters:', customParams);
  
  const scopes = (googleProvider as any)._scopes || [];
  console.log('🔑 Scopes:', scopes);
  
  console.log('----------------------------------');
};
