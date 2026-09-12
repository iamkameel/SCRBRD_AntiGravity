"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sun, 
  Wind, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Hammer, 
  Droplets, 
  Activity,
  ShieldCheck,
  RotateCcw,
  Compass,
  FileCheck,
  Plus,
  Wifi,
  WifiOff,
  ChevronRight,
  Sliders,
  Check
} from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { D } from '@/lib/design-system';
import { fieldService } from "@/services/fieldService";
import { toast } from "sonner";

interface PitchTelemetry {
  fieldId: string;
  fieldName: string;
  pitchNumber: number;
  pitchType: string;
  grassHeightMm: number;
  moisturePct: number;
  cleggImpactValue: number;
  crackIndex: 'Stable' | 'Minor Fractures' | 'Active Cracking';
}

const DEFAULT_PITCHES: PitchTelemetry[] = [
  {
    fieldId: 'main-oval',
    fieldName: 'Main Oval (A-Field)',
    pitchNumber: 4,
    pitchType: 'Kikuyu Clay Base',
    grassHeightMm: 12,
    moisturePct: 14,
    cleggImpactValue: 84,
    crackIndex: 'Stable',
  },
  {
    fieldId: 'b-oval',
    fieldName: 'B-Oval (Secondary Turf)',
    pitchNumber: 2,
    pitchType: 'Cynodon Dactylon',
    grassHeightMm: 15,
    moisturePct: 18,
    cleggImpactValue: 72,
    crackIndex: 'Minor Fractures',
  },
  {
    fieldId: 'indoor-nets',
    fieldName: 'High Performance Nets',
    pitchNumber: 1,
    pitchType: 'Hybrid Astro Turf',
    grassHeightMm: 8,
    moisturePct: 5,
    cleggImpactValue: 95,
    crackIndex: 'Stable',
  }
];

const PREP_TASKS = [
  { id: 'mowing', label: 'Outfield & Pitch Cut (12mm Match Spec)', done: true, category: 'Turf' },
  { id: 'rolling', label: 'Heavy 2-Ton Roller Session (Pitch #4)', done: true, category: 'Pitch' },
  { id: 'crease', label: 'Crease Marking & Crease Paint', done: true, category: 'Paint' },
  { id: 'stumps', label: 'Stump Hole Gauge & Alignment', done: false, category: 'Pitch' },
  { id: 'covers', label: 'Hover Cover Deployment Test', done: false, category: 'Weather' },
  { id: 'sightscreens', label: 'Sight Screen Canvas Cleaning', done: false, category: 'Equipment' },
  { id: 'rings', label: '30-Yard Inner Ring Marker Discs', done: false, category: 'Paint' },
];

