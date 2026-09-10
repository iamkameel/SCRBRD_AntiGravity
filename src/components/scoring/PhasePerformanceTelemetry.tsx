"use client";

import React, { useState } from "react";
import { D } from "@/lib/design-system";
import { Zap, Shield, Flame, Activity, TrendingUp, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

export interface PhaseData {
  phase: "powerplay" | "middle" | "death";
  name: string;
  overs: string;
  runs: number;
  wickets: number;
  balls: number;
  dotBalls: number;
  boundaries: number;
  fours: number;
  sixes: number;
}

interface PhasePerformanceTelemetryProps {
  phases?: PhaseData[];
}

const defaultPhases: PhaseData[] = [
  {
    phase: "powerplay",
    name: "Powerplay",
    overs: "Overs 1 - 6",
    runs: 48,
    wickets: 1,
    balls: 36,
    dotBalls: 14,
    boundaries: 7,
    fours: 5,
    sixes: 2,
  },
  {
    phase: "middle",
    name: "Middle Overs",
    overs: "Overs 7 - 15",
    runs: 72,
    wickets: 3,
    balls: 54,
    dotBalls: 22,
    boundaries: 6,
    fours: 4,
    sixes: 2,
  },
  {
    phase: "death",
    name: "Death Overs",
    overs: "Overs 16 - 20",
    runs: 54,
    wickets: 2,
    balls: 30,
    dotBalls: 8,
    boundaries: 8,
    fours: 5,
    sixes: 3,
  },
];

export function PhasePerformanceTelemetry({ phases = defaultPhases }: PhasePerformanceTelemetryProps) {
  const [selectedPhase, setSelectedPhase] = useState<string>("powerplay");

  const getPhaseIcon = (phase: string) => {
    switch (phase) {
      case "powerplay":
        return <Zap className="h-4 w-4 text-amber-400" />;
      case "middle":
        return <Shield className="h-4 w-4 text-emerald-400" />;
      case "death":
        return <Flame className="h-4 w-4 text-rose-400" />;
      default:
        return <Activity className="h-4 w-4 text-indigo-400" />;
    }
  };

  const calculateRunRate = (runs: number, balls: number) => {
    if (balls === 0) return "0.00";
    return ((runs / balls) * 6).toFixed(2);
  };

  const calculateDotPct = (dotBalls: number, balls: number) => {
    if (balls === 0) return "0%";
    return `${Math.round((dotBalls / balls) * 100)}%`;
  };

  const activePhaseData = phases.find((p) => p.phase === selectedPhase) || phases[0];

  return (
    <div
      className="p-6 rounded-2xl border shadow-xl space-y-6"
      style={{ background: D.surf1, borderColor: D.border }}
    >
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-indigo-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white" style={{ fontFamily: D.head }}>
              Phase Performance Telemetry
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5" style={{ fontFamily: D.sans }}>
            Phase-by-phase scoring efficiency, dot-ball control, and momentum splits
          </p>
        </div>

        {/* Phase Selectors */}
        <div className="flex items-center gap-2 bg-black/20 p-1.5 rounded-xl border border-white/5">
          {phases.map((p) => {
            const isActive = selectedPhase === p.phase;
            return (
              <button
                key={p.phase}
                onClick={() => setSelectedPhase(p.phase)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-indigo-500/20 text-white border border-indigo-500/40 shadow-md"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                style={{ fontFamily: D.sans }}
              >
                {getPhaseIcon(p.phase)}
                <span>{p.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Phase Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border bg-white/[0.02]" style={{ borderColor: D.border }}>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Run Rate</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-white" style={{ fontFamily: D.mono }}>
              {calculateRunRate(activePhaseData.runs, activePhaseData.balls)}
            </span>
            <span className="text-xs text-slate-400">rpo</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border bg-white/[0.02]" style={{ borderColor: D.border }}>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Runs / Wickets</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-emerald-400" style={{ fontFamily: D.mono }}>
              {activePhaseData.runs}/{activePhaseData.wickets}
            </span>
            <span className="text-xs text-slate-400">({activePhaseData.overs})</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border bg-white/[0.02]" style={{ borderColor: D.border }}>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Dot Ball %</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-amber-400" style={{ fontFamily: D.mono }}>
              {calculateDotPct(activePhaseData.dotBalls, activePhaseData.balls)}
            </span>
            <span className="text-xs text-slate-400">({activePhaseData.dotBalls} dots)</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border bg-white/[0.02]" style={{ borderColor: D.border }}>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Boundaries</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-indigo-400" style={{ fontFamily: D.mono }}>
              {activePhaseData.boundaries}
            </span>
            <span className="text-xs text-slate-400">({activePhaseData.fours}×4, {activePhaseData.sixes}×6)</span>
          </div>
        </div>
      </div>

      {/* Phase Comparison Visual Bar */}
      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400" style={{ fontFamily: D.sans }}>
          Phase Run Rate Comparison
        </h4>

        <div className="space-y-2">
          {phases.map((p) => {
            const rr = parseFloat(calculateRunRate(p.runs, p.balls));
            const maxRR = 15;
            const pct = Math.min(100, (rr / maxRR) * 100);
            const isCurrent = p.phase === selectedPhase;

            return (
              <div key={p.phase} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className={`font-semibold flex items-center gap-1.5 ${isCurrent ? "text-white" : "text-slate-400"}`}>
                    {getPhaseIcon(p.phase)}
                    {p.name} ({p.overs})
                  </span>
                  <span className="font-bold text-white" style={{ fontFamily: D.mono }}>
                    {rr.toFixed(2)} RR
                  </span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.5 }}
                    className={`h-full rounded-full ${
                      p.phase === "powerplay"
                        ? "bg-amber-400"
                        : p.phase === "middle"
                        ? "bg-emerald-400"
                        : "bg-rose-400"
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
