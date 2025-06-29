// Personalized AI Coaching Engine
import { Sprint, UserProgress, TaskStatus, JournalEntry } from '@/types';
import { differenceInDays, parseISO, format, startOfWeek, endOfWeek } from 'date-fns';

export interface CoachingInsight {
  id: string;
  type: 'motivation' | 'strategy' | 'skill-development' | 'habit-formation' | 'career-guidance';
  title: string;
  message: string;
  actionItems: string[];
  urgency: 'low' | 'medium' | 'high';
  personalizedFor: {
    userPattern: string;
    preferredStyle: string;
  };
  exercises?: Exercise[];
  resources?: Resource[];
}

export interface Exercise {
  title: string;
  description: string;
  estimatedTime: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  instructions: string[];
}

export interface Resource {
  title: string;
  type: 'article' | 'video' | 'book' | 'course' | 'tool';
  url?: string;
  description: string;
  relevanceScore: number;
}

export interface MotivationalMessage {
  message: string;
  context: string;
  personalizedElements: string[];
  tone: 'encouraging' | 'congratulatory' | 'motivating' | 'supportive';
}

export interface CareerGuidance {
  currentPhase: 'exploration' | 'growth' | 'mastery' | 'transition';
  nextSteps: string[];
  skillGaps: { skill: string; importance: number; resources: Resource[] }[];
  opportunityAreas: string[];
  timelineRecommendations: { action: string; timeframe: string; priority: number }[];
}

export class PersonalizedCoach {
  
  /**
   * Generate personalized coaching insights based on user data
   */
  static generateCoachingInsights(
    sprints: Sprint[],
    userProgress: UserProgress[],
    journalEntries: JournalEntry[]
  ): CoachingInsight[] {
    const insights: CoachingInsight[] = [];
    
    // Analyze user patterns
    const patterns = this.analyzeUserPatterns(userProgress, journalEntries);
    
    // Generate different types of insights
    insights.push(...this.generateMotivationalInsights(patterns, userProgress));
    insights.push(...this.generateStrategyInsights(patterns, sprints));
    insights.push(...this.generateSkillDevelopmentInsights(sprints, userProgress));
    insights.push(...this.generateHabitFormationInsights(patterns));
    insights.push(...this.generateCareerGuidanceInsights(sprints, userProgress));

    return insights.sort((a, b) => {
      const urgencyOrder = { high: 3, medium: 2, low: 1 };
      return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
    });
  }

  /**
   * Generate personalized motivational messages
   */
  static generateMotivationalMessage(
    currentContext: 'daily-checkin' | 'task-completion' | 'streak-milestone' | 'setback-recovery',
    userProgress: UserProgress[],
    recentAchievements: string[] = []
  ): MotivationalMessage {
    const patterns = this.analyzeUserPatterns(userProgress, []);
    
    switch (currentContext) {
      case 'daily-checkin':
        return this.createDailyCheckinMessage(patterns, recentAchievements);
      case 'task-completion':
        return this.createTaskCompletionMessage(patterns);
      case 'streak-milestone':
        return this.createStreakMilestoneMessage(patterns);
      case 'setback-recovery':
        return this.createSetbackRecoveryMessage(patterns);
      default:
        return this.createGeneralMotivationalMessage(patterns);
    }
  }

  /**
   * Provide comprehensive career guidance
   */
  static generateCareerGuidance(
    sprints: Sprint[],
    userProgress: UserProgress[]
  ): CareerGuidance {
    const currentPhase = this.determineCareerPhase(sprints, userProgress);
    const skillAnalysis = this.analyzeSkillDevelopment(sprints);
    const progressTrends = this.analyzeProgressTrends(userProgress);

    return {
      currentPhase,
      nextSteps: this.generateNextSteps(currentPhase, progressTrends),
      skillGaps: this.identifySkillGaps(skillAnalysis),
      opportunityAreas: this.identifyOpportunityAreas(sprints, userProgress),
      timelineRecommendations: this.generateTimelineRecommendations(currentPhase, skillAnalysis)
    };
  }

  /**
   * Create personalized sprint templates based on user success patterns
   */
  static generatePersonalizedSprintTemplate(
    userProgress: UserProgress[],
    sprints: Sprint[],
    goal: string
  ): {
    suggestedDuration: 15 | 30;
    dailyTaskRecommendations: { coreTasks: number; specialTasks: number };
    personalizedTasks: string[];
    motivationalElements: string[];
  } {
    const successfulSprints = this.identifySuccessfulSprints(sprints, userProgress);
    const optimalPattern = this.findOptimalSprintPattern(successfulSprints, userProgress);

    return {
      suggestedDuration: optimalPattern.duration,
      dailyTaskRecommendations: optimalPattern.dailyTasks,
      personalizedTasks: this.generatePersonalizedTasks(goal, successfulSprints),
      motivationalElements: this.generateMotivationalElements(userProgress)
    };
  }

