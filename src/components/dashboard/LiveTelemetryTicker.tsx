"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Radio, ArrowRight, Zap, Trophy, ShieldAlert, ChevronRight } from "lucide-react";
import { D } from "@/lib/design-system";

export interface LiveMatchTickerData {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: string;
  awayScore: string;
  status: string; // e.g. "LIVE · 2ND INNINGS", "PRE-MATCH", "INNINGS BREAK"
  currentOver?: string;
  targetRuns?: number;
  recentBalls?: string[];
  venue: string;
}

const MOCK_TICKER_MATCHES: LiveMatchTickerData[] = [
  {
    id: "wbhs-vs-kearsney-2026",
    homeTeam: "WBHS 1st XI",
    awayTeam: "Kearsney 1st XI",
    homeScore: "248/6 (50.0 ov)",
    awayScore: "184/4 (34.2 ov)",
    status: "LIVE · 2ND INNINGS",
    currentOver: "34.2",
    targetRuns: 249,
    recentBalls: ["1", "4", "0", "W", "2", "6"],
    venue: "Bowden's Field, WBHS"
  },
  {
    id: "hilton-vs-michaelhouse-2026",
    homeTeam: "Hilton 1st XI",
    awayTeam: "Michaelhouse 1st XI",
    homeScore: "192/10 (44.1 ov)",
    awayScore: "85/2 (16.0 ov)",
    status: "LIVE · 2ND INNINGS",
    currentOver: "16.0",
    targetRuns: 193,
    recentBalls: ["0", "1", "1", "4", "0", "0"],
    venue: "Gilfillan Oval, Hilton"
  },
  {
    id: "st-stithians-vs-jeppe-2026",
    homeTeam: "St Stithians 1st XI",
    awayTeam: "Jeppe Boys 1st XI",
    homeScore: "280/4 (50.0 ov)",
    awayScore: "Yet to bat",
    status: "INNINGS BREAK",
    venue: "Baytop Oval, Saints"
  }
];

export function LiveTelemetryTicker() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeMatch = MOCK_TICKER_MATCHES[activeIndex];

  return (
    <div
      className="rounded-2xl border p-4 md:p-5 relative overflow-hidden shadow-xl mb-8"
      style={{
        background: `linear-gradient(135deg, ${D.surf1}, ${D.surf2})`,
        borderColor: `${D.indigo}30`
      }}
    >
      {/* Animated Subtle Pulse */}
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none opacity-5 blur-3xl bg-indigo-500" />

      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4 justify-between relative z-10">
        {/* Left: Ticker Header & Match Selector Tabs */}
        <div className="flex items-center gap-3">
          <div
            className="h-10 w-10 rounded-xl flex items-center justify-center border shrink-0 animate-pulse shadow-md"
            style={{
              background: `${D.rose}15`,
              borderColor: `${D.rose}30`,
              color: D.rose
            }}
          >
            <Radio className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-[0.25em]" style={{ color: D.rose }}>
                LIVE TELEMETRY
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
            </div>
            <p className="text-xs font-bold uppercase tracking-tight text-white" style={{ fontFamily: D.head }}>
              MATCH BROADCAST MATRIX
            </p>
          </div>
        </div>

        {/* Middle: Active Match Banner & Recent Ball Events */}
        <div className="flex-1 max-w-2xl px-2 lg:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border border-white/5 bg-black/20">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-white" style={{ fontFamily: D.head }}>
                <span className="text-indigo-400">{activeMatch.homeTeam}</span>
                <span className="text-slate-500 font-mono text-[10px]">VS</span>
                <span className="text-emerald-400">{activeMatch.awayTeam}</span>
              </div>
              <div className="flex items-center gap-3 mt-1 text-[11px]" style={{ fontFamily: D.mono }}>
                <span className="text-slate-200 font-bold">{activeMatch.awayScore}</span>
                <span className="text-slate-500">|</span>
                <span className="text-slate-400 font-medium">{activeMatch.venue}</span>
              </div>
            </div>

            {/* Recent Balls */}
            {activeMatch.recentBalls && (
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 mr-1" style={{ fontFamily: D.sans }}>RECENT:</span>
                {activeMatch.recentBalls.map((ball, i) => {
                  const isWicket = ball === "W";
                  const isSix = ball === "6";
                  const isFour = ball === "4";
                  return (
                    <span
                      key={i}
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold border shadow-sm"
                      style={{
                        fontFamily: D.mono,
                        background: isWicket
                          ? D.rose
                          : isSix
                          ? D.emerald
                          : isFour
                          ? D.amber
                          : D.surf3,
                        borderColor: isWicket || isSix || isFour ? "transparent" : D.border,
                        color: isWicket || isSix || isFour ? "white" : D.textPrimary
                      }}
                    >
                      {ball}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Quick Action to Scoring Hub & Match Selector Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1 mr-2">
            {MOCK_TICKER_MATCHES.map((m, idx) => (
              <button
                key={m.id}
                onClick={() => setActiveIndex(idx)}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  activeIndex === idx ? "w-6 bg-indigo-500" : "w-2.5 bg-white/20 hover:bg-white/40"
                }`}
                title={m.homeTeam}
              />
            ))}
          </div>

          <Link href={`/matches/${activeMatch.id}/scoring-hub`}>
            <button
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs shadow-lg transition-all hover:scale-105 active:scale-95 text-white"
              style={{ background: D.indigo, fontFamily: D.sans }}
            >
              <Zap className="h-3.5 w-3.5" />
              Live Hub
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
