"use client";

import { D } from '@/lib/design-system';
import { Target, Activity, Shield, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Player as Person } from "@/lib/store";

interface StatsCardProps {
  player: Person;
  index?: number;
}

function StatRow({ label, value, total, color = "#22c55e" }: { label: string; value: number; total: number; color?: string }) {
  const pct = total > 0 ? Math.min((value / total) * 100, 100) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-end">
        <span className="text-[9px] font-black uppercase tracking-widest text-white/30" style={{ fontFamily: D.mono }}>{label}</span>
        <span className="text-xs font-black text-white/80">{value}</span>
      </div>
      <div className="h-1 w-full rounded-full bg-white/[0.06] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}99, ${color})` }}
        />
      </div>
    </div>
  );
}

function BigStat({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: string }) {
  return (
    <div className="space-y-0.5">
      <div className="text-[9px] font-black uppercase tracking-widest text-white/25" style={{ fontFamily: D.mono }}>{label}</div>
      <div className="text-3xl font-black tracking-tighter leading-none" style={{ fontFamily: D.head, color: accent || "rgba(255,255,255,0.85)" }}>
        {value}
      </div>
      {sub && <div className="text-[9px] font-bold text-white/30 uppercase tracking-widest">{sub}</div>}
    </div>
  );
}

export function BattingStatsCard({ player, index = 0 }: StatsCardProps) {
  const stats = player.stats as any;
  const runs = stats?.totalRuns || 0;
  const matches = stats?.matchesPlayed || 0;
  const average = stats?.battingAverage || 0;
  const strikeRate = stats?.strikeRate || 0;
  const fifties = stats?.fifties || 0;
  const hundreds = stats?.hundreds || 0;
  const highScore = stats?.highScore || 0;

  return (
    <div
      className="rounded-[2rem] border border-white/10 bg-white/[0.03] backdrop-blur-xl overflow-hidden sh-slide-up flex flex-col"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-[#22c55e]/30 via-[#22c55e] to-[#22c55e]/30" />

      <div className="p-7 border-b border-white/[0.06] flex items-center justify-between">
        <div>
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#22c55e]" style={{ fontFamily: D.mono }}>
            Batting Profile
          </h3>
          <p className="text-[9px] text-white/25 mt-0.5 font-medium">Career accumulation</p>
        </div>
        <div className="w-8 h-8 rounded-xl bg-[#22c55e]/10 border border-[#22c55e]/20 flex items-center justify-center">
          <Target className="h-4 w-4 text-[#22c55e]" />
        </div>
      </div>

      <div className="p-7 flex-1 space-y-7">
        <div className="grid grid-cols-2 gap-5">
          <BigStat label="Career Runs" value={runs} accent="#22c55e" />
          <BigStat label="Matches" value={matches} />
          <BigStat label="Average" value={average.toFixed(2)} accent="#22c55e" />
          <BigStat label="Strike Rate" value={strikeRate.toFixed(1)} />
        </div>

        <div className="space-y-4 pt-4 border-t border-white/[0.05]">
          <StatRow label="50s" value={fifties} total={matches} color="#22c55e" />
          <StatRow label="100s" value={hundreds} total={Math.max(fifties, 1)} color="#22c55e" />
          <StatRow label="High Score" value={highScore} total={200} color="#22c55e" />
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
  const economy = stats?.economyRate || stats?.economy || 0;
  const bestFigures = stats?.bestBowlingFigures || "—";
  const strikeRate = matches > 0 ? ((wickets / matches)).toFixed(1) : "0.0";

  return (
    <div
      className="rounded-[2rem] border border-white/10 bg-white/[0.03] backdrop-blur-xl overflow-hidden sh-slide-up flex flex-col"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="h-1 w-full bg-gradient-to-r from-blue-500/30 via-blue-500 to-blue-500/30" />

      <div className="p-7 border-b border-white/[0.06] flex items-center justify-between">
        <div>
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400" style={{ fontFamily: D.mono }}>
            Bowling Profile
          </h3>
          <p className="text-[9px] text-white/25 mt-0.5 font-medium">Wicket-taking analysis</p>
        </div>
        <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
          <Activity className="h-4 w-4 text-blue-400" />
        </div>
      </div>

      <div className="p-7 flex-1 space-y-7">
        <div className="grid grid-cols-2 gap-5">
          <BigStat label="Wickets" value={wickets} accent="#60a5fa" />
          <BigStat label="Best" value={bestFigures} />
          <BigStat label="Average" value={average?.toFixed(2) || "0.00"} accent="#60a5fa" />
          <BigStat label="Economy" value={economy?.toFixed(2) || "0.00"} />
        </div>

        <div className="space-y-4 pt-4 border-t border-white/[0.05]">
          <StatRow label="Wkts per match" value={Number(strikeRate)} total={5} color="#60a5fa" />
          <StatRow label="Economy quality" value={economy > 0 ? Math.max(0, 10 - economy) : 0} total={10} color="#60a5fa" />
        </div>
      </div>
    </div>
  );
}

export function FieldingStatsCard({ player, index = 2 }: StatsCardProps) {
  const stats = player.stats as any;
  const catches = stats?.catchesTaken || stats?.catches || 0;
  const runOuts = stats?.runOuts || 0;
  const stumpings = stats?.stumpings || 0;
  const total = catches + runOuts + stumpings;

  return (
    <div
      className="rounded-[2rem] border border-white/10 bg-white/[0.03] backdrop-blur-xl overflow-hidden sh-slide-up flex flex-col"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="h-1 w-full bg-gradient-to-r from-sky-400/30 via-sky-400 to-sky-400/30" />

      <div className="p-7 border-b border-white/[0.06] flex items-center justify-between">
        <div>
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-400" style={{ fontFamily: D.mono }}>
            Fielding Profile
          </h3>
          <p className="text-[9px] text-white/25 mt-0.5 font-medium">Dismissals & involvement</p>
        </div>
        <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
          <Shield className="h-4 w-4 text-sky-400" />
        </div>
      </div>

      <div className="p-7 flex-1 space-y-7">
        {/* Big total */}
        <div className="flex items-end justify-between">
          <BigStat label="Total Dismissals" value={total} accent="#38bdf8" />
          <div className="text-right">
            <div className="text-[9px] font-black uppercase tracking-widest text-white/25 mb-1" style={{ fontFamily: D.mono }}>Best Zone</div>
            <span className="text-xs font-black text-sky-400">Mid-wicket</span>
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t border-white/[0.05]">
          {[
            { label: "Catches Taken", value: catches, max: Math.max(total, 10) },
            { label: "Run-outs", value: runOuts, max: Math.max(total, 10) },
            { label: "Stumpings", value: stumpings, max: Math.max(total, 10) },
          ].map((row, i) => (
            <div key={i} className="flex items-center justify-between gap-4 group hover:bg-white/[0.02] -mx-2 px-2 py-1.5 rounded-lg transition-all">
              <span className="text-[9px] font-black uppercase tracking-widest text-white/30" style={{ fontFamily: D.mono }}>
                {row.label}
              </span>
              <div className="flex items-center gap-3">
                <div className="w-20 h-1 rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-sky-400 transition-all duration-700"
                    style={{ width: `${row.max > 0 ? (row.value / row.max) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-sm font-black text-white/80 w-4 text-right" style={{ fontFamily: D.head }}>
                  {row.value}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
