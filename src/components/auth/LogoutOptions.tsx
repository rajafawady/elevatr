// Logout options component for handling data after logout
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-lg w-full p-6 bg-white dark:bg-gray-800">
        <div className="flex items-center mb-4">
          <LogOut className="w-6 h-6 text-gray-600 mr-2" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Sign Out Options
          </h2>
        </div>

        <div className="mb-6">
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-4">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-amber-900 dark:text-amber-100 mb-1">
                  What would you like to do with your data?
                </h3>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  {userDisplayName ? `Hi ${userDisplayName}, you're` : "You're"} signing out. 
                  Choose what happens to your progress on this device.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {options.map((option) => {
              const Icon = option.icon;
              const isSelected = selectedOption === option.key;
              const isCurrentlyLoading = isLoading && isSelected;
              
              return (
                <button
                  key={option.key}
                  onClick={() => handleChoice(option.key)}
                  disabled={isLoading}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                    option.color === 'blue'
                      ? 'border-blue-200 hover:border-blue-300 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800'
                      : option.color === 'green'
                      ? 'border-green-200 hover:border-green-300 bg-green-50 dark:bg-green-900/20 dark:border-green-800'
                      : 'border-red-200 hover:border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800'
                  } ${
                    isLoading && !isSelected
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${
                      option.color === 'blue'
                        ? 'bg-blue-100 dark:bg-blue-800'
                        : option.color === 'green'
                        ? 'bg-green-100 dark:bg-green-800'
                        : 'bg-red-100 dark:bg-red-800'
                    }`}>
                      {isCurrentlyLoading ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <Icon className={`w-5 h-5 ${
                          option.color === 'blue'
                            ? 'text-blue-600'
                            : option.color === 'green'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`} />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h3 className={`font-medium ${
                          option.color === 'blue'
                            ? 'text-blue-900 dark:text-blue-100'
                            : option.color === 'green'
                            ? 'text-green-900 dark:text-green-100'
                            : 'text-red-900 dark:text-red-100'
                        }`}>
                          {option.title}
                        </h3>
                        {option.recommended && (
                          <span className="ml-2 px-2 py-1 text-xs font-medium bg-blue-600 text-white rounded-full">
                            Recommended
                          </span>
                        )}
                      </div>
                      <p className={`text-sm mt-1 ${
                        option.color === 'blue'
                          ? 'text-blue-700 dark:text-blue-300'
                          : option.color === 'green'
                          ? 'text-green-700 dark:text-green-300'
                          : 'text-red-700 dark:text-red-300'
                      }`}>
                        {option.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-start">
              <AlertTriangle className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <Button
            onClick={onCancel}
            disabled={isLoading}
            variant="outline"
          >
            Cancel
          </Button>
        </div>

        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-start">
            <Shield className="w-4 h-4 text-gray-500 mr-2 mt-0.5 flex-shrink-0" />            <p className="text-xs text-gray-600 dark:text-gray-400">
              <strong>Privacy Note:</strong> Your data is stored locally on this device. 
              Only you can access it, and it won&apos;t be shared with anyone else.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
