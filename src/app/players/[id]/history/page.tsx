"use client";

import React, { use } from "react";
import { PlayerCareerHistoryTab } from "@/components/charts/lazy";
import { MOCK_CAREER_PROFILES } from "@/lib/intelligence/playerHistoryEngine";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, User, Trophy, Calendar, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { D } from "@/lib/design-system";

interface PlayerHistoryPageProps {
  params: Promise<{ id: string }>;
}

export default function PlayerHistoryPage({ params }: PlayerHistoryPageProps) {
  const resolvedParams = use(params);
  const playerId = resolvedParams.id || "player-1";
  const profile = MOCK_CAREER_PROFILES[playerId] || MOCK_CAREER_PROFILES["player-1"];

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-[1600px] mx-auto space-y-8 pb-24">
      {/* Header Banner */}
      <div className="relative p-8 md:p-10 rounded-[3rem] border overflow-hidden shadow-2xl" 
           style={{ background: D.surf1, borderColor: D.border }}>
        <div className="absolute inset-0 opacity-10" style={{ background: D.gradMain }} />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <Link href="/players">
              <Button size="icon" variant="outline" className="h-12 w-12 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-white">
                <ArrowLeft size={20} />
              </Button>
            </Link>

            <div>
              <div className="flex items-center gap-3 mb-2">
                <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/40 text-[9px] font-black uppercase tracking-widest px-3 py-1">
                  CAREER & ACCOLADES ENGINE
                </Badge>
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40 text-[9px] font-black uppercase tracking-widest px-3 py-1">
                  {profile.schoolName}
                </Badge>
              </div>

              <h1 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter" style={{ fontFamily: D.head, color: D.textPrimary }}>
                {profile.firstName} {profile.lastName}
              </h1>

              <p className="text-xs font-mono font-bold text-white/50 mt-1 uppercase tracking-wider flex items-center gap-2">
                <span>{profile.primaryRole}</span> • <span>{profile.battingStyle}</span> • <span>{profile.bowlingStyle}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-black/40 p-4 rounded-2xl border border-white/10">
            <div className="text-right">
              <span className="text-[9px] font-black uppercase tracking-widest text-white/40 block">LONGITUDINAL INDEX</span>
              <span className="text-2xl font-black font-mono text-emerald-400">
                {profile.skillProgression[profile.skillProgression.length - 1]?.compositeIndex || 88} / 100
              </span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <ShieldCheck size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Longitudinal Player History Dashboard */}
      <PlayerCareerHistoryTab profile={profile} playerId={playerId} />
    </main>
  );
}
