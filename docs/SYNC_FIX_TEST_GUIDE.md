# Testing the Sign-Out → Changes → Sign-In Sync Fix

## The Problem
Previously, when you:
1. Signed out → Made changes → Signed back in
2. Your changes were lost because they were stored under a new local user ID

## The Solution
Now the system:
1. **Sign Out**: Caches Firebase data locally + stores your Firebase UID
2. **Make Changes**: Changes are stored under the current local user
3. **Sign In**: Detects you're the same user and syncs all local changes to Firebase

## How to Test

### Test Scenario 1: Sign Out → Add Sprint → Sign In
1. **Sign in** with Google (if not already signed in)
2. **Sign out** from the app
3. **Add a new sprint** while in local mode
4. **Sign back in** with the same Google account
5. **Verify**: The sprint you added while signed out should appear in your account

### Test Scenario 2: Sign Out → Complete Tasks → Sign In
1. **Sign in** with Google
2. **Create a sprint** with some tasks
3. **Sign out**
4. **Complete some tasks** or add journal entries while in local mode
5. **Sign back in** with the same Google account
6. **Verify**: Task completions and journal entries should sync

### Test Scenario 3: Multiple Sign Out/In Cycles
1. **Sign in** → Create some data → **Sign out**
2. **Add more data** while local → **Sign in** → **Sign out**
3. **Add even more data** while local → **Sign in**
4. **Verify**: All data from all sessions should be present

## What to Look For

### In Browser Console:
- `"Caching Firebase data locally before sign out..."`
- `"Stored cached Firebase UID for later sync"`
- `"Detected returning user with cached data, syncing changes..."`
- `"Successfully synced local data to Firebase"`

### In the UI:
- Local user notification should show in dashboard while signed out
- Changes made while local should persist after signing back in
- No data loss between sign-out/sign-in cycles

## Debug Information

If the sync still doesn't work, check:

1. **Browser Console**: Look for error messages during sync
2. **Local Storage**: Check if `elevatr_cached_firebase_uid` is set after sign-out
3. **Network Tab**: Verify API calls are being made during sync
4. **Firebase Console**: Check if data actually appears in Firestore

## Key Changes Made

1. **AuthContext**: Now stores cached Firebase UID during sign-out
2. **Data Sync**: Detects returning users and syncs their local changes
3. **Local Storage**: Maintains continuity between sign-out/sign-in cycles

The fix ensures that your work is never lost when transitioning between local and cloud modes.
