"use client";

import { useState } from "react";
import { D } from "@/lib/design-system";
import { Crosshair, Map, Filter, Zap, Target } from "lucide-react";

interface BallSpot {
  id: string;
  x: number; // percentage
  y: number; // percentage
  runs: number;
  isWicket: boolean;
  bowler: string;
  match: string;
  length: "Yorker" | "Full" | "Good" | "Short";
  line: "Outside Off" | "Stumps" | "Leg Side";
}

export function PlayerPitchShotVisualization() {
  const [activeMode, setActiveMode] = useState<"pitch" | "wagon">("pitch");
  const [filterLength, setFilterLength] = useState<string>("all");

  const pitchEvents: BallSpot[] = [
    { id: "b1", x: 48, y: 82, runs: 6, isWicket: false, bowler: "M. Steyn", match: "vs Wynberg", length: "Full", line: "Stumps" },
    { id: "b2", x: 52, y: 76, runs: 4, isWicket: false, bowler: "M. Steyn", match: "vs Wynberg", length: "Full", line: "Outside Off" },
    { id: "b3", x: 35, y: 55, runs: 0, isWicket: false, bowler: "K. Rabada", match: "vs Bishops", length: "Good", line: "Outside Off" },
    { id: "b4", x: 50, y: 58, runs: 1, isWicket: false, bowler: "K. Rabada", match: "vs Bishops", length: "Good", line: "Stumps" },
    { id: "b5", x: 62, y: 35, runs: 0, isWicket: true, bowler: "A. Nortje", match: "vs SACS", length: "Short", line: "Outside Off" },
    { id: "b6", x: 49, y: 91, runs: 4, isWicket: false, bowler: "L. Ngidi", match: "vs Rondebosch", length: "Yorker", line: "Stumps" },
    { id: "b7", x: 42, y: 62, runs: 2, isWicket: false, bowler: "L. Ngidi", match: "vs Rondebosch", length: "Good", line: "Leg Side" },
    { id: "b8", x: 55, y: 40, runs: 6, isWicket: false, bowler: "M. Jansen", match: "vs Paul Roos", length: "Short", line: "Outside Off" },
  ];

  const filteredBalls = pitchEvents.filter(b => filterLength === "all" || b.length.toLowerCase() === filterLength.toLowerCase());
  const [hoveredSpot, setHoveredSpot] = useState<BallSpot | null>(null);

  return (
    <div className="rounded-3xl border border-zinc-200 dark:border-white/10 bg-white/80 dark:bg-white/[0.03] backdrop-blur-xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b border-zinc-200 dark:border-white/[0.07] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <Crosshair className="h-4 w-4 text-blue-500" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-900 dark:text-white" style={{ fontFamily: D.mono }}>
              2D Pitch Map & Ball Tracking
            </h3>
            <p className="text-[10px] text-zinc-500 dark:text-white/40 font-medium">
              Pitching length distribution & ball impact coordinates
            </p>
          </div>
        </div>

        {/* Length Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {["all", "Yorker", "Full", "Good", "Short"].map(l => (
            <button
              key={l}
              onClick={() => setFilterLength(l)}
              className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-wider transition-all ${
                filterLength === l
                  ? "bg-emerald-500 text-white dark:bg-[#22c55e] dark:text-black shadow-sm"
                  : "bg-zinc-100 dark:bg-white/5 text-zinc-500 dark:text-white/40 hover:text-zinc-900 dark:hover:text-white"
              }`}
              style={{ fontFamily: D.mono }}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Interactive Pitch Graphic */}
        <div className="md:col-span-6 flex justify-center">
          <div className="relative w-48 h-80 bg-emerald-950/60 dark:bg-[#07180e] rounded-2xl border-2 border-emerald-500/30 overflow-hidden shadow-inner p-3 flex flex-col justify-between">
            {/* Pitch Lines */}
            <div className="absolute inset-x-4 top-6 bottom-6 bg-[#d9bd8b]/20 dark:bg-[#9c7c4c]/20 border-x border-[#d9bd8b]/40 dark:border-[#9c7c4c]/40" />

            {/* Bowling Crease */}
            <div className="absolute inset-x-8 top-10 h-0.5 bg-white/40 flex items-center justify-center">
              <div className="w-6 h-1 bg-white/80 rounded" />
            </div>

            {/* Length Zone Labels */}
            <div className="absolute inset-x-0 top-12 text-[7px] font-mono font-black text-rose-400/50 uppercase text-center pointer-events-none">
              Short / Bouncer
            </div>
            <div className="absolute inset-x-0 top-36 text-[7px] font-mono font-black text-amber-400/50 uppercase text-center pointer-events-none">
              Good Length
            </div>
            <div className="absolute inset-x-0 top-56 text-[7px] font-mono font-black text-emerald-400/50 uppercase text-center pointer-events-none">
              Full / Half-Volley
            </div>
            <div className="absolute inset-x-0 bottom-14 text-[7px] font-mono font-black text-blue-400/50 uppercase text-center pointer-events-none">
              Yorker
            </div>

            {/* Batting Crease */}
            <div className="absolute inset-x-8 bottom-10 h-0.5 bg-white/40 flex items-center justify-center">
              <div className="w-6 h-1 bg-white/80 rounded" />
            </div>

            {/* Ball Impact Markers */}
            {filteredBalls.map(spot => (
              <div
                key={spot.id}
                onMouseEnter={() => setHoveredSpot(spot)}
                onMouseLeave={() => setHoveredSpot(null)}
                className={`absolute w-4 h-4 -ml-2 -mt-2 rounded-full flex items-center justify-center text-[8px] font-black cursor-pointer transition-all hover:scale-150 z-10 ${
                  spot.isWicket
                    ? "bg-rose-600 text-white ring-4 ring-rose-500/30 animate-pulse"
                    : spot.runs === 6
                    ? "bg-purple-500 text-white ring-2 ring-purple-400/40"
                    : spot.runs === 4
                    ? "bg-emerald-500 text-white ring-2 ring-emerald-400/40"
                    : "bg-amber-400 text-black"
                }`}
                style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
              >
                {spot.isWicket ? "W" : spot.runs}
              </div>
            ))}
          </div>
        </div>

        {/* Spot Details Panel */}
        <div className="md:col-span-6 space-y-4">
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/5 space-y-3">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-white/30" style={{ fontFamily: D.mono }}>
              Ball Tracking Inspector
            </span>

            {hoveredSpot ? (
              <div className="space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-900 dark:text-white">
                    {hoveredSpot.match} vs {hoveredSpot.bowler}
                  </span>
                  <span className={`text-[9px] font-black font-mono px-2 py-0.5 rounded ${
                    hoveredSpot.isWicket ? "bg-rose-500/20 text-rose-500" : "bg-emerald-500/20 text-emerald-500"
                  }`}>
                    {hoveredSpot.isWicket ? "DISMISSAL" : `${hoveredSpot.runs} RUNS`}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                  <div className="p-2 rounded-xl bg-white dark:bg-white/5">
                    <span className="text-zinc-400 dark:text-white/30 block text-[8px]">LENGTH</span>
                    <span className="font-bold text-emerald-600 dark:text-[#22c55e]">{hoveredSpot.length}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white dark:bg-white/5">
                    <span className="text-zinc-400 dark:text-white/30 block text-[8px]">LINE</span>
                    <span className="font-bold text-zinc-800 dark:text-white">{hoveredSpot.line}</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-zinc-500 dark:text-white/40 italic">
                Hover over any ball impact spot on the pitch map to inspect delivery trajectory & outcome.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
              <div className="text-xl font-black text-emerald-600 dark:text-[#22c55e]" style={{ fontFamily: D.head }}>
                58%
              </div>
              <div className="text-[8px] font-mono font-bold text-zinc-400 dark:text-white/30 uppercase mt-0.5">
                Full Length Scoring Rate
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-amber-500/5 border border-amber-500/20">
              <div className="text-xl font-black text-amber-500" style={{ fontFamily: D.head }}>
                24%
              </div>
              <div className="text-[8px] font-mono font-bold text-zinc-400 dark:text-white/30 uppercase mt-0.5">
                Short Ball Vulnerability
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
