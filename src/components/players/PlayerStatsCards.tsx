"use client";

import { D } from "@/lib/scoring/theme";
import { TrendingUp, TrendingDown, Minus, Activity, Target } from "lucide-react";
import { Player as Person } from "@/lib/store";

interface StatsCardProps {
  player: Person;
  index?: number;
}

export function BattingStatsCard({ player, index = 0 }: StatsCardProps) {
  const stats = player.stats as any;
  const runs = stats?.totalRuns || 0;
  const matches = stats?.matchesPlayed || 0;
  const average = stats?.battingAverage || 0;
  const strikeRate = stats?.strikeRate || 0;
  const fifties = stats?.fifties || 0;
  const hundreds = stats?.hundreds || 0;

  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden sh-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
      <div className="p-8 border-b border-white/10 flex items-center justify-between">
        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary" style={{ fontFamily: D.mono }}>
          Batting Profile
        </h3>
        <Target className="h-4 w-4 text-white/20" />
      </div>
      <div className="p-8 space-y-8">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-1">
            <div className="text-[10px] font-black uppercase tracking-widest text-white/30" style={{ fontFamily: D.mono }}>Career Runs</div>
            <div className="text-3xl font-black text-white/90 tracking-tighter" style={{ fontFamily: D.head }}>{runs}</div>
          </div>
          <div className="space-y-1">
            <div className="text-[10px] font-black uppercase tracking-widest text-white/30" style={{ fontFamily: D.mono }}>Innings</div>
            <div className="text-3xl font-black text-white/90 tracking-tighter" style={{ fontFamily: D.head }}>{matches}</div>
          </div>
          <div className="space-y-1">
            <div className="text-[10px] font-black uppercase tracking-widest text-white/30" style={{ fontFamily: D.mono }}>Average</div>
            <div className="text-3xl font-black text-primary tracking-tighter" style={{ fontFamily: D.head }}>{average.toFixed(2)}</div>
          </div>
          <div className="space-y-1">
            <div className="text-[10px] font-black uppercase tracking-widest text-white/30" style={{ fontFamily: D.mono }}>Strike Rate</div>
            <div className="text-3xl font-black text-white/90 tracking-tighter" style={{ fontFamily: D.head }}>{strikeRate.toFixed(2)}</div>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-white/10">
          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40" style={{ fontFamily: D.mono }}>Half-Centuries</span>
              <span className="text-sm font-bold text-white/90">{fifties}</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min((fifties / (matches || 1)) * 100, 100)}%` }} />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40" style={{ fontFamily: D.mono }}>Centuries</span>
              <span className="text-sm font-bold text-white/90">{hundreds}</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min((hundreds / (matches || 1)) * 100, 100)}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function BowlingStatsCard({ player, index = 1 }: StatsCardProps) {
  const stats = player.stats as any;
  const wickets = stats?.wicketsTaken || 0;
  const matches = stats?.matchesPlayed || 0;
  const average = stats?.bowlingAverage || 0;
  const economy = stats?.economyRate || 0;
  const bestFigures = stats?.bestBowlingFigures || "-";

  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden sh-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
      <div className="p-8 border-b border-white/10 flex items-center justify-between">
        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-emerald-400" style={{ fontFamily: D.mono }}>
          Bowling Profile
        </h3>
        <Activity className="h-4 w-4 text-white/20" />
      </div>
      <div className="p-8 space-y-8">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-1">
            <div className="text-[10px] font-black uppercase tracking-widest text-white/30" style={{ fontFamily: D.mono }}>Wickets</div>
            <div className="text-3xl font-black text-white/90 tracking-tighter" style={{ fontFamily: D.head }}>{wickets}</div>
          </div>
          <div className="space-y-1">
            <div className="text-[10px] font-black uppercase tracking-widest text-white/30" style={{ fontFamily: D.mono }}>Best Figures</div>
            <div className="text-2xl font-black text-white/90 tracking-tighter leading-snug" style={{ fontFamily: D.head }}>{bestFigures}</div>
          </div>
          <div className="space-y-1">
            <div className="text-[10px] font-black uppercase tracking-widest text-white/30" style={{ fontFamily: D.mono }}>Average</div>
            <div className="text-3xl font-black text-emerald-400 tracking-tighter" style={{ fontFamily: D.head }}>{average.toFixed(2)}</div>
          </div>
          <div className="space-y-1">
            <div className="text-[10px] font-black uppercase tracking-widest text-white/30" style={{ fontFamily: D.mono }}>Economy</div>
            <div className="text-3xl font-black text-white/90 tracking-tighter" style={{ fontFamily: D.head }}>{economy.toFixed(2)}</div>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-white/10">
          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40" style={{ fontFamily: D.mono }}>Strike Rate</span>
              <span className="text-sm font-bold text-white/90">{(matches > 0 ? (wickets / matches) : 0).toFixed(1)} WPM</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${Math.min((wickets / (matches || 1)) * 20, 100)}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FieldingStatsCard({ player, index = 2 }: StatsCardProps) {
  const stats = player.stats as any;
  const catches = stats?.catchesTaken || 0;
  const runOuts = stats?.runOuts || 0;
  const stumpings = stats?.stumpings || 0;

  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden sh-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
      <div className="p-8 border-b border-white/10 flex items-center justify-between">
        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-sky-400" style={{ fontFamily: D.mono }}>
          Fielding Profile
        </h3>
        <Target className="h-4 w-4 text-white/20" />
      </div>
      <div className="p-8">
        <div className="grid grid-cols-1 gap-6">
          <div className="flex justify-between items-center group transition-all hover:bg-white/[0.02] -mx-4 px-4 py-3 rounded-xl border border-transparent hover:border-white/5">
            <div className="space-y-1">
              <div className="text-[10px] font-black uppercase tracking-widest text-white/30" style={{ fontFamily: D.mono }}>Catches Taken</div>
            </div>
            <div className="text-3xl font-black text-white/90 tracking-tighter group-hover:text-sky-400 transition-colors" style={{ fontFamily: D.head }}>{catches}</div>
          </div>
          <div className="flex justify-between items-center group transition-all hover:bg-white/[0.02] -mx-4 px-4 py-3 rounded-xl border border-transparent hover:border-white/5">
            <div className="space-y-1">
              <div className="text-[10px] font-black uppercase tracking-widest text-white/30" style={{ fontFamily: D.mono }}>Run-outs Involved</div>
            </div>
            <div className="text-3xl font-black text-white/90 tracking-tighter group-hover:text-sky-400 transition-colors" style={{ fontFamily: D.head }}>{runOuts}</div>
          </div>
          <div className="flex justify-between items-center group transition-all hover:bg-white/[0.02] -mx-4 px-4 py-3 rounded-xl border border-transparent hover:border-white/5">
            <div className="space-y-1">
              <div className="text-[10px] font-black uppercase tracking-widest text-white/30" style={{ fontFamily: D.mono }}>Stumpings</div>
            </div>
            <div className="text-3xl font-black text-white/90 tracking-tighter group-hover:text-sky-400 transition-colors" style={{ fontFamily: D.head }}>{stumpings}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
