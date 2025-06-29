// Smart Insights Component - AI-powered insights for user progress
'use client';

import { useState, useEffect } from 'react';
import { ElevatrCard } from '@/components/ui/ElevatrCard';
import { ElevatrBadge } from '@/components/ui/ElevatrBadge';
import { IntelligenceEngine, ProgressInsight } from '@/services/intelligenceEngine';
import { Sprint, UserProgress } from '@/types';
import { 
  Brain, 
  TrendingUp, 
  Target, 
  Trophy, 
  AlertTriangle, 
  Lightbulb,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface SmartInsightsProps {
  sprints: Sprint[];
  userProgress: UserProgress[];
  showExpanded?: boolean;
  className?: string;
}

export function SmartInsights({ sprints, userProgress, showExpanded = false, className = '' }: SmartInsightsProps) {
  const [insights, setInsights] = useState<ProgressInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedInsight, setExpandedInsight] = useState<string | null>(null);

  useEffect(() => {
    if (sprints.length > 0 && userProgress.length > 0) {
      setLoading(true);
      try {
        const generatedInsights = IntelligenceEngine.generateProgressInsights(sprints, userProgress);
        setInsights(generatedInsights);
      } catch (error) {
        console.error('Error generating insights:', error);
        setInsights([]);
      } finally {
        setLoading(false);
      }
    } else {
      setInsights([]);
      setLoading(false);
    }
  }, [sprints, userProgress]);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'pattern':
        return <Brain className="w-5 h-5" />;
      case 'prediction':
        return <TrendingUp className="w-5 h-5" />;
      case 'recommendation':
        return <Lightbulb className="w-5 h-5" />;
      case 'achievement':
        return <Trophy className="w-5 h-5" />;
      default:
        return <Sparkles className="w-5 h-5" />;
    }
  };
  const getInsightColor = (type: string, priority: string) => {
    if (priority === 'high') return 'accent';
    if (type === 'achievement') return 'success';
    if (type === 'pattern') return 'primary';
    if (type === 'prediction') return 'motivation';
    return 'journal';
  };

  const getPriorityIcon = (priority: string) => {
    if (priority === 'high') return <AlertTriangle className="w-4 h-4" />;
    if (priority === 'medium') return <Target className="w-4 h-4" />;
    return null;
  };

  if (loading) {
    return (
      <ElevatrCard variant="glass" className={`p-6 ${className}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg elevatr-gradient-primary">
            <Brain className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-bold elevatr-gradient-text">AI Insights</h2>
            <p className="text-sm text-muted-foreground">Analyzing your progress patterns...</p>
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-muted rounded-lg w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded-lg w-1/2"></div>
            </div>
          ))}
        </div>
      </ElevatrCard>
    );
  }

  if (insights.length === 0) {
    return (
      <ElevatrCard variant="glass" className={`p-6 ${className}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg elevatr-gradient-primary">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold elevatr-gradient-text">AI Insights</h2>
            <p className="text-sm text-muted-foreground">Complete more sprints to unlock insights</p>
          </div>
        </div>
        <div className="text-center py-8">
          <Sparkles className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">
            Keep tracking your progress! AI insights will appear as you complete more tasks and sprints.
          </p>
        </div>
      </ElevatrCard>
    );
  }

  return (
    <ElevatrCard variant="glass" className={`p-6 ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg elevatr-gradient-primary">
          <Brain className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold elevatr-gradient-text">AI Insights</h2>
          <p className="text-sm text-muted-foreground">
            Personalized insights powered by your progress data
          </p>
        </div>
        <ElevatrBadge variant="primary" className="text-xs">
          {insights.length} insight{insights.length !== 1 ? 's' : ''}
        </ElevatrBadge>
      </div>      <div className="space-y-4">
        {insights.slice(0, showExpanded ? insights.length : 3).map((insight, index) => (
          <div 
            key={insight.id}
            className="elevatr-animate-fade-in-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="glass-panel p-4 rounded-lg hover:bg-primary/5 transition-all duration-300">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg flex-shrink-0 ${
                  insight.type === 'achievement' ? 'elevatr-gradient-success' :
                  insight.type === 'pattern' ? 'elevatr-gradient-primary' :
                  insight.type === 'prediction' ? 'elevatr-gradient-warning' :
                  'elevatr-gradient-accent'
                }`}>
                  {getInsightIcon(insight.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-foreground">
                      {insight.title}
                    </h3>
                    {getPriorityIcon(insight.priority)}
                    <ElevatrBadge 
                      variant={getInsightColor(insight.type, insight.priority)}
                      className="text-xs"
                    >
                      {insight.type}
                    </ElevatrBadge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">
                    {insight.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>Confidence: {Math.round(insight.confidence * 100)}%</span>
                      <span>•</span>
                      <span>{insight.createdAt.toLocaleDateString()}</span>
                    </div>
                    
                    {insight.actionable && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setExpandedInsight(
                          expandedInsight === insight.id ? null : insight.id
                        )}
                        className="text-xs h-7 px-2"
                      >
                        Details
                        <ChevronRight className={`w-3 h-3 ml-1 transition-transform ${
                          expandedInsight === insight.id ? 'rotate-90' : ''
                        }`} />
                      </Button>
                    )}
                  </div>
                  
                  {expandedInsight === insight.id && insight.data && (
                    <div className="mt-4 p-3 rounded-lg bg-muted/50 border border-border/50">
                      <h4 className="text-sm font-medium mb-2">Detailed Analysis</h4>                      <div className="text-xs text-muted-foreground space-y-1">
                        {insight.id === 'sprint-success-pattern' && (
                          <>
                            <div>Optimal sprint duration: {insight.data.optimalDuration} days</div>
                            <div>Success rate: {Math.round(insight.data.successRate * 100)}%</div>
                            <div>Consistency threshold: {Math.round(insight.data.consistencyThreshold * 100)}%</div>
                          </>
                        )}
                        {insight.id === 'productivity-pattern' && (
                          <>
                            <div>Best productivity days: {insight.data.bestDays.join(', ')}</div>
                            <div>Weekly pattern analysis available</div>
                          </>
                        )}
                        {insight.id === 'completion-trend' && (
                          <>
                            <div>Trend direction: {insight.data.trend > 0 ? 'Improving' : 'Declining'}</div>
                            <div>Change rate: {Math.round(Math.abs(insight.data.trend))}%</div>
                          </>
                        )}
                        {insight.id === 'sprint-risk-assessment' && (
                          <>
                            <div>Days elapsed: {insight.data.daysElapsed}</div>
                            <div>Progress ratio: {Math.round(insight.data.progressRatio * 100)}%</div>
                            <div>Completion ratio: {Math.round(insight.data.completionRatio * 100)}%</div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ElevatrCard>
  );
}
