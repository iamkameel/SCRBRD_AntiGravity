"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Waves, Timer, Trophy, Flame, Play, Pause, RotateCcw, Award, CheckCircle2 } from 'lucide-react';
import { SwimmingGala, SwimmingEvent, GalaLaneEntry } from '@/types/sports';
import { cn } from '@/lib/utils';

const MOCK_GALA: SwimmingGala = {
  galaId: 'gala-2026-01',
  title: 'Inter-Schools Quadrangular Swimming Gala',
  venue: 'St John\'s Aquatic Centre (50m Olympic Pool)',
  date: '10 March 2026',
  hostSchool: 'St John\'s College',
  status: 'Live',
  schoolStandings: [
    { schoolName: 'St John\'s College', totalPoints: 142, gold: 6, silver: 4, bronze: 2 },
    { schoolName: 'King Edward VII School', totalPoints: 128, gold: 4, silver: 5, bronze: 3 },
    { schoolName: 'Hilton College', totalPoints: 110, gold: 3, silver: 3, bronze: 4 },
    { schoolName: 'Michaelhouse', totalPoints: 94, gold: 2, silver: 3, bronze: 4 }
  ],
  events: [
    {
      id: 'ev-1',
      eventName: 'U19 Boys 50m Freestyle (Final)',
      distanceMeters: 50,
      stroke: 'freestyle',
      ageGroup: 'U19',
      gender: 'Boys',
      isRelay: false,
      recordTime: '00:23.40',
      recordHolder: 'C. van Rensburg (SJC, 2024)',
      status: 'Live',
      heatNumber: 1,
      lanes: [
        { laneNumber: 1, swimmerId: 'sw-1', swimmerName: 'Luke Davies', schoolName: 'Michaelhouse', seedTime: '00:24.90', finalTime: '00:24.65', status: 'Finished', rank: 4, pointsEarned: 5 },
        { laneNumber: 2, swimmerId: 'sw-2', swimmerName: 'Matthew Miller', schoolName: 'King Edward VII School', seedTime: '00:24.10', finalTime: '00:23.95', status: 'Finished', rank: 2, pointsEarned: 8 },
        { laneNumber: 3, swimmerId: 'sw-3', swimmerName: 'Aidan Smith', schoolName: 'St John\'s College', seedTime: '00:23.80', finalTime: '00:23.32', status: 'Finished', rank: 1, pointsEarned: 10 },
        { laneNumber: 4, swimmerId: 'sw-4', swimmerName: 'James Taylor', schoolName: 'Hilton College', seedTime: '00:24.05', finalTime: '00:24.12', status: 'Finished', rank: 3, pointsEarned: 6 },
        { laneNumber: 5, swimmerId: 'sw-5', swimmerName: 'Ethan Coetzee', schoolName: 'St John\'s College', seedTime: '00:25.10', finalTime: '00:25.02', status: 'Finished', rank: 5, pointsEarned: 4 },
        { laneNumber: 6, swimmerId: 'sw-6', swimmerName: 'Daniel Botha', schoolName: 'King Edward VII School', seedTime: '00:25.40', finalTime: '00:25.35', status: 'Finished', rank: 6, pointsEarned: 3 },
      ]
    },
    {
      id: 'ev-2',
      eventName: 'U17 Boys 100m Breaststroke (Final)',
      distanceMeters: 100,
      stroke: 'breaststroke',
      ageGroup: 'U17',
      gender: 'Boys',
      isRelay: false,
      recordTime: '01:05.12',
      recordHolder: 'R. Naidoo (KES, 2023)',
      status: 'Scheduled',
      heatNumber: 1,
      lanes: [
        { laneNumber: 1, swimmerId: 'sw-7', swimmerName: 'Mark Vance', schoolName: 'Hilton College', seedTime: '01:08.20', status: 'Ready' },
        { laneNumber: 2, swimmerId: 'sw-8', swimmerName: 'Devon Patel', schoolName: 'King Edward VII School', seedTime: '01:06.50', status: 'Ready' },
        { laneNumber: 3, swimmerId: 'sw-9', swimmerName: 'Oliver Harris', schoolName: 'St John\'s College', seedTime: '01:05.80', status: 'Ready' },
        { laneNumber: 4, swimmerId: 'sw-10', swimmerName: 'Liam Williams', schoolName: 'Michaelhouse', seedTime: '01:07.10', status: 'Ready' },
      ]
    }
  ]
};

