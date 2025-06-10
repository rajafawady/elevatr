'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LogIn, Trophy, Target, Calendar, BarChart3, User } from 'lucide-react';
import { getAuthErrorMessage } from '@/lib/auth-utils';
import { useGlobalErrorHandler } from '@/components/providers/ErrorProvider';
import { InlineError } from '@/components/ui/ErrorNotification';
import { debugFirebaseConfig, testGoogleProviderConfig } from '@/utils/auth-debug';
import { runAuthDiagnostics } from '@/utils/auth-diagnostics';
import '@/utils/auth-fixes'; // This will make auth fixes available globally

export function LoginPage() {
  const { signInWithGoogle, continueAsGuest, loading, isMobile, hasLocalDataToSync } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Debug Firebase configuration on component mount
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 LoginPage: Running Firebase diagnostics...');
      debugFirebaseConfig();
      testGoogleProviderConfig();
      
      // Make comprehensive diagnostics available globally in development
      (window as any).runAuthDiagnostics = runAuthDiagnostics;
      console.log('🔧 Run window.runAuthDiagnostics() for comprehensive testing');
    }
  }, []);
  
  const handleSignIn = async () => {
    setIsSigningIn(true);
    setError(null);
    
    try {
      console.log('🎯 LoginPage: Starting sign-in process...');
      await signInWithGoogle();
      console.log('✅ LoginPage: Sign-in process completed');
    } catch (error: unknown) {
      console.error('❌ LoginPage: Sign in error:', error);
      setError(getAuthErrorMessage(error as Error));
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleContinueAsGuest = () => {
    try {
      continueAsGuest();
    } catch (error: unknown) {
      console.error('Continue as guest error:', error);
      setError('Failed to continue as guest. Please try again.');
    }
  };

  const features = [
    {
      icon: Target,
      title: 'Sprint Planning',
      description: 'Set clear goals and track your progress in 15-day or 30-day career sprints',
    },
    {
      icon: Calendar,
      title: 'Daily Tracking',
      description: 'Monitor tasks, update journal entries, and maintain your momentum',
    },
    {
      icon: BarChart3,
      title: 'Progress Analytics',
      description: 'Visualize your growth with detailed progress reports and insights',
    },
    {
      icon: Trophy,
      title: 'Achievement System',
      description: 'Celebrate milestones and build momentum with our achievement tracking',
    },
  ];
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-accent/10 to-primary/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container-responsive py-12 relative z-10">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <h1 className="text-7xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent mb-6">
            Elevatr
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Accelerate your career growth with structured sprints, daily tracking, and actionable insights
          </p>
        </div>

        {/* Login Card */}
        <div className="max-w-lg mx-auto mb-20 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <Card variant="glass" className="p-8 text-center shadow-dramatic">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <LogIn className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              Get Started
            </h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              {hasLocalDataToSync 
                ? "Sign in to sync your local data to the cloud, or continue without an account"
                : "Sign in with your Google account for cloud sync, or try locally first"
              }
            </p>
            </p>
            
            {hasLocalDataToSync && (
              <div className="mb-4 p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded">
                You have local data that can be synced to the cloud when you sign in.
              </div>
            )}
              {error && (
              <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium text-red-700 dark:text-red-300">{error}</span>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <Button
                onClick={handleSignIn}
                disabled={loading || isSigningIn}
                variant="gradient"
                className="w-full h-12 text-base font-semibold group"
                size="lg"
              >
                {isSigningIn ? (
                  <LoadingSpinner size="sm" variant="dots" className="mr-3" />
                ) : (
                  <LogIn className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform" />
                )}
                {isSigningIn ? 'Signing in...' : 'Sign in with Google'}
              </Button>
              
              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
                <span className="text-sm text-muted-foreground font-medium px-4 bg-background/80 backdrop-blur-sm rounded-full">or</span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
              </div>
              
              <Button                onClick={handleContinueAsGuest}
                disabled={loading}
                variant="glass"
                className="w-full h-12 text-base group"
                size="lg"
              >
                <User className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform" />
                Continue without signing in
              </Button>
              
              {isMobile && (
                <div className="text-xs text-muted-foreground text-center p-3 bg-muted/30 rounded-lg">
                  {isSigningIn ? 
                    'If redirected to Google, please complete sign-in and return to this page.' :
                    'You may be redirected to Google to complete sign-in.'
                  }
                </div>
              )}
              
              <div className="text-xs text-muted-foreground text-center mt-4 space-y-1 p-4 bg-gradient-to-r from-background/50 to-accent/5 rounded-lg border border-border/50">
                <p className="flex items-center justify-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  <strong>Sign in:</strong> Cloud sync, backup, access from any device
                </p>
                <p className="flex items-center justify-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  <strong>Local mode:</strong> Your data stays private on this device only
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Features Grid */}
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            Why Choose Elevatr?
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 text-center">
                <feature.icon className="h-12 w-12 mx-auto mb-4 text-blue-600 dark:text-blue-400" />
                <h4 className="text-lg font-semibold mb-3">{feature.title}</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-gray-500 dark:text-gray-400">
          <p>&copy; 2024 Elevatr. Elevate your career, one sprint at a time.</p>
        </div>
      </div>
    </div>
  );
}
