"use client";

import React from "react";
import { ShieldAlert, Activity, Flame, AlertCircle } from "lucide-react";

export interface BowlerWorkloadData {
  bowlerId: string;
  bowlerName: string;
  ageGroup: string; // e.g. "U15" | "U17" | "1st XI"
  currentSpellOvers: number;
  maxSpellOvers: number;
  dailyOversTotal: number;
  maxDailyOvers: number;
  consecutiveDaysBowling: number;
  fatigueLevel: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
  restRequiredMinutes?: number;
}

interface Props {
  data: BowlerWorkloadData;
  onSpellCapReached?: () => void;
}

export function BowlerWorkloadMonitor({ data }: Props) {
  const spellPct = Math.min(100, Math.round((data.currentSpellOvers / data.maxSpellOvers) * 100));
  const dailyPct = Math.min(100, Math.round((data.dailyOversTotal / data.maxDailyOvers) * 100));

  const isSpellWarning = spellPct >= 80;
  const isDailyWarning = dailyPct >= 80;

  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-lg space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-base text-foreground">
              Youth Bowler Workload Safeguard
            </h3>
            <p className="text-xs text-muted-foreground">
              CSA Youth Directives ({data.ageGroup}) · {data.bowlerName}
            </p>
          </div>
        </div>

        <div
          className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${
            data.fatigueLevel === "CRITICAL"
              ? "bg-red-500/10 text-red-500 border-red-500/30"
              : data.fatigueLevel === "HIGH"
              ? "bg-amber-500/10 text-amber-500 border-amber-500/30"
              : "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
          }`}
        >
          {data.fatigueLevel} FATIGUE
        </div>
      </div>

      {/* Spell Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-mono font-medium">
          <span className="text-muted-foreground flex items-center gap-1">
            <Flame className="h-3.5 w-3.5 text-amber-500" /> Current Spell:
          </span>
          <span className={isSpellWarning ? "text-red-400 font-bold" : "text-foreground"}>
            {data.currentSpellOvers} / {data.maxSpellOvers} overs
          </span>
        </div>
        <div className="h-2.5 w-full bg-secondary/50 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              spellPct >= 100
                ? "bg-red-500"
                : spellPct >= 80
                ? "bg-amber-500"
                : "bg-primary"
            }`}
            style={{ width: `${spellPct}%` }}
          />
        </div>
      </div>

      {/* Daily Total Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-mono font-medium">
          <span className="text-muted-foreground flex items-center gap-1">
            <Activity className="h-3.5 w-3.5 text-primary" /> Daily Cap:
          </span>
          <span className={isDailyWarning ? "text-red-400 font-bold" : "text-foreground"}>
            {data.dailyOversTotal} / {data.maxDailyOvers} overs
          </span>
        </div>
        <div className="h-2.5 w-full bg-secondary/50 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              dailyPct >= 100
                ? "bg-red-500"
                : dailyPct >= 80
                ? "bg-amber-500"
                : "bg-emerald-500"
            }`}
            style={{ width: `${dailyPct}%` }}
          />
        </div>
      </div>

      {/* Warnings & Rest Directives */}
      {(isSpellWarning || isDailyWarning) && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-2 text-xs text-amber-400">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>
            {spellPct >= 100
              ? `Spell limit reached! ${data.bowlerName} must rest for at least ${data.restRequiredMinutes || 30} minutes.`
              : `Approaching spell limit (${data.currentSpellOvers}/${data.maxSpellOvers} overs). Prepare bowler change.`}
          </span>
        </div>
      )}
    </div>
  );
}
