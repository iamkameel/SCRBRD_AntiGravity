"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Activity, AlertTriangle, ShieldCheck, Dumbbell, Waves, Flag, Calendar } from 'lucide-react';
import { MultiSportPassport, SportType } from '@/types/sports';
import { cn } from '@/lib/utils';

const MOCK_PASSPORT: MultiSportPassport = {
  athleteId: 'ath-p1',
  athleteName: 'Aidan Smith',
  schoolName: 'St John\'s College',
  primarySport: 'cricket',
  activeSports: ['cricket', 'swimming', 'athletics'],
  weeklyLoadHours: 18.5,
  fatigueLevel: 'High',
  multiSportAlerts: [
    'Fatigue Warning: Competing in Inter-School Swimming Gala (Fri PM) & 1st XI Cricket Match (Sat AM).',
    'Rest Recommendation: Limit bowling load to 6 overs maximum in Saturday match.'
  ],
  sportBreakdown: [
    { sport: 'cricket', eventsThisWeek: 2, intensityScore: 8.5 },
    { sport: 'swimming', eventsThisWeek: 3, intensityScore: 9.0 },
    { sport: 'athletics', eventsThisWeek: 1, intensityScore: 7.0 }
  ]
};

export function MultiSportPassportWidget({ passport = MOCK_PASSPORT }: { passport?: MultiSportPassport }) {
  return (
    <Card className="p-6 bg-slate-900/90 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl text-slate-100 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Multi-Sport Athlete Passport</h3>
            <p className="text-xs text-slate-400">{passport.athleteName} • {passport.schoolName}</p>
          </div>
        </div>

        <Badge 
          variant="outline" 
          className={cn(
            "font-mono text-xs",
            passport.fatigueLevel === 'High' || passport.fatigueLevel === 'Overload Risk'
              ? "bg-rose-500/20 text-rose-400 border-rose-500/40"
              : "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
          )}
        >
          <Activity className="w-3.5 h-3.5 mr-1" />
          {passport.fatigueLevel} Workload ({passport.weeklyLoadHours} hrs/wk)
        </Badge>
      </div>

      {/* Cross-Sport Schedule Risk Alert */}
      {passport.multiSportAlerts.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400 uppercase">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            Cross-Sport Schedule & Workload Alerts
          </div>
          <ul className="space-y-1 text-xs text-slate-200">
            {passport.multiSportAlerts.map((alert, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-amber-400">•</span>
                <span>{alert}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Sport Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {passport.sportBreakdown.map((sb) => (
          <div key={sb.sport} className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-mono uppercase font-bold text-slate-300 flex items-center gap-1.5">
                {sb.sport === 'cricket' && <Dumbbell className="w-4 h-4 text-amber-400" />}
                {sb.sport === 'swimming' && <Waves className="w-4 h-4 text-cyan-400" />}
                {sb.sport === 'athletics' && <Flag className="w-4 h-4 text-emerald-400" />}
                {sb.sport}
              </span>
              <Badge variant="outline" className="bg-slate-950 text-[10px] font-mono text-slate-400 border-white/10">
                {sb.eventsThisWeek} Fixtures/Events
              </Badge>
            </div>
            <div className="flex justify-between items-baseline pt-1">
              <span className="text-xs text-slate-400">Intensity Load:</span>
              <span className="font-mono text-sm font-bold text-white">{sb.intensityScore}/10</span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-white/10">
              <div 
                className={cn(
                  "h-full transition-all",
                  sb.sport === 'cricket' ? 'bg-amber-400' : sb.sport === 'swimming' ? 'bg-cyan-400' : 'bg-emerald-400'
                )} 
                style={{ width: `${sb.intensityScore * 10}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
