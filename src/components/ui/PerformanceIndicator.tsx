'use client';

import { useState, useEffect } from 'react';
import { useSprintStore, useTaskStore, useUserProgressStore } from '@/stores';
import { ElevatrCard } from '@/components/ui/ElevatrCard';
import { Clock, Zap, CheckCircle } from 'lucide-react';

export function PerformanceIndicator() {
  const [renderTime, setRenderTime] = useState<number>(0);
  const [cacheHits, setCacheHits] = useState<number>(0);
  const { sprints, loading: sprintLoading } = useSprintStore();
  const { tasks, updating } = useTaskStore();
  const { userProgress, loading: progressLoading } = useUserProgressStore();

  useEffect(() => {
    const startTime = performance.now();
    const endTime = performance.now();
    setRenderTime(endTime - startTime);

    // Count cache hits (data available without loading)
    let hits = 0;
    if (sprints.length > 0 && !sprintLoading) hits++;
    if (tasks.length > 0) hits++;
    if (userProgress && !progressLoading) hits++;
    setCacheHits(hits);
  }, [sprints, tasks, userProgress, sprintLoading, progressLoading]);

  const getPerformanceColor = (value: number, thresholds: { good: number; ok: number }) => {
    if (value <= thresholds.good) return 'bg-success/20 text-success border-success/20';
    if (value <= thresholds.ok) return 'bg-badge/20 text-badge border-badge/20';
    return 'bg-destructive/20 text-destructive border-destructive/20';
  };

  return (
    <div className="fixed bottom-4 right-4 z-40 elevatr-animate-fade-in">
      <ElevatrCard variant="glass-strong" className="w-64">
        <div className="elevatr-card-header pb-2">
          <h3 className="text-sm flex items-center gap-2 font-semibold">
            <Zap className="h-4 w-4 text-primary" />
            Performance Monitor
          </h3>
        </div>
        <div className="elevatr-card-content space-y-3">{/* Render Performance */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Render Time</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPerformanceColor(renderTime, { good: 16, ok: 50 })}`}>
              {renderTime.toFixed(1)}ms
            </span>
          </div>          {/* Cache Status */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Cache Hits</span>
            <span className="px-2 py-1 rounded-full text-xs font-medium border bg-primary/20 text-primary border-primary/20">
              {cacheHits}/3
            </span>
          </div>

          {/* Update Status */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Updates</span>
            {updating ? (
              <span className="px-2 py-1 rounded-full text-xs font-medium border bg-badge/20 text-badge border-badge/20 flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                Syncing
              </span>
            ) : (
              <span className="px-2 py-1 rounded-full text-xs font-medium border bg-success/20 text-success border-success/20 flex items-center">
                <CheckCircle className="h-3 w-3 mr-1" />
                Synced
              </span>
            )}
          </div>

          {/* Data Status */}
          <div className="text-xs space-y-1">
            <div className="flex justify-between">
              <span>Sprints:</span>
              <span className={sprintLoading ? 'text-badge' : 'text-success'}>
                {sprintLoading ? 'Loading...' : `${sprints.length} cached`}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Tasks:</span>
              <span className="text-success">{tasks.length} cached</span>
            </div>
            <div className="flex justify-between">
              <span>Progress:</span>
              <span className={progressLoading ? 'text-badge' : 'text-success'}>
                {progressLoading ? 'Loading...' : userProgress ? 'Cached' : 'None'}
              </span>
            </div>
          </div>

          {/* Performance Tips */}
          <div className="text-xs text-muted-foreground pt-2 border-t">
            {renderTime > 50 && (
              <div className="text-badge">⚠ Slow render detected</div>
            )}
            {cacheHits === 3 && (
              <div className="text-success">✓ Optimal cache performance</div>
            )}
            {updating && (
              <div className="text-primary">🔄 Background sync active</div>
            )}
          </div>
        </div>
      </ElevatrCard>
    </div>
  );
}
