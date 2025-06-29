'use client';

import Link from 'next/link';
import { ElevatrButton } from '@/components/ui/ElevatrButton';
import { ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md mx-auto">
        <div className="space-y-2">
          <h1 className="text-6xl font-bold elevatr-gradient-text">404</h1>
          <h2 className="text-2xl font-semibold text-foreground">Page Not Found</h2>
          <p className="text-muted-foreground">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <ElevatrButton variant="primary" className="w-full sm:w-auto">
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </ElevatrButton>
          </Link>
          <ElevatrButton
            variant="secondary"
            onClick={() => window.history.back()}
            className="w-full sm:w-auto"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </ElevatrButton>
        </div>
      </div>
    </div>
  );
}
