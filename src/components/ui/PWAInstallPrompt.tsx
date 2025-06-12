'use client';

import { useState, useEffect } from 'react';
import { ElevatrButton } from '@/components/ui/ElevatrButton';
import { ElevatrCard } from '@/components/ui/ElevatrCard';
import { X, Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const checkIfInstalled = () => {
      if (typeof window !== 'undefined') {
        // Check for standalone mode (iOS)
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        // Check for PWA installed state
        const isInWebAppiOS = (window.navigator as any).standalone === true;
        // Check for Android
        const isInWebAppChrome = window.matchMedia('(display-mode: standalone)').matches;
        
        setIsInstalled(isStandalone || isInWebAppiOS || isInWebAppChrome);
      }
    };

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Don't show prompt immediately, wait for user interaction
      setTimeout(() => {
        setShowInstallPrompt(true);
      }, 3000); // Show after 3 seconds
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    checkIfInstalled();

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowInstallPrompt(false);
    }
    
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    // Remember that user dismissed, don't show again for this session
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('elevatr_install_dismissed', 'true');
    }
  };

  // Don't show if already installed or user dismissed
  if (isInstalled || !showInstallPrompt || !deferredPrompt) {
    return null;
  }

  // Check if user already dismissed this session
  if (typeof window !== 'undefined' && sessionStorage.getItem('elevatr_install_dismissed')) {
    return null;
  }
  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50 elevatr-animate-slide-up">
      <ElevatrCard variant="glass-strong">
        <div className="elevatr-card-content">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Download className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-sm">Install Elevatr</h3>
            </div>            
            <div className="cursor-pointer" onClick={handleDismiss}>
              <span className="sr-only">Dismiss</span>
              <X className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Install Elevatr for a faster, native-like experience with offline access.
          </p>
          <div className="flex space-x-2">
            <ElevatrButton
              onClick={handleInstallClick}
              variant="motivation"
              size="sm"
              className="flex-1"
            >
              Install
            </ElevatrButton>
            <ElevatrButton
              onClick={handleDismiss}
              variant="secondary"
              size="sm"
            >
              Not now
            </ElevatrButton>
          </div>
        </div>
      </ElevatrCard>
    </div>
  );
}
