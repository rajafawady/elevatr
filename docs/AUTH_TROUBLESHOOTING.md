# Firebase Authentication Troubleshooting Guide

## Common Issues with Redirect Mode Authentication

### 1. **Authorized Domains Not Set**
**Symptoms:** Authentication fails immediately or redirects to error page
**Solution:** 
- Go to Firebase Console > Authentication > Settings > Authorized domains
- Add your domains:
  - `localhost` (for development)
  - `your-domain.com` (for production)
  - Any preview/staging domains

### 2. **Firebase Configuration Issues**
**Symptoms:** "Firebase configuration error" or "Invalid API key"
**Check:**
- All environment variables are set correctly
- API key is valid and not expired
- Project ID matches your Firebase project

### 3. **Browser Storage Issues**
**Symptoms:** "Web storage unsupported" error
**Solution:**
- Enable cookies in browser
- Enable local storage
- Check if in incognito/private mode
- Try different browser

### 4. **CORS/COOP Policy Issues**
**Symptoms:** "Cross-Origin-Opener-Policy" errors
**Current Settings:**
- COOP: `same-origin-allow-popups` (general pages)
- COOP: `unsafe-none` (auth pages)
- COEP: `unsafe-none`

### 5. **Network/Firewall Issues**
**Symptoms:** Network request failures
**Check:**
- Can reach `*.firebaseapp.com`
- Corporate firewall not blocking Google/Firebase
- VPN not interfering

## Debugging Steps

1. **Open Browser Console**
2. **Run Diagnostics:**
   ```javascript
   // In browser console on the login page
   window.runAuthDiagnostics()
   ```

3. **Manual Redirect Test:**
   ```javascript
   // Test redirect manually
   window.testRedirect()
   ```

4. **Check Firebase Console:**
   - Authentication > Users (should show user after successful auth)
   - Authentication > Settings > Authorized domains
   - Project Settings > General (verify config)

## Expected Console Output for Working Auth

```
🔥 Firebase Debug Information:
✅ Auth instance: true
✅ Google provider: true
📋 Config status: { hasApiKey: true, authDomain: "your-project.firebaseapp.com", ... }
👤 Current user: none
🌍 Environment: { isClient: true, cookiesEnabled: true, localStorage: true }
```

## Manual Fixes

### Fix 1: Reset Browser State
```javascript
// Clear all auth state
localStorage.clear();
sessionStorage.clear();
// Reload page
```

### Fix 2: Force Popup Mode (Desktop Only)
```javascript
// Test popup authentication
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
await signInWithPopup(auth, googleProvider);
```

### Fix 3: Check Firebase Project Settings
1. Firebase Console > Project Settings
2. Your apps > Web app
3. Verify configuration matches .env.local
4. Check Firebase Hosting domains (if using)

## Contact Information
If issues persist after following this guide, check:
- Firebase status page
- Browser compatibility
- Network connectivity to Google services
