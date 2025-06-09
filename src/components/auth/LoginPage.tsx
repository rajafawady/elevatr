'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LogIn, Trophy, Target, Calendar, BarChart3, AlertCircle } from 'lucide-react';
import { getAuthErrorMessage } from '@/lib/auth-utils';

export function LoginPage() {
  const { signInWithGoogle, signInWithGooglePopup, loading } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async (usePopup = false) => {
    setIsSigningIn(true);
    setError(null);
    
    try {
      if (usePopup) {
        await signInWithGooglePopup();
      } else {
        await signInWithGoogle();
      }    } catch (error: any) {
      console.error('Sign in error:', error);
      setError(getAuthErrorMessage(error));
    } finally {
      setIsSigningIn(false);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">
            Elevatr
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Accelerate your career growth with structured sprints, daily tracking, and actionable insights
          </p>
        </div>        {/* Login Card */}
        <div className="max-w-md mx-auto mb-16">
          <Card className="p-8 text-center">
            <h2 className="text-2xl font-semibold mb-6">Get Started</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Sign in with your Google account to start tracking your career journey
            </p>
            
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            <div className="space-y-3">
              <Button
                onClick={() => handleSignIn(false)}
                disabled={loading || isSigningIn}
                className="w-full flex items-center justify-center gap-3"
                size="lg"
              >
                {isSigningIn ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <LogIn className="h-5 w-5" />
                )}
                {isSigningIn ? 'Signing in...' : 'Sign in with Google'}
              </Button>
              
              <div className="text-sm text-gray-500">
                Having trouble with popups?{' '}
                <button
                  onClick={() => handleSignIn(true)}
                  disabled={loading || isSigningIn}
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  Try popup sign-in
                </button>
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
