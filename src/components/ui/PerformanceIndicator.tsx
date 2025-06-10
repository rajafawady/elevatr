'use client';

import { useState, useEffect } from 'react';
import { useSprintStore, useTaskStore, useUserProgressStore } from '@/stores';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
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
    if (value <= thresholds.good) return 'bg-green-100 text-green-800';
    if (value <= thresholds.ok) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <Card className="w-64 bg-white/95 backdrop-blur-sm shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Zap className="h-4 w-4 text-blue-500" />
            Performance Monitor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Render Performance */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Render Time</span>
            <Badge className={getPerformanceColor(renderTime, { good: 16, ok: 50 })}>
              {renderTime.toFixed(1)}ms
            </Badge>
          </div>

          {/* Cache Status */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Cache Hits</span>
            <Badge className="bg-blue-100 text-blue-800">
              {cacheHits}/3
            </Badge>
          </div>

          {/* Update Status */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Updates</span>
            {updating ? (
              <Badge className="bg-yellow-100 text-yellow-800">
                <Clock className="h-3 w-3 mr-1" />
                Syncing
              </Badge>
            ) : (
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Synced
              </Badge>
            )}
          </div>

          {/* Data Status */}
          <div className="text-xs space-y-1">
            <div className="flex justify-between">
              <span>Sprints:</span>
              <span className={sprintLoading ? 'text-yellow-600' : 'text-green-600'}>
                {sprintLoading ? 'Loading...' : `${sprints.length} cached`}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Tasks:</span>
              <span className="text-green-600">{tasks.length} cached</span>
            </div>
            <div className="flex justify-between">
              <span>Progress:</span>
              <span className={progressLoading ? 'text-yellow-600' : 'text-green-600'}>
                {progressLoading ? 'Loading...' : userProgress ? 'Cached' : 'None'}
              </span>
            </div>
          </div>

          {/* Performance Tips */}
          <div className="text-xs text-muted-foreground pt-2 border-t">
            {renderTime > 50 && (
              <div className="text-orange-600">⚠ Slow render detected</div>
            )}
            {cacheHits === 3 && (
              <div className="text-green-600">✓ Optimal cache performance</div>
            )}
            {updating && (
              <div className="text-blue-600">🔄 Background sync active</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
