"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  Eye,
  CloudRain,
  BarChart3,
  Compass,
  Landmark,
  Layers,
  Heart,
  Volume2,
  Calculator,
  Search,
  Sparkles,
} from "lucide-react";

import Link from "next/link";
import { usePermissions } from "@/lib/auth/usePermissions";
import { BowlerWorkloadMonitor } from "@/components/scrbrd/BowlerWorkloadMonitor";
import { DRSReview } from "@/components/scrbrd/DRSReview";
import { GoogleWeatherWidget } from "@/components/scrbrd/GoogleWeatherWidget";
import { PerformanceAnalystCockpit } from "@/components/scrbrd/PerformanceAnalystCockpit";
import { CaptainCockpitView } from "@/components/scrbrd/CaptainCockpitView";
import { CommercialView } from "@/components/scrbrd/CommercialView";
import { MultiSportEngine } from "@/components/scrbrd/MultiSportEngine";
import { ParentMatchPortal } from "@/components/scrbrd/ParentMatchPortal";
import { HistoricalArchiveVault } from "@/components/scrbrd/HistoricalArchiveVault";
import { calculateDlsTarget } from "@/lib/scoring/dlsEngine";
import { scorerAudio } from "@/lib/scoring/scorerAudioEngine";

export default function OperatingSystemPage() {
  const { canAccess } = usePermissions();
  const [showDRS, setShowDRS] = useState(false);
  const [dlsInput, setDlsInput] = useState({
    targetRuns: 240,
    team1TotalOvers: 50,
    team1OversBatted: 50,
    team1WicketsLost: 10,
    team2OversAvailable: 35,
    team2WicketsLostAtInterruption: 2,
  });

  if (!canAccess("operatingsystem")) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-8 text-center space-y-6">
        <div className="p-4 rounded-3xl bg-red-500/10 border border-red-500/30 text-red-500">
          <ShieldAlert className="h-16 w-16" />
        </div>
        <div className="space-y-2 max-w-md">
          <h1 className="font-display font-black text-2xl md:text-3xl text-foreground">
            Access Restricted: Operations Only
          </h1>
          <p className="text-sm text-muted-foreground">
            The Canonical Operating System is strictly reserved for School Sports Administrators, Head Coaches, Sportsmasters & Operational Staff. Spectators, parents, and general members do not have system clearance.
          </p>
        </div>
        <Link
          href="/home"
          className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-2xl hover:opacity-90 transition-all shadow-lg"
        >
          Return to Home Dashboard
        </Link>
      </div>
    );
  }

  const dlsResult = calculateDlsTarget({
    matchFormatOvers: dlsInput.team1TotalOvers,
    team1Runs: dlsInput.targetRuns,
    team1OversBatted: dlsInput.team1OversBatted,
    team1WicketsLost: dlsInput.team1WicketsLost,
    team2RevisedOvers: dlsInput.team2OversAvailable,
    team2CurrentWicketsLost: dlsInput.team2WicketsLostAtInterruption,
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-primary/20 via-primary/10 to-card border border-primary/30 p-8 overflow-hidden shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary border border-primary/30 text-xs font-mono font-bold">
              <Sparkles className="h-3.5 w-3.5" /> CANONICAL OPERATING SYSTEM
            </div>
            <h1 className="font-display font-black text-3xl md:text-5xl text-foreground tracking-tight">
              SCRBRD School Cricket OS
            </h1>
            <p className="text-sm md:text-base text-muted-foreground max-w-2xl">
              The complete digital infrastructure layer for school sports. Connecting competition, team operations, match engine, player development, and institutional memory.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowDRS(true)}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold rounded-xl shadow-lg flex items-center gap-2 transition-all"
            >
              <Eye className="h-4 w-4" /> Trigger DRS Review
            </button>

            <button
              onClick={() => scorerAudio.playFourCheer()}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono text-xs font-bold rounded-xl shadow-lg flex items-center gap-2 transition-all"
            >
              <Volume2 className="h-4 w-4" /> Sound Test (FOUR!)
            </button>
          </div>
        </div>
      </div>

      {/* Grid of OS Engines */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* DLS Calculator */}
        <div className="bg-card border border-border rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-3 border-b border-border pb-3">
            <div className="p-2.5 rounded-2xl bg-primary/10 text-primary border border-primary/20">
              <Calculator className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-foreground">
                DLS Method Rain Target Calculator
              </h3>
              <p className="text-xs text-muted-foreground">Standard Duckworth-Lewis-Stern 2.0 Engine</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
            <div className="bg-secondary/40 border border-white/5 p-3 rounded-xl">
              <span className="text-[10px] text-muted-foreground block">Team 1 Target</span>
              <input
                type="number"
                value={dlsInput.targetRuns}
                onChange={(e) => setDlsInput({ ...dlsInput, targetRuns: Number(e.target.value) })}
                className="w-full bg-transparent font-bold text-base outline-none text-foreground"
              />
            </div>

            <div className="bg-secondary/40 border border-white/5 p-3 rounded-xl">
              <span className="text-[10px] text-muted-foreground block">Team 2 Overs Available</span>
              <input
                type="number"
                value={dlsInput.team2OversAvailable}
                onChange={(e) => setDlsInput({ ...dlsInput, team2OversAvailable: Number(e.target.value) })}
                className="w-full bg-transparent font-bold text-base outline-none text-foreground"
              />
            </div>

            <div className="bg-primary/20 border border-primary/30 p-3 rounded-xl col-span-2 sm:col-span-1">
              <span className="text-[10px] text-primary block font-bold">Revised DLS Target</span>
              <span className="font-display font-black text-xl text-primary">{dlsResult.revisedTarget} Runs</span>
            </div>
          </div>
        </div>

        {/* Bowler Workload */}
        <BowlerWorkloadMonitor
          data={{
            bowlerId: "b1",
            bowlerName: "K. Steyn",
            ageGroup: "U15",
            currentSpellOvers: 4,
            maxSpellOvers: 5,
            dailyOversTotal: 7,
            maxDailyOvers: 8,
            consecutiveDaysBowling: 1,
            fatigueLevel: "HIGH",
            restRequiredMinutes: 40,
          }}
        />
      </div>

      {/* Weather Telemetry & Captain Cockpit */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <GoogleWeatherWidget />
        <CaptainCockpitView />
      </div>

      {/* Analyst Cockpit & Commercial View */}
      <PerformanceAnalystCockpit />
      <CommercialView />

      {/* Multi-Sport Engine & Parent Portal & History Vault */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <MultiSportEngine />
        <ParentMatchPortal />
        <HistoricalArchiveVault />
      </div>

      {/* DRS Modal if open */}
      {showDRS && (
        <DRSReview
          onClose={() => setShowDRS(false)}
          onDecision={(decision) => {
            scorerAudio.speakCommentary(`Decision confirmed: ${decision}`);
            setShowDRS(false);
          }}
        />
      )}
    </div>
  );
}
