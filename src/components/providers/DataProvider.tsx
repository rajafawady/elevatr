'use client';

import { useDataSync } from '@/hooks/useDataSync';

interface DataProviderProps {
  children: React.ReactNode;
}

/**
 * Provider component that initializes data synchronization
 * This should wrap the app to ensure data is loaded on authentication
 */
export function DataProvider({ children }: DataProviderProps) {
  // Initialize data sync
  useDataSync();
  
  return <>{children}</>;
}
