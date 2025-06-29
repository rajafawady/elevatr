'use client';

import { CheckCircle2, Circle, BookOpen } from 'lucide-react';

interface CalendarDayProps {
  day: number;
  isCurrentMonth: boolean;
  sprintDay?: string;
  isCompleted: boolean;
  tasksCompleted: number;
  totalTasks: number;
  hasJournal: boolean;
  onDayClick?: (sprintDay: string, day: number) => void;
}

export function CalendarDay({
  day,
  isCurrentMonth,
  sprintDay,
  isCompleted,
  tasksCompleted,
  totalTasks,
  hasJournal,
  onDayClick
}: CalendarDayProps) {
  const isClickable = isCurrentMonth && sprintDay;

  const handleClick = () => {
    if (isClickable && sprintDay && onDayClick) {
      onDayClick(sprintDay, day);
    }
  };

  return (
    <div
      onClick={isClickable ? handleClick : undefined}
      className={`
        aspect-square p-1 text-center relative border rounded-md transition-all duration-200
        ${isCurrentMonth 
          ? 'bg-background hover:bg-primary/5' 
          : 'bg-muted/50 text-muted-foreground'
        }
        ${sprintDay 
          ? 'ring-2 ring-primary/20 cursor-pointer hover:ring-primary/40' 
          : ''
        }
        ${isCompleted 
          ? 'bg-success/10 border-success/20' 
          : ''
        }
      `}
    >
      <div className="text-sm font-medium">
        {day}
      </div>
      
      {sprintDay && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-5">
          <div className="text-xs text-primary font-medium">
            Day {sprintDay}
          </div>
          
          {totalTasks > 0 && (
            <div className="flex items-center gap-1 mt-1">
              <div className="text-xs">
                {tasksCompleted}/{totalTasks}
              </div>
              {isCompleted ? (
                <CheckCircle2 className="h-3 w-3 text-success" />
              ) : (
                <Circle className="h-3 w-3" />
              )}
            </div>
          )}
          
          {hasJournal && (
            <BookOpen className="h-3 w-3 text-accent mt-1" />
          )}
        </div>
      )}
    </div>
  );
}
