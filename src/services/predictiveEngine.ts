// Predictive Analytics Engine - ML-inspired predictions for career success
import { Sprint, UserProgress, TaskStatus } from '@/types';
import { differenceInDays, addDays, parseISO, format } from 'date-fns';

export interface SprintPrediction {
  sprintId: string;
  predictedCompletionRate: number;
  confidenceLevel: number;
  riskFactors: RiskFactor[];
  successProbability: number;
  recommendedActions: string[];
  milestoneForecasts: MilestoneForecast[];
}

export interface RiskFactor {
  factor: string;
  impact: 'low' | 'medium' | 'high';
  description: string;
  mitigation: string;
}

export interface MilestoneForecast {
  milestone: string;
  predictedDate: Date;
  confidence: number;
  dependencies: string[];
}

export interface CareerProgressPrediction {
  timeframe: '3months' | '6months' | '1year';
  predictedSkillGrowth: { skill: string; growthPercentage: number }[];
  careerMilestones: { milestone: string; estimatedDate: Date; probability: number }[];
  potentialChallenges: { challenge: string; likelihood: number; preparation: string }[];
}

export class PredictiveEngine {
  
  /**
   * Predict sprint completion and success probability
   */
  static predictSprintOutcome(
    sprint: Sprint,
    userProgress: UserProgress,
    historicalProgress: UserProgress[]
  ): SprintPrediction {
    const currentProgress = this.calculateCurrentProgress(sprint, userProgress);
    const historicalPerformance = this.analyzeHistoricalPerformance(historicalProgress);
    const riskFactors = this.identifyRiskFactors(sprint, userProgress, historicalPerformance);
    
    // Machine learning-inspired prediction
    const features = this.extractFeatures(sprint, userProgress, historicalProgress);
    const predictedCompletionRate = this.predictCompletionRate(features);
    const successProbability = this.calculateSuccessProbability(features, riskFactors);
    
    return {
      sprintId: sprint.id,
      predictedCompletionRate,
      confidenceLevel: this.calculateConfidence(features, historicalProgress.length),
      riskFactors,
      successProbability,
      recommendedActions: this.generateRecommendations(riskFactors, currentProgress),
      milestoneForecasts: this.forecastMilestones(sprint, userProgress, predictedCompletionRate)
    };
  }

  /**
   * Predict long-term career progress
   */
  static predictCareerProgress(
    sprints: Sprint[],
    userProgress: UserProgress[],
    timeframe: '3months' | '6months' | '1year'
  ): CareerProgressPrediction {
    const skillProgression = this.analyzeSkillProgression(sprints, userProgress);
    const completionTrends = this.calculateCompletionTrends(userProgress);
    
    return {
      timeframe,
      predictedSkillGrowth: this.predictSkillGrowth(skillProgression, timeframe),
      careerMilestones: this.predictCareerMilestones(completionTrends, timeframe),
      potentialChallenges: this.identifyPotentialChallenges(userProgress, timeframe)
    };
  }

  /**
   * Early warning system for sprint failure risk
   */
  static assessSprintRisk(
    sprint: Sprint,
    userProgress: UserProgress
  ): { riskLevel: 'low' | 'medium' | 'high'; warnings: string[]; urgentActions: string[] } {
    const daysElapsed = differenceInDays(new Date(), parseISO(sprint.startDate));
    const progressRatio = daysElapsed / sprint.duration;
    const completionRatio = userProgress.stats.completionPercentage / 100;
    
    const warnings: string[] = [];
    const urgentActions: string[] = [];
    let riskLevel: 'low' | 'medium' | 'high' = 'low';

    // Progress behind schedule
    if (progressRatio - completionRatio > 0.2) {
      riskLevel = 'high';
      warnings.push('Significantly behind schedule');
      urgentActions.push('Focus on core tasks only');
      urgentActions.push('Consider extending sprint or reducing scope');
    } else if (progressRatio - completionRatio > 0.1) {
      riskLevel = 'medium';
      warnings.push('Slightly behind schedule');
      urgentActions.push('Increase daily task completion target');
    }

    // Low consistency
    const consistency = this.calculateConsistency(userProgress.taskStatuses);
    if (consistency < 0.5) {
      if (riskLevel === 'low') riskLevel = 'medium';
      warnings.push('Inconsistent daily progress');
      urgentActions.push('Establish a more regular routine');
    }

    return { riskLevel, warnings, urgentActions };
  }

  // Private prediction methods
  private static calculateCurrentProgress(sprint: Sprint, userProgress: UserProgress): number {
    const totalTasks = sprint.days.reduce((sum, day) => 
      sum + day.coreTasks.length + day.specialTasks.length, 0
    );
    return userProgress.stats.totalTasksCompleted / totalTasks;
  }

