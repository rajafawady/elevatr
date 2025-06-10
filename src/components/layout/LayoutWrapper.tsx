'use client';

import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from './AppLayout';
import { NavigationProgress } from '@/components/ui/NavigationProgress';
import { NavigationSync } from './NavigationSync';
import { NavigationPreloader } from './NavigationPreloader';
import { NavigationStatePersistence } from './NavigationStatePersistence';
import { PWAInstallPrompt } from '@/components/ui/PWAInstallPrompt';
import { usePathname } from 'next/navigation';
import { NetworkStatus, ErrorToast } from '@/components/ui/ErrorNotification';
import { useGlobalErrorHandler } from '@/components/providers/ErrorProvider';
import { AppError } from '@/services/errorHandling';
import { LogoutOptions } from '@/components/auth/LogoutOptions';
import { MigrationPrompt } from '@/components/auth/MigrationPrompt';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const { 
    user, 
    loading, 
    showLogoutOptions, 
    showMigrationPrompt, 
    guestDataSummary,
    handleLogoutChoice,
    setShowLogoutOptions,
    setShowMigrationPrompt,
    migrateGuestData
  } = useAuth();
  const pathname = usePathname();
  const { errors, removeError, retryError, errorItems } = useGlobalErrorHandler();
  
  // Don't show AppLayout on login page or when loading
  const isLoginPage = pathname === '/' && !user;
  const shouldShowAppLayout = user && !loading && !isLoginPage;
  
  // Handle retry by error item
  const handleRetry = (error: AppError) => {
    const errorItem = errorItems.find((item: any) => item.error === error);
    if (errorItem) {
      retryError(errorItem.id);
    }
  };

  // Handle dismiss by index
  const handleDismiss = (index: number) => {
    const errorItem = errorItems[index];
    if (errorItem) {
      removeError(errorItem.id);
    }
  };  if (shouldShowAppLayout) {
    return (
      <AppLayout>
        <NetworkStatus />
        <ErrorToast 
          errors={errors} 
          onRetry={handleRetry} 
          onDismiss={handleDismiss} 
        />
        <NavigationSync />
        <NavigationPreloader />
        <NavigationStatePersistence />
        <NavigationProgress />
        <PWAInstallPrompt />
        {/* Guest Mode UI Components */}
        {showLogoutOptions && (
          <LogoutOptions
            onChoice={handleLogoutChoice}
            onCancel={() => setShowLogoutOptions(false)}
            isVisible={showLogoutOptions}
            userDisplayName={user?.displayName}
          />
        )}
        {showMigrationPrompt && guestDataSummary && (
          <MigrationPrompt
            migrationData={guestDataSummary}
            onAccept={() => migrateGuestData(true).then(() => setShowMigrationPrompt(false))}
            onDecline={() => {
              migrateGuestData(false).then(() => setShowMigrationPrompt(false));
            }}
            isVisible={showMigrationPrompt}
          />
        )}
        {/* <OptimisticStateIndicator />
        {process.env.NODE_ENV === 'development' && <PerformanceIndicator />} */}
        {children}
      </AppLayout>
    );
  }

  return (
    <>
      <NetworkStatus />
      <ErrorToast 
        errors={errors} 
        onRetry={handleRetry} 
        onDismiss={handleDismiss} 
      />
      <NavigationSync />
      <NavigationPreloader />
      <NavigationStatePersistence />
      <NavigationProgress />
      <PWAInstallPrompt />
      {/* Guest Mode UI Components for non-authenticated state */}
      {showLogoutOptions && (
        <LogoutOptions
          onChoice={handleLogoutChoice}
          onCancel={() => setShowLogoutOptions(false)}
          isVisible={showLogoutOptions}
          userDisplayName={user?.displayName}
        />
      )}
      {showMigrationPrompt && guestDataSummary && (
        <MigrationPrompt
          migrationData={guestDataSummary}
          onAccept={() => migrateGuestData(true).then(() => setShowMigrationPrompt(false))}
          onDecline={() => {
            migrateGuestData(false).then(() => setShowMigrationPrompt(false));
          }}
          isVisible={showMigrationPrompt}
        />
      )}
      {children}
    </>
  );
}
