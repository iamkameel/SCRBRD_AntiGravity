"use client";

import { useState, useEffect } from "react";
import { fetchMatches, fetchTrips, fetchPlayers, fetchTransactions } from "@/lib/firestore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, 
  Trophy, Dumbbell, Truck, Wallet, Filter, Clock, MapPin, Plus, ArrowUpRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { D } from "@/lib/design-system";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { motion } from "framer-motion";

type EventType = 'match' | 'training' | 'transport' | 'finance';

interface CalendarEvent {
  id: string;
  type: EventType;
  title: string;
  date: Date;
  time?: string;
  description?: string;
  meta?: any;
}

export default function StrategicCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [filters, setFilters] = useState<Record<EventType, boolean>>({
    match: true,
    training: true,
    transport: true,
    finance: false,
  });
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [matches, trips, players, transactions] = await Promise.all([
          fetchMatches(100).catch(() => []),
          fetchTrips(50).catch(() => []),
          fetchPlayers(100).catch(() => []),
          fetchTransactions(50).catch(() => [])
        ]);

        const allEvents: CalendarEvent[] = [];

        // 1. Matches
        matches.forEach((m: any) => {
          if (m.dateTime) {
            allEvents.push({
              id: m.id,
              type: 'match',
              title: `${m.homeTeamName || 'Home'} vs ${m.awayTeamName || 'Away'}`,
              date: new Date(m.dateTime),
              time: new Date(m.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              description: `Venue: ${m.venue || 'TBD'}`,
              meta: m
            });
          }
        });

        // 2. Transport (Trips)
        trips.forEach((t: any) => {
          if (t.date) {
            allEvents.push({
              id: t.id,
              type: 'transport',
              title: `Trip: ${t.destination || 'Destination'}`,
              date: new Date(t.date),
              description: `${t.purpose || 'Transport'} (${t.passengers || 0} pax)`,
              meta: t
            });
          }
        });

        // 3. Training Logs
        players.forEach((p: any) => {
          if (p.trainingLogs) {
            p.trainingLogs.forEach((log: any) => {
              if (log.date) {
                allEvents.push({
                  id: `${p.id}-${log.sessionId}`,
                  type: 'training',
                  title: `${p.firstName || 'Player'}'s Training`,
                  date: new Date(log.date),
                  description: `${log.type || 'Session'} - ${log.durationMinutes || 60} mins`,
                  meta: { ...log, personName: `${p.firstName} ${p.lastName}` }
                });
              }
            });
          }
        });

        // 4. Financials
        transactions.forEach((t: any) => {
          if (t.date) {
            allEvents.push({
              id: t.id,
              type: 'finance',
              title: `Tx: ${t.description || 'Transaction'}`,
              date: new Date(t.date),
              description: `${t.type || 'Expense'} - R${t.amount || 0}`,
              meta: t
            });
          }
        });

        setEvents(allEvents.sort((a, b) => a.date.getTime() - b.date.getTime()));
      } catch (error) {
        console.error("Failed to load calendar data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Calendar logic
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const monthNames = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => {
    const now = new Date();
    setCurrentDate(now);
    setSelectedDate(now);
  };

  const getEventsForDay = (day: number) => {
    return events.filter(e => {
      return e.date.getDate() === day && 
             e.date.getMonth() === month && 
             e.date.getFullYear() === year &&
             filters[e.type];
    });
  };

  const selectedDayEvents = events.filter(e => 
    e.date.getDate() === selectedDate.getDate() &&
    e.date.getMonth() === selectedDate.getMonth() &&
    e.date.getFullYear() === selectedDate.getFullYear() &&
    filters[e.type]
  );

  const getEventBadge = (type: EventType) => {
    switch (type) {
      case 'match':
        return { bg: 'bg-emerald-500/10', text: 'text-emerald-300', border: 'border-emerald-500/20', icon: Trophy, color: D.emerald };
      case 'training':
        return { bg: 'bg-indigo-500/10', text: 'text-indigo-300', border: 'border-indigo-500/20', icon: Dumbbell, color: D.indigo };
      case 'transport':
        return { bg: 'bg-amber-500/10', text: 'text-amber-300', border: 'border-amber-500/20', icon: Truck, color: D.amber };
      case 'finance':
        return { bg: 'bg-purple-500/10', text: 'text-purple-300', border: 'border-purple-500/20', icon: Wallet, color: D.violet };
    }
  };

  return (
    <div className="space-y-8 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Standardized Section Header */}
      <SectionHeader
        title="Strategic Operations Calendar"
        sub="Master schedule for matches, logistics, training, and institutional events."
        icon={<CalendarIcon className="w-5 h-5 text-indigo-400" />}
        actions={
          <div className="flex items-center gap-2">
            <Button 
              onClick={goToToday} 
              variant="outline" 
              className="h-10 px-4 rounded-xl font-bold text-xs border border-white/10 hover:bg-white/5 text-white"
              style={{ background: D.surf2 }}
            >
              Today
            </Button>
          </div>
        }
      />

      {/* Control Strip & Month Selector */}
      <div 
        className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl border shadow-xl backdrop-blur-xl"
        style={{ background: D.surf1, borderColor: D.border }}
      >
        {/* Month Navigation */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 rounded-xl p-1 border" style={{ background: D.surf2, borderColor: D.border }}>
            <Button variant="ghost" size="icon" onClick={prevMonth} className="h-8 w-8 text-slate-300 hover:text-white rounded-lg">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="min-w-[140px] text-center font-bold text-sm text-white px-2" style={{ fontFamily: D.head }}>
              {monthNames[month]} {year}
            </span>
            <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8 text-slate-300 hover:text-white rounded-lg">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mr-1">
            <Filter className="h-3.5 w-3.5 text-indigo-400" />
            <span>Filters:</span>
          </div>

          {[
            { key: 'match', label: 'Matches', icon: Trophy, color: 'emerald' },
            { key: 'training', label: 'Training', icon: Dumbbell, color: 'indigo' },
            { key: 'transport', label: 'Logistics', icon: Truck, color: 'amber' },
            { key: 'finance', label: 'Finance', icon: Wallet, color: 'purple' },
          ].map((item) => {
            const isActive = filters[item.key as EventType];
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                onClick={() => setFilters(f => ({ ...f, [item.key]: !f[item.key as EventType] }))}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all border",
                  isActive
                    ? `bg-${item.color}-500/10 text-${item.color}-300 border-${item.color}-500/30 shadow-sm`
                    : "bg-white/5 text-slate-400 border-white/10 opacity-60 hover:opacity-100"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Calendar Grid (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div 
            className="rounded-2xl border overflow-hidden shadow-2xl"
            style={{ background: D.surf1, borderColor: D.border }}
          >
            {/* Weekday Header */}
            <div className="grid grid-cols-7 border-b text-center" style={{ background: D.surf2, borderColor: D.border }}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {d}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 auto-rows-[minmax(105px,1fr)] divide-x divide-y divide-white/5">
              {/* Empty leading days */}
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} className="bg-white/[0.01] min-h-[105px]" />
              ))}

              {/* Days */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const date = new Date(year, month, day);
                const isSelected = selectedDate.toDateString() === date.toDateString();
                const isToday = new Date().toDateString() === date.toDateString();
                const dayEvents = getEventsForDay(day);

                return (
                  <div 
                    key={day}
                    onClick={() => setSelectedDate(date)}
                    className={cn(
                      "p-2 min-h-[105px] cursor-pointer transition-all relative group flex flex-col justify-between",
                      isSelected ? "bg-indigo-500/10 ring-1 ring-inset ring-indigo-500/40" : "hover:bg-white/[0.03]",
                      isToday ? "bg-white/[0.04]" : ""
                    )}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className={cn(
                        "text-xs font-bold h-6 w-6 flex items-center justify-center rounded-lg transition-colors",
                        isToday 
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30" 
                          : isSelected 
                            ? "text-indigo-300 font-extrabold" 
                            : "text-slate-400 group-hover:text-white"
                      )}>
                        {day}
                      </span>
                      {dayEvents.length > 0 && (
                        <span className="text-[10px] font-bold text-indigo-300 bg-indigo-500/15 border border-indigo-500/20 px-1.5 py-0.2 rounded-md">
                          {dayEvents.length}
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-1 mt-auto">
                      {dayEvents.slice(0, 2).map((event, idx) => {
                        const badge = getEventBadge(event.type);
                        return (
                          <div 
                            key={idx} 
                            className={cn(
                              "flex items-center gap-1 text-[10px] truncate px-1.5 py-0.5 rounded-md border font-medium",
                              badge.bg, badge.text, badge.border
                            )}
                          >
                            <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: badge.color }} />
                            <span className="truncate">{event.title}</span>
                          </div>
                        );
                      })}
                      {dayEvents.length > 2 && (
                        <div className="text-[9px] font-semibold text-slate-400 pl-1">
                          +{dayEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Daily Agenda Side Panel (4 cols) */}
        <div className="lg:col-span-4">
          <div 
            className="rounded-2xl border p-5 shadow-2xl flex flex-col h-full space-y-4"
            style={{ background: D.surf1, borderColor: D.border }}
          >
            <div className="border-b pb-4 space-y-1" style={{ borderColor: D.border }}>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2" style={{ fontFamily: D.head }}>
                  {selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </h3>
                <Badge variant="outline" className="text-[10px] font-semibold bg-indigo-500/10 text-indigo-300 border-indigo-500/20">
                  {selectedDayEvents.length} Events
                </Badge>
              </div>
              <p className="text-xs text-slate-400">Scheduled operational breakdown</p>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto max-h-[500px] pr-1">
              {loading ? (
                <div className="text-center py-12 text-xs font-semibold text-slate-400">
                  Loading events...
                </div>
              ) : selectedDayEvents.length > 0 ? (
                selectedDayEvents.map((event, idx) => {
                  const badge = getEventBadge(event.type);
                  const Icon = badge.icon;

                  return (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3.5 rounded-xl border space-y-2 transition-all hover:border-white/20"
                      style={{ background: D.surf2, borderColor: D.border }}
                    >
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className={cn("text-[10px] px-2 py-0.5 rounded-md gap-1 font-semibold", badge.bg, badge.text, badge.border)}>
                          <Icon className="h-3 w-3" />
                          <span className="capitalize">{event.type}</span>
                        </Badge>
                        {event.time && (
                          <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                            <Clock className="h-3 w-3 text-slate-400" /> {event.time}
                          </span>
                        )}
                      </div>

                      <div>
                        <h4 className="font-bold text-sm text-white mb-0.5">{event.title}</h4>
                        <p className="text-xs text-slate-400 line-clamp-2">{event.description}</p>
                      </div>

                      {event.type === 'match' && (
                        <Link href={`/matches/${event.id}`} className="block pt-1">
                          <Button 
                            size="sm" 
                            className="w-full h-8 text-xs rounded-lg font-semibold bg-indigo-600 hover:bg-indigo-500 text-white"
                          >
                            Match Centre
                            <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" />
                          </Button>
                        </Link>
                      )}
                    </motion.div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center space-y-2">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center border" style={{ background: D.surf2, borderColor: D.border }}>
                    <CalendarIcon className="h-5 w-5 text-slate-500" />
                  </div>
                  <p className="text-xs font-semibold text-slate-400">No events scheduled for this day</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