  private static analyzeHistoricalPerformance(historicalProgress: UserProgress[]): {
    averageCompletionRate: number;
    consistencyScore: number;
    improvementTrend: number;
  } {
    if (historicalProgress.length === 0) {
      return { averageCompletionRate: 0.5, consistencyScore: 0.5, improvementTrend: 0 };
    }

    const completionRates = historicalProgress.map(p => p.stats.completionPercentage);
    const averageCompletionRate = completionRates.reduce((a, b) => a + b, 0) / completionRates.length;
    
    const consistencyScores = historicalProgress.map(p => this.calculateConsistency(p.taskStatuses));
    const consistencyScore = consistencyScores.reduce((a, b) => a + b, 0) / consistencyScores.length;
    
    // Calculate improvement trend
    const improvementTrend = this.calculateTrend(completionRates);

    return { averageCompletionRate: averageCompletionRate / 100, consistencyScore, improvementTrend };
  }

  private static identifyRiskFactors(
    sprint: Sprint,
    userProgress: UserProgress,
    historical: { averageCompletionRate: number; consistencyScore: number; improvementTrend: number }
  ): RiskFactor[] {
    const risks: RiskFactor[] = [];

    // Check for overambitious goals
    const dailyTaskLoad = sprint.days.reduce((sum, day) => 
      sum + day.coreTasks.length + day.specialTasks.length, 0
    ) / sprint.duration;

    if (dailyTaskLoad > historical.averageCompletionRate * 10) {
      risks.push({
        factor: 'overambitious-goals',
        impact: 'high',
        description: 'Daily task load exceeds historical capacity',
        mitigation: 'Reduce scope or extend timeline'
      });
    }

    // Check consistency issues
    if (historical.consistencyScore < 0.6) {
      risks.push({
        factor: 'low-consistency',
        impact: 'medium',
        description: 'Historical pattern shows inconsistent daily progress',
        mitigation: 'Establish stronger daily routines and accountability'
      });
    }

    // Check declining performance trend
    if (historical.improvementTrend < -5) {
      risks.push({
        factor: 'declining-performance',
        impact: 'medium',
        description: 'Recent completion rates are declining',
        mitigation: 'Reassess goals and identify barriers to progress'
      });
    }

    return risks;
  }

  private static extractFeatures(
    sprint: Sprint,
    userProgress: UserProgress,
    historicalProgress: UserProgress[]
  ): number[] {
    // Extract numerical features for prediction model
    return [
      sprint.duration,
      userProgress.stats.completionPercentage / 100,
      historicalProgress.length,
      historicalProgress.reduce((sum, p) => sum + p.stats.completionPercentage, 0) / historicalProgress.length / 100,
      this.calculateConsistency(userProgress.taskStatuses),
      userProgress.streaks.currentTaskStreak,
      differenceInDays(new Date(), parseISO(sprint.startDate)) / sprint.duration
    ];
  }

  private static predictCompletionRate(features: number[]): number {
    // Simplified ML-inspired prediction
    // In a real implementation, this would use trained ML models
    const [
      duration,
      currentCompletion,
      experienceLevel,
      historicalAverage,
      consistency,
      currentStreak,
      timeProgress
    ] = features;

    // Weighted prediction based on multiple factors
    let prediction = 0;
    
    // Historical performance (40% weight)
    prediction += historicalAverage * 0.4;
    
    // Current trajectory (30% weight)
    const trajectory = currentCompletion / Math.max(timeProgress, 0.1);
    prediction += Math.min(trajectory, 1) * 0.3;
    
    // Consistency factor (20% weight)
    prediction += consistency * 0.2;
    
    // Experience factor (10% weight)
    const experienceFactor = Math.min(experienceLevel / 5, 1);
    prediction += experienceFactor * 0.1;

    return Math.min(Math.max(prediction, 0.1), 1);
  }

  private static calculateSuccessProbability(features: number[], risks: RiskFactor[]): number {
    const [, currentCompletion, , historicalAverage, consistency] = features;
    
    let probability = (historicalAverage + currentCompletion + consistency) / 3;
    
    // Reduce probability based on risk factors
    risks.forEach(risk => {
      const reduction = risk.impact === 'high' ? 0.2 : risk.impact === 'medium' ? 0.1 : 0.05;
      probability -= reduction;
    });

    return Math.min(Math.max(probability, 0.05), 0.95);
  }

  private static calculateConfidence(features: number[], historicalDataPoints: number): number {
    // Confidence increases with more historical data
    const dataConfidence = Math.min(historicalDataPoints / 10, 1);
    
    // Confidence decreases with volatility
    const stabilityConfidence = features[4]; // consistency score
    
    return (dataConfidence + stabilityConfidence) / 2;
  }

  private static generateRecommendations(risks: RiskFactor[], currentProgress: number): string[] {
    const recommendations: string[] = [];

    if (currentProgress < 0.3) {
      recommendations.push('Focus on establishing daily momentum with smaller tasks');
    }

    risks.forEach(risk => {
      recommendations.push(risk.mitigation);
    });

    if (recommendations.length === 0) {
      recommendations.push('Maintain current pace - you\'re on track for success!');
    }

    return recommendations;
  }

