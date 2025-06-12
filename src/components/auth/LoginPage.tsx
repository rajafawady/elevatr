'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ElevatrButton } from '@/components/ui/ElevatrButton';
import { ElevatrCard } from '@/components/ui/ElevatrCard';
import { LogIn, Trophy, Target, Calendar, BarChart3, User, Mail } from 'lucide-react';
import { getAuthErrorMessage } from '@/lib/auth-utils';
import { useGlobalErrorHandler } from '@/components/providers/ErrorProvider';
import { InlineError } from '@/components/ui/ErrorNotification';
import { PopupPermissionDialog } from './PopupPermissionDialog';
import { EmailPasswordForm } from './EmailPasswordForm';

export function LoginPage() {
  const { 
    signInWithGoogle,
    signInWithEmailAndPassword,
    signUpWithEmailAndPassword, 
    continueAsGuest, 
    loading, 
    isMobile, 
    hasLocalDataToSync,
    showPopupDialog,
    popupInstructions,
    setShowPopupDialog,
    retrySignIn
  } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEmailPasswordForm, setShowEmailPasswordForm] = useState(false);
  
  const handleSignIn = async () => {
    setIsSigningIn(true);
    setError(null);
    
    try {
      await signInWithGoogle();

    } catch (error: unknown) {
      const errorMessage = getAuthErrorMessage(error as Error);
      setError(errorMessage);
      
      // If popup is blocked, show email/password form as fallback
      if ((error as any)?.code === 'auth/popup-blocked') {
        setShowEmailPasswordForm(true);
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleEmailPasswordSignIn = async (email: string, password: string) => {
    setError(null);
    try {
      await signInWithEmailAndPassword(email, password);
    } catch (error: unknown) {
      setError(getAuthErrorMessage(error as Error));
      throw error; // Re-throw to let the form handle it
    }
  };

  const handleEmailPasswordSignUp = async (email: string, password: string) => {
    setError(null);
    try {
      await signUpWithEmailAndPassword(email, password);
    } catch (error: unknown) {
      setError(getAuthErrorMessage(error as Error));
      throw error; // Re-throw to let the form handle it
    }
  };
  const handleContinueAsGuest = () => {
    try {
      continueAsGuest();
    } catch (error: unknown) {
      setError('Failed to continue as guest. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center elevatr-container relative overflow-hidden w-full">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-accent/10 to-primary/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8 elevatr-animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-6">
            <h1 className="text-4xl font-bold elevatr-gradient-text">
              Elevatr
            </h1>
          </div>
          <p className="text-muted-foreground">
            Welcome back! Sign in to continue your career journey.
          </p>
        </div>        {/* Login Card */}
        <div className="elevatr-animate-slide-in-up">
          {showEmailPasswordForm ? (
            <EmailPasswordForm
              onSignIn={handleEmailPasswordSignIn}
              onSignUp={handleEmailPasswordSignUp}
              loading={loading}
              error={error}
              onBack={() => setShowEmailPasswordForm(false)}
            />
          ) : (
            <ElevatrCard variant="glass-strong" className="elevatr-card-content text-center">
              <h2 className="text-2xl font-bold mb-4 elevatr-gradient-text">
                Sign In
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                {hasLocalDataToSync 
                  ? "Sign in to sync your local data to the cloud, or continue without an account"
                  : "Choose how you'd like to get started"
                }
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
                <ElevatrButton
                  onClick={handleSignIn}
                  disabled={loading || isSigningIn}
                  variant="motivation"
                  className="w-full h-12 text-base font-semibold group"
                  size="lg"
                >
                  {isSigningIn ? (
                    <LoadingSpinner size="sm" variant="dots" className="mr-3" />
                  ) : (
                    <LogIn className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform" />
                  )}
                  {isSigningIn ? 'Signing in...' : 'Sign in with Google'}
                </ElevatrButton>

                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
                  <span className="text-sm text-muted-foreground font-medium px-4 bg-background/80 backdrop-blur-sm rounded-full">or</span>
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
                </div>

                <ElevatrButton
                  onClick={() => setShowEmailPasswordForm(true)}
                  disabled={loading}
                  variant="secondary"
                  className="w-full h-12 text-base group"
                  size="lg"
                >
                  <Mail className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform" />
                  Sign in with Email
                </ElevatrButton>

                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
                  <span className="text-sm text-muted-foreground font-medium px-4 bg-background/80 backdrop-blur-sm rounded-full">or</span>
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
                </div>

                <ElevatrButton
                  onClick={handleContinueAsGuest}
                  disabled={loading}
                  variant="secondary"
                  className="w-full h-12 text-base group"
                  size="lg"
                >
                  <User className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform" />
                  Continue in Local Mode
                </ElevatrButton>
              </div>
              
              <div className="text-xs text-muted-foreground text-center mt-6 space-y-2 p-4 bg-muted/20 rounded-lg">
                <p className="flex items-center justify-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></span>
                  <span><strong>Sign in:</strong> Cloud sync, backup, access from any device</span>
                </p>
                <p className="flex items-center justify-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-yellow-500 flex-shrink-0"></span>
                  <span><strong>Local mode:</strong> Your data stays private on this device only</span>
                </p>
              </div>
            </ElevatrCard>
          )}
        </div>

        {/* Link to Landing Page */}
        <div className="text-center mt-8">
          <p className="text-muted-foreground text-sm">
            New to Elevatr?{' '}
            <a href="/landing" className="text-primary hover:text-primary/80 transition-colors underline">
              Learn more about our platform
            </a>
          </p>
        </div>
      </div>

      {/* Popup Permission Dialog */}
      <PopupPermissionDialog
        isOpen={showPopupDialog}
        onClose={() => setShowPopupDialog(false)}
        instructions={popupInstructions}
        onRetry={retrySignIn}
      />
    </div>
  );
}
