'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function AnalyticsPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the new insights page
    router.replace('/insights');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-6 elevatr-animate-fade-in-scale">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full elevatr-gradient-primary flex items-center justify-center elevatr-animate-pulse-glow">
          <LoadingSpinner size="xl" variant="gradient" />
        </div>
        <div className="space-y-2">
          <p className="text-muted-foreground">
            Redirecting to Advanced Insights...
          </p>
        </div>
      </div>
    </div>
  );
}
