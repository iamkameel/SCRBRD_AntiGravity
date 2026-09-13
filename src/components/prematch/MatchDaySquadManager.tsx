"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { D } from '@/lib/design-system';
import { 
  Users, 
  ShieldCheck, 
  Crown, 
  Award, 
  AlertTriangle, 
  CheckCircle2, 
  Lock, 
  Unlock, 
  RefreshCw, 
  ArrowRightLeft, 
  FileText, 
  UserCheck, 
  UserX, 
  Clock, 
  Sparkles,
  ChevronRight,
  ShieldAlert,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { saveMatchDaySquadAction } from "@/app/actions/preMatchActions";

export interface SquadPlayer {
  id: string;
  name: string;
  role: string;
  battingStyle: string;
  bowlingStyle: string;
  status: 'selected_xi' | 'twelfth_man' | 'standby' | 'unavailable';
  availability: 'available' | 'unavailable' | 'pending' | 'medical_restriction';
  isCaptain?: boolean;
  isViceCaptain?: boolean;
  medicalNote?: string;
  orderIndex: number;
}

export interface ReplacementLogEntry {
  id: string;
  outgoingName: string;
  incomingName: string;
  reason: string;
  changedBy: string;
  timestamp: string;
}

const MOCK_SQUAD: SquadPlayer[] = [
  { id: 'p1', name: 'J. Smith', role: 'Opener / Batter', battingStyle: 'RHB', bowlingStyle: 'Right-arm Offbreak', status: 'selected_xi', availability: 'available', isCaptain: true, orderIndex: 1 },
  { id: 'p2', name: 'M. Taylor', role: 'Opener / Batter', battingStyle: 'LHB', bowlingStyle: 'None', status: 'selected_xi', availability: 'available', orderIndex: 2 },
  { id: 'p3', name: 'D. Miller', role: 'Top-order Batter', battingStyle: 'RHB', bowlingStyle: 'Right-arm Medium', status: 'selected_xi', availability: 'available', isViceCaptain: true, orderIndex: 3 },
  { id: 'p4', name: 'A. Naidoo', role: 'Middle-order Batter', battingStyle: 'RHB', bowlingStyle: 'Right-arm Leg-spin', status: 'selected_xi', availability: 'available', orderIndex: 4 },
  { id: 'p5', name: 'K. Singh', role: 'Wicketkeeper-Batter', battingStyle: 'RHB', bowlingStyle: 'None (WK)', status: 'selected_xi', availability: 'available', orderIndex: 5 },
  { id: 'p6', name: 'L. Botha', role: 'All-rounder', battingStyle: 'LHB', bowlingStyle: 'Left-arm Fast-Medium', status: 'selected_xi', availability: 'available', orderIndex: 6 },
  { id: 'p7', name: 'R. Govender', role: 'All-rounder', battingStyle: 'RHB', bowlingStyle: 'Right-arm Offbreak', status: 'selected_xi', availability: 'medical_restriction', medicalNote: 'Shoulder workload max 6 overs', orderIndex: 7 },
  { id: 'p8', name: 'S. Mthembu', role: 'New-ball Seamer', battingStyle: 'RHB', bowlingStyle: 'Right-arm Fast', status: 'selected_xi', availability: 'available', orderIndex: 8 },
  { id: 'p9', name: 'C. Marais', role: 'Finger Spinner', battingStyle: 'RHB', bowlingStyle: 'Slow Left-arm Orthodox', status: 'selected_xi', availability: 'available', orderIndex: 9 },
  { id: 'p10', name: 'T. Ndlovu', role: 'Pace Bowler', battingStyle: 'RHB', bowlingStyle: 'Right-arm Fast-Medium', status: 'selected_xi', availability: 'available', orderIndex: 10 },
  { id: 'p11', name: 'E. du Plessis', role: 'Wrist Spinner', battingStyle: 'RHB', bowlingStyle: 'Right-arm Legbreak', status: 'selected_xi', availability: 'available', orderIndex: 11 },
  { id: 'p12', name: 'B. Williams', role: 'Substitute / Fielder', battingStyle: 'RHB', bowlingStyle: 'Right-arm Medium', status: 'twelfth_man', availability: 'available', orderIndex: 12 },
  { id: 'p13', name: 'H. van Zyl', role: 'Standby Seamer', battingStyle: 'RHB', bowlingStyle: 'Right-arm Fast', status: 'standby', availability: 'available', orderIndex: 13 },
  { id: 'p14', name: 'Z. Patel', role: 'Standby Batter', battingStyle: 'LHB', bowlingStyle: 'Slow Left-arm', status: 'standby', availability: 'pending', orderIndex: 14 },
];

export interface MatchDaySquadManagerProps {
  hideHeader?: boolean;
}

export function MatchDaySquadManager({ hideHeader = false }: MatchDaySquadManagerProps) {
  const [players, setPlayers] = useState<SquadPlayer[]>(MOCK_SQUAD);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [version, setVersion] = useState<number>(1);
  const [replacementModalOpen, setReplacementModalOpen] = useState<boolean>(false);
  const [outgoingPlayerId, setOutgoingPlayerId] = useState<string>('');
  const [incomingPlayerId, setIncomingPlayerId] = useState<string>('');
  const [replaceReason, setReplaceReason] = useState<string>('');
  const [replacementLogs, setReplacementLogs] = useState<ReplacementLogEntry[]>([
    {
      id: 'log-1',
      outgoingName: 'P. Johnson',
      incomingName: 'R. Govender',
      reason: 'Late fitness test clearance (Hamstring fine)',
      changedBy: 'Head Coach (M. Davies)',
      timestamp: 'Today, 07:45 AM'
    }
  ]);

  const selectedXi = players.filter(p => p.status === 'selected_xi').sort((a, b) => a.orderIndex - b.orderIndex);
  const twelfthMan = players.find(p => p.status === 'twelfth_man');
  const standbyList = players.filter(p => p.status === 'standby');

  const handleToggleLock = () => {
    const nextLocked = !isLocked;
    setIsLocked(nextLocked);
    if (nextLocked) {
      toast.success(`Playing XI locked & saved (v${version}.0 Selection Package)`, {
        description: "Official team sheet finalized for umpire and scorer review."
      });
    } else {
      toast.info("Match-Day Squad unlocked for editing.");
    }
  };

  const handleMovePlayer = (index: number, direction: 'up' | 'down') => {
    if (isLocked) return;
    const xi = [...selectedXi];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= xi.length) return;

    // Swap orderIndex
    const tempOrder = xi[index].orderIndex;
    xi[index].orderIndex = xi[targetIdx].orderIndex;
    xi[targetIdx].orderIndex = tempOrder;

    setPlayers(prev => {
      const remaining = prev.filter(p => p.status !== 'selected_xi');
      return [...remaining, ...xi];
    });
    toast.success(`Batting order updated: ${xi[index].name} moved to #${xi[index].orderIndex}`);
  };

  const handleSetCaptain = (playerId: string) => {
    if (isLocked) return;
    setPlayers(prev => prev.map(p => ({
      ...p,
      isCaptain: p.id === playerId ? true : (p.id !== playerId && p.isCaptain ? false : p.isCaptain),
      isViceCaptain: p.id === playerId ? false : p.isViceCaptain
    })));
    const targetP = players.find(p => p.id === playerId);
    toast.success(`${targetP?.name} designated as Captain (C)`);
  };

  const handleSetViceCaptain = (playerId: string) => {
    if (isLocked) return;
    setPlayers(prev => prev.map(p => ({
      ...p,
      isViceCaptain: p.id === playerId ? true : (p.id !== playerId && p.isViceCaptain ? false : p.isViceCaptain),
      isCaptain: p.id === playerId ? false : p.isCaptain
    })));
    const targetP = players.find(p => p.id === playerId);
    toast.success(`${targetP?.name} designated as Vice-Captain (VC)`);
  };

  const handlePerformReplacement = () => {
    if (!outgoingPlayerId || !incomingPlayerId || !replaceReason) return;

    const outP = players.find(p => p.id === outgoingPlayerId);
    const inP = players.find(p => p.id === incomingPlayerId);
    if (!outP || !inP) return;

    setPlayers(prev => prev.map(p => {
      if (p.id === outgoingPlayerId) {
        return { ...p, status: 'standby' };
      }
      if (p.id === incomingPlayerId) {
        return { ...p, status: outP.status, orderIndex: outP.orderIndex };
      }
      return p;
    }));

    setReplacementLogs(prev => [
      {
        id: `log-${Date.now()}`,
        outgoingName: outP.name,
        incomingName: inP.name,
        reason: replaceReason,
        changedBy: 'Coach / Team Manager',
        timestamp: 'Just now'
      },
      ...prev
    ]);

    setVersion(v => v + 1);
    setReplacementModalOpen(false);
    setOutgoingPlayerId('');
    setIncomingPlayerId('');
    setReplaceReason('');
    toast.success(`Logged Replacement: ${outP.name} replaced by ${inP.name}`);
  };

  return (
    <div className="space-y-6">
      {/* Header & Status Banner */}
      {!hideHeader ? (
        <div className="p-6 rounded-3xl border border-white/10 flex flex-col xl:flex-row xl:items-center justify-between gap-6" style={{ background: D.surf1 }}>
          <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <Badge className="bg-sky-500/20 text-sky-400 border-sky-500/30 font-black text-xs px-3 py-1 uppercase tracking-widest">
                Match-Day Squad Engine v{version}.0
              </Badge>
              <Badge 
                className={`font-black text-xs px-3 py-1 uppercase tracking-widest flex items-center gap-1.5 ${
                  isLocked 
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                    : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                }`}
              >
                {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                {isLocked ? 'Squad Confirmed & Locked' : 'Selection Open / Draft State'}
              </Badge>
            </div>
            <h2 className="text-2xl font-black uppercase italic tracking-tight" style={{ fontFamily: D.head, color: D.textPrimary }}>
              Playing XI & Selection Package
            </h2>
            <p className="text-xs font-medium text-muted-foreground">
              Versioned selection protocol, captaincy confirmation, and emergency replacement audit trail.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Button
              variant="outline"
              disabled={isLocked}
              onClick={() => setReplacementModalOpen(true)}
              className="h-11 px-5 rounded-2xl font-bold text-xs uppercase tracking-wider border-white/10 hover:bg-white/5 text-white"
            >
              <ArrowRightLeft className="w-4 h-4 mr-2 text-sky-400" /> Log Replacement
            </Button>

            <Button
              onClick={handleToggleLock}
              className={`h-11 px-6 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg ${
                isLocked 
                  ? 'bg-amber-500 text-black hover:bg-amber-400' 
                  : 'bg-emerald-500 text-black hover:bg-emerald-400'
              }`}
            >
              {isLocked ? (
                <><Unlock className="w-4 h-4 mr-2" /> Unlock Squad</>
              ) : (
                <><Lock className="w-4 h-4 mr-2" /> Confirm & Lock XI</>
              )}
            </Button>
          </div>
        </div>
      ) : (
        /* Compact Control Bar when embedded in tabs */
        <div className="p-4 rounded-2xl border flex items-center justify-between gap-4" style={{ background: D.surf1, borderColor: D.border }}>
          <div className="flex items-center gap-3">
            <Badge className="bg-sky-500/20 text-sky-400 border-sky-500/30 font-black text-[10px] px-2.5 py-0.5 uppercase tracking-widest">
              Squad Engine v{version}.0
            </Badge>
            <Badge 
              className={`font-black text-[10px] px-2.5 py-0.5 uppercase tracking-widest flex items-center gap-1.5 ${
                isLocked 
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                  : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
              }`}
            >
              {isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
              {isLocked ? 'Squad Locked' : 'Selection Open'}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={isLocked}
              onClick={() => setReplacementModalOpen(true)}
              className="h-9 px-3 rounded-xl font-bold text-xs border-white/10 hover:bg-white/5 text-white"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 mr-1.5 text-sky-400" /> Log Replacement
            </Button>

            <Button
              size="sm"
              onClick={handleToggleLock}
              className={`h-9 px-4 rounded-xl font-black text-xs uppercase shadow-md ${
                isLocked 
                  ? 'bg-amber-500 text-black hover:bg-amber-400' 
                  : 'bg-emerald-500 text-black hover:bg-emerald-400'
              }`}
            >
              {isLocked ? 'Unlock Squad' : 'Confirm & Lock XI'}
            </Button>
          </div>
        </div>
      )}

      {/* Main Grid: Playing XI + Standby & Audit */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Playing XI List */}
        <Card className="lg:col-span-2 border-white/10" style={{ background: D.surf1 }}>
          <CardHeader className="border-b border-white/5 pb-4 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-black uppercase italic" style={{ fontFamily: D.head }}>
                Confirmed Playing XI ({selectedXi.length} / 11)
              </CardTitle>
              <CardDescription className="text-xs font-bold text-muted-foreground">
                Batting order & role assignments for match day
              </CardDescription>
            </div>
            <Badge className="bg-sky-500/20 text-sky-400 border-sky-500/30 font-mono text-xs px-3 py-1">
              v{version}.0 Package
            </Badge>
          </CardHeader>
          <CardContent className="p-6 space-y-3">
            {selectedXi.map((p, idx) => (
              <div 
                key={p.id}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-black/30 border border-white/5 hover:border-sky-500/30 transition-all"
              >
                <div className="flex items-center gap-3">
                  {/* Order Index & Reorder Controls */}
                  <div className="flex items-center gap-1">
                    <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center font-mono text-xs font-black text-sky-400">
                      {idx + 1}
                    </div>
                    {!isLocked && (
                      <div className="flex flex-col gap-0.5">
                        <button
                          disabled={idx === 0}
                          onClick={() => handleMovePlayer(idx, 'up')}
                          className="p-0.5 text-zinc-400 hover:text-white disabled:opacity-20 transition-colors"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          disabled={idx === selectedXi.length - 1}
                          onClick={() => handleMovePlayer(idx, 'down')}
                          className="p-0.5 text-zinc-400 hover:text-white disabled:opacity-20 transition-colors"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-white">{p.name}</span>
                      {p.isCaptain && (
                        <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[9px] font-black uppercase px-2 py-0.5">
                          <Crown className="w-3 h-3 mr-1 text-amber-400" /> Captain
                        </Badge>
                      )}
                      {p.isViceCaptain && (
                        <Badge className="bg-sky-500/20 text-sky-400 border-sky-500/30 text-[9px] font-black uppercase px-2 py-0.5">
                          VC
                        </Badge>
                      )}
                    </div>
                    <p className="text-[11px] font-medium text-muted-foreground flex items-center gap-2 mt-0.5">
                      <span>{p.role}</span>
                      <span>•</span>
                      <span className="text-white/80">{p.battingStyle}</span>
                      <span>•</span>
                      <span className="text-sky-400/90">{p.bowlingStyle}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Leadership Quick Action Buttons */}
                  {!isLocked && (
                    <div className="flex items-center gap-1 opacity-0 hover:opacity-100 focus-within:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleSetCaptain(p.id)}
                        className={`text-[9px] font-black px-2 py-0.5 rounded-lg border transition-all ${
                          p.isCaptain 
                            ? 'bg-amber-500 text-black border-amber-400' 
                            : 'bg-white/5 text-zinc-400 border-white/10 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        (C)
                      </button>
                      <button
                        onClick={() => handleSetViceCaptain(p.id)}
                        className={`text-[9px] font-black px-2 py-0.5 rounded-lg border transition-all ${
                          p.isViceCaptain 
                            ? 'bg-sky-500 text-black border-sky-400' 
                            : 'bg-white/5 text-zinc-400 border-white/10 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        (VC)
                      </button>
                    </div>
                  )}

                  {p.medicalNote && (
                    <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/30 text-[10px] font-bold hidden sm:flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3" /> {p.medicalNote}
                    </Badge>
                  )}
                  <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] font-bold">
                    Ready
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* 12th Man, Standby & Replacement Audit */}
        <div className="space-y-6">
          {/* 12th Man & Reserves */}
          <Card className="border-white/10" style={{ background: D.surf1 }}>
            <CardHeader className="border-b border-white/5 pb-4">
              <CardTitle className="text-base font-black uppercase italic" style={{ fontFamily: D.head }}>
                12th Man & Standby Pool
              </CardTitle>
              <CardDescription className="text-xs font-bold text-muted-foreground">
                Emergency substitute & backup roster
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {twelfthMan && (
                <div className="p-3.5 rounded-2xl bg-sky-500/5 border border-sky-500/20 space-y-1">
                  <div className="flex items-center justify-between text-xs font-black text-sky-400 uppercase tracking-wider">
                    <span>12th Man (Substitute)</span>
                    <Badge className="bg-sky-500/20 text-sky-400 border-sky-500/30 text-[9px]">Fielding Spec</Badge>
                  </div>
                  <p className="text-sm font-black text-white">{twelfthMan.name}</p>
                  <p className="text-[11px] font-medium text-muted-foreground">{twelfthMan.role}</p>
                </div>
              )}

              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Standby Pool</p>
                {standbyList.map(p => (
                  <div key={p.id} className="p-3 rounded-xl bg-black/20 border border-white/5 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-white">{p.name}</p>
                      <p className="text-[10px] text-muted-foreground">{p.role}</p>
                    </div>
                    <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30 text-[9px]">Standby</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Replacement Audit Trail */}
          <Card className="border-white/10" style={{ background: D.surf1 }}>
            <CardHeader className="border-b border-white/5 pb-4">
              <CardTitle className="text-base font-black uppercase italic" style={{ fontFamily: D.head }}>
                Replacement Audit Log
              </CardTitle>
              <CardDescription className="text-xs font-bold text-muted-foreground">
                Official change record for competition compliance
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-3">
              {replacementLogs.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">No replacements logged.</p>
              ) : (
                replacementLogs.map(log => (
                  <div key={log.id} className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-bold text-sky-400">
                      <span>OUT: {log.outgoingName} ➔ IN: {log.incomingName}</span>
                      <span className="text-muted-foreground font-mono">{log.timestamp}</span>
                    </div>
                    <p className="text-xs font-medium text-white">{log.reason}</p>
                    <p className="text-[10px] text-muted-foreground">By {log.changedBy}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* LOG REPLACEMENT MODAL */}
      <Dialog open={replacementModalOpen} onOpenChange={setReplacementModalOpen}>
        <DialogContent className="max-w-md bg-slate-950 border-white/10 text-white rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase italic" style={{ fontFamily: D.head }}>
              Log Match-Day Replacement
            </DialogTitle>
            <DialogDescription className="text-xs font-bold text-muted-foreground">
              Swap an XI player with a standby reserve and log compliance reason
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Outgoing XI Player</label>
              <Select value={outgoingPlayerId} onValueChange={setOutgoingPlayerId}>
                <SelectTrigger className="bg-black/40 border-white/10 rounded-xl text-xs font-bold">
                  <SelectValue placeholder="Select XI Player to Replace..." />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10">
                  {selectedXi.map(p => (
                    <SelectItem key={p.id} value={p.id} className="text-xs font-bold">
                      {p.name} ({p.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Incoming Standby Player</label>
              <Select value={incomingPlayerId} onValueChange={setIncomingPlayerId}>
                <SelectTrigger className="bg-black/40 border-white/10 rounded-xl text-xs font-bold">
                  <SelectValue placeholder="Select Incoming Standby..." />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10">
                  {[twelfthMan, ...standbyList].filter(Boolean).map(p => (
                    <SelectItem key={p!.id} value={p!.id} className="text-xs font-bold">
                      {p!.name} ({p!.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Replacement Reason & Clearance</label>
              <Textarea
                placeholder="e.g. Illness / injury during warm-up; cleared by medical staff."
                value={replaceReason}
                onChange={(e) => setReplaceReason(e.target.value)}
                className="bg-black/40 border-white/10 rounded-xl h-20 text-xs font-medium"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setReplacementModalOpen(false)} className="border-white/10 rounded-xl font-bold">
              Cancel
            </Button>
            <Button
              onClick={handlePerformReplacement}
              disabled={!outgoingPlayerId || !incomingPlayerId || !replaceReason}
              className="bg-sky-500 text-black font-black rounded-xl"
            >
              Log & Apply Swap
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
