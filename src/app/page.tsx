'use client';
import { useAuth } from '@/contexts/AuthContext';
import { LoginPage } from '@/components/auth/LoginPage';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Dashboard } from '@/components/dashboard/Dashboard';

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // If no user at all (neither authenticated nor local), show login options
  if (!user) {
    return <LoginPage />;
  }

  // User exists (either authenticated or local), show dashboard
  return <Dashboard />;
}