'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LoginPage } from '@/components/auth/LoginPage';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function Login() {
  const router = useRouter();
  const { firebaseUser, loading } = useAuth();

  // Redirect to dashboard if user is already authenticated
  useEffect(() => {
    if (!loading && firebaseUser) {
      router.push('/');
    }
  }, [firebaseUser, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen elevatr-container">
        <div className="text-center">
          <LoadingSpinner size="lg" variant="gradient" />
        </div>
      </div>
    );
  }

  // If user exists, don't show login page (redirect will handle navigation)
  if (firebaseUser) {
    return (
      <div className="flex items-center justify-center min-h-screen elevatr-container">
        <div className="text-center">
          <LoadingSpinner size="lg" variant="gradient" />
        </div>
      </div>
    );
  }

  // Show login page for unauthenticated users
  return <LoginPage />;
}
