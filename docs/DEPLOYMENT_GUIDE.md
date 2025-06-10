# 🚀 Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying the Elevatr Career Success Tracker application to production environments.

## Prerequisites

### Required Accounts
- **Vercel Account**: For hosting the Next.js application
- **Firebase Project**: For database and authentication
- **GitHub Account**: For source code management (optional but recommended)

### Required Tools
- **Node.js**: Version 18 or later
- **npm**: Version 8 or later
- **Git**: For version control
- **Firebase CLI**: For Firebase configuration

## Environment Setup

### 1. Firebase Configuration

#### Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: `elevatr-career-tracker`
4. Enable Google Analytics (optional)
5. Create project

#### Enable Required Services
```bash
# Enable Firestore
1. Navigate to Firestore Database
2. Click "Create database"
3. Choose "Start in production mode"
4. Select your preferred location

# Enable Authentication
1. Navigate to Authentication
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Email/Password"
```

#### Configure Web App
1. In Firebase Console, click "Project Settings"
2. Scroll to "Your apps" section
3. Click "Add app" and select "Web"
4. Register app with name: `elevatr-web`
5. Copy the configuration object

### 2. Environment Variables

#### Create `.env.local` File
```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Application Configuration
NEXT_PUBLIC_APP_NAME=Elevatr Career Success Tracker
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_ENVIRONMENT=production
```

#### Create `.env.example` File
```bash
# Copy .env.local to .env.example and remove actual values
# This serves as a template for other developers
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
# ... etc
```

### 3. Firebase Security Rules

#### Firestore Security Rules
Create `firestore.rules`:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own sprints
    match /sprints/{sprintId} {
      allow read, write: if request.auth != null && 
                        request.auth.uid == resource.data.userId;
    }
    
    // Users can only access their own progress data
    match /userProgress/{progressId} {
      allow read, write: if request.auth != null && 
                        request.auth.uid == resource.data.userId;
    }
    
    // Public templates are read-only for authenticated users
    match /templates/{templateId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                   request.auth.uid == resource.data.userId;
    }
    
    // Journal entries are private to users
    match /journalEntries/{entryId} {
      allow read, write: if request.auth != null && 
                        request.auth.uid == resource.data.userId;
    }
  }
}
```

#### Firebase Storage Rules
Create `storage.rules`:
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Users can upload sprint templates
    match /templates/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && 
                        request.auth.uid == userId;
    }
    
    // Profile images
    match /profiles/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && 
                        request.auth.uid == userId;
    }
  }
}
```

## Deployment Methods

### Method 1: Vercel Deployment (Recommended)

#### Option A: GitHub Integration
1. **Connect Repository**
   ```bash
   # Push your code to GitHub
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy via Vercel Dashboard**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository
   - Configure project settings:
     - Framework Preset: Next.js
     - Root Directory: ./
     - Build Command: `npm run build`
     - Output Directory: `.next`

3. **Configure Environment Variables**
   - In Vercel project settings, go to "Environment Variables"
   - Add all variables from your `.env.local` file
   - Ensure all environments (Production, Preview, Development) are selected

#### Option B: Vercel CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Follow the prompts:
# ? Set up and deploy "~/elevatr"? [Y/n] y
# ? Which scope do you want to deploy to? [Your username]
# ? Link to existing project? [y/N] n
# ? What's your project's name? elevatr-career-tracker
# ? In which directory is your code located? ./
```

### Method 2: Custom Server Deployment

#### Docker Deployment
Create `Dockerfile`:
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

Create `docker-compose.yml`:
```yaml
version: '3.8'
services:
  elevatr:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_FIREBASE_API_KEY=${NEXT_PUBLIC_FIREBASE_API_KEY}
      - NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=${NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN}
      - NEXT_PUBLIC_FIREBASE_PROJECT_ID=${NEXT_PUBLIC_FIREBASE_PROJECT_ID}
      - NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=${NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}
      - NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=${NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID}
      - NEXT_PUBLIC_FIREBASE_APP_ID=${NEXT_PUBLIC_FIREBASE_APP_ID}
    restart: unless-stopped
```

Deploy:
```bash
# Build and run
docker-compose up -d

# Check logs
docker-compose logs -f elevatr
```

## Post-Deployment Configuration

### 1. Domain Configuration

