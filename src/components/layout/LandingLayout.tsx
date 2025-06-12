'use client';

import { Header } from './Header';

interface LandingLayoutProps {
  children: React.ReactNode;
}

export function LandingLayout({ children }: LandingLayoutProps) {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="w-full">
        {children}
      </main>
    </div>
  );
}
