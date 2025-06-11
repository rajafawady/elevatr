'use client';

import { ElevatrCard, ElevatrCardHeader, ElevatrCardContent, ElevatrCardTitle } from '@/components/ui/ElevatrTheme';
import { Plus, Upload, Calendar, BookOpen, BarChart3, Target } from 'lucide-react';
import Link from 'next/link';

export function QuickActions() {
  const actions = [
    {
      title: 'Start New Sprint',
      description: 'Create a new 15-day or 30-day career sprint',
      icon: Target,
      href: '/sprint/new',
      gradient: 'elevatr-gradient-primary',
    },
    {
      title: 'Upload Sprint Plan',
      description: 'Import a sprint plan from JSON file',
      icon: Upload,
      href: '/upload',
      gradient: 'elevatr-gradient-success',
    },
    {
      title: 'Add Journal Entry',
      description: 'Record your thoughts and progress',
      icon: BookOpen,
      href: '/journal/new',
      gradient: 'elevatr-gradient-journal',
    },
    {
      title: 'View Calendar',
      description: 'See your sprint timeline and deadlines',
      icon: Calendar,
      href: '/calendar',
      gradient: 'elevatr-gradient-accent',
    },
    {
      title: 'View Progress',
      description: 'Analyze your performance and growth',
      icon: BarChart3,
      href: '/progress',
      gradient: 'elevatr-gradient-motivation',
    },
  ];

  return (
    <ElevatrCard variant="glass" className="p-6">
      <ElevatrCardHeader>
        <ElevatrCardTitle className="flex items-center gap-3">
            <div className="p-2 rounded-lg elevatr-gradient-primary">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
          Quick Actions
        </ElevatrCardTitle>
      </ElevatrCardHeader>
      <ElevatrCardContent>        <div className="elevatr-grid elevatr-grid-auto-fit gap-4">
          {actions.map((action, index) => (
            <div key={action.title} className="elevatr-animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
              <ElevatrCard
                variant="interactive"
                hover
                className="group relative overflow-hidden border-0"
              >
                <Link href={action.href} className="block p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${action.gradient} elevatr-shadow-soft elevatr-hover-glow transition-all duration-300`}>
                      <action.icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {action.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        {action.description}
                      </p>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 w-full h-0.5 elevatr-gradient-motivation transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                </Link>
              </ElevatrCard>
            </div>
          ))}
        </div>
      </ElevatrCardContent>
    </ElevatrCard>
  );
}
