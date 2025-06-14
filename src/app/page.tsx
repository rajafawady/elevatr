'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Dashboard } from '@/components/dashboard/Dashboard';

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();
  // Redirect to landing page if no user is present
  useEffect(() => {
    if (!loading && !user) {
      router.push('/landing');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen elevatr-container">
        <div className="text-center">
          <LoadingSpinner size="lg" variant="gradient" />
        </div>
      </div>
    );
  }

  // If no user, don't show dashboard (redirect will handle navigation)
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen elevatr-container">
        <div className="text-center">
          <LoadingSpinner size="lg" variant="gradient" />
        </div>
      </div>
    );
  }

  // User exists (either authenticated or local), show dashboard
  return <Dashboard />;
}