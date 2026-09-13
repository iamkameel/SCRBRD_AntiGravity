"use client";

import React from "react";
import { Heart, Bell, Video, MapPin, Award, Share2 } from "lucide-react";

export function ParentMatchPortal() {
  return (
    <div className="bg-card border border-border rounded-3xl p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <Heart className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-display font-bold text-xl text-foreground">
              Parent & Family Live Match Portal
            </h2>
            <p className="text-xs text-muted-foreground">
              Personalized Child Telemetry · Real-Time Milestone Alerts · Bus GPS Tracking
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            LIVE PARENT STREAM
          </span>
        </div>
      </div>

      {/* Child Card Focus */}
      <div className="bg-gradient-to-r from-rose-950/30 via-background to-secondary/30 border border-rose-500/20 rounded-2xl p-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-display font-black text-xl border border-rose-500/30">
            JP
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-rose-400 font-bold">
              Following Child
            </span>
            <h3 className="font-display font-bold text-lg text-foreground">Joshua Patel (U15A)</h3>
            <p className="text-xs text-muted-foreground font-mono">
              Role: Opener & Vice Captain · Current Score: 42* (34b)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-rose-500 text-white text-xs font-mono font-bold rounded-xl shadow-lg flex items-center gap-2">
            <Bell className="h-4 w-4" /> 50-Run Alert ON
          </button>
        </div>
      </div>

      {/* Highlights & Transport */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-secondary/30 border border-white/10 rounded-2xl p-4 space-y-3">
          <span className="text-xs font-mono font-bold text-rose-400 flex items-center gap-1.5">
            <Video className="h-4 w-4" /> Video Highlight Replay
          </span>
          <p className="text-xs text-foreground font-mono">
            Joshua Patel brings up 40 with a majestic cover drive off the seam bowler.
          </p>
          <button className="text-[11px] font-mono text-rose-400 underline font-bold">
            Watch 10-Second Clip →
          </button>
        </div>

        <div className="bg-secondary/30 border border-white/10 rounded-2xl p-4 space-y-3">
          <span className="text-xs font-mono font-bold text-sky-400 flex items-center gap-1.5">
            <MapPin className="h-4 w-4" /> Team Transport ETA
          </span>
          <p className="text-xs text-foreground font-mono">
            Return Bus #3 departed venue. Estimated arrival back at St Stithians: <strong>17:45</strong>.
          </p>
          <span className="text-[11px] font-mono text-emerald-400 font-bold block">
            GPS Live Tracker Active
          </span>
        </div>
      </div>
    </div>
  );
}
