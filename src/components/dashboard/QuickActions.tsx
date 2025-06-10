'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Plus, Upload, Calendar, BookOpen, BarChart3, Target } from 'lucide-react';
import Link from 'next/link';

export function QuickActions() {
  const actions = [
    {
      title: 'Start New Sprint',
      description: 'Create a new 15-day or 30-day career sprint',
      icon: Target,
      href: '/sprint/new',
      variant: 'gradient' as const,
      color: 'from-blue-500 to-purple-600',
    },
    {
      title: 'Upload Sprint Plan',
      description: 'Import a sprint plan from JSON file',
      icon: Upload,
      href: '/upload',
      variant: 'glass' as const,
      color: 'from-green-500 to-emerald-600',
    },
    {
      title: 'Add Journal Entry',
      description: 'Record your thoughts and progress',
      icon: BookOpen,
      href: '/journal/new',
      variant: 'glass' as const,
      color: 'from-orange-500 to-red-600',
    },
    {
      title: 'View Calendar',
      description: 'See your sprint timeline and deadlines',
      icon: Calendar,
      href: '/calendar',
      variant: 'glass' as const,
      color: 'from-purple-500 to-pink-600',
    },
    {
      title: 'View Progress',
      description: 'Analyze your performance and growth',
      icon: BarChart3,
      href: '/progress',
      variant: 'glass' as const,
      color: 'from-indigo-500 to-blue-600',
    },
  ];

  return (
    <Card variant="elevated" hover>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20">
            <Plus className="h-5 w-5 text-primary" />
          </div>
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {actions.map((action, index) => (
            <Card
              key={action.title}
              variant="interactive"
              className="group relative overflow-hidden border-0 bg-gradient-to-br from-background to-accent/5 hover:from-accent/10 hover:to-accent/20 transition-all duration-300"
            >
              <Link href={action.href} className="block p-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${action.color} shadow-soft group-hover:shadow-medium transition-all duration-300`}>
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
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
              </Link>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