  private static forecastMilestones(
    sprint: Sprint,
    userProgress: UserProgress,
    predictedRate: number
  ): MilestoneForecast[] {
    const milestones: MilestoneForecast[] = [];
    const startDate = parseISO(sprint.startDate);
    
    // Predict 25%, 50%, 75%, and 100% completion dates
    [0.25, 0.5, 0.75, 1.0].forEach(target => {
      const daysNeeded = Math.ceil((target / predictedRate) * sprint.duration);
      const predictedDate = addDays(startDate, daysNeeded);
      
      milestones.push({
        milestone: `${Math.round(target * 100)}% Complete`,
        predictedDate,
        confidence: this.calculateMilestoneConfidence(target, predictedRate),
        dependencies: target === 1.0 ? ['Consistent daily progress', 'No major disruptions'] : []
      });
    });

    return milestones;
  }

  private static predictSkillGrowth(
    skillProgression: { [skill: string]: number[] },
    timeframe: string
  ): { skill: string; growthPercentage: number }[] {
    const multiplier = timeframe === '3months' ? 1 : timeframe === '6months' ? 2 : 4;
    
    return Object.entries(skillProgression).map(([skill, progression]) => {
      const recentGrowth = progression.length > 1 ? 
        progression[progression.length - 1] - progression[0] : 10;
      
      return {
        skill,
        growthPercentage: Math.min(recentGrowth * multiplier, 100)
      };
    });
  }

  private static predictCareerMilestones(
    trends: number[],
    timeframe: string
  ): { milestone: string; estimatedDate: Date; probability: number }[] {
    const avgTrend = trends.reduce((a, b) => a + b, 0) / trends.length;
    const timeMultiplier = timeframe === '3months' ? 3 : timeframe === '6months' ? 6 : 12;
    
    const milestones = [
      { name: 'Complete 5 successful sprints', sprintsNeeded: 5 },
      { name: 'Achieve 90% average completion rate', targetRate: 90 },
      { name: 'Build 30-day consistency streak', streakTarget: 30 }
    ];

    return milestones.map(milestone => ({
      milestone: milestone.name,
      estimatedDate: addDays(new Date(), timeMultiplier * 30),
      probability: Math.min(avgTrend / 100 + 0.3, 0.9)
    }));
  }

  private static identifyPotentialChallenges(
    userProgress: UserProgress[],
    timeframe: string
  ): { challenge: string; likelihood: number; preparation: string }[] {
    const challenges = [
      {
        challenge: 'Motivation decline after initial enthusiasm',
        likelihood: 0.7,
        preparation: 'Set up accountability systems and celebrate small wins'
      },
      {
        challenge: 'Time management difficulties with increased responsibilities',
        likelihood: 0.5,
        preparation: 'Practice time-blocking and prioritization techniques'
      },
      {
        challenge: 'Skill plateau requiring new learning approaches',
        likelihood: 0.4,
        preparation: 'Diversify learning methods and seek mentorship'
      }
    ];

    return challenges.filter(c => c.likelihood > 0.3);
  }

  // Helper methods
  private static calculateConsistency(taskStatuses: TaskStatus[]): number {
    const days = [...new Set(taskStatuses.map(ts => ts.dayId))];
    const completionByDay = days.map(day => {
      const dayTasks = taskStatuses.filter(ts => ts.dayId === day);
      const completed = dayTasks.filter(ts => ts.completed).length;
      return dayTasks.length > 0 ? completed / dayTasks.length : 0;
    });
    
    if (completionByDay.length === 0) return 0;
    
    const variance = this.calculateVariance(completionByDay);
    return Math.max(1 - variance, 0);
  }

  private static calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;
    
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    return secondAvg - firstAvg;
  }

  private static calculateVariance(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  }

  private static calculateMilestoneConfidence(target: number, predictedRate: number): number {
    // Higher confidence for earlier milestones
    const timeConfidence = 1 - (target * 0.3);
    const rateConfidence = Math.min(predictedRate * 1.2, 1);
    return (timeConfidence + rateConfidence) / 2;
  }

  private static analyzeSkillProgression(
    sprints: Sprint[],
    userProgress: UserProgress[]
  ): { [skill: string]: number[] } {
    // Simplified skill tracking based on task categories
    const skillProgress: { [skill: string]: number[] } = {};
    
    sprints.forEach(sprint => {
      const progress = userProgress.find(p => p.sprintId === sprint.id);
      if (progress) {
        sprint.days.forEach(day => {
          day.coreTasks.forEach(task => {
            if (!skillProgress[task.category]) {
              skillProgress[task.category] = [];
            }
            skillProgress[task.category].push(progress.stats.completionPercentage);
          });
        });
      }
    });

    return skillProgress;
  }

  private static calculateCompletionTrends(userProgress: UserProgress[]): number[] {
    return userProgress.map(p => p.stats.completionPercentage);
  }
}
