// Personalized Coaching Panel Component
'use client';

import { useState, useEffect } from 'react';
import { ElevatrCard } from '@/components/ui/ElevatrCard';
import { ElevatrBadge } from '@/components/ui/ElevatrBadge';
import { ElevatrButton } from '@/components/ui/ElevatrButton';
import { PersonalizedCoach, CoachingInsight, MotivationalMessage, CareerGuidance } from '@/services/personalizedCoach';
import { Task, Sprint, UserProgress } from '@/types';
import { 
  Heart, 
  MessageCircle, 
  TrendingUp, 
  Target,
  Zap,
  Star,
  ChevronRight,
  Lightbulb,
  Trophy,
  RefreshCw,
  Calendar
} from 'lucide-react';

interface PersonalizedCoachingProps {
  tasks: Task[];
  sprints: Sprint[];
  userProgress: UserProgress[];
  className?: string;
}

export function PersonalizedCoaching({ 
  tasks, 
  sprints, 
  userProgress, 
  className = '' 
}: PersonalizedCoachingProps) {  const [coachingInsights, setCoachingInsights] = useState<CoachingInsight[]>([]);
  const [motivationalMessage, setMotivationalMessage] = useState<MotivationalMessage | null>(null);
  const [careerGuidance, setCareerGuidance] = useState<CareerGuidance | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'coaching' | 'motivation' | 'career'>('coaching');
  const [refreshing, setRefreshing] = useState(false);
  const generateCoachingContent = async () => {
    if (userProgress.length > 0) {
      try {
        // Extract journal entries from user progress
        const journalEntries = userProgress.flatMap(up => up.journalEntries || []);
        
        const insights = PersonalizedCoach.generateCoachingInsights(sprints, userProgress, journalEntries);
        const motivation = PersonalizedCoach.generateMotivationalMessage('daily-checkin', userProgress);
        const career = PersonalizedCoach.generateCareerGuidance(sprints, userProgress);
        
        setCoachingInsights(insights);
        setMotivationalMessage(motivation);
        setCareerGuidance(career);
      } catch (error) {
        console.error('Error generating coaching content:', error);
      }
    }
  };

  useEffect(() => {
    setLoading(true);
    generateCoachingContent().finally(() => setLoading(false));
  }, [tasks, sprints, userProgress]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await generateCoachingContent();
    setRefreshing(false);
  };

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case 'encouragement': return <Heart className="w-4 h-4" />;
      case 'advice': return <Lightbulb className="w-4 h-4" />;
      case 'challenge': return <Target className="w-4 h-4" />;
      case 'celebration': return <Trophy className="w-4 h-4" />;
      default: return <MessageCircle className="w-4 h-4" />;
    }
  };

  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case 'encouragement': return 'elevatr-gradient-motivation';
      case 'advice': return 'elevatr-gradient-primary';
      case 'challenge': return 'elevatr-gradient-accent';
      case 'celebration': return 'elevatr-gradient-success';
      default: return 'elevatr-gradient-journal';
    }
  };

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'enthusiastic': return 'text-green-600';
      case 'supportive': return 'text-blue-600';
      case 'motivational': return 'text-purple-600';
      case 'celebratory': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <ElevatrCard variant="glass" className={`p-6 ${className}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg elevatr-gradient-motivation">
            <Heart className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-bold elevatr-gradient-text">Your AI Coach</h2>
            <p className="text-sm text-muted-foreground">Preparing personalized guidance...</p>
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
          <div className="p-2 rounded-lg elevatr-gradient-motivation">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold elevatr-gradient-text">Your AI Coach</h2>
            <p className="text-sm text-muted-foreground">
              Personalized guidance and motivation for your journey
            </p>
          </div>
          <ElevatrButton
            variant="secondary"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </ElevatrButton>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6">
          <ElevatrButton
            variant={activeTab === 'coaching' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setActiveTab('coaching')}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Coaching
          </ElevatrButton>
          <ElevatrButton
            variant={activeTab === 'motivation' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setActiveTab('motivation')}
          >
            <Zap className="w-4 h-4 mr-2" />
            Motivation
          </ElevatrButton>          <ElevatrButton
            variant={activeTab === 'career' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setActiveTab('career')}
          >
            <Star className="w-4 h-4 mr-2" />
            Career
          </ElevatrButton>
        </div>

        {/* Coaching Insights Tab */}
        {activeTab === 'coaching' && (
          <div className="space-y-4">
            {coachingInsights.length === 0 ? (
              <div className="text-center py-8">
                <Heart className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">
                  Keep working on your goals to unlock personalized coaching insights!
                </p>
              </div>
            ) : (
              coachingInsights.map((insight, index) => (
                <div 
                  key={insight.id}
                  className="glass-panel p-4 rounded-lg elevatr-animate-fade-in-up hover:bg-primary/5 transition-all duration-300"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg flex-shrink-0 ${getMessageTypeColor(insight.type)}`}>
                      {getMessageTypeIcon(insight.type)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <ElevatrBadge 
                          variant="primary"
                          className="text-xs capitalize"
                        >
                          {insight.type.replace('-', ' ')}
                        </ElevatrBadge>
                        <ElevatrBadge 
                          variant={insight.urgency === 'high' ? 'accent' : insight.urgency === 'medium' ? 'motivation' : 'journal'}
                          className="text-xs capitalize"
                        >
                          {insight.urgency} priority
                        </ElevatrBadge>
                      </div>
                      
                      <h3 className="font-semibold text-foreground mb-2">{insight.title}</h3>
                      <p className="text-foreground mb-3 leading-relaxed">
                        {insight.message}
                      </p>
                      
                      {insight.actionItems.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                            <Target className="w-3 h-3" />
                            Action Items:
                          </h4>
                          <ul className="space-y-1">
                            {insight.actionItems.map((item: string, idx: number) => (
                              <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                                <ChevronRight className="w-3 h-3 text-primary" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Motivation Tab */}
        {activeTab === 'motivation' && motivationalMessage && (
          <div className="space-y-4">
            <div className="glass-panel p-6 rounded-lg text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full elevatr-gradient-motivation">
                  <Zap className="w-6 h-6 text-white" />
                </div>
              </div>
              
              <h3 className="text-lg font-bold elevatr-gradient-text mb-3">
                Daily Motivation
              </h3>
              
              <p className="text-foreground text-base leading-relaxed mb-4">
                {motivationalMessage.message}
              </p>
              
              <div className="flex justify-center gap-2 mb-4">
                <ElevatrBadge variant="motivation" className="text-xs">
                  {motivationalMessage.context}
                </ElevatrBadge>
                <ElevatrBadge variant="accent" className="text-xs capitalize">
                  {motivationalMessage.tone}
                </ElevatrBadge>
              </div>
              
              {motivationalMessage.personalizedElements.length > 0 && (
                <div className="space-y-2 mt-4">
                  <h4 className="text-sm font-medium text-foreground">Personalized for you:</h4>
                  <div className="text-sm text-muted-foreground">
                    {motivationalMessage.personalizedElements.join(' • ')}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Career Guidance Tab */}
        {activeTab === 'career' && careerGuidance && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="glass-panel p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Star className="w-5 h-5 text-primary" />
                  <span className="font-semibold">Career Phase</span>
                </div>
                <div className="text-lg font-bold text-primary capitalize">
                  {careerGuidance.currentPhase}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Current development stage
                </div>
              </div>
              
              <div className="glass-panel p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <span className="font-semibold">Opportunities</span>
                </div>
                <div className="text-lg font-bold text-green-600">
                  {careerGuidance.opportunityAreas.length} areas
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  identified for growth
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="glass-panel p-4 rounded-lg">
                <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Next Steps
                </h4>
                <div className="space-y-2">
                  {careerGuidance.nextSteps.map((step: string, idx: number) => (
                    <div key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                      <ChevronRight className="w-3 h-3 text-primary" />
                      {step}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="glass-panel p-4 rounded-lg">
                <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" />
                  Skill Development Opportunities
                </h4>
                <div className="space-y-2">
                  {careerGuidance.skillGaps.slice(0, 5).map((gap: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">{gap.skill}</span>
                      <span className="text-sm font-medium text-orange-600">
                        Priority: {gap.importance}/10
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="glass-panel p-4 rounded-lg">
                <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Timeline Recommendations
                </h4>
                <div className="space-y-2">
                  {careerGuidance.timelineRecommendations
                    .sort((a: any, b: any) => b.priority - a.priority)
                    .slice(0, 5)
                    .map((rec: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">{rec.action}</span>
                      <span className="text-sm font-medium text-blue-600">
                        {rec.timeframe}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </ElevatrCard>
    </div>
  );
}
