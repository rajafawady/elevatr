# 🚀 Production Deployment Checklist

## Pre-Deployment Setup

### 1. Environment Configuration
- [ ] Create production Firebase project
- [ ] Set up production environment variables in `.env.production`
- [ ] Generate secure `NEXTAUTH_SECRET` using: `openssl rand -base64 32`
- [ ] Configure production domain in `NEXTAUTH_URL`
- [ ] Set up EmailJS production service and templates
- [ ] Configure Google Analytics (if using)
- [ ] Set up error monitoring (Sentry, LogRocket, etc.)

### 2. Firebase Production Setup
- [ ] Create new Firebase project for production
- [ ] Enable Firestore Database in production mode
- [ ] Enable Authentication with Email/Password
- [ ] Configure authentication domains
- [ ] Set up Firestore security rules
- [ ] Configure Storage security rules
- [ ] Enable Analytics (optional)

### 3. Code Preparation
- [ ] Update Firebase configuration with production values
- [ ] Run `npm run lint` to check for issues
- [ ] Run `npm run build:prod` to test production build
- [ ] Test all critical features locally
- [ ] Verify PWA functionality
- [ ] Check responsive design on multiple devices

## Deployment Options

### Option A: Vercel (Recommended)

#### Quick Deploy
```powershell
# Install Vercel CLI
npm i -g vercel

# Deploy to production
npm run deploy:vercel
```

#### Environment Variables Setup in Vercel
1. Go to Vercel Dashboard → Project → Settings → Environment Variables
2. Add all variables from `.env.production`:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
   - `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`
   - `NEXT_PUBLIC_EMAILJS_SERVICE_ID`
   - `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID`
   - `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY`

#### Domain Configuration
- [ ] Add custom domain in Vercel settings
- [ ] Configure DNS records
- [ ] Enable SSL certificate
- [ ] Update `NEXTAUTH_URL` with production domain

### Option B: Netlify

#### Quick Deploy
```powershell
# Install Netlify CLI
npm i -g netlify-cli

# Build and deploy
npm run build:prod
netlify deploy --prod --dir=.next
```

### Option C: Railway

```powershell
# Install Railway CLI
npm i -g @railway/cli

# Deploy
railway login
railway deploy
```

### Option D: Digital Ocean App Platform

1. Connect GitHub repository
2. Configure build settings:
   - Build Command: `npm run build:prod`
   - Output Directory: `.next`
3. Add environment variables

## Post-Deployment

### 1. Verification Tests
- [ ] Visit production URL and verify app loads
- [ ] Test user registration/login
- [ ] Create a test sprint and verify data persistence
- [ ] Test journal functionality
- [ ] Verify progress tracking works
- [ ] Test calendar integration
- [ ] Check mobile responsiveness
- [ ] Verify PWA installation works
- [ ] Test offline functionality

### 2. Performance Checks
- [ ] Run Lighthouse audit (aim for 90+ scores)
- [ ] Check Core Web Vitals
- [ ] Verify service worker is working
- [ ] Test loading speeds
- [ ] Check bundle size is optimized

### 3. Security Verification
- [ ] Verify HTTPS is enabled
- [ ] Check security headers are set
- [ ] Verify Firebase security rules are active
- [ ] Test authentication flows
- [ ] Verify sensitive data is not exposed

### 4. Monitoring Setup
- [ ] Set up uptime monitoring
- [ ] Configure error tracking
- [ ] Set up performance monitoring
- [ ] Configure analytics
- [ ] Set up alerts for critical issues

## Firebase Production Configuration

### Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /sprints/{sprintId} {
      allow read, write: if request.auth != null && 
                        request.auth.uid == resource.data.userId;
    }
    
    match /userProgress/{progressId} {
      allow read, write: if request.auth != null && 
                        request.auth.uid == resource.data.userId;
    }
    
    match /journalEntries/{entryId} {
      allow read, write: if request.auth != null && 
                        request.auth.uid == resource.data.userId;
    }
    
    match /templates/{templateId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                   request.auth.uid == resource.data.userId;
    }
  }
}
```

### Storage Security Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /templates/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && 
                        request.auth.uid == userId;
    }
    
    match /profiles/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && 
                        request.auth.uid == userId;
    }
  }
}
```

## Troubleshooting

### Common Issues

1. **Build Fails**
   - Check for TypeScript errors: `npm run lint`
   - Verify all dependencies are installed
   - Check for missing environment variables

2. **Authentication Issues**
   - Verify Firebase configuration
   - Check authorized domains in Firebase Console
   - Ensure `NEXTAUTH_URL` matches production domain

3. **PWA Not Working**
   - Verify service worker is registered
   - Check manifest.json is accessible
   - Ensure HTTPS is enabled

4. **Performance Issues**
   - Enable compression in hosting platform
   - Optimize images and assets
   - Check bundle analyzer for large dependencies

## Maintenance

### Regular Tasks
- [ ] Monitor error rates and performance
- [ ] Update dependencies monthly
- [ ] Review security rules quarterly
- [ ] Backup Firebase data regularly
- [ ] Monitor usage and costs
- [ ] Update SSL certificates (usually automatic)

### Version Updates
```powershell
# Check for updates
npm outdated

# Update dependencies
npm update

# Test after updates
npm run build:prod
npm run deploy:check
```

## Emergency Procedures

### Rollback
```powershell
# Vercel rollback to previous deployment
vercel --prod --confirm
```

### Hot Fixes
1. Create hotfix branch
2. Make minimal changes
3. Test thoroughly
4. Deploy directly to production
5. Merge back to main branch

---

## Quick Deploy Commands

```powershell
# Full deployment check
npm run deploy:check

# Deploy to Vercel
npm run deploy:vercel

# Health check
npm run health:check
```
