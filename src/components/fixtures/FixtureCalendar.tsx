'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, CalendarDays, Trophy, Info, Clock, PlayCircle } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { DisplayFixture } from '@/app/fixtures/page';
import { D } from '@/lib/design-system';
import { motion, AnimatePresence } from 'framer-motion';

interface FixtureCalendarProps {
  fixtures: DisplayFixture[];
}

export function FixtureCalendar({ fixtures }: FixtureCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startDay = firstDayOfMonth.getDay();

  const calendarDays: (Date | null)[] = [];
  for (let i = 0; i < startDay; i++) {
    calendarDays.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(new Date(year, month, day));
  }

  const getFixturesForDate = (date: Date) => {
    return fixtures.filter(fixture => {
      const parts = fixture.date.split('-');
      if (parts.length !== 3) return false;
      const fYear = parseInt(parts[0], 10);
      const fMonth = parseInt(parts[1], 10) - 1;
      const fDay = parseInt(parts[2], 10);
      return fYear === date.getFullYear() && fMonth === date.getMonth() && fDay === date.getDate();
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  };

  return (
    <div className="rounded-[2.5rem] overflow-hidden border shadow-2xl" style={{ background: D.surf1, borderColor: D.border }}>
      <div className="p-10 border-b flex flex-col md:flex-row items-center justify-between gap-6" style={{ borderColor: D.border }}>
        <div className="flex items-center gap-4">
           <div className="h-14 w-14 rounded-2xl flex items-center justify-center border shadow-inner" style={{ background: D.surf2, borderColor: D.border }}>
              <CalendarDays className="h-7 w-7 text-indigo-500" />
           </div>
           <div>
              <h2 className="text-3xl font-bold uppercase tracking-tight" style={{ fontFamily: D.head, color: D.textPrimary }}>
                {currentDate.toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' }).toUpperCase()}
              </h2>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] opacity-40 mt-1" style={{ color: D.textMuted }}>INSTITUTIONAL SCHEDULE CALENDAR</p>
           </div>
        </div>
        
        <div className="flex items-center gap-3 p-1.5 rounded-2xl" style={{ background: D.surf2, border: `1px solid ${D.border}` }}>
          <Button variant="ghost" size="icon" onClick={goToPreviousMonth} className="h-10 w-10 rounded-xl hover:bg-black/5">
            <ChevronLeft size={18} />
          </Button>
          <Button variant="ghost" onClick={goToToday} className="px-6 h-10 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-black/5">
            TODAY
          </Button>
          <Button variant="ghost" size="icon" onClick={goToNextMonth} className="h-10 w-10 rounded-xl hover:bg-black/5">
            <ChevronRight size={18} />
          </Button>
        </div>
      </div>

      <div className="p-10">
        <div className="grid grid-cols-7 gap-4">
          {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day) => (
            <div key={day} className="text-center text-[10px] font-bold uppercase tracking-[0.3em] opacity-40 py-4" style={{ color: D.textMuted }}>
              {day}
            </div>
          ))}

          {calendarDays.map((date, index) => {
            if (!date) return <div key={`empty-${index}`} className="min-h-[140px] rounded-3xl border border-transparent" />;

            const dayFixtures = getFixturesForDate(date);
            const today = isToday(date);

            return (
              <motion.div
                key={date.toISOString()}
                whileHover={{ scale: 0.98 }}
                className={cn(
                  "min-h-[140px] p-4 rounded-3xl border transition-all duration-300 relative group overflow-hidden",
                  today ? "shadow-xl" : "hover:shadow-lg"
                )}
                style={{ 
                  background: today ? `${D.indigo}05` : D.surf2, 
                  borderColor: today ? D.indigo : D.border 
                }}
              >
                {today && <div className="absolute top-0 right-0 p-3"><div className="w-2 h-2 rounded-full animate-pulse" style={{ background: D.indigo, boxShadow: `0 0 10px ${D.indigo}` }} /></div>}
                
                <div className={cn(
                  "text-xl font-bold mb-3",
                  today ? "text-indigo-500" : "opacity-40"
                )} style={{ fontFamily: D.head }}>
                  {date.getDate()}
                </div>

                <div className="space-y-2 relative z-10">
                  {dayFixtures.slice(0, 3).map((fixture) => {
                    const statusConfig = {
                      Live: { color: D.rose, icon: PlayCircle },
                      Scheduled: { color: D.indigo, icon: Clock },
                      Completed: { color: D.emerald, icon: Trophy },
                      Rain: { color: D.sky, icon: Clock }
                    } as any;
                    const sc = statusConfig[fixture.status] || statusConfig.Scheduled;

                    return (
                      <Link key={fixture.id} href={`/matches/${fixture.id}`} className="block">
                        <div className="px-2.5 py-2 rounded-xl border text-[9px] font-bold uppercase tracking-tight transition-all hover:scale-105"
                             style={{ background: D.surf1, borderColor: `${sc.color}20`, color: D.textPrimary }}>
                          <div className="flex items-center gap-1.5 mb-1 opacity-40">
                             <sc.icon size={10} style={{ color: sc.color }} />
                             <span className="truncate">{fixture.status.toUpperCase()}</span>
                          </div>
                          <div className="truncate font-bold">{fixture.homeTeamName} vs {fixture.awayTeamName}</div>
                        </div>
                      </Link>
                    );
                  })}
                  {dayFixtures.length > 3 && (
                    <div className="text-[9px] font-bold uppercase tracking-widest text-center py-1 opacity-40">
                      +{dayFixtures.length - 3} MORE MATCHES
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Strategic Legend */}
        <div className="flex flex-wrap items-center justify-center gap-8 mt-12 pt-10 border-t" style={{ borderColor: D.border }}>
          {[
            { label: 'LIVE OPERATIONS', color: D.rose, icon: PlayCircle },
            { label: 'SCHEDULED FIXTURES', color: D.indigo, icon: Clock },
            { label: 'COMPLETED RECORDS', color: D.emerald, icon: Trophy },
            { label: 'SYSTEM DELAYS', color: D.sky, icon: Info }
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full" style={{ background: item.color, boxShadow: `0 0 8px ${item.color}40` }} />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60" style={{ color: D.textMuted }}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
