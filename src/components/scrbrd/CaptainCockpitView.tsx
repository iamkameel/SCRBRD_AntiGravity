"use client";

import React, { useState } from "react";
import { Compass, Users, CheckSquare, Zap, Clock, ShieldAlert } from "lucide-react";

export function CaptainCockpitView() {
  const [fieldPreset, setFieldPreset] = useState<"attacking" | "defensive" | "spin_trap">("attacking");

  return (
    <div className="bg-card border border-border rounded-3xl p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <Compass className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-display font-bold text-xl text-foreground">
              Captain Tactical Cockpit
            </h2>
            <p className="text-xs text-muted-foreground">
              On-Field Situational Awareness · Over Planner · Field Preset Directives
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            LIVE INNINGS
          </span>
        </div>
      </div>

      {/* Field Presets Selection */}
      <div className="space-y-3">
        <h4 className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
          Quick Field Presets
        </h4>
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => setFieldPreset("attacking")}
            className={`p-4 rounded-2xl border text-left transition-all ${
              fieldPreset === "attacking"
                ? "bg-amber-500/15 border-amber-500/50 text-amber-400"
                : "bg-secondary/30 border-white/10 text-muted-foreground hover:bg-white/5"
            }`}
          >
            <span className="font-display font-bold text-sm text-foreground block">1. Ultra Attacking</span>
            <span className="text-[11px] font-mono opacity-80 block mt-1">2 Slips, 1 Gully, Short Leg, Catching Mid-Wicket</span>
          </button>

          <button
            onClick={() => setFieldPreset("defensive")}
            className={`p-4 rounded-2xl border text-left transition-all ${
              fieldPreset === "defensive"
                ? "bg-amber-500/15 border-amber-500/50 text-amber-400"
                : "bg-secondary/30 border-white/10 text-muted-foreground hover:bg-white/5"
            }`}
          >
            <span className="font-display font-bold text-sm text-foreground block">2. Boundary Containment</span>
            <span className="text-[11px] font-mono opacity-80 block mt-1">Deep Cover, Deep Mid-Wicket, Long-On, Long-Off</span>
          </button>

          <button
            onClick={() => setFieldPreset("spin_trap")}
            className={`p-4 rounded-2xl border text-left transition-all ${
              fieldPreset === "spin_trap"
                ? "bg-amber-500/15 border-amber-500/50 text-amber-400"
                : "bg-secondary/30 border-white/10 text-muted-foreground hover:bg-white/5"
            }`}
          >
            <span className="font-display font-bold text-sm text-foreground block">3. Spin Squeeze Trap</span>
            <span className="text-[11px] font-mono opacity-80 block mt-1">Silly Mid-Off, Short Fine Leg, Deep Sweep</span>
          </button>
        </div>
      </div>

      {/* Bowler Spell Directives */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-secondary/30 border border-white/10 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-muted-foreground">Next Over Bowler:</span>
            <span className="text-emerald-400 font-bold">K. Patel (Off-Spin)</span>
          </div>
          <p className="text-xs text-foreground font-mono">
            Tactical Directive: Target left-hander outside off-stump with flight.
          </p>
        </div>

        <div className="bg-secondary/30 border border-white/10 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-muted-foreground">Required Run Rate:</span>
            <span className="text-amber-400 font-bold">8.40 RRR</span>
          </div>
          <p className="text-xs text-foreground font-mono">
            Defense Target: Limit next over to under 6 runs.
          </p>
        </div>
      </div>
    </div>
  );
}
