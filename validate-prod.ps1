# Production Environment Validation Script

Write-Host "🔍 Validating Production Environment Configuration" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green

$isValid = $true
$requiredVars = @(
    "NEXT_PUBLIC_FIREBASE_API_KEY",
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN", 
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
    "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
    "NEXT_PUBLIC_FIREBASE_APP_ID",
    "NEXTAUTH_SECRET",
    "NEXTAUTH_URL"
)

# Check if .env.production exists
if (-not (Test-Path ".env.production")) {
    Write-Host "❌ .env.production file not found!" -ForegroundColor Red
    Write-Host "   Create this file with your production environment variables." -ForegroundColor Yellow
    $isValid = $false
} else {
    Write-Host "✅ .env.production file found" -ForegroundColor Green
      # Read and validate environment variables
    $envContent = Get-Content ".env.production" | Where-Object { $_ -notmatch "^\s*#" -and $_ -notmatch "^\s*$" }
    $envVars = @{}
    
    foreach ($line in $envContent) {
        if ($line -match "^(.+?)=(.*)$") {
            $envVars[$matches[1]] = $matches[2]
        }
    }
    
    Write-Host ""
    Write-Host "🔍 Checking required environment variables:" -ForegroundColor Cyan
    
    foreach ($var in $requiredVars) {
        if ($envVars.ContainsKey($var) -and $envVars[$var] -ne "" -and $envVars[$var] -notmatch "your_.*_here") {
            Write-Host "  ✅ $var" -ForegroundColor Green
        } else {
            Write-Host "  ❌ $var (missing or placeholder value)" -ForegroundColor Red
            $isValid = $false
        }
    }
}

Write-Host ""
Write-Host "🔍 Checking optional configurations:" -ForegroundColor Cyan

# Check Firebase project ID format
if ($envVars.ContainsKey("NEXT_PUBLIC_FIREBASE_PROJECT_ID")) {
    $projectId = $envVars["NEXT_PUBLIC_FIREBASE_PROJECT_ID"]
    if ($projectId -match "^[a-z0-9\-]+$") {
        Write-Host "  ✅ Firebase Project ID format is valid" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  Firebase Project ID should only contain lowercase letters, numbers, and hyphens" -ForegroundColor Yellow
    }
}

# Check NextAuth URL format
if ($envVars.ContainsKey("NEXTAUTH_URL")) {
    $authUrl = $envVars["NEXTAUTH_URL"]
    if ($authUrl -match "^https://") {
        Write-Host "  ✅ NEXTAUTH_URL uses HTTPS" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  NEXTAUTH_URL should use HTTPS for production" -ForegroundColor Yellow
    }
}

# Check NextAuth secret strength
if ($envVars.ContainsKey("NEXTAUTH_SECRET")) {
    $secret = $envVars["NEXTAUTH_SECRET"]
    if ($secret.Length -ge 32) {
        Write-Host "  ✅ NEXTAUTH_SECRET has adequate length" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  NEXTAUTH_SECRET should be at least 32 characters" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "🔍 Checking build configuration:" -ForegroundColor Cyan

# Check if build succeeds
try {
    Write-Host "  🔨 Testing production build..." -ForegroundColor Yellow
    $buildOutput = & npm run build:prod 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ Production build successful" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Production build failed" -ForegroundColor Red
        Write-Host "  Build output: $buildOutput" -ForegroundColor Red
        $isValid = $false
    }
} catch {
    Write-Host "  ❌ Could not run build test" -ForegroundColor Red
    $isValid = $false
}

Write-Host ""
if ($isValid) {
    Write-Host "🎉 Production environment is ready for deployment!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Run: npm run deploy:vercel" -ForegroundColor White
    Write-Host "2. Set environment variables in your hosting platform" -ForegroundColor White
    Write-Host "3. Configure your custom domain" -ForegroundColor White
    Write-Host "4. Run post-deployment tests" -ForegroundColor White
} else {
    Write-Host "❌ Production environment has issues that need to be resolved" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please fix the issues above before deploying to production." -ForegroundColor Yellow
}

# Optional: Show deployment commands
Write-Host ""
Write-Host "📋 Available deployment commands:" -ForegroundColor Cyan
Write-Host "  npm run deploy:check   - Validate before deployment" -ForegroundColor White
Write-Host "  npm run deploy:vercel  - Deploy to Vercel" -ForegroundColor White
Write-Host "  npm run health:check   - Check app health" -ForegroundColor White
