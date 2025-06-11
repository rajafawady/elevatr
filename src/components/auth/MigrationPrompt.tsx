// Data migration prompt component
'use client';

import { useState } from 'react';
import { ElevatrButton } from '@/components/ui/ElevatrButton';
import { ElevatrCard, ElevatrCardHeader, ElevatrCardContent } from '@/components/ui/ElevatrCard';
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <ElevatrCard 
        variant="glass-strong" 
        className="w-full max-w-md max-h-[85vh] overflow-y-auto elevatr-animate-fade-in-scale"
      >
        <ElevatrCardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-success/20 mr-3">
                <Database className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Import Local Progress
                </h2>
                <p className="text-sm text-muted-foreground">
                  We found your previous session data
                </p>
              </div>
            </div>
            <ElevatrButton
              onClick={onDecline}
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
          <div className="mb-6">
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-4 elevatr-animate-slide-in-right">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-foreground mb-1">
                    Local Progress Found
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    We found progress from your previous session. Would you like to import it into your account?
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { icon: Calendar, label: 'Sprints', value: migrationData.sprints.length, color: 'primary' },
                { icon: Target, label: 'Tasks Completed', value: migrationData.totalTasks, color: 'success' },
                { icon: FileText, label: 'Journal Entries', value: migrationData.totalJournalEntries, color: 'accent' }
              ].map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className={`flex items-center justify-between p-3 bg-muted rounded-lg 
                               transition-all duration-300 elevatr-hover-lift
                               elevatr-animate-slide-in-left`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center">
                      <Icon className="w-4 h-4 text-muted-foreground mr-2" />
                      <span className="text-sm font-medium text-foreground">
                        {stat.label}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {stat.value}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg elevatr-animate-fade-in">
              <div className="flex items-start">
                <AlertCircle className="w-4 h-4 text-destructive mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-destructive">Import Failed</h4>
                  <p className="text-sm text-destructive/80">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex space-x-3 mb-4">
            <ElevatrButton
              onClick={handleAccept}
              disabled={isLoading}
              variant="primary"
              className="flex-1"
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

          <div className="glass-panel rounded-lg p-3">
            <p className="text-xs text-muted-foreground text-center">
              Your local progress will remain available until you import or clear it.
            </p>
          </div>
        </ElevatrCardContent>
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <ElevatrCard 
        variant="glass-strong" 
        className="w-full max-w-md max-h-[90vh] overflow-y-auto elevatr-animate-fade-in-scale"
      >
        <ElevatrCardContent className="text-center p-6">
          {result.success ? (
            <div className="p-3 rounded-full bg-success/20 w-fit mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-success" />
            </div>
          ) : (
            <div className="p-3 rounded-full bg-destructive/20 w-fit mx-auto mb-4">
              <AlertCircle className="w-12 h-12 text-destructive" />
            </div>
          )}
          
          <h2 className="text-xl font-semibold text-foreground mb-2">
            {result.success ? 'Import Successful!' : 'Import Failed'}
          </h2>
          
          {result.success ? (
            <div className="space-y-2 mb-6">
              <p className="text-muted-foreground">
                Your local progress has been successfully imported.
              </p>
              <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                <p>• {result.migratedData.sprints} sprints imported</p>
                <p>• {result.migratedData.tasks} tasks migrated</p>
                <p>• {result.migratedData.journalEntries} journal entries imported</p>
              </div>
            </div>
          ) : (
            <div className="mb-6">
              <p className="text-muted-foreground mb-2">
                There was an issue importing your data:
              </p>
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                {result.errors.map((error, index) => (
                  <p key={index}>• {error}</p>
                ))}
              </div>
            </div>
          )}
          
          <ElevatrButton
            onClick={onClose}
            variant="primary"
            className="w-full"
          >
            Continue
          </ElevatrButton>
        </ElevatrCardContent>
      </ElevatrCard>
    </div>
  );
}
