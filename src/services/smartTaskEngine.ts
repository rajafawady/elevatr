// Smart Task Prioritization Engine
import { Task, TaskStatus, UserProgress, Sprint } from '@/types';
import { differenceInDays, parseISO, isWeekend, getHours } from 'date-fns';

export interface TaskPrioritizationSuggestion {
  taskId: string;
  suggestedPriority: 'low' | 'medium' | 'high';
  reasons: string[];
  confidence: number;
  estimatedEffort: 'low' | 'medium' | 'high';
  bestTimeOfDay: 'morning' | 'afternoon' | 'evening';
  dependencies?: string[];
}

export interface WorkloadAnalysis {
  currentLoad: 'light' | 'balanced' | 'heavy' | 'overloaded';
  dailyTaskDistribution: { [date: string]: number };
  burnoutRisk: number; // 0-1
  recommendations: string[];
}

export class SmartTaskEngine {
  
  /**
   * Generate intelligent task prioritization suggestions
   */
  static generateTaskPrioritization(
    tasks: Task[],
    userProgress: UserProgress[],
    sprints: Sprint[]
  ): TaskPrioritizationSuggestion[] {
    return tasks
      .filter(task => task.status === 'active')
      .map(task => this.analyzeTaskPriority(task, userProgress, sprints))
      .sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Analyze workload and suggest task distribution
   */
  static analyzeWorkload(
    tasks: Task[],
    userProgress: UserProgress[]
  ): WorkloadAnalysis {
    const activeTasks = tasks.filter(t => t.status === 'active');
    const completionHistory = this.getCompletionHistory(userProgress);
    
    // Calculate current workload
    const dailyTaskCounts = this.calculateDailyTaskDistribution(activeTasks);
    const averageDaily = Object.values(dailyTaskCounts).reduce((a, b) => a + b, 0) / 7;
    
    const currentLoad = this.determineWorkloadLevel(averageDaily, completionHistory);
    const burnoutRisk = this.calculateBurnoutRisk(userProgress, activeTasks.length);
    
    return {
      currentLoad,
      dailyTaskDistribution: dailyTaskCounts,
      burnoutRisk,
      recommendations: this.generateWorkloadRecommendations(currentLoad, burnoutRisk)
    };
  }

  /**
   * Suggest optimal task scheduling based on user patterns
   */
  static suggestTaskScheduling(
    tasks: Task[],
    userProgress: UserProgress[]
  ): { [taskId: string]: { day: string; timeSlot: string; reason: string } } {
    const productivityPatterns = this.analyzeProductivityPatterns(userProgress);
    const scheduling: { [taskId: string]: { day: string; timeSlot: string; reason: string } } = {};

    tasks.filter(t => t.status === 'active').forEach(task => {
      const suggestion = this.suggestOptimalTime(task, productivityPatterns);
      if (suggestion) {
        scheduling[task.id] = suggestion;
      }
    });

    return scheduling;
  }

  // Private helper methods
  private static analyzeTaskPriority(
    task: Task,
    userProgress: UserProgress[],
    sprints: Sprint[]
  ): TaskPrioritizationSuggestion {
    const reasons: string[] = [];
    let priorityScore = 0;
    
    // Check deadlines
    if (task.dueDate) {
      const daysUntilDue = differenceInDays(
        task.dueDate instanceof Date ? task.dueDate : parseISO(task.dueDate.toString()),
        new Date()
      );
      
      if (daysUntilDue <= 1) {
        priorityScore += 3;
        reasons.push('Due very soon');
      } else if (daysUntilDue <= 3) {
        priorityScore += 2;
        reasons.push('Due within 3 days');
      }
    }

    // Check task type importance
    if (task.taskType === 'core') {
      priorityScore += 2;
      reasons.push('Core task for career development');
    }

    // Check sprint progress
    const sprint = sprints.find(s => s.id === task.sprintId);
    if (sprint) {
      const progress = userProgress.find(p => p.sprintId === sprint.id);
      if (progress && progress.stats.completionPercentage < 50) {
        priorityScore += 1;
        reasons.push('Sprint needs progress boost');
      }
    }

    // Determine priority
    let suggestedPriority: 'low' | 'medium' | 'high';
    if (priorityScore >= 4) {
      suggestedPriority = 'high';
    } else if (priorityScore >= 2) {
      suggestedPriority = 'medium';
    } else {
      suggestedPriority = 'low';
    }

    return {
      taskId: task.id,
      suggestedPriority,
      reasons,
      confidence: Math.min(priorityScore / 5, 1),
      estimatedEffort: this.estimateTaskEffort(task),
      bestTimeOfDay: this.suggestBestTimeOfDay(task, userProgress)
    };
  }

  private static getCompletionHistory(userProgress: UserProgress[]): number[] {
    // Get completion rates over time
    return userProgress.map(p => p.stats.completionPercentage);
  }

  private static calculateDailyTaskDistribution(tasks: Task[]): { [date: string]: number } {
    const distribution: { [date: string]: number } = {};
    
    // Initialize next 7 days
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      distribution[date.toISOString().split('T')[0]] = 0;
    }

    // Count tasks per day
    tasks.forEach(task => {
      if (task.dueDate) {
        const dueDate = task.dueDate instanceof Date 
          ? task.dueDate 
          : parseISO(task.dueDate.toString());
        const dateKey = dueDate.toISOString().split('T')[0];
        
        if (distribution[dateKey] !== undefined) {
          distribution[dateKey]++;
        }
      }
    });

    return distribution;
  }

