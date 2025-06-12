'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { X } from 'lucide-react';

interface PopupPermissionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  instructions: string;
  onRetry: () => void;
}

export const PopupPermissionDialog: React.FC<PopupPermissionDialogProps> = ({
  isOpen,
  onClose,
  instructions,
  onRetry
}) => {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setIsRetrying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Popup Blocked
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            Your browser is blocking popups, which are required for Google sign-in. 
            Please follow these steps to allow popups:
          </p>
          
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <pre className="text-sm text-blue-800 whitespace-pre-wrap font-mono">
              {instructions}
            </pre>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleRetry}
            disabled={isRetrying}
            className="flex-1"
          >
            {isRetrying ? 'Testing...' : 'Try Again'}
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1"
          >
            Cancel
          </Button>
        </div>        <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-700">
            💡 <strong>Tip:</strong> Look for a popup blocked icon (usually a small popup or shield icon) 
            in your browser&apos;s address bar and click it to allow popups for this site.
          </p>
        </div>
      </div>
    </div>
  );
};
