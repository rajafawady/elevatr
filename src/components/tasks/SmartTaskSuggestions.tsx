// Smart Task Suggestions Component
'use client';

import { useState, useEffect } from 'react';
import { ElevatrCard } from '@/components/ui/ElevatrCard';
import { ElevatrBadge } from '@/components/ui/ElevatrBadge';
import { Button } from '@/components/ui/Button';
import { SmartTaskEngine, TaskPrioritizationSuggestion, WorkloadAnalysis } from '@/services/smartTaskEngine';
import { Task, Sprint, UserProgress } from '@/types';
import { 
  Brain, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  Calendar,
  Zap,
  Target
} from 'lucide-react';

interface SmartTaskSuggestionsProps {
  tasks: Task[];
  sprints: Sprint[];
  userProgress: UserProgress[];
  onApplySuggestion?: (taskId: string, newPriority: 'low' | 'medium' | 'high') => void;
  className?: string;
}

export function SmartTaskSuggestions({ 
  tasks, 
  sprints, 
  userProgress, 
  onApplySuggestion,
  className = '' 
}: SmartTaskSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<TaskPrioritizationSuggestion[]>([]);
  const [workloadAnalysis, setWorkloadAnalysis] = useState<WorkloadAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSuggestion, setExpandedSuggestion] = useState<string | null>(null);

  useEffect(() => {
    if (tasks.length > 0) {
      setLoading(true);
      try {
        const taskSuggestions = SmartTaskEngine.generateTaskPrioritization(tasks, userProgress, sprints);
        const workload = SmartTaskEngine.analyzeWorkload(tasks, userProgress);
        
        setSuggestions(taskSuggestions);
        setWorkloadAnalysis(workload);
      } catch (error) {
        console.error('Error generating task suggestions:', error);
        setSuggestions([]);
        setWorkloadAnalysis(null);
      } finally {
        setLoading(false);
      }
    } else {
      setSuggestions([]);
      setWorkloadAnalysis(null);
      setLoading(false);
    }
  }, [tasks, userProgress, sprints]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'accent';
      case 'medium': return 'motivation';
      case 'low': return 'journal';
      default: return 'primary';
    }
  };

  const getWorkloadColor = (load: string) => {
    switch (load) {
      case 'overloaded': return 'text-red-600';
      case 'heavy': return 'text-orange-600';
      case 'balanced': return 'text-green-600';
      case 'light': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getEffortIcon = (effort: string) => {
    switch (effort) {
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'medium': return <Clock className="w-4 h-4" />;
      case 'low': return <CheckCircle className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <ElevatrCard variant="glass" className={`p-6 ${className}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg elevatr-gradient-primary">
            <Brain className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-bold elevatr-gradient-text">Smart Task Suggestions</h2>
            <p className="text-sm text-muted-foreground">Analyzing your workload and priorities...</p>
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

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Workload Analysis */}
      {workloadAnalysis && (
        <ElevatrCard variant="glass" className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg elevatr-gradient-accent">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold elevatr-gradient-text">Workload Analysis</h3>
              <p className="text-sm text-muted-foreground">Current capacity and recommendations</p>
            </div>
            <ElevatrBadge variant="accent" className="text-xs">
              {workloadAnalysis.currentLoad}
            </ElevatrBadge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="glass-panel p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-muted-foreground">Current Load</span>
                <span className={`text-lg font-bold capitalize ${getWorkloadColor(workloadAnalysis.currentLoad)}`}>
                  {workloadAnalysis.currentLoad}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                Burnout Risk: {Math.round(workloadAnalysis.burnoutRisk * 100)}%
              </div>
            </div>

            <div className="glass-panel p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-muted-foreground">Next 7 Days</span>
              </div>
              <div className="flex gap-1">
                {Object.entries(workloadAnalysis.dailyTaskDistribution).map(([date, count]) => (
                  <div 
                    key={date}
                    className="flex-1 text-center"
                    title={`${new Date(date).toLocaleDateString()}: ${count} tasks`}
                  >
                    <div 
                      className={`h-8 rounded-sm flex items-center justify-center text-xs font-medium ${
                        count > 5 ? 'bg-red-500 text-white' :
                        count > 3 ? 'bg-orange-500 text-white' :
                        count > 1 ? 'bg-green-500 text-white' :
                        'bg-blue-500 text-white'
                      }`}
                    >
                      {count}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {workloadAnalysis.recommendations.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-foreground">Recommendations:</h4>
              <ul className="space-y-1">
                {workloadAnalysis.recommendations.map((rec, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                    <Zap className="w-3 h-3 text-primary" />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </ElevatrCard>
      )}

      {/* Task Priority Suggestions */}
      <ElevatrCard variant="glass" className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg elevatr-gradient-primary">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold elevatr-gradient-text">Smart Task Suggestions</h2>
            <p className="text-sm text-muted-foreground">
              AI-powered priority recommendations based on your patterns
            </p>
          </div>
          <ElevatrBadge variant="primary" className="text-xs">
            {suggestions.length} suggestion{suggestions.length !== 1 ? 's' : ''}
          </ElevatrBadge>
        </div>

        {suggestions.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-3" />
            <p className="text-muted-foreground">
              No priority adjustments needed! Your current task priorities look optimal.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {suggestions.map((suggestion, index) => {
              const task = tasks.find(t => t.id === suggestion.taskId);
              if (!task) return null;

              return (
                <div 
                  key={suggestion.taskId}
                  className="elevatr-animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="glass-panel p-4 rounded-lg hover:bg-primary/5 transition-all duration-300">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg flex-shrink-0 ${
                        suggestion.suggestedPriority === 'high' ? 'elevatr-gradient-accent' :
                        suggestion.suggestedPriority === 'medium' ? 'elevatr-gradient-motivation' :
                        'elevatr-gradient-journal'
                      }`}>
                        {getEffortIcon(suggestion.estimatedEffort)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-foreground truncate">
                            {task.title}
                          </h3>
                          <ElevatrBadge 
                            variant={getPriorityColor(suggestion.suggestedPriority)}
                            className="text-xs"
                          >
                            {suggestion.suggestedPriority} priority
                          </ElevatrBadge>
                          {task.priority !== suggestion.suggestedPriority && (
                            <span className="text-xs text-muted-foreground">
                              (currently {task.priority})
                            </span>
                          )}
                        </div>
                        
                        <div className="space-y-2 mb-3">
                          {suggestion.reasons.map((reason, idx) => (
                            <div key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                              <Target className="w-3 h-3 text-primary" />
                              {reason}
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Confidence: {Math.round(suggestion.confidence * 100)}%</span>
                            <span>Best time: {suggestion.bestTimeOfDay}</span>
                            <span>Effort: {suggestion.estimatedEffort}</span>
                          </div>
                          
                          {task.priority !== suggestion.suggestedPriority && onApplySuggestion && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onApplySuggestion(task.id, suggestion.suggestedPriority)}
                              className="text-xs h-7 px-3"
                            >
                              Apply Suggestion
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ElevatrCard>
    </div>
  );
}
