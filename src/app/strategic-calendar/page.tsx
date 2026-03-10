"use client";

import { useState, useMemo, useEffect } from "react";
import { fetchMatches, fetchTrips, fetchPlayers, fetchTransactions } from "@/lib/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, 
  Trophy, Dumbbell, Truck, Wallet, Filter, Clock, MapPin
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

type EventType = 'match' | 'training' | 'transport' | 'finance';

interface CalendarEvent {
  id: string;
  type: EventType;
  title: string;
  date: Date;
  time?: string;
  description?: string;
  meta?: any; // Store original object
}

export default function StrategicCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [filters, setFilters] = useState<Record<EventType, boolean>>({
    match: true,
    training: true,
    transport: true,
    finance: false, // Hidden by default to reduce clutter
  });
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [matches, trips, players, transactions] = await Promise.all([
          fetchMatches(100),
          fetchTrips(50),
          fetchPlayers(100),
          fetchTransactions(50)
        ]);

        const allEvents: CalendarEvent[] = [];

        // 1. Matches
        matches.forEach((m: any) => {
          allEvents.push({
            id: m.id,
            type: 'match',
            title: `${m.homeTeamName || 'Home'} vs ${m.awayTeamName || 'Away'}`,
            date: new Date(m.dateTime),
            time: new Date(m.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            description: `Venue: ${m.venue}`,
            meta: m
          });
        });

        // 2. Transport (Trips)
        trips.forEach((t: any) => {
          allEvents.push({
            id: t.id,
            type: 'transport',
            title: `Trip: ${t.destination}`,
            date: new Date(t.date),
            description: `${t.purpose} (${t.passengers} pax)`,
            meta: t
          });
        });

        // 3. Training Logs (Flattened from People)
        // Note: In a real app, training logs might be a subcollection or separate collection
        // For now, assuming players have trainingLogs property if migrated, or we skip
        players.forEach((p: any) => {
          if (p.trainingLogs) {
            p.trainingLogs.forEach((log: any) => {
              allEvents.push({
                id: `${p.id}-${log.sessionId}`,
                type: 'training',
                title: `${p.firstName}'s Training`,
                date: new Date(log.date),
                description: `${log.type} - ${log.durationMinutes} mins`,
                meta: { ...log, personName: `${p.firstName} ${p.lastName}` }
              });
            });
          }
        });

        // 4. Financials (Transactions)
        transactions.forEach((t: any) => {
          allEvents.push({
            id: t.id,
            type: 'finance',
            title: `Tx: ${t.description}`,
            date: new Date(t.date),
            description: `${t.type} - R${t.amount}`,
            meta: t
          });
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

  // --- Calendar Logic ---
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

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

  // --- Render Helpers ---
  const getEventColor = (type: EventType) => {
    switch (type) {
      case 'match': return 'bg-emerald-500';
      case 'training': return 'bg-emerald-500';
      case 'transport': return 'bg-amber-500';
      case 'finance': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getEventIcon = (type: EventType) => {
    switch (type) {
      case 'match': return <Trophy className="h-4 w-4 text-emerald-500" />;
      case 'training': return <Dumbbell className="h-4 w-4 text-emerald-500" />;
      case 'transport': return <Truck className="h-4 w-4 text-amber-500" />;
      case 'finance': return <Wallet className="h-4 w-4 text-purple-500" />;
    }
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <CalendarIcon className="h-8 w-8 text-primary" />
            Strategic Calendar
          </h1>
          <p className="text-muted-foreground mt-1">
            Master schedule for matches, logistics, and training operations.
          </p>
        </div>
        
        <div className="flex items-center gap-2 bg-secondary/30 p-1 rounded-lg">
          <Button variant="ghost" onClick={prevMonth}><ChevronLeft className="h-4 w-4" /></Button>
          <span className="min-w-[140px] text-center font-semibold text-lg">
            {monthNames[month]} {year}
          </span>
          <Button variant="ghost" onClick={nextMonth}><ChevronRight className="h-4 w-4" /></Button>
          <Button variant="outline" size="sm" onClick={goToToday} className="ml-2">Today</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Calendar Grid */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-2 items-center bg-card p-3 rounded-lg border shadow-sm">
            <Filter className="h-4 w-4 text-muted-foreground mr-2" />
            <span className="text-sm font-medium mr-2">Filters:</span>
            <Button 
              size="sm" 
              variant={filters.match ? "default" : "outline"}
              onClick={() => setFilters(f => ({ ...f, match: !f.match }))}
              className={cn("gap-2", filters.match ? "bg-emerald-600 hover:bg-emerald-700" : "text-emerald-600 border-emerald-200")}
            >
              <Trophy className="h-3 w-3" /> Matches
            </Button>
            <Button 
              size="sm" 
              variant={filters.training ? "default" : "outline"}
              onClick={() => setFilters(f => ({ ...f, training: !f.training }))}
              className={cn("gap-2", filters.training ? "bg-blue-600 hover:bg-blue-700" : "text-blue-600 border-blue-200")}
            >
              <Dumbbell className="h-3 w-3" /> Training
            </Button>
            <Button 
              size="sm" 
              variant={filters.transport ? "default" : "outline"}
              onClick={() => setFilters(f => ({ ...f, transport: !f.transport }))}
              className={cn("gap-2", filters.transport ? "bg-amber-600 hover:bg-amber-700" : "text-amber-600 border-amber-200")}
            >
              <Truck className="h-3 w-3" /> Logistics
            </Button>
            <Button 
              size="sm" 
              variant={filters.finance ? "default" : "outline"}
              onClick={() => setFilters(f => ({ ...f, finance: !f.finance }))}
              className={cn("gap-2", filters.finance ? "bg-purple-600 hover:bg-purple-700" : "text-purple-600 border-purple-200")}
            >
              <Wallet className="h-3 w-3" /> Finance
            </Button>
          </div>

          <Card className="overflow-hidden border-border/50 shadow-md">
            <div className="grid grid-cols-7 bg-muted/30 border-b">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="p-3 text-center text-sm font-semibold text-muted-foreground">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 auto-rows-[minmax(100px,1fr)]">
              {/* Empty days */}
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} className="bg-card/50 border-r border-b p-2 min-h-[100px]" />
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
                      "border-r border-b p-2 min-h-[100px] cursor-pointer transition-colors hover:bg-muted/50 relative group",
                      isSelected && "bg-primary/5 ring-1 ring-inset ring-primary",
                      isToday && "bg-muted/30"
                    )}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className={cn(
                        "text-sm font-medium h-7 w-7 flex items-center justify-center rounded-full",
                        isToday ? "bg-primary text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                      )}>
                        {day}
                      </span>
                      {dayEvents.length > 0 && (
                        <span className="text-[10px] font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                          {dayEvents.length}
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map((event, idx) => (
                        <div key={idx} className="flex items-center gap-1 text-[10px] truncate px-1 py-0.5 rounded bg-secondary/50 border border-border/50">
                          <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", getEventColor(event.type))} />
                          <span className="truncate">{event.title}</span>
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-[10px] text-muted-foreground pl-1">
                          + {dayEvents.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Side Panel: Daily Agenda */}
        <div className="lg:col-span-4 xl:col-span-3">
          <Card className="h-full border-border/50 shadow-md flex flex-col">
            <CardHeader className="bg-muted/10 pb-4">
              <CardTitle className="text-xl flex items-center gap-2">
                {selectedDate.toLocaleDateString('en-US', { weekday: 'long' })}
                <span className="text-muted-foreground font-normal">
                  {selectedDate.getDate()}
                </span>
              </CardTitle>
              <CardDescription>
                {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Loading events...</div>
              ) : selectedDayEvents.length > 0 ? (
                <div className="space-y-4">
                  {selectedDayEvents.map((event, idx) => (
                    <div key={idx} className="flex gap-3 group">
                      <div className="flex flex-col items-center mt-1">
                        <div className={cn("w-2 h-2 rounded-full mb-1", getEventColor(event.type))} />
                        <div className="w-0.5 flex-1 bg-border group-last:hidden" />
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center justify-between mb-1">
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 gap-1">
                            {getEventIcon(event.type)}
                            <span className="capitalize">{event.type}</span>
                          </Badge>
                          {event.time && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {event.time}
                            </span>
                          )}
                        </div>
                        <h4 className="font-semibold text-sm mb-1">{event.title}</h4>
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                          {event.description}
                        </p>
                        
                        {event.type === 'match' && (
                          <Link href={`/matches/${event.id}`}>
                            <Button size="sm" variant="secondary" className="w-full h-7 text-xs">
                              View Match Center
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-40 text-center text-muted-foreground">
                  <CalendarIcon className="h-10 w-10 mb-2 opacity-20" />
                  <p>No events scheduled for this day.</p>
                  <Button variant="link" className="mt-2 text-primary">
                    + Add Event
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