#### Custom Domain (Vercel)
1. Go to Vercel project dashboard
2. Navigate to "Settings" > "Domains"
3. Add your custom domain
4. Configure DNS records as instructed
5. Wait for SSL certificate provisioning

#### Domain Security Headers
Add to `next.config.ts`:
```typescript
/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline';",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

### 2. Performance Optimization

#### Enable Compression
```typescript
// next.config.ts
const nextConfig = {
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  
  experimental: {
    optimizeCss: true,
  },
  
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },
};
```

#### CDN Configuration
- Vercel automatically provides CDN
- For custom deployments, consider Cloudflare or AWS CloudFront

### 3. Analytics Setup

#### Vercel Analytics
```bash
# Install Vercel Analytics
npm install @vercel/analytics

# Add to _app.tsx or layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

#### Google Analytics (Optional)
```typescript
// lib/gtag.ts
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID;

export const pageview = (url: string) => {
  window.gtag('config', GA_TRACKING_ID, {
    page_path: url,
  });
};

export const event = ({ action, category, label, value }: any) => {
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};
```

## Monitoring and Maintenance

### 1. Application Monitoring

#### Health Check Endpoint
Create `pages/api/health.ts`:
```typescript
import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  });
}
```

#### Error Tracking
```bash
# Install Sentry (optional)
npm install @sentry/nextjs

# Configure sentry.client.config.js
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
});
```

### 2. Backup Strategy

#### Database Backup
```bash
# Firebase CLI backup (requires setup)
firebase firestore:export gs://your-bucket/backups/$(date +%Y%m%d)

# Automated backup script
#!/bin/bash
DATE=$(date +%Y%m%d)
firebase firestore:export gs://elevatr-backups/firestore-$DATE
```

#### Code Backup
- Use GitHub for source code backup
- Tag releases for version tracking
- Maintain multiple environment branches

### 3. Update Procedures

#### Dependency Updates
```bash
# Check for updates
npm outdated

# Update dependencies
npm update

# Security audit
npm audit
npm audit fix
```

#### Application Updates
```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and test
npm run dev
npm run build
npm run test

# Deploy to staging
vercel --prod --scope staging

# Deploy to production
git checkout main
git merge feature/new-feature
git push origin main
```

## Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clear cache and reinstall
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

#### Environment Variable Issues
```bash
# Verify variables are set
printenv | grep NEXT_PUBLIC

# Check Vercel environment variables
vercel env ls
```

#### Firebase Connection Issues
```bash
# Test Firebase connection
firebase projects:list
firebase firestore:indexes

# Check security rules
firebase firestore:rules:get
```

#### Performance Issues
```bash
# Analyze bundle
npm install --save-dev @next/bundle-analyzer

# Add to next.config.ts
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer(nextConfig);

# Run analysis
ANALYZE=true npm run build
```

## Security Checklist

### Pre-Deployment Security
- [ ] Environment variables configured securely
- [ ] Firebase security rules implemented
- [ ] Authentication properly configured
- [ ] Input validation implemented
- [ ] HTTPS enforced
- [ ] Security headers configured
- [ ] Dependency vulnerabilities checked

### Post-Deployment Security
- [ ] SSL certificate active
- [ ] Domain security configured
- [ ] Monitoring alerts set up
- [ ] Backup procedures tested
- [ ] Incident response plan documented

## Performance Checklist

### Pre-Deployment Performance
- [ ] Bundle size optimized
- [ ] Images optimized
- [ ] Database queries optimized
- [ ] Caching strategies implemented
- [ ] Core Web Vitals tested

### Post-Deployment Performance
- [ ] Performance monitoring active
- [ ] CDN configured
- [ ] Database performance monitored
- [ ] User experience metrics tracked

## Support and Maintenance

### Monitoring Schedule
- **Daily**: Check application health and error rates
- **Weekly**: Review performance metrics and user feedback
- **Monthly**: Security audit and dependency updates
- **Quarterly**: Full system review and optimization

### Emergency Procedures
1. **Application Down**: Check Vercel status and error logs
2. **Database Issues**: Review Firebase console and security rules
3. **Performance Issues**: Check analytics and optimize bottlenecks
4. **Security Incidents**: Follow incident response plan

---

**Deployment Guide Version**: 1.0  
**Last Updated**: June 10, 2025  
**Next Review**: September 10, 2025  
**Maintained By**: Development Team