  // Private analysis methods
  private static analyzeUserPatterns(
    userProgress: UserProgress[],
    journalEntries: JournalEntry[]
  ): {
    preferredWorkingStyle: 'sprint' | 'steady' | 'burst';
    motivationalTriggers: string[];
    commonStruggles: string[];
    peakPerformanceDays: string[];
    consistencyLevel: number;
    resilience: number;
  } {
    const taskPatterns = this.analyzeTaskCompletionPatterns(userProgress);
    const journalSentiments = this.analyzeSentimentPatterns(journalEntries);
    
    return {
      preferredWorkingStyle: taskPatterns.workingStyle,
      motivationalTriggers: this.extractMotivationalTriggers(journalSentiments),
      commonStruggles: this.identifyCommonStruggles(journalSentiments),
      peakPerformanceDays: taskPatterns.bestDays,
      consistencyLevel: taskPatterns.consistency,
      resilience: this.calculateResilience(userProgress)
    };
  }

  private static generateMotivationalInsights(
    patterns: any,
    userProgress: UserProgress[]
  ): CoachingInsight[] {
    const insights: CoachingInsight[] = [];

    // Low motivation insight
    if (patterns.consistencyLevel < 0.6) {
      insights.push({
        id: 'motivation-boost',
        type: 'motivation',
        title: 'Consistency Challenge Detected',
        message: `I notice your consistency has been around ${Math.round(patterns.consistencyLevel * 100)}%. Let's work on building stronger daily habits that align with your natural rhythm.`,
        actionItems: [
          'Start with just 1 core task per day for the next week',
          'Set up a specific time for career development work',
          'Create a reward system for completing daily tasks'
        ],
        urgency: 'medium',
        personalizedFor: {
          userPattern: 'low-consistency',
          preferredStyle: patterns.preferredWorkingStyle
        },
        exercises: [
          {
            title: 'Habit Stacking Exercise',
            description: 'Link your career development tasks to existing habits',
            estimatedTime: '10 minutes',
            difficulty: 'beginner',
            instructions: [
              'Identify a habit you do consistently every day',
              'Choose one small career task to do immediately after',
              'Practice this combination for 7 days',
              'Track your success rate'
            ]
          }
        ]
      });
    }

    return insights;
  }

  private static generateStrategyInsights(
    patterns: any,
    sprints: Sprint[]
  ): CoachingInsight[] {
    const insights: CoachingInsight[] = [];

    // Sprint optimization insight
    const avgSprintLength = sprints.reduce((sum, s) => sum + s.duration, 0) / sprints.length;
    if (avgSprintLength > 20 && patterns.consistencyLevel < 0.7) {
      insights.push({
        id: 'sprint-optimization',
        type: 'strategy',
        title: 'Sprint Length Optimization',
        message: 'Your data suggests shorter sprints might work better for your working style. Consider 15-day sprints to build momentum.',
        actionItems: [
          'Try a 15-day sprint with focused, achievable goals',
          'Reduce the number of daily tasks to build consistency',
          'Track how this shorter cycle affects your motivation'
        ],
        urgency: 'medium',
        personalizedFor: {
          userPattern: 'benefits-from-shorter-cycles',
          preferredStyle: patterns.preferredWorkingStyle
        }
      });
    }

    return insights;
  }

  private static generateSkillDevelopmentInsights(
    sprints: Sprint[],
    userProgress: UserProgress[]
  ): CoachingInsight[] {
    const insights: CoachingInsight[] = [];
    
    // Analyze skill focus patterns
    const skillFocus = this.analyzeSkillFocus(sprints);
    const topSkills = Object.entries(skillFocus)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([skill]) => skill);

    insights.push({
      id: 'skill-development-focus',
      type: 'skill-development',
      title: 'Your Top Skill Development Areas',
      message: `You've been focusing most on: ${topSkills.join(', ')}. This shows great consistency in your development priorities.`,
      actionItems: [
        `Deepen your ${topSkills[0]} expertise with advanced challenges`,
        'Consider cross-training in complementary skills',
        'Find opportunities to apply these skills in real projects'
      ],
      urgency: 'low',
      personalizedFor: {
        userPattern: 'focused-skill-developer',
        preferredStyle: 'systematic'
      },
      resources: [
        {
          title: `Advanced ${topSkills[0]} Techniques`,
          type: 'course',
          description: `Deep dive into advanced ${topSkills[0]} concepts`,
          relevanceScore: 0.9
        }
      ]
    });

