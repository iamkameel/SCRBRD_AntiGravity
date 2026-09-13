"use client";

import { useState } from "react";
import { D } from "@/lib/design-system";
import { Zap, Activity, Clock, ShieldAlert, BarChart3, TrendingUp } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";

interface PhaseData {
  phase: string;
  ballsFaced: number;
  runsScored: number;
  strikeRate: number;
  dotBallPct: number;
  boundaryPct: number;
  bowlingOvers: number;
  wickets: number;
  economy: number;
}

interface PlayerPhaseBreakdownProps {
  playerId: string;
}

export function PlayerPhaseBreakdown({ playerId }: PlayerPhaseBreakdownProps) {
  const [metric, setMetric] = useState<"batting" | "bowling">("batting");

  const phases: PhaseData[] = [
    {
      phase: "Powerplay (O1-6)",
      ballsFaced: 184,
      runsScored: 258,
      strikeRate: 140.2,
      dotBallPct: 38.0,
      boundaryPct: 21.5,
      bowlingOvers: 14.0,
      wickets: 5,
      economy: 6.8,
    },
    {
      phase: "Middle Overs (O7-15)",
      ballsFaced: 360,
      runsScored: 495,
      strikeRate: 137.5,
      dotBallPct: 29.5,
      boundaryPct: 15.2,
      bowlingOvers: 28.5,
      wickets: 12,
      economy: 5.9,
    },
    {
      phase: "Death Overs (O16-20)",
      ballsFaced: 195,
      runsScored: 320,
      strikeRate: 164.1,
      dotBallPct: 22.0,
      boundaryPct: 26.8,
      bowlingOvers: 8.0,
      wickets: 4,
      economy: 8.4,
    },
  ];

  return (
    <div className="rounded-3xl border border-zinc-200 dark:border-white/10 bg-white/80 dark:bg-white/[0.03] backdrop-blur-xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b border-zinc-200 dark:border-white/[0.07] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <Zap className="h-4 w-4 text-amber-500" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-900 dark:text-white" style={{ fontFamily: D.mono }}>
              Match Phase Intelligence
            </h3>
            <p className="text-[10px] text-zinc-500 dark:text-white/40 font-medium">
              Performance breakdown across match phases
            </p>
          </div>
        </div>

        {/* Toggle Batting / Bowling */}
        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-white/5 p-1 rounded-xl border border-zinc-200 dark:border-white/10">
          <button
            onClick={() => setMetric("batting")}
            className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
              metric === "batting"
                ? "bg-emerald-500 text-white dark:bg-[#22c55e] dark:text-black shadow-sm"
                : "text-zinc-500 dark:text-white/40 hover:text-zinc-900 dark:hover:text-white"
            }`}
            style={{ fontFamily: D.mono }}
          >
            Batting Tempo
          </button>
          <button
            onClick={() => setMetric("bowling")}
            className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
              metric === "bowling"
                ? "bg-emerald-500 text-white dark:bg-[#22c55e] dark:text-black shadow-sm"
                : "text-zinc-500 dark:text-white/40 hover:text-zinc-900 dark:hover:text-white"
            }`}
            style={{ fontFamily: D.mono }}
          >
            Bowling Economy
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Phase Cards Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {phases.map((p, i) => (
            <div
              key={i}
              className="p-4 rounded-2xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/5 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-[#22c55e]" style={{ fontFamily: D.mono }}>
                  {p.phase}
                </span>
                <Clock className="h-3.5 w-3.5 text-zinc-400 dark:text-white/20" />
              </div>

              {metric === "batting" ? (
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-xl bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/5">
                    <div className="text-lg font-black text-zinc-900 dark:text-white" style={{ fontFamily: D.head }}>
                      {p.strikeRate}
                    </div>
                    <div className="text-[8px] font-mono font-bold text-zinc-400 dark:text-white/30 uppercase">
                      S/R
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/5">
                    <div className="text-lg font-black text-rose-500" style={{ fontFamily: D.head }}>
                      {p.dotBallPct}%
                    </div>
                    <div className="text-[8px] font-mono font-bold text-zinc-400 dark:text-white/30 uppercase">
                      Dot %
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/5">
                    <div className="text-lg font-black text-emerald-500" style={{ fontFamily: D.head }}>
                      {p.boundaryPct}%
                    </div>
                    <div className="text-[8px] font-mono font-bold text-zinc-400 dark:text-white/30 uppercase">
                      Bndry %
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-xl bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/5">
                    <div className="text-lg font-black text-zinc-900 dark:text-white" style={{ fontFamily: D.head }}>
                      {p.economy}
                    </div>
                    <div className="text-[8px] font-mono font-bold text-zinc-400 dark:text-white/30 uppercase">
                      Econ
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/5">
                    <div className="text-lg font-black text-amber-500" style={{ fontFamily: D.head }}>
                      {p.wickets}
                    </div>
                    <div className="text-[8px] font-mono font-bold text-zinc-400 dark:text-white/30 uppercase">
                      Wkts
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/5">
                    <div className="text-lg font-black text-blue-500" style={{ fontFamily: D.head }}>
                      {p.bowlingOvers}
                    </div>
                    <div className="text-[8px] font-mono font-bold text-zinc-400 dark:text-white/30 uppercase">
                      Overs
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Phase Recharts Visual */}
        <div className="h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={phases}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(150,150,150,0.15)" vertical={false} />
              <XAxis dataKey="phase" fontSize={10} fontFamily={D.mono} tick={{ fill: 'currentColor', opacity: 0.5, fontWeight: 900 }} tickLine={false} axisLine={false} />
              <YAxis fontSize={10} fontFamily={D.mono} tick={{ fill: 'currentColor', opacity: 0.5, fontWeight: 900 }} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(10,10,10,0.95)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '1rem', color: 'white' }}
              />
              <Legend iconType="circle" wrapperStyle={{ fontFamily: D.mono, fontSize: '10px', textTransform: 'uppercase', opacity: 0.6 }} />
              {metric === "batting" ? (
                <>
                  <Bar dataKey="strikeRate" name="Strike Rate" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="dotBallPct" name="Dot Ball %" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="boundaryPct" name="Boundary %" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </>
              ) : (
                <>
                  <Bar dataKey="economy" name="Economy Rate" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="wickets" name="Wickets Taken" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </>
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
