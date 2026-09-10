"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { D } from "@/lib/scoring/theme";
import { 
  Trophy, 
  Zap, 
  Star, 
  ChevronRight,
  TrendingUp,
  Activity,
  Award
} from 'lucide-react';

interface BroadcastProps {
  score: string;
  wickets: number;
  overs: string;
  batterName: string;
  batterRuns: number;
  batterBalls: number;
  bowlerName: string;
  bowlerFigures: string;
  milestone?: string;
}

export function BroadcastOverlay({
  score = "142",
  wickets = 3,
  overs = "15.4",
  batterName = "Liam Peterson",
  batterRuns = 48,
  batterBalls = 32,
  bowlerName = "K. Rabada",
  bowlerFigures = "3.4-0-22-2",
  milestone
}: Partial<BroadcastProps>) {
  const [showMilestone, setShowMilestone] = useState(!!milestone);

  useEffect(() => {
    if (milestone) {
      setShowMilestone(true);
      const timer = setTimeout(() => setShowMilestone(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [milestone]);

  return (
    <div className="fixed inset-0 pointer-events-none flex flex-col justify-end p-12 z-50">
      {/* Milestone Alert (Upper Third) */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-full max-w-lg">
        <AnimatePresence>
          {showMilestone && (
            <motion.div
              initial={{ y: -100, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -50, opacity: 0, scale: 0.95 }}
              className="bg-primary border-4 border-black shadow-[0_0_50px_rgba(var(--primary-rgb),0.4)] px-8 py-4 rounded-3xl flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="bg-black p-3 rounded-2xl">
                  <Award className="w-8 h-8 text-primary fill-primary/20" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-black/60 uppercase tracking-[0.2em] mb-1">Match Milestone</p>
                  <h3 className="text-2xl font-black text-black uppercase italic leading-none" style={{ fontFamily: D.syne }}>{milestone || "Half-Century"}</h3>
                </div>
              </div>
              <div className="text-right">
                <p className="text-4xl font-black text-black tracking-tighter tabular-nums" style={{ fontFamily: D.head }}>50*</p>
                <p className="text-[9px] font-black text-black/40 uppercase tracking-widest">32 Balls Faced</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Bottom Bar (Lower Third) */}
      <div className="w-full flex flex-col gap-4">
        <div className="flex items-end justify-between gap-6">
          {/* Score & Overs */}
          <motion.div 
            initial={{ x: -200, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex items-center"
          >
            <div className="bg-black border-l-8 border-primary px-8 py-4 shadow-2xl skew-x-[-12deg] flex items-center gap-6">
              <div className="skew-x-[12deg]">
                <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-1">Griquas U15</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-white tracking-tighter tabular-nums" style={{ fontFamily: D.head }}>{score}</span>
                  <span className="text-3xl font-black text-primary/80 tracking-tighter tabular-nums" style={{ fontFamily: D.head }}>/{wickets}</span>
                </div>
              </div>
              <div className="w-px h-10 bg-white/10 skew-x-[12deg]" />
              <div className="skew-x-[12deg]">
                <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-1">Overs</p>
                <p className="text-3xl font-black text-white tracking-tighter tabular-nums" style={{ fontFamily: D.head }}>{overs}</p>
              </div>
            </div>
          </motion.div>

          {/* Current Battle Insights */}
          <motion.div 
            initial={{ x: 200, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="hidden lg:flex flex-col gap-2 scale-90 origin-bottom-right"
          >
            <div className="bg-white/5 backdrop-blur-3xl border border-white/10 p-4 rounded-3xl flex items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <div>
                  <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Projected Score</p>
                  <p className="text-lg font-black text-white tabular-nums" style={{ fontFamily: D.syne }}>214 @ 8.4 RPO</p>
                </div>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div>
                <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Target</p>
                <p className="text-lg font-black text-primary tabular-nums" style={{ fontFamily: D.syne }}>73 runs to win</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Player Strips */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Batter Strip */}
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex"
          >
            <div className="bg-primary/95 px-6 py-3 shadow-2xl skew-x-[-12deg] flex items-center justify-between min-w-[320px]">
              <div className="skew-x-[12deg] flex items-center gap-3">
                <div className="bg-black rounded-lg p-1.5 transform rotate-3">
                  <TrendingUp className="w-3.5 h-3.5 text-primary" />
                </div>
                <span className="text-lg font-black text-black uppercase italic tracking-tighter" style={{ fontFamily: D.syne }}>{batterName}</span>
              </div>
              <div className="skew-x-[12deg] flex items-center gap-1.5">
                <span className="text-2xl font-black text-black tabular-nums">{batterRuns}*</span>
                <span className="text-xs font-bold text-black/60 tabular-nums">({batterBalls})</span>
              </div>
            </div>
          </motion.div>

          {/* Bowler Strip */}
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex justify-end"
          >
            <div className="bg-black/80 backdrop-blur-xl px-6 py-3 shadow-2xl skew-x-[-12deg] border border-white/10 flex items-center justify-between min-w-[340px]">
              <div className="skew-x-[12deg] flex items-center gap-3">
                <div className="bg-white/10 rounded-lg p-1.5">
                  <Zap className="w-3.5 h-3.5 text-white/60" />
                </div>
                <span className="text-lg font-black text-white/80 uppercase italic tracking-tighter" style={{ fontFamily: D.syne }}>{bowlerName}</span>
              </div>
              <div className="skew-x-[12deg] flex items-center gap-4">
                <span className="text-lg font-black text-primary tabular-nums tracking-tighter" style={{ fontFamily: D.mono }}>{bowlerFigures}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Background Polish - Corner Logos / Safe Zones */}
      <div className="absolute top-8 right-8 mix-blend-overlay opacity-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-white" />
          <span className="text-xl font-black text-white tracking-widest uppercase">SCRBRD LIVE</span>
        </div>
      </div>
    </div>
  );
}
