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
      variant: 'default' as const,
    },
    {
      title: 'Upload Sprint Plan',
      description: 'Import a sprint plan from JSON file',
      icon: Upload,
      href: '/upload',
      variant: 'outline' as const,
    },
    {
      title: 'Add Journal Entry',
      description: 'Record your thoughts and progress',
      icon: BookOpen,
      href: '/journal/new',
      variant: 'outline' as const,
    },
    {
      title: 'View Calendar',
      description: 'See your sprint timeline and deadlines',
      icon: Calendar,
      href: '/calendar',
      variant: 'outline' as const,
    },
    {
      title: 'View Progress',
      description: 'Analyze your performance and growth',
      icon: BarChart3,
      href: '/progress',
      variant: 'outline' as const,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {actions.map((action) => (
            <Button
              key={action.title}
              variant={action.variant}
              className="h-auto p-4 flex flex-col items-start space-y-2"
              asChild
            >
              <Link href={action.href}>
                <div className="flex items-center gap-2 w-full">
                  <action.icon className="h-5 w-5" />
                  <span className="font-medium">{action.title}</span>
                </div>
                <p className="text-xs text-muted-foreground text-left">
                  {action.description}
                </p>
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