    return insights;
  }

  private static generateHabitFormationInsights(patterns: any): CoachingInsight[] {
    const insights: CoachingInsight[] = [];

    if (patterns.peakPerformanceDays.length > 0) {
      insights.push({
        id: 'optimal-timing',
        type: 'habit-formation',
        title: 'Your Peak Performance Pattern',
        message: `You perform best on ${patterns.peakPerformanceDays.join(' and ')}s. Let's leverage this pattern.`,
        actionItems: [
          `Schedule your most challenging tasks for ${patterns.peakPerformanceDays[0]}s`,
          'Use other days for planning and easier tasks',
          'Track energy levels to refine this pattern'
        ],
        urgency: 'low',
        personalizedFor: {
          userPattern: 'peak-performance-aware',
          preferredStyle: patterns.preferredWorkingStyle
        }
      });
    }

    return insights;
  }

  private static generateCareerGuidanceInsights(
    sprints: Sprint[],
    userProgress: UserProgress[]
  ): CoachingInsight[] {
    const insights: CoachingInsight[] = [];
    const completedSprints = sprints.filter(s => s.status === 'completed').length;

    if (completedSprints >= 3) {
      insights.push({
        id: 'career-acceleration',
        type: 'career-guidance',
        title: 'Ready for Advanced Career Strategies',
        message: `With ${completedSprints} completed sprints, you've built strong development habits. Time to focus on strategic career moves.`,
        actionItems: [
          'Identify 2-3 specific career opportunities to pursue',
          'Build a professional network in your target area',
          'Create projects that demonstrate your growing expertise'
        ],
        urgency: 'medium',
        personalizedFor: {
          userPattern: 'experienced-sprint-user',
          preferredStyle: 'strategic'
        },
        resources: [
          {
            title: 'Strategic Career Planning',
            type: 'article',
            description: 'Advanced techniques for career progression',
            relevanceScore: 0.85
          }
        ]
      });
    }

    return insights;
  }

  // Message generation methods
  private static createDailyCheckinMessage(
    patterns: any,
    achievements: string[]
  ): MotivationalMessage {
    const messages = [
      `Good ${this.getTimeOfDay()}! Ready to make today count?`,
      `Your ${patterns.consistencyLevel > 0.7 ? 'strong' : 'growing'} track record shows you've got this!`,
      `Today is another step toward your career goals. What will you accomplish?`
    ];

    return {
      message: messages[Math.floor(Math.random() * messages.length)],
      context: 'daily-checkin',
      personalizedElements: achievements.slice(0, 2),
      tone: 'encouraging'
    };
  }

  private static createTaskCompletionMessage(patterns: any): MotivationalMessage {
    const messages = [
      '🎉 Another task down! You\'re building unstoppable momentum.',
      '✅ Great work! Each task completed is a step closer to your goals.',
      '⚡ You\'re on fire! This consistency is what separates achievers from dreamers.'
    ];

    return {
      message: messages[Math.floor(Math.random() * messages.length)],
      context: 'task-completion',
      personalizedElements: [`Your ${patterns.preferredWorkingStyle} approach is working well`],
      tone: 'congratulatory'
    };
  }

  // Helper methods
  private static analyzeTaskCompletionPatterns(userProgress: UserProgress[]): {
    workingStyle: 'sprint' | 'steady' | 'burst';
    bestDays: string[];
    consistency: number;
  } {
    // Simplified pattern analysis
    const avgCompletion = userProgress.reduce((sum, p) => sum + p.stats.completionPercentage, 0) / userProgress.length;
    
    return {
      workingStyle: avgCompletion > 80 ? 'sprint' : avgCompletion > 60 ? 'steady' : 'burst',
      bestDays: ['Monday', 'Tuesday'], // Simplified
      consistency: avgCompletion / 100
    };
  }

  private static analyzeSentimentPatterns(journalEntries: JournalEntry[]): string[] {
    // Simplified sentiment analysis
    return journalEntries.map(entry => entry.content.toLowerCase());
  }

  private static extractMotivationalTriggers(sentiments: string[]): string[] {
    // Analyze journal content for motivational patterns
    return ['achievement', 'progress', 'learning'];
  }

  private static identifyCommonStruggles(sentiments: string[]): string[] {
    return ['time management', 'motivation consistency'];
  }

  private static calculateResilience(userProgress: UserProgress[]): number {
    // Measure how well user recovers from setbacks
    const completionRates = userProgress.map(p => p.stats.completionPercentage);
    const variance = this.calculateVariance(completionRates);
    return Math.max(1 - variance / 100, 0);
  }

  private static analyzeSkillFocus(sprints: Sprint[]): { [skill: string]: number } {
    const skillCounts: { [skill: string]: number } = {};
    
    sprints.forEach(sprint => {
      sprint.days.forEach(day => {
        day.coreTasks.forEach(task => {
          skillCounts[task.category] = (skillCounts[task.category] || 0) + 1;
        });
      });
    });

    return skillCounts;
  }

  private static getTimeOfDay(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  }

  private static calculateVariance(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  }

  // Additional helper methods would be implemented here...
  private static createStreakMilestoneMessage(patterns: any): MotivationalMessage {
    return {
      message: '🔥 Incredible streak! You\'re proving that consistency creates miracles.',
      context: 'streak-milestone',
      personalizedElements: ['Your dedication is inspiring'],
      tone: 'congratulatory'
    };
  }

  private static createSetbackRecoveryMessage(patterns: any): MotivationalMessage {
    return {
      message: 'Every expert was once a beginner. Every pro was once an amateur. Keep going! 💪',
      context: 'setback-recovery',
      personalizedElements: ['Your resilience is your superpower'],
      tone: 'supportive'
    };
  }

  private static createGeneralMotivationalMessage(patterns: any): MotivationalMessage {
    return {
      message: 'Your career development journey is unique and valuable. Keep building! 🚀',
      context: 'general',
      personalizedElements: [],
      tone: 'encouraging'
    };
  }

  private static determineCareerPhase(sprints: Sprint[], userProgress: UserProgress[]): 'exploration' | 'growth' | 'mastery' | 'transition' {
    const completedSprints = sprints.filter(s => s.status === 'completed').length;
    if (completedSprints < 2) return 'exploration';
    if (completedSprints < 5) return 'growth';
    if (completedSprints < 10) return 'mastery';
    return 'transition';
  }

  private static generateNextSteps(phase: string, trends: any[]): string[] {
    switch (phase) {
      case 'exploration': return ['Define clear career goals', 'Experiment with different approaches'];
      case 'growth': return ['Deepen expertise', 'Build professional network'];
      case 'mastery': return ['Lead projects', 'Mentor others'];
      default: return ['Explore new opportunities', 'Consider career pivots'];
    }
  }

  private static identifySkillGaps(skillAnalysis: any): { skill: string; importance: number; resources: Resource[] }[] {
    return [
      {
        skill: 'Leadership',
        importance: 0.8,
        resources: [{ title: 'Leadership Fundamentals', type: 'course', description: 'Core leadership skills', relevanceScore: 0.9 }]
      }
    ];
  }

  private static identifyOpportunityAreas(sprints: Sprint[], userProgress: UserProgress[]): string[] {
    return ['Technical leadership', 'Project management', 'Strategic thinking'];
  }

  private static generateTimelineRecommendations(phase: string, skillAnalysis: any): { action: string; timeframe: string; priority: number }[] {
    return [
      { action: 'Complete advanced course', timeframe: '3 months', priority: 1 },
      { action: 'Build portfolio project', timeframe: '6 months', priority: 2 }
    ];
  }

  private static identifySuccessfulSprints(sprints: Sprint[], userProgress: UserProgress[]): Sprint[] {
    return sprints.filter(sprint => {
      const progress = userProgress.find(p => p.sprintId === sprint.id);
      return progress && progress.stats.completionPercentage >= 75;
    });
  }

  private static findOptimalSprintPattern(successfulSprints: Sprint[], userProgress: UserProgress[]): {
    duration: 15 | 30;
    dailyTasks: { coreTasks: number; specialTasks: number };
  } {
    const avgDuration = successfulSprints.reduce((sum, s) => sum + s.duration, 0) / successfulSprints.length;
    
    return {
      duration: avgDuration > 22 ? 30 : 15,
      dailyTasks: { coreTasks: 2, specialTasks: 1 }
    };
  }

  private static generatePersonalizedTasks(goal: string, successfulSprints: Sprint[]): string[] {
    return [
      `Practice ${goal} for 30 minutes daily`,
      `Read one article about ${goal} techniques`,
      `Apply ${goal} concepts in a real project`
    ];
  }

  private static generateMotivationalElements(userProgress: UserProgress[]): string[] {
    return [
      'Track daily wins',
      'Celebrate weekly progress',
      'Share achievements with accountability partner'
    ];
  }

  private static analyzeProgressTrends(userProgress: UserProgress[]): any[] {
    return userProgress.map(p => p.stats.completionPercentage);
  }

  private static analyzeSkillDevelopment(sprints: Sprint[]): any {
    return { skills: ['leadership', 'technical', 'communication'] };
  }
}
