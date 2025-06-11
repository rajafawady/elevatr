// Data migration prompt component
'use client';

import { useState } from 'react';
import { ElevatrButton } from '@/components/ui/ElevatrButton';
import { ElevatrCard } from '@/components/ui/ElevatrCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { 
  Database, 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  Calendar, 
  Target,
  X
} from 'lucide-react';
import * as dataMigration from '@/services/dataMigration';

interface MigrationPromptProps {
  migrationData: dataMigration.DataToMigrate;
  onAccept: () => Promise<void>;
  onDecline: () => void;
  isVisible: boolean;
}

export function MigrationPrompt({ 
  migrationData, 
  onAccept, 
  onDecline, 
  isVisible 
}: MigrationPromptProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isVisible) return null;

  const handleAccept = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await onAccept();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Migration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
<ElevatrCard className="w-full max-w-md max-h-[70vh] sm:max-h-[90vh] overflow-y-auto p-2 sm:p-6 bg-white dark:bg-gray-800 border-blue-200 dark:border-blue-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Database className="w-6 h-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Import Local Progress
            </h2>
          </div>
          <ElevatrButton
            onClick={onDecline}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            disabled={isLoading}
          >
            <X className="w-5 h-5" />
          </ElevatrButton>
        </div>

        <div className="mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                  Local Progress Found
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  We found progress from your previous session. Would you like to import it into your account?
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Sprints
                </span>
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {migrationData.sprints.length}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center">
                <Target className="w-4 h-4 text-gray-500 mr-2" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tasks Completed
                </span>
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {migrationData.totalTasks}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center">
                <FileText className="w-4 h-4 text-gray-500 mr-2" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Journal Entries
                </span>
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {migrationData.totalJournalEntries}
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        )}

        <div className="flex space-x-3">
          <ElevatrButton
            onClick={handleAccept}
            disabled={isLoading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Import Progress
              </>
            )}
          </ElevatrButton>
          
          <ElevatrButton
            onClick={onDecline}
            disabled={isLoading}
            variant="secondary"
            className="flex-1"
          >
            Skip for Now
          </ElevatrButton>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
          Your local progress will remain available until you import or clear it.
        </p>
      </ElevatrCard>
    </div>
  );
}

interface MigrationResultProps {
  result: dataMigration.MigrationResult;
  onClose: () => void;
  isVisible: boolean;
}

export function MigrationResult({ result, onClose, isVisible }: MigrationResultProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <ElevatrCard className="w-full max-w-md max-h-[90vh] overflow-y-auto p-4 sm:p-6 bg-white dark:bg-gray-800">
        <div className="text-center">
          {result.success ? (
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
          ) : (
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          )}
          
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {result.success ? 'Import Successful!' : 'Import Failed'}
          </h2>
          
          {result.success ? (
            <div className="space-y-2 mb-6">
              <p className="text-gray-600 dark:text-gray-400">
                Your local progress has been successfully imported.
              </p>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <p>• {result.migratedData.sprints} sprints imported</p>
                <p>• {result.migratedData.tasks} tasks migrated</p>
                <p>• {result.migratedData.journalEntries} journal entries imported</p>
              </div>
            </div>
          ) : (
            <div className="mb-6">
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                There was an issue importing your data:
              </p>
              <div className="text-sm text-red-600 dark:text-red-400">
                {result.errors.map((error, index) => (
                  <p key={index}>• {error}</p>
                ))}
              </div>
            </div>
          )}
          
          <ElevatrButton
            onClick={onClose}
            className="w-full"
          >
            Continue
          </ElevatrButton>
        </div>
      </ElevatrCard>
    </div>
  );
}
