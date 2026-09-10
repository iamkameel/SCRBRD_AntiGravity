"use client";

import React, { useState } from 'react';
import { D } from '@/lib/design-system';
import { 
  BrainCircuit, 
  Target, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Sparkles, 
  Dumbbell, 
  ChevronRight, 
  UserCheck, 
  Plus, 
  Calendar,
  FileCheck,
  TrendingUp,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RoleArchetype, SkillDomain } from '@/types/schema_v4';

export interface MicroPlanDrill {
  id: string;
  name: string;
  category: SkillDomain;
  intensity: 'Low' | 'Medium' | 'High';
  durationMins: number;
  linkedAttribute: string;
  coachNotes?: string;
  completed?: boolean;
  effectivenessScore?: number; // 1-5
}

export interface PlayerMicroPlan {
  id: string;
  playerId: string;
  playerName: string;
  role: RoleArchetype;
  developmentTrend: 'Improving Strongly' | 'Improving Steadily' | 'Stable' | 'Slight Regression' | 'Needs Intervention';
  targetCompletionDate: string;
  focusArea: string;
  drills: MicroPlanDrill[];
  status: 'Draft' | 'Active' | 'Completed';
}

interface PlayerMicroPlanGeneratorProps {
  playerId?: string;
  playerName?: string;
  role?: RoleArchetype;
  onPlanCreated?: (plan: PlayerMicroPlan) => void;
}

const SAMPLE_PLAYERS = [
  { id: 'p1', name: 'Liam Thompson', role: 'Opener' as RoleArchetype, trend: 'Improving Steadily' as const },
  { id: 'p2', name: 'Marco Jansen', role: 'Strike Pace Bowler' as RoleArchetype, trend: 'Stable' as const },
  { id: 'p3', name: 'David Thorne', role: 'Finisher' as RoleArchetype, trend: 'Improving Strongly' as const },
  { id: 'p4', name: 'Siya Khumalo', role: 'Finger Spinner' as RoleArchetype, trend: 'Needs Intervention' as const },
];

const TAXONOMY_DRILLS: MicroPlanDrill[] = [
  { id: 'd1', name: 'Drop & Run Strike Rotation', category: 'Batting', intensity: 'Medium', durationMins: 15, linkedAttribute: 'Strike Rotation' },
  { id: 'd2', name: 'Yorker Target Grid Protocol', category: 'Bowling', intensity: 'High', durationMins: 20, linkedAttribute: 'Death Over Execution' },
  { id: 'd3', name: 'Slip Catching Reaction Box', category: 'Fielding', intensity: 'High', durationMins: 15, linkedAttribute: 'High & Slip Catching' },
  { id: 'd4', name: 'Leg-Side Deflection Takes', category: 'Wicketkeeping', intensity: 'Medium', durationMins: 20, linkedAttribute: 'Glovework & Takes' },
  { id: 'd5', name: 'Between-Wickets Acceleration Sets', category: 'Physical', intensity: 'High', durationMins: 15, linkedAttribute: 'Speed & Acceleration' },
  { id: 'd6', name: '12-Ball Spin Rotation Scenario', category: 'Batting', intensity: 'Medium', durationMins: 20, linkedAttribute: 'Playing Spin' },
  { id: 'd7', name: 'Pressure Pre-Ball Reset Routine', category: 'Mental', intensity: 'Low', durationMins: 10, linkedAttribute: 'Composure Under Pressure' },
];

