"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Users, 
  Bus, 
  HeartPulse, 
  Award, 
  Calendar, 
  Lock, 
  Unlock, 
  Sparkles, 
  Activity,
  FileCheck,
  ChevronRight,
  RefreshCw,
  MapPin,
  FileText
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { D } from "@/lib/design-system";
import { MatchTransportTelemetry } from "@/components/matches/MatchTransportTelemetry";
import { toast } from "sonner";

export interface ReadinessCheckItem {
  id: string;
  category: 'squad' | 'availability' | 'ground' | 'transport' | 'officials' | 'medical' | 'equipment';
  title: string;
  subtitle: string;
  status: 'READY' | 'PENDING' | 'WARNING';
  scoreWeight: number; // e.g. 15
  verifiedBy?: string;
  verifiedAt?: string;
  details?: string;
}

interface PreMatchReadinessBoardProps {
  matchId?: string;
  homeTeamName?: string;
  awayTeamName?: string;
  onSignOffComplete?: () => void;
}

export function PreMatchReadinessBoard({
  matchId = 'match-101',
  homeTeamName = 'Westville 1st XI',
  awayTeamName = 'Kearsney 1st XI',
  onSignOffComplete
}: PreMatchReadinessBoardProps) {
  const [items, setItems] = useState<ReadinessCheckItem[]>([
    {
      id: 'r1',
      category: 'squad',
      title: 'Match-Day Squad Selection',
      subtitle: 'Playing XI, 12th Man & Captain confirmed',
      status: 'READY',
      scoreWeight: 20,
      verifiedBy: 'Coach A. Smith',
      verifiedAt: '07:15 AM',
      details: '11 Playing XI confirmed, 12th Man assigned (L. Peterson)'
    },
    {
      id: 'r2',
      category: 'availability',
      title: 'Player Availability Responses',
      subtitle: '100% Availability confirmed by squad',
      status: 'READY',
      scoreWeight: 15,
      verifiedBy: 'Team Manager',
      verifiedAt: '07:20 AM',
      details: '13/13 Players responded Available'
    },
    {
      id: 'r3',
      category: 'ground',
      title: 'Ground & Pitch Clearance',
      subtitle: 'Clegg index 92 CIV, Outfield excellent',
      status: 'READY',
      scoreWeight: 15,
      verifiedBy: 'Head Groundskeeper (D. Botha)',
      verifiedAt: '06:45 AM',
      details: 'Match ball pitch prepared, grass canopy cut to 4.2mm'
    },
    {
      id: 'r4',
      category: 'transport',
      title: 'Squad Transport Logistics',
      subtitle: 'Bus V02 assigned, 11/11 passengers boarded',
      status: 'READY',
      scoreWeight: 20,
      verifiedBy: 'Transport Hub',
      verifiedAt: '07:45 AM',
      details: 'Mercedes Sprinter V02 en route to Westville Oval (ETA 08:35 AM)'
    },
    {
      id: 'r5',
      category: 'officials',
      title: 'Officials & Umpires Validation',
      subtitle: 'Standing Umpires & Official Scorer appointed',
      status: 'READY',
      scoreWeight: 10,
      verifiedBy: 'SA Schools Cricket',
      verifiedAt: 'YESTERDAY',
      details: 'Umpire: M. Erasmus, Scorer: K. Kalyan'
    },
    {
      id: 'r6',
      category: 'medical',
      title: 'Medical & Workload Compliance',
      subtitle: '1 Warning: Fast bowler workload limit check',
      status: 'WARNING',
      scoreWeight: 10,
      verifiedBy: 'Sports Med Department',
      verifiedAt: '07:00 AM',
      details: 'J. Steyn flagged for 6-over max spell limit (back tightness)'
    },
    {
      id: 'r7',
      category: 'equipment',
      title: 'Match Kit & Equipment Clearance',
      subtitle: 'Match balls certified, scorer tablet 100%',
      status: 'READY',
      scoreWeight: 10,
      verifiedBy: 'Equipment Manager',
      verifiedAt: '07:30 AM',
      details: '2x Readers 156g leather match balls inspected & approved'
    }
  ]);

  const [isSignedOff, setIsSignedOff] = useState(false);

  // Calculate composite readiness score (0-100%)
  const totalPossible = items.reduce((sum, item) => sum + item.scoreWeight, 0);
  const currentScore = items.reduce((sum, item) => {
    if (item.status === 'READY') return sum + item.scoreWeight;
    if (item.status === 'WARNING') return sum + (item.scoreWeight * 0.7);
    return sum;
  }, 0);

  const overallPct = Math.round((currentScore / totalPossible) * 100);

  const handleToggleItemStatus = (itemId: string) => {
    setItems(prev => prev.map(item => {
      if (item.id !== itemId) return item;
      const nextStatus = item.status === 'READY' ? 'WARNING' : item.status === 'WARNING' ? 'PENDING' : 'READY';
      return { ...item, status: nextStatus };
    }));
  };

  const handleSignOffFixture = () => {
    setIsSignedOff(true);
    toast.success("FIXTURE OPERATIONAL CLEARANCE SIGNED OFF! Match is ready for toss.");
    if (onSignOffComplete) onSignOffComplete();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Overview */}
      <div 
        className="p-6 rounded-3xl border shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden"
        style={{ background: D.surf2, borderColor: D.border }}
      >
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-indigo-500/20 text-indigo-300 border-indigo-500/40 text-[9px] font-black uppercase">
              FIXTURE PRE-MATCH READINESS
            </Badge>
            <span className="text-[10px] font-bold opacity-50 uppercase" style={{ color: D.textMuted }}>
              MATCH ID: {matchId}
            </span>
          </div>

          <h2 className="text-2xl font-black italic uppercase tracking-tight flex items-center gap-3" style={{ fontFamily: D.head, color: D.textPrimary }}>
            {homeTeamName} <span style={{ color: D.textMuted }}>VS</span> {awayTeamName}
          </h2>

          <p className="text-xs font-bold opacity-60 flex items-center gap-2" style={{ color: D.textMuted }}>
            <Calendar className="w-3.5 h-3.5 text-indigo-400" /> SATURDAY 09:00 AM • WESTVILLE MAIN OVAL
          </p>
        </div>

        {/* Readiness Telemetry Gauge */}
        <div className="flex items-center gap-6 p-4 rounded-2xl border shrink-0" style={{ background: D.surf1, borderColor: D.border }}>
          <div className="text-center">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] block opacity-50" style={{ color: D.textMuted }}>
              READINESS INDEX
            </span>
            <span 
              className={`text-3xl font-black italic ${
                overallPct >= 90 ? 'text-emerald-400' : overallPct >= 75 ? 'text-amber-400' : 'text-rose-400'
              }`}
              style={{ fontFamily: D.head }}
            >
              {overallPct}%
            </span>
          </div>

          <div className="h-10 w-[1px] bg-white/10" />

          <div>
            {isSignedOff ? (
              <Badge className="bg-emerald-500 text-black font-black uppercase px-4 py-2 text-xs gap-1.5 shadow-lg">
                <CheckCircle2 className="w-4 h-4" /> SIGNED OFF FOR MATCH
              </Badge>
            ) : (
              <Button
                disabled={overallPct < 70}
                onClick={handleSignOffFixture}
                className="bg-emerald-500 hover:bg-emerald-600 text-black font-black uppercase text-xs px-5 h-11 rounded-xl shadow-lg gap-2"
              >
                <ShieldCheck className="w-4 h-4" /> SIGN-OFF FIXTURE
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Embedded Live Transport Telemetry Stream */}
      <MatchTransportTelemetry fixtureId={matchId} homeTeamName={homeTeamName} awayTeamName={awayTeamName} />

      {/* 7 Operational Readiness Checklist Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2 opacity-70" style={{ color: D.textMuted }}>
            <FileCheck className="w-4 h-4 text-indigo-400" /> 7 OPERATIONAL READINESS DIMENSIONS
          </h3>
          <span className="text-[10px] font-bold opacity-40 uppercase" style={{ color: D.textMuted }}>
            CLICK CARD TO OVERRIDE STATUS
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item) => {
            const isReady = item.status === 'READY';
            const isWarning = item.status === 'WARNING';

            return (
              <motion.div
                key={item.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => handleToggleItemStatus(item.id)}
                className={`p-5 rounded-2xl border cursor-pointer transition-all space-y-3 relative overflow-hidden ${
                  isReady ? 'border-emerald-500/30' : isWarning ? 'border-amber-500/30' : 'border-rose-500/30'
                }`}
                style={{ background: D.surf2 }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                      isReady ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                      isWarning ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                      'bg-rose-500/20 text-rose-400 border-rose-500/30'
                    }`}>
                      {item.category === 'squad' && <Users className="w-5 h-5" />}
                      {item.category === 'availability' && <CheckCircle2 className="w-5 h-5" />}
                      {item.category === 'ground' && <MapPin className="w-5 h-5" />}
                      {item.category === 'transport' && <Bus className="w-5 h-5" />}
                      {item.category === 'officials' && <Award className="w-5 h-5" />}
                      {item.category === 'medical' && <HeartPulse className="w-5 h-5" />}
                      {item.category === 'equipment' && <FileText className="w-5 h-5" />}
                    </div>

                    <div>
                      <h4 className="text-sm font-black uppercase tracking-tight" style={{ fontFamily: D.head, color: D.textPrimary }}>
                        {item.title}
                      </h4>
                      <p className="text-[11px] font-bold opacity-60 mt-0.5" style={{ color: D.textMuted }}>
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <Badge 
                    variant="outline"
                    className={`text-[9px] font-black uppercase px-2.5 py-1 ${
                      isReady ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
                      isWarning ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                      'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    }`}
                  >
                    {item.status}
                  </Badge>
                </div>

                {item.details && (
                  <div className="p-3 rounded-xl border text-[11px] font-bold opacity-80" style={{ background: D.surf1, borderColor: D.border, color: D.textPrimary }}>
                    {item.details}
                  </div>
                )}

                <div className="flex items-center justify-between text-[9px] font-black uppercase opacity-40 pt-1 border-t" style={{ borderColor: D.border, color: D.textMuted }}>
                  <span>VERIFIED BY: {item.verifiedBy || 'SYSTEM'}</span>
                  <span>TIME: {item.verifiedAt || 'JUST NOW'}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
