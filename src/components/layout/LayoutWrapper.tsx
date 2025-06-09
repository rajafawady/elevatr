'use client';

import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from './AppLayout';
import { usePathname } from 'next/navigation';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  
  // Don't show AppLayout on login page or when loading
  const isLoginPage = pathname === '/' && !user;
  const shouldShowAppLayout = user && !loading && !isLoginPage;
  
  if (shouldShowAppLayout) {
    return <AppLayout>{children}</AppLayout>;
  }
  
  return <>{children}</>;
}
