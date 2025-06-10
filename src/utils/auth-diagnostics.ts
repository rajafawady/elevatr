// Comprehensive test for redirect authentication issues
// Run this in browser console to diagnose the problem

export const runAuthDiagnostics = async () => {
  console.log('🔬 COMPREHENSIVE AUTH DIAGNOSTICS');
  console.log('==================================');
  
  // Test 1: Environment Variables
  console.log('\n1️⃣ Testing Environment Variables...');
  const envVars = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  };
  
  Object.entries(envVars).forEach(([key, value]) => {
    const status = value && value !== 'undefined' ? '✅' : '❌';
    console.log(`${status} ${key}: ${value ? 'Set' : 'Missing'}`);
  });
  
  // Test 2: Firebase Initialization
  console.log('\n2️⃣ Testing Firebase Initialization...');
  try {
    const { auth, googleProvider } = await import('@/lib/firebase');
    console.log('✅ Firebase auth imported successfully');
    console.log('✅ Google provider imported successfully');
    console.log('📋 Auth app config:', {
      apiKey: auth.app.options.apiKey?.substring(0, 10) + '...',
      authDomain: auth.app.options.authDomain,
      projectId: auth.app.options.projectId,
    });
  } catch (error) {
    console.error('❌ Firebase import failed:', error);
    return;
  }
  
  // Test 3: Network Connectivity to Firebase
  console.log('\n3️⃣ Testing Network Connectivity...');
  try {
    const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
    if (authDomain) {
      const response = await fetch(`https://${authDomain}`, { mode: 'no-cors' });
      console.log('✅ Can reach Firebase auth domain');
    }
  } catch (error) {
    console.error('❌ Cannot reach Firebase auth domain:', error);
  }
  
  // Test 4: Browser Capabilities
  console.log('\n4️⃣ Testing Browser Capabilities...');
  const browserTests = {
    localStorage: typeof localStorage !== 'undefined',
    sessionStorage: typeof sessionStorage !== 'undefined',
    cookies: navigator.cookieEnabled,
    popups: typeof window.open === 'function',
    history: typeof history.pushState === 'function',
  };
  
  Object.entries(browserTests).forEach(([test, result]) => {
    const status = result ? '✅' : '❌';
    console.log(`${status} ${test}: ${result}`);
  });
  
  // Test 5: CORS Headers
  console.log('\n5️⃣ Testing CORS Headers...');
  try {
    const response = await fetch(window.location.href, { method: 'HEAD' });
    const headers = {
      coop: response.headers.get('cross-origin-opener-policy'),
      coep: response.headers.get('cross-origin-embedder-policy'),
      corp: response.headers.get('cross-origin-resource-policy'),
    };
    
    Object.entries(headers).forEach(([header, value]) => {
      console.log(`📋 ${header.toUpperCase()}: ${value || 'Not set'}`);
    });
  } catch (error) {
    console.error('❌ Could not check headers:', error);
  }
  
  // Test 6: Manual Redirect Test
  console.log('\n6️⃣ Testing Manual Redirect...');
  try {
    const { auth, googleProvider } = await import('@/lib/firebase');
    const { signInWithRedirect } = await import('firebase/auth');
    
    console.log('🔄 You can test manual redirect by running:');
    console.log('   window.testRedirect = async () => {');
    console.log('     const { auth, googleProvider } = await import("/src/lib/firebase");');
    console.log('     const { signInWithRedirect } = await import("firebase/auth");');
    console.log('     await signInWithRedirect(auth, googleProvider);');
    console.log('   };');
    console.log('   Then call: window.testRedirect()');
    
    // Make the test function available globally
    (window as any).testRedirect = async () => {
      console.log('🚀 Starting manual redirect test...');
      await signInWithRedirect(auth, googleProvider);
    };
    
  } catch (error) {
    console.error('❌ Could not set up manual redirect test:', error);
  }
  
  console.log('\n✅ Diagnostics complete! Check the results above.');
  console.log('If all tests pass but redirect still fails, the issue might be:');
  console.log('- Firebase project configuration');
  console.log('- Authorized domains in Firebase Console');
  console.log('- Browser-specific issues');
};
