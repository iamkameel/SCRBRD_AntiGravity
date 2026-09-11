"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { D } from '@/lib/design-system';
import { fieldService } from "@/services/fieldService";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sun, 
  Wind, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Hammer, 
  Droplets, 
  Thermometer,
  Layout,
  ChevronRight,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Activity,
  Layers,
  Sliders,
  Compass,
  FileCheck,
  Plus
} from 'lucide-react';

interface PitchTelemetry {
  fieldId: string;
  fieldName: string;
  pitchNumber: number;
  pitchType: string;
  grassHeightMm: number;
  moisturePct: number;
  cleggImpactValue: number; // Surface hardness (CIV)
  crackIndex: 'Stable' | 'Minor Fractures' | 'Active Cracking';
  expectedBehavior: {
    pace: 'Lightning' | 'Bouncy' | 'Medium' | 'Slow';
    bounce: 'Steep' | 'True & Predictable' | 'Variable' | 'Low';
    spin: 'Day 1 Minimal' | 'Moderate Turn' | 'Sharp Turn' | 'Dusty';
  };
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
    expectedBehavior: {
      pace: 'Bouncy',
      bounce: 'True & Predictable',
      spin: 'Day 1 Minimal'
    }
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
    expectedBehavior: {
      pace: 'Medium',
      bounce: 'True & Predictable',
      spin: 'Moderate Turn'
    }
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
    expectedBehavior: {
      pace: 'Lightning',
      bounce: 'Steep',
      spin: 'Day 1 Minimal'
    }
  }
];

const PREP_TASKS = [
  { id: 'mowing', label: 'Outfield & Pitch Mowing (Match Spec: 12mm)', done: true, category: 'Turf' },
  { id: 'rolling', label: 'Heavy 2-Ton Roller Session (Pitch #4)', done: true, category: 'Pitch' },
  { id: 'crease', label: 'Crease Marking & Boundary Painting', done: true, category: 'Paint' },
  { id: 'stumps', label: 'Stump Hole Boring, Gauge & Alignment', done: false, category: 'Pitch' },
  { id: 'covers', label: 'Pre-Match Hover Cover Deployment Test', done: false, category: 'Weather' },
  { id: 'sightscreens', label: 'Sight Screen Canvas Cleaning & Position', done: false, category: 'Equipment' },
  { id: 'rings', label: '30-Yard Circle & Inner Ring Disc Marking', done: false, category: 'Paint' },
  { id: 'lights', label: 'LED Floodlight Lux Calibration & Beam Check', done: true, category: 'Facility' }
];

interface MaintenanceItem {
  id: number;
  task: string;
  priority: 'High' | 'Med' | 'Low';
  status: 'In Progress' | 'Pending' | 'Completed';
  category: string;
}

const INITIAL_MAINTENANCE: MaintenanceItem[] = [
  { id: 1, task: 'Pop-up Irrigation Header Valve Repair', priority: 'High', status: 'In Progress', category: 'Plumbing' },
  { id: 2, task: 'Sight Screen Canvas Tensioner Adjustment', priority: 'Low', status: 'Pending', category: 'Equipment' },
  { id: 3, task: 'Boundary Rope Foam Segment Inspection', priority: 'Med', status: 'Pending', category: 'Safety' },
  { id: 4, task: 'Roller Engine Oil & Hydraulic Fluid Change', priority: 'Med', status: 'In Progress', category: 'Machinery' }
];

