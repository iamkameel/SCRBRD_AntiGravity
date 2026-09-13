"use client";

import React, { useState } from "react";
import { Layers, ShieldCheck, Trophy, ArrowRight, Activity } from "lucide-react";

export function MultiSportEngine() {
  const [selectedSport, setSelectedSport] = useState<"cricket" | "rugby" | "hockey" | "netball">("cricket");

  const sports = [
    { id: "cricket", name: "Cricket OS", status: "Active Canonical", icon: Trophy, teams: 14, matchesThisWeek: 6 },
    { id: "rugby", name: "Rugby 15s OS", status: "Enabled Engine", icon: Layers, teams: 12, matchesThisWeek: 4 },
    { id: "hockey", name: "Field Hockey OS", status: "Enabled Engine", icon: Activity, teams: 10, matchesThisWeek: 5 },
    { id: "netball", name: "Netball OS", status: "Beta Engine", icon: ShieldCheck, teams: 8, matchesThisWeek: 3 },
  ];

  return (
    <div className="bg-card border border-border rounded-3xl p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-display font-bold text-xl text-foreground">
              SCRBRD Multi-Sport Expansion Engine
            </h2>
            <p className="text-xs text-muted-foreground">
              Shared Identity Layer · Cross-Sport Player Passport · School Sports Infrastructure
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-violet-500/10 text-violet-400 border border-violet-500/20">
            4 ACTIVE SPORT ENGINES
          </span>
        </div>
      </div>

      {/* Sport Selector Cards */}
      <div className="grid grid-cols-4 gap-3">
        {sports.map((s) => {
          const Icon = s.icon;
          const isSelected = selectedSport === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setSelectedSport(s.id as any)}
              className={`p-4 rounded-2xl border text-left transition-all ${
                isSelected
                  ? "bg-violet-500/15 border-violet-500/50 text-violet-300"
                  : "bg-secondary/30 border-white/10 text-muted-foreground hover:bg-white/5"
              }`}
            >
              <div className="flex items-center justify-between">
                <Icon className={`h-5 w-5 ${isSelected ? "text-violet-400" : "text-muted-foreground"}`} />
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/5">
                  {s.status}
                </span>
              </div>
              <p className="font-display font-bold text-base text-foreground mt-3">{s.name}</p>
              <p className="text-xs font-mono text-muted-foreground mt-1">
                {s.teams} Squads · {s.matchesThisWeek} Fixtures
              </p>
            </button>
          );
        })}
      </div>

      {/* Shared Platform Synergy Info */}
      <div className="bg-secondary/20 border border-white/10 rounded-2xl p-5 space-y-3">
        <h4 className="text-xs font-mono uppercase tracking-widest text-violet-400 font-bold flex items-center gap-2">
          <ShieldCheck className="h-4 w-4" /> Shared Platform Infrastructure Active
        </h4>
        <p className="text-xs text-foreground font-mono leading-relaxed">
          Player identity profiles, medical clearances, transport dispatch manifests, and coach accreditation cross-sync automatically between <strong>Cricket</strong>, <strong>Rugby</strong>, <strong>Field Hockey</strong>, and <strong>Netball</strong>.
        </p>
      </div>
    </div>
  );
}
