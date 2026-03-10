'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Match } from '@/types/firestore';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface MatchCalendarProps {
  matches: Match[];
}

export function MatchCalendar({ matches }: MatchCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Navigate months
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Get calendar data
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startDay = firstDayOfMonth.getDay(); // 0 = Sunday

  // Generate calendar days
  const calendarDays: (Date | null)[] = [];
  
  // Add empty spaces for days before month starts
  for (let i = 0; i < startDay; i++) {
    calendarDays.push(null);
  }
  
  // Add actual days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(new Date(year, month, day));
  }

  // Helper: Get matches for a specific date
  const getMatchesForDate = (date: Date) => {
    return matches.filter(match => {
      const matchDate = typeof match.matchDate === 'string' 
        ? new Date(match.matchDate)
        : match.matchDate.toDate();
      
      return (
        matchDate.getDate() === date.getDate() &&
        matchDate.getMonth() === date.getMonth() &&
        matchDate.getFullYear() === date.getFullYear()
      );
    });
  };

  // Helper: Check if date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Match Calendar</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
            <div className="flex items-center">
              <Button variant="ghost" size="icon" onClick={goToPreviousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="min-w-[140px] text-center font-semibold">
                {currentDate.toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' })}
              </span>
              <Button variant="ghost" size="icon" onClick={goToNextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1">
          {/* Day headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div
              key={day}
              className="text-center text-sm font-semibold text-muted-foreground p-2"
            >
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {calendarDays.map((date, index) => {
            if (!date) {
              return (
                <div
                  key={`empty-${index}`}
                  className="min-h-[100px] p-2 border border-transparent"
                />
              );
            }

            const dayMatches = getMatchesForDate(date);
            const today = isToday(date);

            return (
              <div
                key={date.toISOString()}
                className={cn(
                  "min-h-[100px] p-2 border rounded-lg hover:bg-muted/50 transition-colors",
                  today && "bg-primary/10 border-primary"
                )}
              >
                <div className={cn(
                  "text-sm font-medium mb-1",
                  today && "text-primary font-bold"
                )}>
                  {date.getDate()}
                </div>

                <div className="space-y-1">
                  {dayMatches.slice(0, 2).map((match) => (
                    <Link
                      key={match.id}
                      href={`/matches/${match.id}`}
                      className="block"
                    >
                      <div
                        className={cn(
                          "text-xs p-1 rounded cursor-pointer hover:opacity-80 transition-opacity",
                          match.status === 'live' && "bg-red-100 dark:bg-red-950 text-red-900 dark:text-red-100",
                          match.status === 'scheduled' && "bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-100",
                          match.status === 'completed' && "bg-green-100 dark:bg-green-950 text-green-900 dark:text-green-100"
                        )}
                      >
                        <div className="font-medium truncate">
                          {match.matchType || 'Match'}
                        </div>
                      </div>
                    </Link>
                  ))}
                  {dayMatches.length > 2 && (
                    <div className="text-xs text-muted-foreground text-center">
                      +{dayMatches.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-6 pt-4 border-t">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-red-100 dark:bg-red-950" />
            <span className="text-xs text-muted-foreground">Live</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-blue-100 dark:bg-blue-950" />
            <span className="text-xs text-muted-foreground">Scheduled</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-100 dark:bg-green-950" />
            <span className="text-xs text-muted-foreground">Completed</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