export function GroundskeeperDashboard() {
  const [pitches] = useState<PitchTelemetry[]>(DEFAULT_PITCHES);
  const [selectedPitchIndex, setSelectedPitchIndex] = useState<number>(0);
  const [tasks, setTasks] = useState(PREP_TASKS);
  const [maintenance, setMaintenance] = useState<MaintenanceItem[]>(INITIAL_MAINTENANCE);
  const [newTaskText, setNewTaskText] = useState('');
  const [rollerHours, setRollerHours] = useState<string>('1.5');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clearanceLogged, setClearanceLogged] = useState(false);

  const currentPitch = pitches[selectedPitchIndex];
  const completedCount = tasks.filter(t => t.done).length;
  const progressPercent = Math.round((completedCount / tasks.length) * 100);

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const handleAddMaintenance = () => {
    if (!newTaskText.trim()) return;
    const newItem: MaintenanceItem = {
      id: Date.now(),
      task: newTaskText.trim(),
      priority: 'Med',
      status: 'Pending',
      category: 'General'
    };
    setMaintenance(prev => [newItem, ...prev]);
    setNewTaskText('');
  };

  const handleConfirmReadiness = async () => {
    setIsSubmitting(true);
    try {
      await fieldService.logGroundStatus({
        fieldId: currentPitch.fieldId,
        conditionStatus: progressPercent >= 80 ? 'Optimal' : progressPercent >= 50 ? 'Playable' : 'Inspection Required',
        pitchReadiness: progressPercent,
        outfieldReadiness: 95,
        equipmentReadiness: 90,
        loggedBy: 'Lead Groundskeeper',
        notes: `Pitch #${currentPitch.pitchNumber} cleared with ${progressPercent}% readiness. Clegg Hardness: ${currentPitch.cleggImpactValue} CIV, Moisture: ${currentPitch.moisturePct}%. Roller session: ${rollerHours} hrs.`
      });
      setClearanceLogged(true);
    } catch (err) {
      console.error('Failed to log ground status:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 p-6 bg-[#05070a] min-h-screen text-white">
      {/* Top Intel & Pitch Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-emerald-400">Live Field Operations</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mt-1" style={{ fontFamily: D.head }}>
            GROUND OPS <span className="text-emerald-400 font-normal">& PITCH INTEL</span>
          </h1>
          <p className="text-slate-400 text-xs font-mono mt-1">
            School Sports OS • Turf Telemetry • Clegg Hardness Index • Field Clearance
          </p>
        </div>

        {/* Surface Selection Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0">
          {pitches.map((p, idx) => (
            <button
              key={p.fieldId}
              onClick={() => setSelectedPitchIndex(idx)}
              className={`px-4 py-3 rounded-2xl border text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                selectedPitchIndex === idx
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>{p.fieldName}</span>
              <Badge variant="outline" className="text-[10px] bg-black/40 border-white/10">
                P#{p.pitchNumber}
              </Badge>
            </button>
          ))}
        </div>
      </div>

      {/* Surface Telemetry Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Clegg Surface Hardness */}
        <Card className="bg-slate-900/60 border-white/10 rounded-2xl p-5 backdrop-blur-xl space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-400 font-mono">
            <span>Clegg Hardness Index</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-white font-mono tracking-tight">
            {currentPitch.cleggImpactValue} <span className="text-xs font-normal text-slate-400">CIV</span>
          </div>
          <p className="text-[11px] text-emerald-400 font-medium">Optimal Compaction • Firm Bounce</p>
        </Card>

        {/* Moisture Reading */}
        <Card className="bg-slate-900/60 border-white/10 rounded-2xl p-5 backdrop-blur-xl space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-400 font-mono">
            <span>Pitch Moisture Content</span>
            <Droplets className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-black text-white font-mono tracking-tight">
            {currentPitch.moisturePct}% <span className="text-xs font-normal text-slate-400">TDM</span>
          </div>
          <p className="text-[11px] text-blue-400 font-medium">Controlled Drying • Ideal Binding</p>
        </Card>

        {/* Grass Height */}
        <Card className="bg-slate-900/60 border-white/10 rounded-2xl p-5 backdrop-blur-xl space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-400 font-mono">
            <span>Turf Cut Height</span>
            <Sliders className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-white font-mono tracking-tight">
            {currentPitch.grassHeightMm} <span className="text-xs font-normal text-slate-400">mm</span>
          </div>
          <p className="text-[11px] text-amber-400 font-medium">Kikuyu Dense Canopy • Fast Outfield</p>
        </Card>

        {/* Pitch Readiness Progress */}
        <Card className="bg-slate-900/60 border-white/10 rounded-2xl p-5 backdrop-blur-xl space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-400 font-mono">
            <span>Clearance Readiness</span>
            <ShieldCheck className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-black text-purple-400 font-mono tracking-tight">
            {progressPercent}%
          </div>
          <Progress value={progressPercent} className="h-1.5 bg-white/10" indicatorClassName="bg-purple-500" />
        </Card>
      </div>

      {/* Main Grid: Checklist & Telemetry Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Match-Day Preparation Checklist & Heavy Roller Controls */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-slate-900/60 border-white/10 rounded-3xl p-6 backdrop-blur-xl space-y-6">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-emerald-400" />
                  <span>Match-Day Field Readiness Checklist</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Target Surface: {currentPitch.fieldName} (Pitch #{currentPitch.pitchNumber})
                </p>
              </div>
              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-mono text-xs px-3 py-1">
                {completedCount} / {tasks.length} Completed
              </Badge>
            </div>

            {/* Checklist Items */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {tasks.map((task) => (
                <motion.div
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    task.done
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-white'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={task.done}
                      onCheckedChange={() => toggleTask(task.id)}
                      className="w-5 h-5 border-white/20 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-none"
                    />
                    <div>
                      <span className={`text-xs font-semibold ${task.done ? 'text-white' : 'text-slate-300'}`}>
                        {task.label}
                      </span>
                      <span className="block text-[10px] text-slate-500 font-mono mt-0.5">
                        Category: {task.category}
                      </span>
                    </div>
                  </div>
                  {task.done ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <Clock className="w-4 h-4 text-slate-600 flex-shrink-0" />
                  )}
                </motion.div>
              ))}
            </div>

            {/* Heavy Roller & Turf Preparation Session Logger */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-amber-400" />
                  Heavy Roller Session Logging
                </span>
                <Badge variant="outline" className="text-[10px] text-amber-400 border-amber-400/20 font-mono">
                  2-Ton Hydraulic Roller
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Roller Time (Hours)</label>
                  <Input
                    type="number"
                    step="0.5"
                    value={rollerHours}
                    onChange={(e) => setRollerHours(e.target.value)}
                    className="bg-black/60 border-white/10 text-white font-mono text-sm rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Logged Hardness Gain</label>
                  <div className="text-sm font-mono font-bold text-emerald-400 bg-black/60 border border-white/10 p-2.5 rounded-xl">
                    +6.5 CIV Estimated
                  </div>
                </div>
                <div className="sm:pt-5">
                  <Button
                    variant="outline"
                    className="w-full bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20 font-mono text-xs rounded-xl"
                  >
                    Log Roller Session
                  </Button>
                </div>
              </div>
            </div>

            {/* Official Clearance Trigger */}
            <div className="pt-2">
              <Button
                onClick={handleConfirmReadiness}
                disabled={isSubmitting || clearanceLogged}
                className={`w-full h-14 font-bold uppercase tracking-wider text-xs rounded-2xl gap-2 shadow-xl transition-all ${
                  clearanceLogged
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold shadow-emerald-500/20'
                }`}
              >
                <ShieldCheck className="w-5 h-5" />
                {clearanceLogged
                  ? 'Official Pitch Clearance Certificate Logged to Match Engine'
                  : isSubmitting
                  ? 'Verifying Surface Telemetry & Logging...'
                  : `Issue Official Match Clearance (${progressPercent}% Ready)`}
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Column: Surface Behavior Forecast & Maintenance Queue */}
        <div className="space-y-6">
          {/* Surface Behavior Forecast */}
          <Card className="bg-slate-900/60 border-white/10 rounded-3xl p-6 backdrop-blur-xl space-y-4">
            <h3 className="text-sm font-mono text-slate-300 uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-3">
              <Layers className="w-4 h-4 text-purple-400" />
              Surface Behavior Forecast
            </h3>

            <div className="space-y-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex justify-between items-center">
                <span className="text-slate-400">Expected Pace:</span>
                <span className="font-bold text-emerald-400">{currentPitch.expectedBehavior.pace}</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex justify-between items-center">
                <span className="text-slate-400">Expected Bounce:</span>
                <span className="font-bold text-blue-400">{currentPitch.expectedBehavior.bounce}</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex justify-between items-center">
                <span className="text-slate-400">Day 1 Spin:</span>
                <span className="font-bold text-purple-400">{currentPitch.expectedBehavior.spin}</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex justify-between items-center">
                <span className="text-slate-400">Crack Behavior:</span>
                <span className="font-bold text-amber-400">{currentPitch.crackIndex}</span>
              </div>
            </div>
          </Card>

          {/* Maintenance & Work Order Queue */}
          <Card className="bg-slate-900/60 border-white/10 rounded-3xl p-6 backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-mono text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Hammer className="w-4 h-4 text-amber-400" />
                Work Order Queue
              </h3>
              <Badge variant="outline" className="text-[10px] text-slate-400 border-white/10">
                {maintenance.length} Active
              </Badge>
            </div>

            {/* Quick Add Work Order */}
            <div className="flex gap-2">
              <Input
                placeholder="New work order item..."
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddMaintenance()}
                className="bg-black/60 border-white/10 text-xs text-white rounded-xl placeholder:text-slate-600 font-mono"
              />
              <Button
                onClick={handleAddMaintenance}
                size="sm"
                className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl px-3"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Work Order List */}
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {maintenance.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs font-mono"
                >
                  <div>
                    <div className="text-slate-200 font-medium">{item.task}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{item.category} • {item.status}</div>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-[9px] ${
                      item.priority === 'High'
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        : item.priority === 'Med'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                    }`}
                  >
                    {item.priority}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>

          {/* Micro-Climate Weather Sensor */}
          <Card className="bg-slate-900/60 border-white/10 rounded-3xl p-6 backdrop-blur-xl space-y-3">
            <div className="flex justify-between items-center text-xs font-mono text-slate-300 uppercase tracking-wider border-b border-white/10 pb-3">
              <span className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-400" />
                Turf Micro-Climate Sensor
              </span>
              <span className="text-emerald-400">Live</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <div className="text-slate-500 text-[10px]">Ambient Temp</div>
                <div className="text-base font-bold text-white mt-0.5">24.5°C</div>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <div className="text-slate-500 text-[10px]">Wind Velocity</div>
                <div className="text-base font-bold text-white mt-0.5">12 km/h SE</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
