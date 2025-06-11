// Logout options component for handling data after logout
'use client';

import { useState } from 'react';
import { ElevatrButton } from '@/components/ui/ElevatrButton';
import { ElevatrCard, ElevatrCardHeader, ElevatrCardContent } from '@/components/ui/ElevatrCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { 
  LogOut, 
  Trash2, 
  Save, 
  AlertTriangle,
  Shield,
  RotateCcw,
  X
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
      recommended: true
    },
    {
      key: 'keep' as const,
      icon: Save,
      title: 'Keep Data for Later',
      description: 'Save your progress for when you sign in again',
      recommended: false
    },
    {
      key: 'delete' as const,
      icon: Trash2,
      title: 'Delete All Data',
      description: 'Remove all progress from this device',
      recommended: false
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <ElevatrCard 
        variant="glass-strong" 
        className="w-full max-w-md elevatr-animate-fade-in-scale"
      >
        <ElevatrCardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 mr-3">
                <LogOut className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Sign Out Options
                </h2>
                <p className="text-sm text-muted-foreground">
                  Choose what happens to your data
                </p>
              </div>
            </div>
            <ElevatrButton
              onClick={onCancel}
              variant="secondary"
              size="sm"
              className="p-2 w-8 h-8"
              disabled={isLoading}
            >
              <X className="w-4 h-4" />
            </ElevatrButton>
          </div>
        </ElevatrCardHeader>

        <ElevatrCardContent>
          <div className="space-y-3 mb-6">
            {options.map((option, index) => {
              const Icon = option.icon;
              const isSelected = selectedOption === option.key;
              const isCurrentlyLoading = isLoading && isSelected;
              
              return (
                <div
                  key={option.key}
                  className={`relative p-4 rounded-lg border transition-all duration-300 cursor-pointer
                             elevatr-hover-lift ${
                               isSelected 
                                 ? 'border-primary bg-primary/10' 
                                 : 'border-border hover:border-primary/50'
                             }
                             ${isLoading && !isSelected ? 'opacity-50 cursor-not-allowed' : ''}
                             ${index === 0 ? 'elevatr-animate-slide-in-right' : ''}
                             ${index === 1 ? 'elevatr-animate-slide-in-left' : ''}
                             ${index === 2 ? 'elevatr-animate-slide-in-right' : ''}`}
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => !isLoading && handleChoice(option.key)}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center mr-3">
                      {isCurrentlyLoading ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <Icon className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium text-foreground">
                          {option.title}
                        </h3>
                        {option.recommended && (
                          <span className="motivation-badge">
                            Recommended
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {option.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg elevatr-animate-fade-in">
              <div className="flex items-start">
                <AlertTriangle className="w-4 h-4 text-destructive mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-destructive">Operation Failed</h4>
                  <p className="text-sm text-destructive/80">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end mb-4">
            <ElevatrButton
              onClick={onCancel}
              disabled={isLoading}
              variant="secondary"
            >
              Cancel
            </ElevatrButton>
          </div>

          <div className="glass-panel rounded-lg p-3">
            <div className="flex items-start">
              <Shield className="w-4 h-4 text-accent mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-foreground text-sm mb-1">Privacy Protection</h4>
                <p className="text-xs text-muted-foreground">
                  Your data is stored locally on this device. Only you can access it, 
                  and it won&apos;t be shared with anyone else.
                </p>
              </div>
            </div>
          </div>
        </ElevatrCardContent>
      </ElevatrCard>
    </div>
  );
}
