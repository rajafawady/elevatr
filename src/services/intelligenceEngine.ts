// AI-powered intelligence engine for Elevatr
import { Sprint, UserProgress, TaskStatus, JournalEntry } from '@/types';
import { differenceInDays, format, parseISO, isWeekend } from 'date-fns';

export interface ProgressInsight {
  id: string;
  type: 'pattern' | 'prediction' | 'recommendation' | 'achievement';
  title: string;
  description: string;
  confidence: number; // 0-1
  actionable: boolean;
  priority: 'low' | 'medium' | 'high';
  data?: any;
  createdAt: Date;
}

export interface ProductivityPattern {
  bestDaysOfWeek: string[];
  peakHours: number[];
  averageTasksPerDay: number;
  streakPatterns: {
    averageLength: number;
    breakReasons: string[];
  };
  seasonalTrends: {
    month: number;
    productivity: number;
  }[];
}

export class IntelligenceEngine {
  
  /**
   * Analyze user's progress data to generate intelligent insights
   */
  static generateProgressInsights(
    sprints: Sprint[], 
    userProgress: UserProgress[]
  ): ProgressInsight[] {
    const insights: ProgressInsight[] = [];

    // 1. Sprint Success Pattern Analysis
    const sprintSuccessInsight = this.analyzeSprintSuccessPatterns(sprints, userProgress);
    if (sprintSuccessInsight) insights.push(sprintSuccessInsight);

    // 2. Productivity Pattern Detection
    const productivityInsight = this.analyzeProductivityPatterns(userProgress);
    if (productivityInsight) insights.push(productivityInsight);

    // 3. Task Completion Trend Analysis
    const trendInsight = this.analyzeCompletionTrends(userProgress);
    if (trendInsight) insights.push(trendInsight);

    // 4. Risk Assessment for Current Sprint
    const riskInsight = this.assessCurrentSprintRisk(sprints, userProgress);
    if (riskInsight) insights.push(riskInsight);

    // 5. Achievement Recognition
    const achievementInsights = this.recognizeAchievements(sprints, userProgress);
    insights.push(...achievementInsights);

    return insights.sort((a, b) => b.priority.localeCompare(a.priority));
  }

  /**
   * Analyze what makes sprints successful
   */
  private static analyzeSprintSuccessPatterns(
    sprints: Sprint[], 
    userProgress: UserProgress[]
  ): ProgressInsight | null {
    const completedSprints = sprints.filter(s => s.status === 'completed');
    
    if (completedSprints.length < 2) return null;    const successFactors = completedSprints.map(sprint => {
      const progress = userProgress.find(p => p.sprintId === sprint.id);
      if (!progress) return null;

      const completionRate = progress.stats.completionPercentage;
      const taskConsistency = this.calculateTaskConsistency(progress.taskStatuses);
      const journalFrequency = progress.journalEntries.length / sprint.duration;

      return {
        sprintId: sprint.id,
        duration: sprint.duration,
        completionRate,
        taskConsistency,
        journalFrequency,
        success: completionRate >= 80
      };
    }).filter((factor): factor is NonNullable<typeof factor> => factor !== null);

    if (successFactors.length === 0) return null;

    // Find patterns in successful sprints
    const successfulSprints = successFactors.filter(s => s.success);
    const optimalDuration = this.findOptimalSprintDuration(successfulSprints);
    const consistencyThreshold = this.findConsistencyThreshold(successfulSprints);

    return {
      id: 'sprint-success-pattern',
      type: 'pattern',
      title: 'Sprint Success Pattern Identified',
      description: `Your ${optimalDuration}-day sprints show ${Math.round(consistencyThreshold * 100)}% higher success rates when you maintain consistent daily progress.`,
      confidence: 0.85,
      actionable: true,
      priority: 'high',
      data: {
        optimalDuration,
        consistencyThreshold,
        successRate: successfulSprints.length / completedSprints.length
      },
      createdAt: new Date()
    };
  }

  /**
   * Detect productivity patterns
   */
  private static analyzeProductivityPatterns(userProgress: UserProgress[]): ProgressInsight | null {
    const allTaskStatuses = userProgress.flatMap(p => p.taskStatuses);
    
    if (allTaskStatuses.length < 20) return null;

    const completedTasks = allTaskStatuses.filter(ts => ts.completed && ts.completedAt);
    const dayOfWeekProductivity = this.analyzeDayOfWeekProductivity(completedTasks);
    const bestDays = dayOfWeekProductivity
      .sort((a, b) => b.avgTasks - a.avgTasks)
      .slice(0, 2)
      .map(d => d.day);

    return {
      id: 'productivity-pattern',
      type: 'pattern',
      title: 'Peak Productivity Days Identified',
      description: `You're most productive on ${bestDays.join(' and ')}s. Consider scheduling important tasks on these days.`,
      confidence: 0.78,
      actionable: true,
      priority: 'medium',
      data: {
        bestDays,
        dayOfWeekProductivity
      },
      createdAt: new Date()
    };
  }

  /**
   * Analyze completion trends
   */
  private static analyzeCompletionTrends(userProgress: UserProgress[]): ProgressInsight | null {
    if (userProgress.length < 2) return null;

    const recentProgress = userProgress.slice(-3); // Last 3 sprints
    const completionRates = recentProgress.map(p => p.stats.completionPercentage);
    
    const trend = this.calculateTrend(completionRates);
    
    if (Math.abs(trend) < 5) return null; // No significant trend

    const isImproving = trend > 0;
    
    return {
      id: 'completion-trend',
      type: 'prediction',
      title: isImproving ? 'Upward Performance Trend' : 'Performance Decline Detected',
      description: isImproving 
        ? `Your completion rate has improved by ${Math.round(trend)}% over recent sprints. Keep up the momentum!`
        : `Your completion rate has declined by ${Math.round(Math.abs(trend))}% recently. Consider adjusting your approach.`,
      confidence: 0.72,
      actionable: true,
      priority: isImproving ? 'medium' : 'high',
      data: {
        trend,
        recentRates: completionRates
      },
      createdAt: new Date()
    };
  }