  private static determineWorkloadLevel(
    averageDaily: number,
    history: number[]
  ): 'light' | 'balanced' | 'heavy' | 'overloaded' {
    const userCapacity = this.estimateUserCapacity(history);
    
    if (averageDaily > userCapacity * 1.5) return 'overloaded';
    if (averageDaily > userCapacity * 1.2) return 'heavy';
    if (averageDaily > userCapacity * 0.8) return 'balanced';
    return 'light';
  }

  private static calculateBurnoutRisk(
    userProgress: UserProgress[],
    activeTasks: number
  ): number {
    // Analyze recent completion trends and workload
    const recentProgress = userProgress.slice(-3);
    const completionTrend = this.calculateTrend(
      recentProgress.map(p => p.stats.completionPercentage)
    );
    
    let risk = 0;
    
    // Declining performance increases risk
    if (completionTrend < -10) risk += 0.3;
    
    // High task count increases risk
    if (activeTasks > 15) risk += 0.2;
    if (activeTasks > 25) risk += 0.3;
    
    // Check for overwork patterns
    const avgStreak = recentProgress.reduce((sum, p) => sum + p.streaks.currentTaskStreak, 0) / recentProgress.length;
    if (avgStreak > 14) risk += 0.2; // Long streaks without breaks
    
    return Math.min(risk, 1);
  }

  private static generateWorkloadRecommendations(
    currentLoad: string,
    burnoutRisk: number
  ): string[] {
    const recommendations: string[] = [];

    if (currentLoad === 'overloaded') {
      recommendations.push('Consider postponing non-critical tasks');
      recommendations.push('Focus on high-priority items only');
    }

    if (burnoutRisk > 0.7) {
      recommendations.push('Take a break day to recharge');
      recommendations.push('Reduce daily task targets temporarily');
    }

    if (currentLoad === 'light') {
      recommendations.push('Good time to tackle challenging tasks');
      recommendations.push('Consider adding stretch goals');
    }

    return recommendations;
  }

  private static analyzeProductivityPatterns(
    userProgress: UserProgress[]
  ): { bestDays: string[]; bestHours: number[]; averageDaily: number } {
    // Analyze when user is most productive
    const taskStatuses = userProgress.flatMap(p => p.taskStatuses);
    const completedTasks = taskStatuses.filter(ts => ts.completed && ts.completedAt);

    // This would need more sophisticated analysis
    return {
      bestDays: ['Monday', 'Tuesday', 'Wednesday'], // Simplified
      bestHours: [9, 10, 14, 15], // 9-10 AM, 2-3 PM
      averageDaily: completedTasks.length / userProgress.length
    };
  }

  private static suggestOptimalTime(
    task: Task,
    patterns: { bestDays: string[]; bestHours: number[]; averageDaily: number }
  ): { day: string; timeSlot: string; reason: string } | null {
    // High priority tasks get best time slots
    if (task.priority === 'high') {
      return {
        day: patterns.bestDays[0],
        timeSlot: `${patterns.bestHours[0]}:00`,
        reason: 'Scheduled during your peak productivity hours'
      };
    }

    return null;
  }

  private static estimateTaskEffort(task: Task): 'low' | 'medium' | 'high' {
    // Estimate based on task description, type, etc.
    if (task.description && task.description.length > 200) return 'high';
    if (task.taskType === 'core') return 'medium';
    return 'low';
  }

  private static suggestBestTimeOfDay(
    task: Task,
    userProgress: UserProgress[]
  ): 'morning' | 'afternoon' | 'evening' {
    // Analyze user's completion patterns by time of day
    // For now, return based on task complexity
    if (task.priority === 'high') return 'morning';
    if (task.taskType === 'core') return 'morning';
    return 'afternoon';
  }

  private static estimateUserCapacity(history: number[]): number {
    // Estimate how many tasks user can handle daily based on history
    const avgCompletion = history.reduce((a, b) => a + b, 0) / history.length;
    return Math.max(avgCompletion / 10, 3); // At least 3 tasks
  }

  private static calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;
    
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    return secondAvg - firstAvg;
  }
}
