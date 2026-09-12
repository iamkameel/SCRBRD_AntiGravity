'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Dumbbell, 
  Target, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Users, 
  ArrowRight, 
  BrainCircuit, 
  Sparkles, 
  Layers, 
  ShieldCheck, 
  AlertTriangle, 
  Check, 
  Send,
  FileCheck,
  Zap,
  Activity
} from 'lucide-react';
import { PlayerMicroPlanGenerator } from '@/components/coaches/PlayerMicroPlanGenerator';
import { AICoachAssistantWidget } from '@/components/coach/AICoachAssistantWidget';
import { D } from '@/lib/design-system';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MASTER_DRILL_CATALOG } from '@/services/drillService';
import { trainingService, TrainingSessionPlan, SessionPlayerLog } from '@/services/trainingService';

export default function TrainingPlannerPage() {
  const [activeTab, setActiveTab] = useState<'micro_plans' | 'squad_planner' | 'ai_assistant'>('squad_planner');
  const [sessions, setSessions] = useState<TrainingSessionPlan[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  // New session state
  const [sessionTitle, setSessionTitle] = useState('');
  const [teamName, setTeamName] = useState('1st XI Squad');
  const [sessionDate, setSessionDate] = useState('2026-09-16');
  const [venueName, setVenueName] = useState('Main Oval Nets & Outfield');
  const [coachNotes, setCoachNotes] = useState('');
  const [selectedDrillIds, setSelectedDrillIds] = useState<string[]>(['drill-bat-01', 'drill-bowl-01']);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Execution Log Modal State
  const [activeLogSession, setActiveLogSession] = useState<TrainingSessionPlan | null>(null);
  const [playerLogs, setPlayerLogs] = useState<SessionPlayerLog[]>([]);

  useEffect(() => {
    const unsubscribe = trainingService.subscribeTrainingPlans((fetchedSessions) => {
      setSessions(fetchedSessions);
      if (fetchedSessions.length > 0 && !selectedSessionId) {
        setSelectedSessionId(fetchedSessions[0].sessionId);
      }
    });
    return () => unsubscribe();
  }, []);

  const toggleDrill = (id: string) => {
    setSelectedDrillIds((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  const selectedDrills = MASTER_DRILL_CATALOG.filter((d) => selectedDrillIds.includes(d.id));
  const totalDuration = selectedDrills.reduce((sum, d) => sum + d.durationMinutes, 0);

  const handleSaveSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionTitle.trim()) return;

    setIsSaving(true);
    const newSession: TrainingSessionPlan = {
      sessionId: `ts-${Date.now()}`,
      teamId: teamName.toLowerCase().replace(/\s+/g, '-'),
      teamName,
      seasonId: '2026-season',
      title: sessionTitle,
      objective: coachNotes || 'Targeted technical development and team scenario rehearsal.',
      scheduledAt: `${sessionDate}T15:30:00Z`,
      venueName,
      totalDurationMins: totalDuration,
      status: 'PLANNED',
      createdBy: 'Head Coach David Smith',
      assignments: selectedDrills.map((d, i) => ({
        assignmentId: `sa-${Date.now()}-${i}`,
        drillId: d.id,
        drillName: d.name,
        category: d.category,
        durationMins: d.durationMinutes,
        assignedBy: 'Head Coach David Smith',
        status: 'PENDING',
        targetPlayerName: 'Squad Unit'
      })),
      logs: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await trainingService.saveTrainingPlan(newSession);
    setIsSaving(false);
    setSavedSuccess(true);
    setSessionTitle('');
    setCoachNotes('');
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const openLogModal = (session: TrainingSessionPlan) => {
    setActiveLogSession(session);
    setPlayerLogs(
      session.logs && session.logs.length > 0
        ? session.logs
        : [
            { playerId: 'p-01', playerName: 'Liam Thorne', completed: true, coachObservation: 'Solid balance and top-hand grip consistency.', playerResponse: 'Excellent', effectivenessScore: 5 },
            { playerId: 'p-02', playerName: 'Kagiso Mokoena', completed: true, coachObservation: 'Good line repeatability on yorker mat.', playerResponse: 'Satisfactory', effectivenessScore: 4 },
            { playerId: 'p-03', playerName: 'Siya Khumalo', completed: false, coachObservation: 'Restricted workload due to finger sprain.', playerResponse: 'Fatigued / Modified', effectivenessScore: 3 }
          ]
    );
  };

  const handleSaveExecutionLogs = async () => {
    if (!activeLogSession) return;
    await trainingService.logPlayerExecution(activeLogSession.sessionId, playerLogs);
    setActiveLogSession(null);
  };

  return (
    <div className="space-y-10 pb-24 max-w-7xl mx-auto">
      {/* Strategic Header */}
      <div 
        className="relative p-10 rounded-[3rem] border overflow-hidden shadow-2xl"
        style={{ background: D.surf1, borderColor: D.border }}
      >
        <div className="absolute inset-0 opacity-10" style={{ background: D.gradMain }} />
        <div className="flex flex-col lg:flex-row items-center gap-10 relative z-10">
          <div 
            className="h-24 w-24 rounded-3xl flex items-center justify-center shadow-inner" 
            style={{ background: D.surf2, border: `1px solid ${D.border}` }}
          >
            <Dumbbell className="h-12 w-12" style={{ color: D.amber }} />
          </div>
          <div className="text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-3 mb-2">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] italic" style={{ color: D.amber }}>
                STAGE 04 — DRILL TAXONOMY & INTERVENTION ENGINE
              </span>
              <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] font-mono">
                RULE SAFETY FILTER v1.4
              </Badge>
            </div>
            <h1 
              className="text-3xl md:text-4xl font-black tracking-tighter uppercase italic leading-none" 
              style={{ fontFamily: D.head, color: D.textPrimary }}
            >
              COACH DEVELOPMENT <span style={{ color: D.amber }}>HUB</span>
            </h1>
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] mt-3 opacity-60 italic" style={{ color: D.textMuted }}>
              SQUAD SESSION PLANNER • PLAYER MICRO-PLANS • AI DIAGNOSTICS & SAFETY LOGS
            </p>
          </div>

          <div className="lg:ml-auto flex items-center gap-3">
            <div className="px-6 py-3.5 rounded-2xl border text-right" style={{ background: D.surf2, borderColor: D.border }}>
              <span className="block text-[9px] font-black uppercase tracking-widest opacity-40">ACTIVE SQUAD PLANS</span>
              <span className="text-xl font-black italic" style={{ fontFamily: D.head, color: D.amber }}>
                {sessions.length} SESSIONS
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mode Selector Tabs */}
      <div className="flex flex-wrap items-center gap-4 p-2 rounded-2xl border" style={{ background: D.surf1, borderColor: D.border }}>
        <button
          onClick={() => setActiveTab('squad_planner')}
          className={`flex items-center gap-3 px-6 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
            activeTab === 'squad_planner'
              ? 'text-white shadow-xl'
              : 'opacity-40 hover:opacity-100'
          }`}
          style={{ background: activeTab === 'squad_planner' ? D.amber : 'transparent', color: activeTab === 'squad_planner' ? 'black' : D.textPrimary }}
        >
          <Dumbbell className="w-4 h-4" /> Squad Training Session Planner
        </button>

        <button
          onClick={() => setActiveTab('micro_plans')}
          className={`flex items-center gap-3 px-6 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
            activeTab === 'micro_plans'
              ? 'text-white shadow-xl'
              : 'opacity-40 hover:opacity-100'
          }`}
          style={{ background: activeTab === 'micro_plans' ? D.indigo : 'transparent', color: activeTab === 'micro_plans' ? 'white' : D.textPrimary }}
        >
          <BrainCircuit className="w-4 h-4" /> Player Micro-Plan Generator
        </button>

        <button
          onClick={() => setActiveTab('ai_assistant')}
          className={`flex items-center gap-3 px-6 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
            activeTab === 'ai_assistant'
              ? 'text-white shadow-xl'
              : 'opacity-40 hover:opacity-100'
          }`}
          style={{ background: activeTab === 'ai_assistant' ? D.sky : 'transparent', color: activeTab === 'ai_assistant' ? 'black' : D.textPrimary }}
        >
          <Sparkles className="w-4 h-4" /> AI Coach Assistant & Medical Safety
        </button>
      </div>

      {/* Main Tab Views */}
      {activeTab === 'micro_plans' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <PlayerMicroPlanGenerator />
        </motion.div>
      )}

      {activeTab === 'ai_assistant' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <AICoachAssistantWidget />
        </motion.div>
      )}

      {activeTab === 'squad_planner' && (
        <div className="space-y-10">
          {savedSuccess && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="p-5 rounded-2xl border flex items-center justify-between"
              style={{ background: `${D.emerald}15`, borderColor: `${D.emerald}40`, color: D.emerald }}
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-xs font-black uppercase tracking-wider">
                  Training plan published and synced to real-time squad log!
                </span>
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-300 text-[10px] font-black border-0">FIRESTORE SYNCED</Badge>
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column — Session Construction Form */}
            <div className="lg:col-span-1 rounded-[2.5rem] border p-8 space-y-6 shadow-2xl" style={{ background: D.surf1, borderColor: D.border }}>
              <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: D.border }}>
                <h2 className="text-xl font-black uppercase italic tracking-tight" style={{ fontFamily: D.head, color: D.textPrimary }}>
                  NEW <span style={{ color: D.amber }}>SESSION PLAN</span>
                </h2>
                <Badge className="text-[9px] font-black uppercase tracking-widest" style={{ background: `${D.amber}20`, color: D.amber }}>
                  {totalDuration} MINS
                </Badge>
              </div>

              <form onSubmit={handleSaveSession} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest opacity-40 mb-2" style={{ color: D.textMuted }}>
                    SESSION TITLE *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Death Yorker & Spin Rotation Block"
                    value={sessionTitle}
                    onChange={(e) => setSessionTitle(e.target.value)}
                    className="w-full h-14 px-5 rounded-2xl text-xs font-bold uppercase tracking-wider bg-black/10 border outline-none transition-all focus:border-amber-500"
                    style={{ borderColor: D.border, color: D.textPrimary }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest opacity-40 mb-2" style={{ color: D.textMuted }}>
                      TARGET SQUAD
                    </label>
                    <select
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      className="w-full h-14 px-4 rounded-2xl text-xs font-bold uppercase tracking-wider bg-black/10 border outline-none focus:border-amber-500"
                      style={{ borderColor: D.border, color: D.textPrimary }}
                    >
                      <option value="1st XI Squad" className="bg-zinc-900">1st XI Squad</option>
                      <option value="2nd XI Squad" className="bg-zinc-900">2nd XI Squad</option>
                      <option value="Under 15A Squad" className="bg-zinc-900">Under 15A Squad</option>
                      <option value="Batting Unit" className="bg-zinc-900">Batting Unit Only</option>
                      <option value="Bowling Unit" className="bg-zinc-900">Bowling Unit Only</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest opacity-40 mb-2" style={{ color: D.textMuted }}>
                      SCHEDULED DATE
                    </label>
                    <input
                      type="date"
                      value={sessionDate}
                      onChange={(e) => setSessionDate(e.target.value)}
                      className="w-full h-14 px-4 rounded-2xl text-xs font-bold uppercase tracking-wider bg-black/10 border outline-none focus:border-amber-500"
                      style={{ borderColor: D.border, color: D.textPrimary }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest opacity-40 mb-2" style={{ color: D.textMuted }}>
                    FACILITY / VENUE
                  </label>
                  <input
                    type="text"
                    value={venueName}
                    onChange={(e) => setVenueName(e.target.value)}
                    className="w-full h-14 px-5 rounded-2xl text-xs font-bold uppercase tracking-wider bg-black/10 border outline-none focus:border-amber-500"
                    style={{ borderColor: D.border, color: D.textPrimary }}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest opacity-40 mb-2" style={{ color: D.textMuted }}>
                    COACH OBJECTIVES & SCENARIO GOALS
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Focus on soft wrist control, top-hand release, and Yorker precision under press..."
                    value={coachNotes}
                    onChange={(e) => setCoachNotes(e.target.value)}
                    className="w-full p-4 rounded-2xl text-xs font-bold uppercase tracking-wider bg-black/10 border outline-none focus:border-amber-500"
                    style={{ borderColor: D.border, color: D.textPrimary }}
                  />
                </div>

                <div className="pt-4 border-t space-y-2" style={{ borderColor: D.border }}>
                  <div className="flex justify-between text-xs font-bold opacity-60">
                    <span>SELECTED DRILLS:</span>
                    <span className="font-mono text-white">{selectedDrillIds.length} UNITS</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold opacity-60">
                    <span>ESTIMATED DURATION:</span>
                    <span className="font-mono text-amber-400">{totalDuration} MINS</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSaving || !sessionTitle.trim()}
                  className="w-full h-14 rounded-2xl text-xs font-black uppercase tracking-widest shadow-2xl transition-all hover:translate-y-[-2px]"
                  style={{ background: D.amber, color: 'black' }}
                >
                  {isSaving ? "SAVING TO FIRESTORE..." : "CONFIRM & PUBLISH SESSION PLAN"}
                </Button>
              </form>
            </div>

            {/* Right Column — Drill Taxonomy Library Grid */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black uppercase italic tracking-tight" style={{ fontFamily: D.head, color: D.textPrimary }}>
                  DRILL TAXONOMY <span style={{ color: D.indigo }}>LIBRARY</span>
                </h2>
                <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
                  SELECT DRILLS TO INCLUDE IN PLAN ({MASTER_DRILL_CATALOG.length} CATALOGUED)
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {MASTER_DRILL_CATALOG.map((drill) => {
                  const isSelected = selectedDrillIds.includes(drill.id);
                  return (
                    <div
                      key={drill.id}
                      onClick={() => toggleDrill(drill.id)}
                      className="p-6 rounded-[2rem] border cursor-pointer transition-all duration-300 relative overflow-hidden shadow-xl"
                      style={{
                        background: isSelected ? `${D.amber}10` : D.surf1,
                        borderColor: isSelected ? D.amber : D.border
                      }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="space-y-1">
                          <span className="px-3 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest"
                                style={{ background: `${D.indigo}15`, borderColor: `${D.indigo}30`, color: D.indigo }}>
                            {drill.category}
                          </span>
                          <h3 className="text-lg font-black uppercase italic tracking-tight text-white mt-2" style={{ fontFamily: D.head }}>
                            {drill.name}
                          </h3>
                        </div>

                        <div className="h-10 w-10 rounded-xl flex items-center justify-center border"
                             style={{ background: isSelected ? D.amber : D.surf2, borderColor: D.border, color: isSelected ? 'black' : D.textMuted }}>
                          {isSelected ? <CheckCircle2 className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                        </div>
                      </div>

                      <p className="text-xs font-semibold opacity-60 leading-relaxed mb-4 line-clamp-2" style={{ color: D.textMuted }}>
                        {drill.description}
                      </p>

                      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest pt-3 border-t opacity-60" style={{ borderColor: D.border }}>
                        <span className="flex items-center gap-1.5"><Clock size={12} /> {drill.durationMinutes} MINS</span>
                        <span className="font-mono text-amber-400">{drill.level.toUpperCase()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Active Training Plans Feed */}
          <div className="space-y-6 pt-8 border-t" style={{ borderColor: D.border }}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black uppercase italic tracking-tight" style={{ fontFamily: D.head, color: D.textPrimary }}>
                  ACTIVE <span style={{ color: D.amber }}>SQUAD TRAINING PLANS</span>
                </h2>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mt-1">
                  RECENT SESSIONS GENERATED & ASSIGNED ACROSS SCHOOL SQUADS
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {sessions.map((session) => (
                <div 
                  key={session.sessionId}
                  className="p-8 rounded-[2.5rem] border space-y-6 shadow-2xl relative overflow-hidden"
                  style={{ background: D.surf1, borderColor: D.border }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] font-black">
                          {session.teamName}
                        </Badge>
                        <span className="text-[9px] font-black uppercase tracking-widest opacity-40">
                          {new Date(session.scheduledAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="text-2xl font-black uppercase italic tracking-tight text-white" style={{ fontFamily: D.head }}>
                        {session.title}
                      </h3>
                      <p className="text-xs font-semibold opacity-60 mt-1" style={{ color: D.textMuted }}>
                        {session.objective}
                      </p>
                    </div>

                    <Badge className={`text-[9px] font-black uppercase tracking-widest border-0 px-3 py-1 ${
                      session.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-sky-500/20 text-sky-300'
                    }`}>
                      {session.status}
                    </Badge>
                  </div>

                  <div className="space-y-3 pt-4 border-t" style={{ borderColor: D.border }}>
                    <span className="text-[9px] font-black uppercase tracking-widest opacity-40">ASSIGNED DRILL MODULES</span>
                    <div className="space-y-2">
                      {session.assignments.map((assignment, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-xl border bg-black/10" style={{ borderColor: D.border }}>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-mono font-bold text-amber-400">0{i+1}</span>
                            <span className="text-xs font-bold uppercase tracking-wider text-white">{assignment.drillName}</span>
                          </div>
                          <span className="text-[10px] font-mono text-zinc-400">{assignment.durationMins} MINS</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={() => openLogModal(session)}
                    className="w-full h-12 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-lg transition-all"
                    style={{ background: D.surf2, borderColor: D.border, color: D.textPrimary }}
                  >
                    <FileCheck className="h-4 w-4 mr-2" style={{ color: D.amber }} />
                    {session.status === 'COMPLETED' ? 'VIEW PLAYER EXECUTION LOGS' : 'LOG SESSION EXECUTION & FEEDBACK'}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Player Execution Log Modal */}
      <AnimatePresence>
        {activeLogSession && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl p-8 rounded-[2.5rem] border shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
              style={{ background: D.surf1, borderColor: D.indigo }}
            >
              <div className="flex items-start justify-between border-b pb-4" style={{ borderColor: D.border }}>
                <div>
                  <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] font-black mb-2">
                    POST-SESSION EXECUTION LOG
                  </Badge>
                  <h3 className="text-2xl font-black uppercase italic tracking-tight text-white" style={{ fontFamily: D.head }}>
                    {activeLogSession.title}
                  </h3>
                  <p className="text-xs font-semibold opacity-60" style={{ color: D.textMuted }}>
                    {activeLogSession.teamName} • {activeLogSession.venueName}
                  </p>
                </div>
                <button 
                  onClick={() => setActiveLogSession(null)}
                  className="text-xs font-mono font-bold opacity-40 hover:opacity-100 px-3 py-1 rounded-lg border"
                  style={{ borderColor: D.border }}
                >
                  ESC
                </button>
              </div>

              <div className="space-y-4">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-40">INDIVIDUAL PLAYER PERFORMANCE LOGS</span>
                {playerLogs.map((log, idx) => (
                  <div key={log.playerId} className="p-5 rounded-2xl border space-y-3 bg-black/10" style={{ borderColor: D.border }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-black uppercase tracking-wider text-white">{log.playerName}</span>
                        <button
                          onClick={() => {
                            const updated = [...playerLogs];
                            updated[idx].completed = !updated[idx].completed;
                            setPlayerLogs(updated);
                          }}
                          className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border ${
                            log.completed ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          }`}
                        >
                          {log.completed ? 'ATTENDED / COMPLETED' : 'ABSENT / RESTRICTED'}
                        </button>
                      </div>

                      <select
                        value={log.playerResponse}
                        onChange={(e) => {
                          const updated = [...playerLogs];
                          updated[idx].playerResponse = e.target.value as any;
                          setPlayerLogs(updated);
                        }}
                        className="bg-zinc-900 border text-[10px] font-bold uppercase tracking-wider text-white px-3 py-1 rounded-lg"
                        style={{ borderColor: D.border }}
                      >
                        <option value="Excellent">Excellent</option>
                        <option value="Satisfactory">Satisfactory</option>
                        <option value="Fatigued / Modified">Fatigued / Modified</option>
                        <option value="Needs Intervention">Needs Intervention</option>
                      </select>
                    </div>

                    <input
                      type="text"
                      placeholder="Coach observations & technical notes..."
                      value={log.coachObservation}
                      onChange={(e) => {
                        const updated = [...playerLogs];
                        updated[idx].coachObservation = e.target.value;
                        setPlayerLogs(updated);
                      }}
                      className="w-full px-4 py-2 rounded-xl text-xs font-medium bg-black/20 border outline-none text-white focus:border-amber-400"
                      style={{ borderColor: D.border }}
                    />
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t flex justify-end gap-3" style={{ borderColor: D.border }}>
                <Button
                  onClick={() => setActiveLogSession(null)}
                  variant="ghost"
                  className="rounded-xl text-xs font-black uppercase tracking-widest h-12"
                  style={{ color: D.textMuted }}
                >
                  CANCEL
                </Button>
                <Button
                  onClick={handleSaveExecutionLogs}
                  className="rounded-xl text-xs font-black uppercase tracking-widest h-12 px-8 shadow-xl"
                  style={{ background: D.emerald, color: 'black' }}
                >
                  SAVE & CLOSE LOGS
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