export function PlayerMicroPlanGenerator({
  playerId: initialId = 'p1',
  playerName: initialName = 'Liam Thompson',
  role: initialRole = 'Opener',
  onPlanCreated,
}: PlayerMicroPlanGeneratorProps) {
  const [selectedPlayerId, setSelectedPlayerId] = useState(initialId);
  const currentPlayer = SAMPLE_PLAYERS.find(p => p.id === selectedPlayerId) || {
    id: initialId,
    name: initialName,
    role: initialRole,
    trend: 'Improving Steadily' as const
  };

  const [activeStage, setActiveStage] = useState<1 | 2 | 3>(1);
  const [focusArea, setFocusArea] = useState('Strike Rotation & Spin Footwork');
  const [targetDate, setTargetDate] = useState('2026-09-24');
  const [selectedDrills, setSelectedDrills] = useState<MicroPlanDrill[]>([TAXONOMY_DRILLS[0], TAXONOMY_DRILLS[5]]);
  const [planStatus, setPlanStatus] = useState<'Draft' | 'Active' | 'Completed'>('Draft');
  const [executionLogs, setExecutionLogs] = useState<Record<string, { completed: boolean; score: number }>>({});
  const [trendStatus, setTrendStatus] = useState(currentPlayer.trend);

  const toggleDrill = (drill: MicroPlanDrill) => {
    setSelectedDrills(prev => 
      prev.some(d => d.id === drill.id) 
        ? prev.filter(d => d.id !== drill.id) 
        : [...prev, drill]
    );
  };

  const totalDuration = selectedDrills.reduce((sum, d) => sum + d.durationMins, 0);

  const handleActivatePlan = () => {
    setPlanStatus('Active');
    setActiveStage(3);
    if (onPlanCreated) {
      onPlanCreated({
        id: `plan-${Date.now()}`,
        playerId: currentPlayer.id,
        playerName: currentPlayer.name,
        role: currentPlayer.role,
        developmentTrend: trendStatus,
        targetCompletionDate: targetDate,
        focusArea,
        drills: selectedDrills,
        status: 'Active'
      });
    }
  };

  const updateExecutionLog = (drillId: string, completed: boolean, score: number) => {
    setExecutionLogs(prev => ({
      ...prev,
      [drillId]: { completed, score }
    }));
  };

  return (
    <div className="rounded-2xl border p-8 space-y-8" style={{ background: D.surf1, borderColor: D.border }}>
      {/* Step Header Indicator */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b" style={{ borderColor: D.border }}>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.3em] flex items-center gap-2 mb-2" style={{ color: D.indigo }}>
            <BrainCircuit className="w-4 h-4" /> COACH DEVELOPMENT ENGINE
          </div>
          <h2 className="text-3xl font-black uppercase tracking-tight italic" style={{ fontFamily: D.head, color: D.textPrimary }}>
            PLAYER <span style={{ color: D.indigo }}>MICRO-PLAN GENERATOR</span>
          </h2>
          <p className="text-[11px] font-semibold tracking-wider mt-1 text-zinc-400">
            Rule-weighted diagnostic protocols & feedback execution loop for individual school athletes.
          </p>
        </div>

        {/* Player Selector */}
        <div className="flex items-center gap-3 bg-black/20 p-2 rounded-xl border" style={{ borderColor: D.border }}>
          <UserCheck className="w-4 h-4 text-sky-400 ml-2" />
          <select 
            value={selectedPlayerId}
            onChange={(e) => setSelectedPlayerId(e.target.value)}
            className="bg-transparent text-xs font-bold text-white focus:outline-none uppercase tracking-wider pr-4 cursor-pointer"
          >
            {SAMPLE_PLAYERS.map(p => (
              <option key={p.id} value={p.id} className="bg-zinc-900 text-white">
                {p.name} ({p.role})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stage Navigation Stepper */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { num: 1, title: '1. Diagnosis & Need Score', sub: 'Assess Gaps & Role Weights' },
          { num: 2, title: '2. Plan Construction', sub: 'Assign Drills & Milestones' },
          { num: 3, title: '3. Execution & Feedback Loop', sub: 'Log Progress & Update Trend' },
        ].map(stage => {
          const isActive = activeStage === stage.num;
          return (
            <button
              key={stage.num}
              onClick={() => setActiveStage(stage.num as any)}
              className={`p-4 rounded-xl border text-left transition-all ${
                isActive 
                  ? 'bg-sky-500/10 border-sky-500/40 text-white shadow-lg' 
                  : 'bg-white/[0.02] border-white/5 text-zinc-500 hover:border-white/10'
              }`}
            >
              <div className="text-[10px] font-black uppercase tracking-widest" style={{ color: isActive ? D.sky : D.textMuted }}>
                STAGE 0{stage.num}
              </div>
              <div className="text-sm font-bold mt-1" style={{ fontFamily: D.head, color: isActive ? D.textPrimary : D.textMuted }}>
                {stage.title}
              </div>
              <div className="text-[10px] font-medium text-zinc-400 mt-0.5">{stage.sub}</div>
            </button>
          );
        })}
      </div>

      {/* Stage Content */}
      <AnimatePresence mode="wait">
        {activeStage === 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Player Profile & Role Weights */}
              <div className="p-6 rounded-xl border bg-black/20 space-y-4" style={{ borderColor: D.border }}>
                <div className="text-[10px] font-bold uppercase tracking-widest text-sky-400 flex items-center gap-2">
                  <Target className="w-4 h-4" /> Role Profile: {currentPlayer.role}
                </div>
                <div className="text-2xl font-black" style={{ fontFamily: D.head }}>{currentPlayer.name}</div>
                
                <div className="space-y-2 pt-2 border-t border-white/5">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">Batting Weight</span>
                    <span className="font-mono font-bold text-sky-400">40%</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">Mental Composure</span>
                    <span className="font-mono font-bold text-sky-400">20%</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">Tactical Awareness</span>
                    <span className="font-mono font-bold text-sky-400">20%</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">Physical Fitness</span>
                    <span className="font-mono font-bold text-sky-400">20%</span>
                  </div>
                </div>
              </div>

              {/* Identified Weaknesses */}
              <div className="p-6 rounded-xl border bg-black/20 space-y-4" style={{ borderColor: D.border }}>
                <div className="text-[10px] font-bold uppercase tracking-widest text-amber-400 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Identified Need Scores
                </div>
                
                <div className="space-y-3">
                  <div className="p-3 rounded-lg border border-amber-500/20 bg-amber-500/5 space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-white">Strike Rotation (Spin)</span>
                      <span className="text-amber-400 font-mono">Need: 8.4/10</span>
                    </div>
                    <p className="text-[10px] text-zinc-400">High dot-ball % in middle overs against left-arm orthodox.</p>
                  </div>

                  <div className="p-3 rounded-lg border border-sky-500/20 bg-sky-500/5 space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-white">Pre-Ball Reset Routine</span>
                      <span className="text-sky-400 font-mono">Need: 6.2/10</span>
                    </div>
                    <p className="text-[10px] text-zinc-400">Rushed decisions following dots in tight chases.</p>
                  </div>
                </div>
              </div>

              {/* Readiness & Medical Restrictions */}
              <div className="p-6 rounded-xl border bg-black/20 space-y-4" style={{ borderColor: D.border }}>
                <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> Readiness State
                </div>
                
                <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400">STATUS: FIT / FULL LOAD</span>
                    <Badge className="bg-emerald-500/20 text-emerald-300 text-[9px] font-black border-0">100%</Badge>
                  </div>
                  <p className="text-[10px] text-zinc-400">No medical restrictions logged. Workload tolerance optimal.</p>
                </div>

                <Button 
                  onClick={() => setActiveStage(2)}
                  className="w-full mt-4 h-12 bg-sky-500 hover:bg-sky-400 text-black font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg"
                >
                  Proceed to Plan Construction <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {activeStage === 2 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form Controls */}
              <div className="p-6 rounded-xl border bg-black/20 space-y-4" style={{ borderColor: D.border }}>
                <div className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-2">
                  <FileCheck className="w-4 h-4" /> Plan Configuration
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Focus Objective</label>
                  <input 
                    type="text"
                    value={focusArea}
                    onChange={(e) => setFocusArea(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Target Completion Date</label>
                  <input 
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="pt-4 border-t border-zinc-800 space-y-2">
                  <div className="flex justify-between text-xs text-zinc-400">
                    <span>Assigned Drills</span>
                    <span className="font-mono text-white font-bold">{selectedDrills.length} Drills</span>
                  </div>
                  <div className="flex justify-between text-xs text-zinc-400">
                    <span>Total Session Time</span>
                    <span className="font-mono text-sky-400 font-bold">{totalDuration} Mins</span>
                  </div>
                </div>

                <Button
                  onClick={handleActivatePlan}
                  className="w-full h-12 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg mt-4"
                >
                  <CheckCircle className="w-4 h-4 mr-2" /> Confirm & Activate Micro-Plan
                </Button>
              </div>

              {/* Taxonomy Drill Selector */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex justify-between items-center">
                  <div className="text-xs font-bold uppercase tracking-wider text-white">Recommended Drill Taxonomy</div>
                  <span className="text-[10px] text-zinc-500 uppercase font-mono">{TAXONOMY_DRILLS.length} Drills Available</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {TAXONOMY_DRILLS.map(drill => {
                    const isSelected = selectedDrills.some(d => d.id === drill.id);
                    return (
                      <div 
                        key={drill.id}
                        onClick={() => toggleDrill(drill)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all space-y-2 ${
                          isSelected 
                            ? 'bg-sky-500/10 border-sky-500 text-white shadow-md' 
                            : 'bg-white/[0.02] border-white/5 text-zinc-400 hover:border-white/10'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <Badge className="bg-sky-500/20 text-sky-300 text-[9px] font-black uppercase tracking-wider border-0">
                              {drill.category}
                            </Badge>
                            <div className="text-sm font-bold text-white mt-1" style={{ fontFamily: D.head }}>{drill.name}</div>
                          </div>
                          <CheckCircle className={`w-5 h-5 ${isSelected ? 'text-sky-400' : 'text-zinc-700'}`} />
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-2 border-t border-white/5">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {drill.durationMins} mins</span>
                          <span className="font-mono text-zinc-400">{drill.linkedAttribute}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeStage === 3 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5" />
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider">MICRO-PLAN ACTIVE FOR {currentPlayer.name.toUpperCase()}</div>
                  <div className="text-[10px] opacity-80">Target Completion: {targetDate} • Focus: {focusArea}</div>
                </div>
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-widest border-0">
                ACTIVE IN SQUAD
              </Badge>
            </div>

            {/* Drill Execution Tracker */}
            <div className="space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-white">Assigned Drill Execution & Feedback Loop</div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedDrills.map(drill => {
                  const log = executionLogs[drill.id] || { completed: false, score: 3 };
                  return (
                    <div key={drill.id} className="p-5 rounded-xl border bg-black/20 space-y-3" style={{ borderColor: D.border }}>
                      <div className="flex justify-between items-start">
                        <div>
                          <Badge className="bg-sky-500/20 text-sky-300 text-[9px] font-black border-0">{drill.category}</Badge>
                          <div className="text-sm font-bold text-white mt-1">{drill.name}</div>
                        </div>
                        <button
                          onClick={() => updateExecutionLog(drill.id, !log.completed, log.score)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all ${
                            log.completed ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                          }`}
                        >
                          {log.completed ? 'COMPLETED' : 'PENDING'}
                        </button>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-zinc-400">Effectiveness Rating (1–5)</label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map(score => (
                            <button
                              key={score}
                              onClick={() => updateExecutionLog(drill.id, log.completed, score)}
                              className={`flex-1 py-1 rounded text-xs font-mono font-bold border transition-all ${
                                log.score === score 
                                  ? 'bg-sky-500 text-black border-sky-400' 
                                  : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                              }`}
                            >
                              {score}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Development Trend Review */}
            <div className="p-6 rounded-xl border bg-black/20 space-y-4" style={{ borderColor: D.border }}>
              <div className="flex justify-between items-center">
                <div className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" /> Development Trend Status Update
                </div>
                <span className="text-[10px] text-zinc-400 font-mono">Current: {trendStatus}</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                  'Improving Strongly',
                  'Improving Steadily',
                  'Stable',
                  'Slight Regression',
                  'Needs Intervention'
                ].map((status: any) => (
                  <button
                    key={status}
                    onClick={() => setTrendStatus(status)}
                    className={`p-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all ${
                      trendStatus === status 
                        ? 'bg-sky-500/20 text-sky-300 border-sky-500/40' 
                        : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
