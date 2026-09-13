"use client";

import React, { useState } from "react";
import { BarChart3, Shield, Zap, Target, PieChart, ChevronRight } from "lucide-react";

export function PerformanceAnalystCockpit() {
  const [selectedTab, setSelectedTab] = useState<"efficiency" | "phase" | "matchups">("efficiency");

  const shotData = [
    { shot: "Cover Drive", runs: 48, balls: 22, boundaryPct: 68, riskScore: "Low" },
    { shot: "Pull Shot", runs: 36, balls: 14, boundaryPct: 78, riskScore: "Med" },
    { shot: "Sweep / Reverse", runs: 18, balls: 10, boundaryPct: 50, riskScore: "High" },
    { shot: "Flick / Glance", runs: 28, balls: 19, boundaryPct: 42, riskScore: "Low" },
    { shot: "Straight Drive", runs: 24, balls: 12, boundaryPct: 60, riskScore: "Low" },
  ];

  const phaseData = [
    { phase: "Powerplay (Overs 1-6)", runs: 52, wickets: 1, rr: 8.67, dotBallPct: 42 },
    { phase: "Middle Overs (Overs 7-15)", runs: 68, wickets: 2, rr: 7.55, dotBallPct: 35 },
    { phase: "Death Overs (Overs 16-20)", runs: 58, wickets: 3, rr: 11.60, dotBallPct: 22 },
  ];

  return (
    <div className="bg-card border border-border rounded-3xl p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <BarChart3 className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-display font-bold text-xl text-foreground">
              High Performance Analyst Cockpit
            </h2>
            <p className="text-xs text-muted-foreground">
              Shot-Type Efficiency · Innings Phase Breakdown · Matchup Intelligence
            </p>
          </div>
        </div>

        {/* Tab selector */}
        <div className="flex bg-secondary/50 p-1 rounded-xl border border-white/10 text-xs font-mono">
          <button
            onClick={() => setSelectedTab("efficiency")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              selectedTab === "efficiency" ? "bg-primary text-primary-foreground font-bold" : "text-muted-foreground"
            }`}
          >
            Shot Efficiency
          </button>
          <button
            onClick={() => setSelectedTab("phase")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              selectedTab === "phase" ? "bg-primary text-primary-foreground font-bold" : "text-muted-foreground"
            }`}
          >
            Phase Telemetry
          </button>
          <button
            onClick={() => setSelectedTab("matchups")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              selectedTab === "matchups" ? "bg-primary text-primary-foreground font-bold" : "text-muted-foreground"
            }`}
          >
            Bowler Matchups
          </button>
        </div>
      </div>

      {/* Tab 1: Shot Efficiency */}
      {selectedTab === "efficiency" && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-secondary/30 border border-white/5 rounded-2xl p-4">
              <span className="text-[11px] font-mono text-muted-foreground uppercase flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5 text-indigo-400" /> Primary Scoring Zone
              </span>
              <p className="font-display font-bold text-lg text-foreground mt-1">Extra Cover / Mid-Off</p>
              <p className="text-xs text-emerald-400 mt-0.5">42% of total runs scored</p>
            </div>

            <div className="bg-secondary/30 border border-white/5 rounded-2xl p-4">
              <span className="text-[11px] font-mono text-muted-foreground uppercase flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-amber-400" /> Highest Control Shot
              </span>
              <p className="font-display font-bold text-lg text-foreground mt-1">Cover Drive</p>
              <p className="text-xs text-emerald-400 mt-0.5">92% control rate (22 balls)</p>
            </div>

            <div className="bg-secondary/30 border border-white/5 rounded-2xl p-4">
              <span className="text-[11px] font-mono text-muted-foreground uppercase flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-red-400" /> Vulnerability Risk
              </span>
              <p className="font-display font-bold text-lg text-foreground mt-1">Short Ball (Pull)</p>
              <p className="text-xs text-amber-400 mt-0.5">2 false shots in last 14 attempts</p>
            </div>
          </div>

          {/* Shot Breakdown Table */}
          <div className="border border-white/10 rounded-2xl overflow-hidden bg-card">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-secondary/50 text-muted-foreground uppercase text-[10px]">
                <tr>
                  <th className="p-3">Shot Category</th>
                  <th className="p-3">Runs</th>
                  <th className="p-3">Balls Faced</th>
                  <th className="p-3">Boundary %</th>
                  <th className="p-3">Risk Assessment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-foreground">
                {shotData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-white/5">
                    <td className="p-3 font-bold">{row.shot}</td>
                    <td className="p-3 text-indigo-400 font-bold">{row.runs}</td>
                    <td className="p-3 text-muted-foreground">{row.balls}</td>
                    <td className="p-3">{row.boundaryPct}%</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] ${
                          row.riskScore === "High"
                            ? "bg-red-500/10 text-red-400"
                            : row.riskScore === "Med"
                            ? "bg-amber-500/10 text-amber-400"
                            : "bg-emerald-500/10 text-emerald-400"
                        }`}
                      >
                        {row.riskScore}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Phase Telemetry */}
      {selectedTab === "phase" && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {phaseData.map((phase, i) => (
              <div key={i} className="bg-secondary/30 border border-white/10 rounded-2xl p-4 space-y-3">
                <span className="text-xs font-mono font-bold text-primary block">{phase.phase}</span>
                <div className="flex justify-between items-baseline">
                  <span className="font-display font-black text-2xl text-foreground">{phase.runs}/{phase.wickets}</span>
                  <span className="text-xs font-mono text-emerald-400 font-bold">RR {phase.rr}</span>
                </div>
                <div className="text-xs text-muted-foreground font-mono flex justify-between">
                  <span>Dot-ball %:</span>
                  <span className="text-foreground">{phase.dotBallPct}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Bowler Matchups */}
      {selectedTab === "matchups" && (
        <div className="p-4 bg-secondary/20 border border-white/10 rounded-2xl space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-foreground font-bold">vs Off-Spin (Right-Arm)</span>
            <span className="text-emerald-400 font-bold">SR 145.0 · 0 Wickets</span>
          </div>
          <div className="flex items-center justify-between text-xs font-mono border-t border-white/5 pt-2">
            <span className="text-foreground font-bold">vs Left-Arm Fast (Seam)</span>
            <span className="text-amber-400 font-bold">SR 112.5 · 2 Wickets</span>
          </div>
          <div className="flex items-center justify-between text-xs font-mono border-t border-white/5 pt-2">
            <span className="text-foreground font-bold">vs Leg-Spin (Wrist)</span>
            <span className="text-indigo-400 font-bold">SR 160.0 · 1 Wicket</span>
          </div>
        </div>
      )}
    </div>
  );
}