export function SwimmingGalaHub() {
  const [gala, setGala] = useState<SwimmingGala>(MOCK_GALA);
  const [selectedEventId, setSelectedEventId] = useState<string>(MOCK_GALA.events[0].id);

  const selectedEvent = gala.events.find(e => e.id === selectedEventId) || gala.events[0];
  const isRecordBroken = selectedEvent.lanes.some(l => l.rank === 1 && l.finalTime && l.finalTime < selectedEvent.recordTime);

  return (
    <Card className="p-6 bg-slate-900/90 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl text-slate-100 space-y-6">
      {/* Gala Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Waves className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white font-['Syne',sans-serif] tracking-tight">{gala.title}</h2>
              <Badge variant="outline" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 font-mono text-[10px]">
                <Timer className="w-3 h-3 mr-1 animate-spin" />
                Live Gala Engine
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{gala.venue} • Host: {gala.hostSchool}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {gala.events.map(ev => (
            <Button
              key={ev.id}
              size="sm"
              variant="outline"
              onClick={() => setSelectedEventId(ev.id)}
              className={cn(
                "text-xs font-mono transition-all",
                selectedEventId === ev.id 
                  ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/40" 
                  : "bg-slate-950 text-slate-400 border-white/10"
              )}
            >
              {ev.eventName.split(' ')[0]} {ev.eventName.split(' ')[2]}
            </Button>
          ))}
        </div>
      </div>

      {/* Record Breaker Alert Banner */}
      {isRecordBroken && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3 animate-bounce">
          <Trophy className="w-6 h-6 text-amber-400 shrink-0" />
          <div>
            <div className="text-xs font-mono font-bold uppercase text-amber-400">New Gala Record Established!</div>
            <div className="text-xs text-slate-200 mt-0.5">
              <span className="font-bold text-white">{selectedEvent.lanes.find(l => l.rank === 1)?.swimmerName}</span> ({selectedEvent.lanes.find(l => l.rank === 1)?.schoolName}) broke the record with <span className="font-mono text-emerald-400 font-bold">{selectedEvent.lanes.find(l => l.rank === 1)?.finalTime}</span> (Previous: {selectedEvent.recordTime}).
            </div>
          </div>
        </div>
      )}

      {/* Selected Event Details */}
      <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase text-slate-400">Event</span>
          <h3 className="text-lg font-bold text-white">{selectedEvent.eventName}</h3>
        </div>
        <div className="flex gap-6 text-xs font-mono">
          <div>
            <span className="text-slate-400">Gala Record: </span>
            <span className="text-amber-400 font-bold">{selectedEvent.recordTime}</span> ({selectedEvent.recordHolder})
          </div>
          <div>
            <span className="text-slate-400">Heat: </span>
            <span className="text-cyan-400 font-bold">#{selectedEvent.heatNumber}</span>
          </div>
        </div>
      </div>

      {/* Lane Telemetry Grid */}
      <div className="space-y-3">
        <div className="text-xs font-mono uppercase font-bold text-slate-400">Lane Touchpad Telemetry & Splits</div>
        <div className="space-y-2">
          {selectedEvent.lanes.map(lane => (
            <div 
              key={lane.laneNumber}
              className={cn(
                "p-3 rounded-xl border flex items-center justify-between text-xs transition-all",
                lane.rank === 1 
                  ? "bg-amber-500/10 border-amber-500/30 text-slate-100" 
                  : "bg-white/5 border-white/5 text-slate-300"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-7 h-7 rounded-lg font-mono font-bold flex items-center justify-center text-xs",
                  lane.rank === 1 ? "bg-amber-500 text-slate-950" : "bg-slate-950 text-cyan-400 border border-cyan-500/30"
                )}>
                  L{lane.laneNumber}
                </div>
                <div>
                  <div className="font-bold text-white flex items-center gap-1.5">
                    {lane.swimmerName}
                    {lane.rank === 1 && <Badge className="bg-amber-500 text-slate-950 font-mono text-[9px] px-1 py-0">GOLD</Badge>}
                    {lane.rank === 2 && <Badge className="bg-slate-300 text-slate-950 font-mono text-[9px] px-1 py-0">SILVER</Badge>}
                    {lane.rank === 3 && <Badge className="bg-amber-700 text-white font-mono text-[9px] px-1 py-0">BRONZE</Badge>}
                  </div>
                  <div className="text-[11px] text-slate-400">{lane.schoolName} • Seed: {lane.seedTime}</div>
                </div>
              </div>

              <div className="flex items-center gap-4 font-mono">
                <div className="text-right">
                  <div className="text-emerald-400 font-bold text-sm">{lane.finalTime || '--:--.--'}</div>
                  <div className="text-[10px] text-slate-400">{lane.pointsEarned ? `+${lane.pointsEarned} pts` : ''}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Inter-School Gala Points Table */}
      <div className="space-y-3 pt-2">
        <div className="text-xs font-mono uppercase font-bold text-slate-400 flex items-center gap-1.5">
          <Trophy className="w-4 h-4 text-cyan-400" />
          Inter-School Gala Standings
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {gala.schoolStandings.map((stand, idx) => (
            <div key={stand.schoolName} className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-white">{idx + 1}. {stand.schoolName}</span>
                <span className="font-mono text-cyan-400 font-bold text-sm">{stand.totalPoints} pts</span>
              </div>
              <div className="flex gap-2 text-[10px] font-mono text-slate-400 pt-1">
                <span>🥇 {stand.gold}</span>
                <span>🥈 {stand.silver}</span>
                <span>🥉 {stand.bronze}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