export function GroundskeeperMobilePWA() {
  const [pitches, setPitches] = useState<PitchTelemetry[]>(DEFAULT_PITCHES);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [tasks, setTasks] = useState(PREP_TASKS);
  const [rollerHours, setRollerHours] = useState('1.5');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clearanceLogged, setClearanceLogged] = useState(false);
  const [isOnline] = useState(true);

  const activePitch = pitches[selectedIndex];
  const completedTasksCount = tasks.filter(t => t.done).length;
  const readinessPct = Math.round((completedTasksCount / tasks.length) * 100);

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const updateTelemetry = (field: keyof PitchTelemetry, value: any) => {
    setPitches(prev => prev.map((p, idx) => idx === selectedIndex ? { ...p, [field]: value } : p));
  };

  const handleIssueClearance = async () => {
    setIsSubmitting(true);
    try {
      await fieldService.logGroundStatus({
        fieldId: activePitch.fieldId,
        conditionStatus: readinessPct >= 80 ? 'Optimal' : readinessPct >= 50 ? 'Playable' : 'Inspection Required',
        pitchReadiness: readinessPct,
        outfieldReadiness: 95,
        equipmentReadiness: 90,
        loggedBy: 'Groundskeeper Mobile PWA',
        notes: `Pitch #${activePitch.pitchNumber} cleared with ${readinessPct}% readiness. CIV: ${activePitch.cleggImpactValue}, Moisture: ${activePitch.moisturePct}%, Grass: ${activePitch.grassHeightMm}mm.`
      });
      setClearanceLogged(true);
      toast.success(`Official Pitch Clearance Certificate Logged for ${activePitch.fieldName}!`);
    } catch (err) {
      toast.error('Failed to log ground status');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex flex-col max-w-md mx-auto border-x shadow-2xl overflow-x-hidden select-none" 
      style={{ background: D.surf1, borderColor: D.border, color: D.textPrimary }}
    >
      {/* Header Bar */}
      <div className="p-4 border-b sticky top-0 z-40 backdrop-blur-xl" style={{ background: `${D.surf2}ee`, borderColor: D.border }}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest block opacity-50" style={{ color: D.textMuted }}>
                FIELD OPS MOBILE PWA
              </span>
              <h1 className="text-sm font-black italic uppercase tracking-tight" style={{ fontFamily: D.head }}>
                {activePitch.fieldName}
              </h1>
            </div>
          </div>

          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[9px] font-black uppercase px-2.5 py-1 flex items-center gap-1">
            {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3 text-rose-400" />}
            {isOnline ? 'ONLINE SYNC' : 'OFFLINE QUEUED'}
          </Badge>
        </div>

        {/* Pitch Switcher Bar */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {pitches.map((p, idx) => (
            <button
              key={p.fieldId}
              onClick={() => { setSelectedIndex(idx); setClearanceLogged(false); }}
              className={`px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-wider shrink-0 transition-all flex items-center gap-1.5 ${
                selectedIndex === idx
                  ? 'bg-emerald-500 text-black border-emerald-400 font-extrabold shadow-md'
                  : 'bg-black/30 text-white/60 border-white/10 hover:bg-black/50'
              }`}
            >
              <span>{p.fieldName.split(' ')[0]}</span>
              <span className="text-[8px] opacity-70">P#{p.pitchNumber}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Touch Body */}
      <div className="p-4 flex-1 space-y-4">
        {/* Readiness Gauge */}
        <div className="p-4 rounded-2xl border space-y-2" style={{ background: D.surf2, borderColor: D.border }}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-60 flex items-center gap-1.5" style={{ color: D.textMuted }}>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> SURFACE READINESS
            </span>
            <span className="text-sm font-black text-emerald-400" style={{ fontFamily: D.mono }}>
              {readinessPct}%
            </span>
          </div>

          <div className="w-full bg-black/40 h-2.5 rounded-full overflow-hidden border p-0.5" style={{ borderColor: D.border }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${readinessPct}%` }}
              className="h-full rounded-full bg-gradient-to-r from-amber-500 to-emerald-400"
            />
          </div>
        </div>

        {/* Live Telemetry Steppers */}
        <div className="grid grid-cols-3 gap-2">
          {/* Clegg Impact Value (CIV) */}
          <div className="p-3 rounded-xl border text-center space-y-1" style={{ background: D.surf2, borderColor: D.border }}>
            <span className="text-[8px] font-black uppercase tracking-widest block opacity-50" style={{ color: D.textMuted }}>
              CLEGG (CIV)
            </span>
            <div className="text-lg font-black" style={{ fontFamily: D.mono, color: D.textPrimary }}>
              {activePitch.cleggImpactValue}
            </div>
            <div className="flex justify-center gap-1">
              <button 
                onClick={() => updateTelemetry('cleggImpactValue', Math.max(50, activePitch.cleggImpactValue - 2))}
                className="w-6 h-6 rounded-md bg-black/40 border border-white/10 font-bold text-xs active:scale-95"
              >-</button>
              <button 
                onClick={() => updateTelemetry('cleggImpactValue', Math.min(120, activePitch.cleggImpactValue + 2))}
                className="w-6 h-6 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold text-xs active:scale-95"
              >+</button>
            </div>
          </div>

          {/* Moisture % */}
          <div className="p-3 rounded-xl border text-center space-y-1" style={{ background: D.surf2, borderColor: D.border }}>
            <span className="text-[8px] font-black uppercase tracking-widest block opacity-50" style={{ color: D.textMuted }}>
              MOISTURE %
            </span>
            <div className="text-lg font-black text-blue-400" style={{ fontFamily: D.mono }}>
              {activePitch.moisturePct}%
            </div>
            <div className="flex justify-center gap-1">
              <button 
                onClick={() => updateTelemetry('moisturePct', Math.max(2, activePitch.moisturePct - 1))}
                className="w-6 h-6 rounded-md bg-black/40 border border-white/10 font-bold text-xs active:scale-95"
              >-</button>
              <button 
                onClick={() => updateTelemetry('moisturePct', Math.min(40, activePitch.moisturePct + 1))}
                className="w-6 h-6 rounded-md bg-blue-500/20 text-blue-400 border border-blue-500/30 font-bold text-xs active:scale-95"
              >+</button>
            </div>
          </div>

          {/* Grass Cut mm */}
          <div className="p-3 rounded-xl border text-center space-y-1" style={{ background: D.surf2, borderColor: D.border }}>
            <span className="text-[8px] font-black uppercase tracking-widest block opacity-50" style={{ color: D.textMuted }}>
              GRASS CUT
            </span>
            <div className="text-lg font-black text-amber-400" style={{ fontFamily: D.mono }}>
              {activePitch.grassHeightMm} mm
            </div>
            <div className="flex justify-center gap-1">
              <button 
                onClick={() => updateTelemetry('grassHeightMm', Math.max(5, activePitch.grassHeightMm - 1))}
                className="w-6 h-6 rounded-md bg-black/40 border border-white/10 font-bold text-xs active:scale-95"
              >-</button>
              <button 
                onClick={() => updateTelemetry('grassHeightMm', Math.min(25, activePitch.grassHeightMm + 1))}
                className="w-6 h-6 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold text-xs active:scale-95"
              >+</button>
            </div>
          </div>
        </div>

        {/* Touch Checklist */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60" style={{ color: D.textMuted }}>
              PRE-MATCH PREP TOUCH CHECKLIST
            </span>
            <span className="text-[9px] font-bold text-emerald-400">
              {completedTasksCount}/{tasks.length} DONE
            </span>
          </div>

          {tasks.map((task) => (
            <button
              key={task.id}
              onClick={() => toggleTask(task.id)}
              className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between active:scale-[0.98] ${
                task.done ? 'border-emerald-500/40 bg-emerald-500/10' : 'border-white/10 bg-black/30'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black shrink-0 border ${
                  task.done ? 'bg-emerald-500 text-black border-emerald-400' : 'bg-black/40 text-white/30 border-white/10'
                }`}>
                  {task.done ? <Check className="w-5 h-5 stroke-[3]" /> : <Clock className="w-4 h-4" />}
                </div>
                <div className="min-w-0">
                  <span className={`text-xs font-bold block truncate ${task.done ? 'text-white' : 'text-white/70'}`}>
                    {task.label}
                  </span>
                  <span className="text-[9px] font-bold opacity-40 uppercase block" style={{ color: D.textMuted }}>
                    CATEGORY: {task.category}
                  </span>
                </div>
              </div>

              <Badge variant="outline" className={`text-[8px] font-black uppercase px-2 py-0.5 ${
                task.done ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-black/40 text-white/40 border-white/10'
              }`}>
                {task.done ? 'PASSED' : 'PENDING'}
              </Badge>
            </button>
          ))}
        </div>

        {/* Heavy Roller Touch Logger */}
        <div className="p-4 rounded-2xl border space-y-3" style={{ background: D.surf2, borderColor: D.border }}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-60 flex items-center gap-1.5" style={{ color: D.textMuted }}>
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" /> HEAVY ROLLER SESSION
            </span>
            <Badge variant="outline" className="text-[8px] font-mono text-amber-400 border-amber-400/30">
              2-TON HYDRAULIC
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1">
              <span className="text-[9px] font-bold opacity-50 block uppercase mb-1" style={{ color: D.textMuted }}>HOURS ROLLED</span>
              <Input
                type="number"
                step="0.5"
                value={rollerHours}
                onChange={(e) => setRollerHours(e.target.value)}
                className="h-10 bg-black/50 border-white/10 text-white font-mono text-sm rounded-xl"
              />
            </div>
            <Button
              onClick={() => toast.success(`Logged ${rollerHours} hours of heavy rolling for ${activePitch.fieldName}!`)}
              className="h-10 bg-amber-500 hover:bg-amber-600 text-black font-black uppercase text-xs rounded-xl mt-5 px-4"
            >
              LOG SESSION
            </Button>
          </div>
        </div>

        {/* Big Touch Action Clearance Button */}
        <Button
          onClick={handleIssueClearance}
          disabled={isSubmitting || clearanceLogged}
          className={`w-full h-16 rounded-2xl font-black uppercase text-xs tracking-wider flex items-center justify-center gap-2 shadow-xl transition-all active:scale-95 ${
            clearanceLogged 
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
              : 'bg-emerald-500 hover:bg-emerald-600 text-black shadow-emerald-500/20'
          }`}
        >
          <ShieldCheck className="w-6 h-6" />
          {clearanceLogged ? 'OFFICIAL CLEARANCE LOGGED' : isSubmitting ? 'VERIFYING...' : `ISSUE CLEARANCE (${readinessPct}%)`}
        </Button>
      </div>
    </div>
  );
}
