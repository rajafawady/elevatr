// Error Provider component for global error management
'use client';

import React, { createContext, useContext } from 'react';
import { useErrorHandler } from '@/hooks/useErrorHandler';

interface ErrorContextType {
  errorHandler: ReturnType<typeof useErrorHandler>;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export const ErrorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const errorHandler = useErrorHandler();

  return (
    <ErrorContext.Provider value={{ errorHandler }}>
      {children}
    </ErrorContext.Provider>
  );
};

export const useGlobalErrorHandler = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useGlobalErrorHandler must be used within an ErrorProvider');
  }
  return context.errorHandler;
};