  /**
   * Assess risk for current active sprint
   */
  private static assessCurrentSprintRisk(
    sprints: Sprint[], 
    userProgress: UserProgress[]
  ): ProgressInsight | null {
    const activeSprint = sprints.find(s => s.status === 'active');
    if (!activeSprint) return null;

    const progress = userProgress.find(p => p.sprintId === activeSprint.id);
    if (!progress) return null;

    const daysElapsed = differenceInDays(new Date(), parseISO(activeSprint.startDate));
    const progressRatio = daysElapsed / activeSprint.duration;
    const completionRatio = progress.stats.completionPercentage / 100;

    // Risk assessment: if progress is significantly behind schedule
    const riskLevel = progressRatio - completionRatio;
    
    if (riskLevel > 0.2) { // 20% behind schedule
      return {
        id: 'sprint-risk-assessment',
        type: 'prediction',
        title: 'Sprint At Risk',
        description: `Your current sprint is ${Math.round(riskLevel * 100)}% behind schedule. Consider focusing on core tasks or adjusting your goals.`,
        confidence: 0.82,
        actionable: true,
        priority: 'high',
        data: {
          riskLevel,
          daysElapsed,
          progressRatio,
          completionRatio
        },
        createdAt: new Date()
      };
    }

    return null;
  }

  /**
   * Recognize achievements and milestones
   */
  private static recognizeAchievements(
    sprints: Sprint[], 
    userProgress: UserProgress[]
  ): ProgressInsight[] {
    const achievements: ProgressInsight[] = [];

    // Check for streaks
    const currentStreak = this.calculateCurrentStreak(userProgress);
    if (currentStreak >= 7) {
      achievements.push({
        id: 'streak-achievement',
        type: 'achievement',
        title: 'Consistency Champion!',
        description: `Amazing! You've maintained a ${currentStreak}-day task completion streak.`,
        confidence: 1.0,
        actionable: false,
        priority: 'medium',
        data: { streak: currentStreak },
        createdAt: new Date()
      });
    }

    // Check for sprint completion milestones
    const completedSprints = sprints.filter(s => s.status === 'completed').length;
    if (completedSprints > 0 && completedSprints % 5 === 0) {
      achievements.push({
        id: 'sprint-milestone',
        type: 'achievement',
        title: 'Sprint Milestone Reached!',
        description: `Congratulations on completing ${completedSprints} career development sprints!`,
        confidence: 1.0,
        actionable: false,
        priority: 'medium',
        data: { completedSprints },
        createdAt: new Date()
      });
    }

    return achievements;
  }

  // Helper methods
  private static calculateTaskConsistency(taskStatuses: TaskStatus[]): number {
    // Calculate how consistent the user is with daily task completion
    const days = [...new Set(taskStatuses.map(ts => ts.dayId))];
    const completionByDay = days.map(day => {
      const dayTasks = taskStatuses.filter(ts => ts.dayId === day);
      const completed = dayTasks.filter(ts => ts.completed).length;
      return completed / dayTasks.length;
    });
    
    const variance = this.calculateVariance(completionByDay);
    return 1 - variance; // Lower variance = higher consistency
  }

  private static findOptimalSprintDuration(successfulSprints: any[]): number {
    const durationCounts = successfulSprints.reduce((acc, sprint) => {
      acc[sprint.duration] = (acc[sprint.duration] || 0) + 1;
      return acc;
    }, {});
    
    return Object.entries(durationCounts)
      .sort(([,a], [,b]) => (b as number) - (a as number))[0][0] as unknown as number;
  }

  private static findConsistencyThreshold(successfulSprints: any[]): number {
    const consistencies = successfulSprints.map(s => s.taskConsistency);
    return consistencies.reduce((a, b) => a + b, 0) / consistencies.length;
  }

  private static analyzeDayOfWeekProductivity(completedTasks: TaskStatus[]) {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const productivityByDay = dayNames.map((day, index) => {
      const dayTasks = completedTasks.filter(task => {
        if (!task.completedAt) return false;
        const taskDate = typeof task.completedAt === 'string' 
          ? parseISO(task.completedAt) 
          : task.completedAt;
        return taskDate.getDay() === index;
      });
      
      return {
        day,
        totalTasks: dayTasks.length,
        avgTasks: dayTasks.length / 4 // Assuming 4 weeks of data
      };
    });
    
    return productivityByDay;
  }

  private static calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;
    
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    return secondAvg - firstAvg;
  }

  private static calculateCurrentStreak(userProgress: UserProgress[]): number {
    // Simplified streak calculation - would need more sophisticated logic
    const allTaskStatuses = userProgress.flatMap(p => p.taskStatuses);
    const recentTasks = allTaskStatuses      .filter(ts => ts.completed && ts.completedAt)
      .sort((a, b) => {
        const dateA = a.completedAt ? parseISO(a.completedAt) : new Date(0);
        const dateB = b.completedAt ? parseISO(b.completedAt) : new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
    
    // Count consecutive days (simplified)
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
        const hasTasksOnDay = recentTasks.some(task => {
        if (!task.completedAt) return false;
        const taskDate = parseISO(task.completedAt);
        return format(taskDate, 'yyyy-MM-dd') === format(checkDate, 'yyyy-MM-dd');
      });
      
      if (hasTasksOnDay) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }

  private static calculateVariance(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  }
}
