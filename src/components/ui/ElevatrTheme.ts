// Elevatr Theme Utilities
// Export all Elevatr-themed components for easy importing

export { ElevatrCard, ElevatrCardHeader, ElevatrCardContent, ElevatrCardTitle, ElevatrCardDescription } from './ElevatrCard';
export { ElevatrButton } from './ElevatrButton';
export { ElevatrBadge } from './ElevatrBadge';
export { ElevatrProgress, ElevatrStatCard, ElevatrStatusIndicator } from './ElevatrProgress';
export { ElevatrSprintCard, ElevatrTaskCard } from './ElevatrSprintCard';
export { ElevatrJournalCard, ElevatrFloatingActionButton } from './ElevatrJournalCard';
export { ElevatrNotification, ElevatrTooltip, ElevatrEmptyState } from './ElevatrNotification';

// Theme utility functions
export const elevatrTheme = {
  colors: {
    primary: '#3B82F6',
    secondary: '#64748B',
    accent: '#14B8A6',
    success: '#10B981',
    journal: '#D8B4FE',
    badge: '#F59E0B',
    background: {
      light: '#FFFFFF',
      dark: '#0F172A'
    },
    surface: {
      light: '#FFFFFF',
      dark: '#1E293B'
    },
    text: {
      primary: '#334155',
      secondary: '#64748B',
      light: '#F8FAFC'
    }
  },
  
  gradients: {
    primary: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)',
    accent: 'linear-gradient(135deg, #14B8A6 0%, #06B6D4 100%)',
    success: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
    journal: 'linear-gradient(135deg, #D8B4FE 0%, #E879F9 100%)',
    badge: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
    motivation: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 50%, #14B8A6 100%)'
  },
  
  glass: {
    light: {
      background: 'rgba(255, 255, 255, 0.15)',
      border: 'rgba(255, 255, 255, 0.1)',
      blur: 'blur(16px)'
    },
    dark: {
      background: 'rgba(15, 23, 42, 0.15)',
      border: 'rgba(255, 255, 255, 0.1)',
      blur: 'blur(16px)'
    }
  },
  
  shadows: {
    soft: '0 1px 2px rgba(0, 0, 0, 0.05)',
    medium: '0 6px 16px rgba(0, 0, 0, 0.08)',
    strong: '0 10px 24px rgba(0, 0, 0, 0.1)',
    dramatic: '0 20px 40px rgba(0, 0, 0, 0.12)',
    hero: '0 25px 50px rgba(0, 0, 0, 0.15)'
  },
  
  animations: {
    fadeInUp: 'fadeInUp 0.6s ease-out',
    fadeInScale: 'fadeInScale 0.4s ease-out',
    slideInRight: 'slideInRight 0.5s ease-out',
    slideInLeft: 'slideInLeft 0.5s ease-out',
    pulseGlow: 'pulse-glow 2s infinite',
    motivationPulse: 'motivation-pulse 3s infinite',
    float: 'float 3s ease-in-out infinite',
    bounceSubtle: 'bounce-subtle 2s ease-in-out infinite',
    gradientShift: 'gradient-shift 4s ease-in-out infinite'
  }
};

// CSS class name utilities
export const elevatrClasses = {
  // Cards
  card: 'elevatr-card',
  cardGlass: 'glass-card',
  cardGlassStrong: 'glass-card-strong',
  cardInteractive: 'elevatr-card-interactive',
  cardStat: 'elevatr-stat-card',
  
  // Buttons
  button: 'elevatr-button',
  buttonSecondary: 'elevatr-button-secondary',
  buttonAccent: 'elevatr-button-accent',
  buttonSuccess: 'elevatr-button-success',
  
  // Progress
  progress: 'elevatr-progress',
  progressBar: 'elevatr-progress-bar',
  
  // Status
  statusActive: 'elevatr-status-active',
  statusCompleted: 'elevatr-status-completed',
  statusError: 'elevatr-status-error',
  statusPending: 'elevatr-status-pending',
  
  // Shadows
  shadowSoft: 'elevatr-shadow-soft',
  shadowMedium: 'elevatr-shadow-medium',
  shadowStrong: 'elevatr-shadow-strong',
  shadowDramatic: 'elevatr-shadow-dramatic',
  shadowHero: 'elevatr-shadow-hero',
  
  // Hover effects
  hoverLift: 'elevatr-hover-lift',
  hoverGlow: 'elevatr-hover-glow',
  hoverScale: 'elevatr-hover-scale',
  
  // Animations
  animateFadeInUp: 'elevatr-animate-fade-in-up',
  animateFadeInScale: 'elevatr-animate-fade-in-scale',
  animateSlideInRight: 'elevatr-animate-slide-in-right',
  animateSlideInLeft: 'elevatr-animate-slide-in-left',
  animatePulseGlow: 'elevatr-animate-pulse-glow',
  animateMotivationPulse: 'elevatr-animate-motivation-pulse',
  animateFloat: 'elevatr-animate-float',
  animateBounceSubtle: 'elevatr-animate-bounce-subtle',
  animateGradientShift: 'elevatr-animate-gradient-shift',
  
  // Gradients
  gradientPrimary: 'elevatr-gradient-primary',
  gradientAccent: 'elevatr-gradient-accent',
  gradientSuccess: 'elevatr-gradient-success',
  gradientJournal: 'elevatr-gradient-journal',
  gradientBadge: 'elevatr-gradient-badge',
  gradientMotivation: 'elevatr-gradient-motivation',
  
  // Sprint & Task specific
  sprintActive: 'sprint-card-active',
  sprintPlanning: 'sprint-card-planning',
  sprintCompleted: 'sprint-card-completed',
  taskPriorityHigh: 'task-priority-high',
  taskPriorityMedium: 'task-priority-medium',
  taskPriorityLow: 'task-priority-low',
  
  // Journal specific
  journalCard: 'journal-card',
  motivationBadge: 'motivation-badge',
  
  // FAB
  fab: 'elevatr-fab'
};

// Helper function to get appropriate classes based on theme/variant
export function getElevatrVariantClasses(
  component: 'card' | 'button' | 'badge' | 'progress' | 'status',
  variant?: string
): string {
  const variantMap: Record<string, Record<string, string>> = {
    card: {
      default: elevatrClasses.card,
      glass: elevatrClasses.cardGlass,
      'glass-strong': elevatrClasses.cardGlassStrong,
      interactive: elevatrClasses.cardInteractive,
      stat: elevatrClasses.cardStat,
      journal: elevatrClasses.journalCard
    },
    button: {
      primary: elevatrClasses.button,
      secondary: elevatrClasses.buttonSecondary,
      accent: elevatrClasses.buttonAccent,
      success: elevatrClasses.buttonSuccess
    },
    badge: {
      motivation: elevatrClasses.motivationBadge,
      primary: elevatrClasses.gradientPrimary,
      success: elevatrClasses.gradientSuccess,
      accent: elevatrClasses.gradientAccent,
      journal: elevatrClasses.gradientJournal
    },
    progress: {
      primary: '',
      accent: 'elevatr-progress-accent',
      success: 'elevatr-progress-success',
      journal: 'elevatr-progress-journal'
    },
    status: {
      active: elevatrClasses.statusActive,
      completed: elevatrClasses.statusCompleted,
      error: elevatrClasses.statusError,
      pending: elevatrClasses.statusPending
    }
  };

  return variantMap[component]?.[variant || 'default'] || '';
}
