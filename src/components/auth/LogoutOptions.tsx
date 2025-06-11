// Logout options component for handling data after logout
'use client';

import { useState } from 'react';
import { ElevatrButton } from '@/components/ui/ElevatrButton';
import { ElevatrCard } from '@/components/ui/ElevatrCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { 
  LogOut, 
  Trash2, 
  Download, 
  Save, 
  AlertTriangle,
  Database,
  Shield,
  RotateCcw
} from 'lucide-react';

interface LogoutOptionsProps {
  onChoice: (option: 'delete' | 'convert' | 'keep') => Promise<void>;
  onCancel: () => void;
  isVisible: boolean;
  userDisplayName?: string;
}

export function LogoutOptions({ 
  onChoice, 
  onCancel, 
  isVisible, 
  userDisplayName 
}: LogoutOptionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState<'delete' | 'convert' | 'keep' | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isVisible) return null;

  const handleChoice = async (option: 'delete' | 'convert' | 'keep') => {
    setIsLoading(true);
    setSelectedOption(option);
    setError(null);
    
    try {
      await onChoice(option);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Operation failed');
      setSelectedOption(null);
    } finally {
      setIsLoading(false);
    }
  };

  const options = [
    {
      key: 'convert' as const,
      icon: RotateCcw,
      title: 'Continue as Guest',
      description: 'Keep your current progress and continue working locally',
      color: 'blue',
      recommended: true
    },
    {
      key: 'keep' as const,
      icon: Save,
      title: 'Keep Data for Later',
      description: 'Save your progress for when you sign in again',
      color: 'green',
      recommended: false
    },
    {
      key: 'delete' as const,
      icon: Trash2,
      title: 'Delete All Data',
      description: 'Remove all progress from this device',
      color: 'red',
      recommended: false
    }
  ];
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <ElevatrCard className="w-full max-w-md max-h-[95dvh] sm:max-h-[80vh] flex flex-col overflow-hidden p-2 sm:p-6 bg-white dark:bg-gray-900 border border-blue-200 dark:border-blue-800 shadow-xl">
        <div className="elevatr-card-header flex-shrink-0">
          <div className="flex items-center mb-4">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 mr-3">
              <LogOut className="w-6 h-6 text-primary dark:text-primary-300" />
            </div>
            <h2 className="text-lg font-semibold text-gray-200 dark:text-white">
              Sign Out Options
            </h2>
          </div>
        </div>

        <div className="elevatr-card-content flex-1 overflow-y-auto min-h-0">
          <div className="mb-6">
            <div className="space-y-3">
              {options.map((option, index) => {
                const Icon = option.icon;
                const isSelected = selectedOption === option.key;
                const isCurrentlyLoading = isLoading && isSelected;
                
                const variantMap = {
                  blue: 'primary',
                  green: 'success', 
                  red: 'destructive'
                } as const;
                
                return (
                  <ElevatrButton
                    key={option.key}
                    onClick={() => handleChoice(option.key)}
                    disabled={isLoading}
                    variant={variantMap[option.color as keyof typeof variantMap]}
                    className={`w-full p-3 text-left h-auto elevatr-animate-fade-in bg-gray-100 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-lg transition-colors duration-150 focus:ring-2 focus:ring-primary/40 focus:outline-none text-sm ${
                      isLoading && !isSelected ? 'opacity-50' : ''
                    }`}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mr-3 bg-background/50 dark:bg-gray-700">
                        {isCurrentlyLoading ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <Icon className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center">
                          <h3 className="font-medium text-gray-900 dark:text-white text-base">
                            {option.title}
                          </h3>
                          {option.recommended && (
                            <span className="ml-2 px-2 py-1 text-xs font-medium bg-primary text-primary-foreground rounded-full">
                              Recommended
                            </span>
                          )}
                        </div>
                        <p className="text-xs mt-1 opacity-80 text-gray-700 dark:text-gray-300">
                          {option.description}
                        </p>
                      </div>
                    </div>
                  </ElevatrButton>
                );
              })}
            </div>
          </div>
          {error && (
            <div className="mb-4 glass-panel border border-destructive/20 dark:border-destructive/40 bg-red-50 dark:bg-red-900/30 rounded-lg p-3">
              <div className="flex items-start">
                <AlertTriangle className="w-4 h-4 text-destructive dark:text-red-400 mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-destructive dark:text-red-200">{error}</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end mb-4 flex-shrink-0">
          <ElevatrButton
            onClick={onCancel}
            disabled={isLoading}
            variant="secondary"
            className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200"
          >
            Cancel
          </ElevatrButton>
        </div>

        <div className="glass-panel rounded-lg p-3 bg-gray-50 dark:bg-gray-800/70 flex-shrink-0">
          <div className="flex items-start">
            <Shield className="w-4 h-4 text-muted-foreground dark:text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground dark:text-gray-300">
              <strong>Privacy Note:</strong> Your data is stored locally on this device. 
              Only you can access it, and it won&apos;t be shared with anyone else.
            </p>
          </div>
        </div>
      </ElevatrCard>
    </div>
  );
}
