// Predictive Analytics Dashboard Component
'use client';

import { useState, useEffect } from 'react';
import { ElevatrCard } from '@/components/ui/ElevatrCard';
import { ElevatrBadge } from '@/components/ui/ElevatrBadge';
import { ElevatrButton } from '@/components/ui/ElevatrButton';
import { PredictiveEngine, SprintPrediction, CareerProgressPrediction, RiskFactor } from '@/services/predictiveEngine';
import { Task, Sprint, UserProgress } from '@/types';
import { 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Calendar,
  Target,
  Brain,
  Clock,
  BarChart3,
  Zap,
  TrendingDown,
  Activity
} from 'lucide-react';

interface PredictiveAnalyticsProps {
  tasks: Task[];
  sprints: Sprint[];
  userProgress: UserProgress[];
  className?: string;
}

export function PredictiveAnalytics({ 
  tasks, 
  sprints, 
  userProgress, 
  className = '' 
}: PredictiveAnalyticsProps) {
  const [sprintPredictions, setSprintPredictions] = useState<SprintPrediction[]>([]);
  const [careerPredictions, setCareerPredictions] = useState<CareerProgressPrediction | null>(null);
  const [riskFactors, setRiskFactors] = useState<RiskFactor[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'sprints' | 'career' | 'risks'>('sprints');

  useEffect(() => {
    if (userProgress.length > 0 && sprints.length > 0) {
      setLoading(true);
      try {
        // Generate predictions for active sprints
        const predictions: SprintPrediction[] = [];
        const allRisks: RiskFactor[] = [];        sprints.forEach(sprint => {
          if (sprint.status === 'active') {
            const sprintProgress = userProgress.find(up => up.sprintId === sprint.id);
            if (sprintProgress) {
              const prediction = PredictiveEngine.predictSprintOutcome(
                sprint,
                sprintProgress,
                userProgress
              );
              predictions.push(prediction);
              allRisks.push(...prediction.riskFactors);

              // Also assess additional risks
              const riskAssessment = PredictiveEngine.assessSprintRisk(
                sprint,
                sprintProgress
              );
              // Note: assessSprintRisk returns warnings and urgentActions, not riskFactors
            }
          }
        });

        // Generate career predictions
        if (sprints.length > 0 && userProgress.length > 0) {
          const careerPrediction = PredictiveEngine.predictCareerProgress(
            sprints,
            userProgress,
            '6months'
          );
          setCareerPredictions(careerPrediction);
        }

        setSprintPredictions(predictions);
        setRiskFactors(allRisks);
      } catch (error) {
        console.error('Error generating predictive analytics:', error);
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [tasks, sprints, userProgress]);

  const getRiskColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-orange-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getRiskIcon = (impact: string) => {
    switch (impact) {
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'medium': return <Clock className="w-4 h-4" />;
      case 'low': return <CheckCircle className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const getSuccessColor = (probability: number) => {
    if (probability >= 0.8) return 'text-green-600';
    if (probability >= 0.6) return 'text-blue-600';
    if (probability >= 0.4) return 'text-orange-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <ElevatrCard variant="glass" className={`p-6 ${className}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg elevatr-gradient-primary">
            <Brain className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-bold elevatr-gradient-text">Predictive Analytics</h2>
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

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <ElevatrCard variant="glass" className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg elevatr-gradient-primary">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold elevatr-gradient-text">Predictive Analytics</h2>
            <p className="text-sm text-muted-foreground">
              AI-powered insights into your career development trajectory
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6">
          <ElevatrButton
            variant={activeTab === 'sprints' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setActiveTab('sprints')}
          >
            <Target className="w-4 h-4 mr-2" />
            Sprint Predictions
          </ElevatrButton>
          <ElevatrButton
            variant={activeTab === 'career' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setActiveTab('career')}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Career Growth
          </ElevatrButton>
          <ElevatrButton
            variant={activeTab === 'risks' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setActiveTab('risks')}
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Risk Analysis
          </ElevatrButton>
        </div>

        {/* Sprint Predictions Tab */}
        {activeTab === 'sprints' && (
          <div className="space-y-4">
            {sprintPredictions.length === 0 ? (
              <div className="text-center py-8">
                <Target className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">
                  No active sprints found. Start a sprint to get predictions!
                </p>
              </div>
            ) : (
              sprintPredictions.map((prediction, index) => (
                <div 
                  key={prediction.sprintId}
                  className="glass-panel p-4 rounded-lg elevatr-animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg flex-shrink-0 ${
                      prediction.successProbability >= 0.8 ? 'elevatr-gradient-success' :
                      prediction.successProbability >= 0.6 ? 'elevatr-gradient-motivation' :
                      prediction.successProbability >= 0.4 ? 'elevatr-gradient-accent' :
                      'elevatr-gradient-journal'
                    }`}>
                      <Target className="w-4 h-4 text-white" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-foreground">
                          Sprint {prediction.sprintId}
                        </h3>
                        <ElevatrBadge 
                          variant="primary"
                          className="text-xs"
                        >
                          {Math.round(prediction.successProbability * 100)}% success
                        </ElevatrBadge>                        <ElevatrBadge 
                          variant="journal"
                          className="text-xs"
                        >
                          {Math.round(prediction.confidenceLevel * 100)}% confidence
                        </ElevatrBadge>
                      </div>
                      
                      <div className="space-y-2 mb-3">
                        <div className="flex items-center gap-2 text-sm">
                          <BarChart3 className="w-3 h-3 text-primary" />
                          <span className="text-muted-foreground">
                            Predicted completion: {Math.round(prediction.predictedCompletionRate * 100)}%
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium text-foreground">Recommended Actions:</h4>
                        {prediction.recommendedActions.map((action: string, idx: number) => (
                          <div key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                            <Zap className="w-3 h-3 text-primary" />
                            {action}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Career Predictions Tab */}
        {activeTab === 'career' && careerPredictions && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="glass-panel p-4 rounded-lg text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <span className="font-semibold">Skill Growth</span>
                </div>
                <div className="text-lg font-bold text-green-600">
                  {careerPredictions.predictedSkillGrowth.length} areas
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  next {careerPredictions.timeframe}
                </div>
              </div>
              
              <div className="glass-panel p-4 rounded-lg text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-blue-500" />
                  <span className="font-semibold">Milestones</span>
                </div>
                <div className="text-lg font-bold text-blue-600">
                  {careerPredictions.careerMilestones.length} upcoming
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  projected targets
                </div>
              </div>
              
              <div className="glass-panel p-4 rounded-lg text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  <span className="font-semibold">Challenges</span>
                </div>
                <div className="text-lg font-bold text-orange-600">
                  {careerPredictions.potentialChallenges.length} identified
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  preparation needed
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="glass-panel p-4 rounded-lg">
                <h4 className="font-semibold text-foreground mb-3">Predicted Skill Growth</h4>
                <div className="space-y-2">
                  {careerPredictions.predictedSkillGrowth.map((skill: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">{skill.skill}</span>
                      <span className="text-sm font-medium text-green-600">
                        +{skill.growthPercentage}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="glass-panel p-4 rounded-lg">
                <h4 className="font-semibold text-foreground mb-3">Career Milestones</h4>
                <div className="space-y-2">
                  {careerPredictions.careerMilestones.map((milestone: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">{milestone.milestone}</span>
                      <div className="flex gap-2 text-xs">
                        <span className="text-blue-600">
                          {new Date(milestone.estimatedDate).toLocaleDateString()}
                        </span>
                        <span className="text-green-600">
                          {Math.round(milestone.probability * 100)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Risk Analysis Tab */}
        {activeTab === 'risks' && (
          <div className="space-y-4">
            {riskFactors.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-3" />
                <p className="text-muted-foreground">
                  No significant risks detected. Keep up the great work!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {riskFactors.map((risk, idx) => (
                  <div key={idx} className="glass-panel p-4 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg flex-shrink-0 ${getRiskColor(risk.impact)}`}>
                        {getRiskIcon(risk.impact)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-foreground">{risk.factor}</h4>
                          <ElevatrBadge 
                            variant={risk.impact === 'high' ? 'accent' : risk.impact === 'medium' ? 'motivation' : 'journal'}
                            className="text-xs"
                          >
                            {risk.impact} impact
                          </ElevatrBadge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{risk.description}</p>
                        <div className="text-sm text-green-600 flex items-center gap-2">
                          <CheckCircle className="w-3 h-3" />
                          <span>Mitigation: {risk.mitigation}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </ElevatrCard>
    </div>
  );
}
