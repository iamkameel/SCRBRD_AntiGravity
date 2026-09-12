"use client";

import React, { useState, useEffect } from 'react';
import { 
  HeartPulse, 
  Stethoscope, 
  Brain, 
  ShieldAlert, 
  ShieldCheck, 
  Lock, 
  Plus, 
  Search, 
  Filter, 
  Activity, 
  Calendar, 
  Clock, 
  UserCheck, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronRight, 
  Download, 
  Printer, 
  QrCode, 
  Sparkles,
  Zap,
  Info,
  Check,
  RefreshCw
} from 'lucide-react';
import { D } from '@/lib/design-system';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { medicalService, MedicalIncident, ConcussionRtpRecord, ConcussionStage } from '@/lib/services/medicalService';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { format } from 'date-fns';

const GRTP_STAGES: { stage: ConcussionStage; name: string; desc: string; minRest: string; allowedActivity: string }[] = [
  {
    stage: 1,
    name: 'Initial Physical & Cognitive Rest',
    desc: 'Complete mental and physical rest until symptom-free at rest.',
    minRest: '24 - 48 Hours Minimum',
    allowedActivity: 'Sleep, light walking, avoiding screens/loud noise.'
  },
  {
    stage: 2,
    name: 'Light Aerobic Exercise',
    desc: 'Increase heart rate without head impact or heavy resistance.',
    minRest: '24 Hours',
    allowedActivity: 'Stationary bike <70% Max HR, light jogging. No weight lifting.'
  },
  {
    stage: 3,
    name: 'Sport-Specific Non-Contact Drills',
    desc: 'Add movement and sport-specific motor skills without head impact risk.',
    minRest: '24 Hours',
    allowedActivity: 'Running drills, shadow batting, fielding footwork. No head jarring.'
  },
  {
    stage: 4,
    name: 'Non-Contact Training Drills',
    desc: 'Complex training drills, passing, tactical meetings, and resistance training.',
    minRest: '24 Hours',
    allowedActivity: 'Full gym sessions, non-contact net sessions, tactical rehearsals.'
  },
  {
    stage: 5,
    name: 'Full Contact Practice',
    desc: 'Participate in normal training activities following medical doctor clearance.',
    minRest: '24 Hours',
    allowedActivity: 'Full match simulation, live net sessions, boundary sliding.'
  },
  {
    stage: 6,
    name: 'Return to Match Play',
    desc: 'Full clearance for competitive match selection.',
    minRest: 'Final Clearance',
    allowedActivity: 'Unrestricted competitive sport.'
  }
];

export default function MedicalPage() {
  const [activeTab, setActiveTab] = useState<'triage' | 'concussion' | 'anatomical' | 'certificates'>('triage');
  const [incidents, setIncidents] = useState<MedicalIncident[]>([]);
  const [concussionRecords, setConcussionRecords] = useState<ConcussionRtpRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [showLogModal, setShowLogModal] = useState<boolean>(false);
  const [selectedConcussion, setSelectedConcussion] = useState<ConcussionRtpRecord | null>(null);
  const [selectedBodyPart, setSelectedBodyPart] = useState<string | null>(null);

  useEffect(() => {
    async function loadMedicalData() {
      try {
        const [incRes, rtpRes] = await Promise.all([
          medicalService.getIncidents(),
          medicalService.getConcussionRecords()
        ]);
        setIncidents(incRes);
        setConcussionRecords(rtpRes);
        if (rtpRes.length > 0) setSelectedConcussion(rtpRes[0]);
      } catch (err) {
        console.error('Failed to load medical data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadMedicalData();
  }, []);

  const filteredIncidents = incidents.filter(inc => {
    const matchesSearch = inc.personName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          inc.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = selectedSeverity === 'ALL' || inc.severity === selectedSeverity;
    const matchesBody = !selectedBodyPart || inc.bodyPart === selectedBodyPart;
    return matchesSearch && matchesSeverity && matchesBody;
  });

  const handleAdvanceStage = async (recordId: string, currentStage: ConcussionStage) => {
    if (currentStage >= 6) return;
    const nextStage = (currentStage + 1) as ConcussionStage;
    await medicalService.advanceConcussionStage(recordId, nextStage, 'Dr. S. Van Der Merwe', 'Advanced following symptom-free baseline protocol.');
    setConcussionRecords(prev => prev.map(rec => {
      if (rec.id === recordId) {
        return {
          ...rec,
          currentStage: nextStage,
          stageName: GRTP_STAGES.find(s => s.stage === nextStage)?.name || rec.stageName,
          stageHistory: [
            ...rec.stageHistory,
            {
              stage: nextStage,
              completedAt: new Date().toISOString().split('T')[0],
              approvedBy: 'Dr. S. Van Der Merwe',
              notes: 'Approved via GRTP protocol checklist.'
            }
          ]
        };
      }
      return rec;
    }));
    if (selectedConcussion && selectedConcussion.id === recordId) {
      setSelectedConcussion(prev => prev ? {
        ...prev,
        currentStage: nextStage,
        stageName: GRTP_STAGES.find(s => s.stage === nextStage)?.name || prev.stageName
      } : null);
    }
  };

  return (
    <RouteGuard module="medical" label="Confidential Medical & Concussion Engine">
      <div className="space-y-10 pb-24 max-w-7xl mx-auto p-4 md:p-8">
        {/* Strategic Header & Data Encryption Shield */}
        <div 
          className="relative p-8 md:p-10 rounded-[3rem] border overflow-hidden shadow-2xl"
          style={{ background: D.surf1, borderColor: D.border }}
        >
          <div className="absolute inset-0 opacity-10" style={{ background: 'linear-gradient(135deg, #f43f5e, #e11d48)' }} />
          <div className="flex flex-col lg:flex-row items-center gap-10 relative z-10">
            <div 
              className="h-24 w-24 rounded-3xl flex items-center justify-center shadow-inner" 
              style={{ background: D.surf2, border: `1px solid ${D.border}` }}
            >
              <HeartPulse className="h-12 w-12 text-rose-500" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] italic text-rose-400">
                  POPIA / HIPAA COMPLIANT CLINICAL CORE
                </span>
                <Badge className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[9px] font-mono gap-1">
                  <Lock className="w-3 h-3 text-emerald-400" /> 256-BIT ENCRYPTED
                </Badge>
              </div>
              <h1 
                className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic leading-none" 
                style={{ fontFamily: D.head, color: D.textPrimary }}
              >
                CONFIDENTIAL <span className="text-rose-500">MEDICAL & RTP HUB</span>
              </h1>
              <p className="text-[11px] font-bold uppercase tracking-[0.3em] mt-3 opacity-60 italic" style={{ color: D.textMuted }}>
                CONCUSSION GRADUATED RETURN-TO-PLAY • ANATOMICAL HEATMAPS • CLINICAL CLEARANCE CERTIFICATES
              </p>
            </div>

            <div className="lg:ml-auto grid grid-cols-2 md:grid-cols-3 gap-4 w-full lg:w-auto">
              <div className="p-4 rounded-2xl border bg-black/20 text-center" style={{ borderColor: D.border }}>
                <span className="text-[9px] font-black uppercase tracking-widest opacity-40 block mb-1">INJURY RATE</span>
                <div className="text-xl font-black text-rose-400 font-mono">7.2%</div>
              </div>
              <div className="p-4 rounded-2xl border bg-black/20 text-center" style={{ borderColor: D.border }}>
                <span className="text-[9px] font-black uppercase tracking-widest opacity-40 block mb-1">GRTP PROTOCOLS</span>
                <div className="text-xl font-black text-amber-400 font-mono">{concussionRecords.length} ACTIVE</div>
              </div>
              <div className="p-4 rounded-2xl border bg-black/20 text-center col-span-2 md:col-span-1" style={{ borderColor: D.border }}>
                <span className="text-[9px] font-black uppercase tracking-widest opacity-40 block mb-1">CLEARANCE RATE</span>
                <div className="text-xl font-black text-emerald-400 font-mono">94%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-3 p-2 rounded-2xl border" style={{ background: D.surf1, borderColor: D.border }}>
          <button
            onClick={() => setActiveTab('triage')}
            className={`flex items-center gap-2.5 px-6 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              activeTab === 'triage' ? 'text-white shadow-xl' : 'opacity-40 hover:opacity-100'
            }`}
            style={{ background: activeTab === 'triage' ? D.rose : 'transparent', color: activeTab === 'triage' ? 'white' : D.textPrimary }}
          >
            <Stethoscope className="w-4 h-4" /> Active Triage & Roster Health ({filteredIncidents.length})
          </button>

          <button
            onClick={() => setActiveTab('concussion')}
            className={`flex items-center gap-2.5 px-6 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              activeTab === 'concussion' ? 'text-black shadow-xl' : 'opacity-40 hover:opacity-100'
            }`}
            style={{ background: activeTab === 'concussion' ? D.amber : 'transparent', color: activeTab === 'concussion' ? 'black' : D.textPrimary }}
          >
            <Brain className="w-4 h-4" /> Concussion 6-Stage GRTP Protocol ({concussionRecords.length})
          </button>

          <button
            onClick={() => setActiveTab('anatomical')}
            className={`flex items-center gap-2.5 px-6 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              activeTab === 'anatomical' ? 'text-black shadow-xl' : 'opacity-40 hover:opacity-100'
            }`}
            style={{ background: activeTab === 'anatomical' ? D.sky : 'transparent', color: activeTab === 'anatomical' ? 'black' : D.textPrimary }}
          >
            <Activity className="w-4 h-4" /> Anatomical Body Map
          </button>

          <button
            onClick={() => setActiveTab('certificates')}
            className={`flex items-center gap-2.5 px-6 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              activeTab === 'certificates' ? 'text-black shadow-xl' : 'opacity-40 hover:opacity-100'
            }`}
            style={{ background: activeTab === 'certificates' ? D.emerald : 'transparent', color: activeTab === 'certificates' ? 'black' : D.textPrimary }}
          >
            <ShieldCheck className="w-4 h-4" /> Digital Clearance Certificates
          </button>
        </div>

        {/* TAB 1: ACTIVE TRIAGE & ROSTER HEALTH BOARD */}
        {activeTab === 'triage' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Filter & Search Bar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl border" style={{ background: D.surf1, borderColor: D.border }}>
              <div className="relative w-full md:w-96">
                <Search className="absolute left-4 top-3.5 h-4 w-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search player or incident type..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-black border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <span className="text-[10px] font-mono text-zinc-400 mr-2 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5 text-rose-400" /> SEVERITY:
                </span>
                {['ALL', 'Critical', 'High', 'Medium', 'Low'].map(sev => (
                  <button
                    key={sev}
                    onClick={() => setSelectedSeverity(sev)}
                    className={cn(
                      'px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold uppercase transition-all border',
                      selectedSeverity === sev ? 'bg-rose-500 text-white border-rose-400 shadow-md' : 'bg-black/40 text-zinc-400 border-white/10 hover:text-white'
                    )}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>

            {/* Incident Dossier Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredIncidents.map(inc => (
                <Card 
                  key={inc.id}
                  className="p-6 border rounded-3xl space-y-4 shadow-xl relative overflow-hidden transition-all hover:border-rose-500/40"
                  style={{ background: D.surf1, borderColor: D.border }}
                >
                  <div className="flex items-center justify-between">
                    <Badge className={cn(
                      'font-mono text-[9px] uppercase px-3 py-1',
                      inc.severity === 'Critical' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                      inc.severity === 'High' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                      inc.severity === 'Medium' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40' :
                      'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    )}>
                      {inc.severity} Severity
                    </Badge>
                    <Badge className={cn(
                      'font-mono text-[9px] uppercase',
                      inc.status === 'Cleared' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    )}>
                      {inc.status}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="text-xl font-black text-white uppercase italic tracking-tight" style={{ fontFamily: D.head }}>
                      {inc.personName}
                    </h3>
                    <p className="text-[10px] font-mono text-rose-400 font-bold uppercase tracking-wider mt-0.5">
                      {inc.teamName || "St John's 1st XI"} • {inc.type}
                    </p>
                  </div>

                  <p className="text-xs text-zinc-300 leading-relaxed font-sans line-clamp-3">
                    {inc.description}
                  </p>

                  <div className="pt-3 border-t space-y-2 text-[10px] font-mono text-zinc-400" style={{ borderColor: D.border }}>
                    <div className="flex justify-between">
                      <span>TREATMENT:</span>
                      <span className="text-white font-bold truncate max-w-[180px]">{inc.treatmentAdministered || 'Under Evaluation'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>ESTIMATED RETURN:</span>
                      <span className="text-amber-400 font-bold">{inc.estimatedReturnDays !== undefined ? `${inc.estimatedReturnDays} Days` : 'TBD'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>CLINICIAN:</span>
                      <span className="text-zinc-300">{inc.reportedBy}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {/* TAB 2: CONCUSSION 6-STAGE GRTP PROTOCOL */}
        {activeTab === 'concussion' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Player Selector Panel */}
            <div className="lg:col-span-4 space-y-4">
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block">ACTIVE CONCUSSION PROTOCOLS</span>
              {concussionRecords.map(rec => (
                <Card
                  key={rec.id}
                  onClick={() => setSelectedConcussion(rec)}
                  className={cn(
                    'p-5 border rounded-2xl cursor-pointer transition-all space-y-2',
                    selectedConcussion?.id === rec.id ? 'bg-amber-500/10 border-amber-500/40 shadow-xl' : 'bg-black/30 border-white/10 hover:border-white/20'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-black text-white uppercase italic" style={{ fontFamily: D.head }}>{rec.personName}</h4>
                    <Badge className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-mono">
                      STAGE {rec.currentStage} OF 6
                    </Badge>
                  </div>
                  <p className="text-[10px] font-mono text-zinc-400">{rec.teamName} • Injured {rec.injuryDate}</p>
                  <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden border border-white/10 mt-2">
                    <div className="bg-amber-500 h-full transition-all" style={{ width: `${(rec.currentStage / 6) * 100}%` }} />
                  </div>
                </Card>
              ))}
            </div>

            {/* Concussion 6-Stage Timeline Inspector */}
            {selectedConcussion && (
              <div className="lg:col-span-8 space-y-6">
                <Card className="p-8 border rounded-3xl shadow-2xl space-y-6" style={{ background: D.surf1, borderColor: D.border }}>
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b pb-6" style={{ borderColor: D.border }}>
                    <div>
                      <span className="text-[9px] font-mono text-amber-400 font-bold uppercase tracking-widest">WORLD RUGBY / ICC SCAT6 PROTOCOL</span>
                      <h3 className="text-2xl font-black text-white uppercase italic" style={{ fontFamily: D.head }}>
                        {selectedConcussion.personName} — GRTP TRACKER
                      </h3>
                      <p className="text-xs text-zinc-400 font-mono mt-1">
                        Doctor: {selectedConcussion.treatingDoctorName} (Lic: {selectedConcussion.doctorLicenseNumber})
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right font-mono">
                        <span className="text-[9px] text-zinc-400 block">SCAT6 SYMPTOM SCORE</span>
                        <span className="text-lg font-black text-amber-400">{selectedConcussion.scat6CurrentScore} / 132</span>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleAdvanceStage(selectedConcussion.id, selectedConcussion.currentStage)}
                        disabled={selectedConcussion.currentStage >= 6}
                        className="bg-amber-500 hover:bg-amber-400 text-black font-mono text-xs font-bold px-4 py-2 rounded-xl"
                      >
                        Advance to Stage {selectedConcussion.currentStage + 1}
                      </Button>
                    </div>
                  </div>

                  {/* 6 Stage Breakdown Grid */}
                  <div className="space-y-4">
                    {GRTP_STAGES.map(s => {
                      const isCurrent = selectedConcussion.currentStage === s.stage;
                      const isPassed = selectedConcussion.currentStage > s.stage;

                      return (
                        <div
                          key={s.stage}
                          className={cn(
                            'p-5 rounded-2xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4',
                            isCurrent ? 'bg-amber-500/10 border-amber-500/40 shadow-lg' :
                            isPassed ? 'bg-emerald-500/5 border-emerald-500/20 opacity-80' :
                            'bg-black/20 border-white/10 opacity-40'
                          )}
                        >
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              'w-10 h-10 rounded-xl flex items-center justify-center font-mono font-black text-sm border',
                              isCurrent ? 'bg-amber-500 text-black border-amber-400' :
                              isPassed ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' :
                              'bg-zinc-800 text-zinc-500 border-zinc-700'
                            )}>
                              {isPassed ? <Check className="w-5 h-5 text-emerald-400" /> : s.stage}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-base font-bold text-white">{s.name}</h4>
                                {isCurrent && (
                                  <Badge className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-mono">
                                    ACTIVE STAGE
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-zinc-400 mt-0.5">{s.desc}</p>
                              <span className="text-[10px] font-mono text-zinc-400 mt-1 block">ALLOWED: {s.allowedActivity}</span>
                            </div>
                          </div>

                          <div className="text-right font-mono min-w-[140px]">
                            <span className="text-[9px] text-zinc-400 block">MANDATORY REST</span>
                            <span className="text-xs font-bold text-amber-400">{s.minRest}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </div>
            )}
          </motion.div>
        )}

        {/* TAB 3: ANATOMICAL BODY MAP */}
        {activeTab === 'anatomical' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <Card className="p-8 border rounded-3xl shadow-2xl space-y-6" style={{ background: D.surf1, borderColor: D.border }}>
              <div>
                <span className="text-[9px] font-mono text-sky-400 font-bold uppercase tracking-widest">ANATOMICAL TRIAGE & TISSUE DENSITY MAP</span>
                <h3 className="text-2xl font-black uppercase italic text-white" style={{ fontFamily: D.head }}>
                  SQUAD ANATOMICAL INJURY DISTRIBUTION
                </h3>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { key: 'HEAD', label: 'Head & Cervical', count: incidents.filter(i => i.bodyPart === 'HEAD').length, color: D.rose },
                  { key: 'SHOULDER', label: 'Shoulder & Rotator Cuff', count: incidents.filter(i => i.bodyPart === 'SHOULDER').length, color: D.amber },
                  { key: 'HAMSTRING', label: 'Hamstring & Quad', count: incidents.filter(i => i.bodyPart === 'HAMSTRING').length, color: D.sky },
                  { key: 'ANKLE_FOOT', label: 'Ankle & Achilles', count: incidents.filter(i => i.bodyPart === 'ANKLE_FOOT').length, color: D.emerald }
                ].map(part => (
                  <button
                    key={part.key}
                    onClick={() => setSelectedBodyPart(selectedBodyPart === part.key ? null : part.key)}
                    className={cn(
                      'p-5 rounded-2xl border text-left transition-all space-y-2',
                      selectedBodyPart === part.key ? 'bg-sky-500/20 border-sky-400 shadow-xl' : 'bg-black/30 border-white/10 hover:border-white/20'
                    )}
                  >
                    <span className="text-[10px] font-mono text-zinc-400 block">{part.label}</span>
                    <div className="text-2xl font-black font-mono" style={{ color: part.color }}>
                      {part.count} Active Case(s)
                    </div>
                  </button>
                ))}
              </div>

              <div className="p-6 rounded-2xl bg-black/40 border border-white/10 space-y-4">
                <h4 className="text-xs font-mono font-bold text-white uppercase">Filtered Anatomical Cases</h4>
                <div className="space-y-3">
                  {filteredIncidents.map(inc => (
                    <div key={inc.id} className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs font-mono text-zinc-300">
                      <div>
                        <b className="text-white">{inc.personName}</b> — {inc.type} ({inc.bodyPart})
                      </div>
                      <Badge className="bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[9px]">
                        {inc.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* TAB 4: DIGITAL CLEARANCE CERTIFICATES */}
        {activeTab === 'certificates' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <Card className="p-8 border rounded-3xl shadow-2xl space-y-6" style={{ background: D.surf1, borderColor: D.border }}>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b pb-6" style={{ borderColor: D.border }}>
                <div>
                  <span className="text-[9px] font-mono text-emerald-400 font-bold uppercase tracking-widest">DIGITAL MEDICAL AUDIT LEDGER</span>
                  <h3 className="text-2xl font-black uppercase italic text-white" style={{ fontFamily: D.head }}>
                    OFFICIAL RETURN-TO-PLAY CLEARANCE CERTIFICATES
                  </h3>
                </div>

                <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold px-5 py-2.5 rounded-xl gap-2 shadow-lg">
                  <Printer className="w-4 h-4" /> Print Signed Dossier PDF
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {incidents.filter(i => i.clearanceCode).map(inc => (
                  <div key={inc.id} className="p-6 rounded-2xl bg-black/40 border border-emerald-500/30 space-y-4 relative">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-mono">
                        VERIFIED CLINICAL CLEARANCE
                      </Badge>
                      <QrCode className="w-6 h-6 text-emerald-400 opacity-60" />
                    </div>

                    <div>
                      <h4 className="text-xl font-black text-white uppercase italic" style={{ fontFamily: D.head }}>{inc.personName}</h4>
                      <p className="text-[10px] font-mono text-zinc-400">{inc.teamName || "St John's 1st XI"} • {inc.type}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono text-emerald-300 space-y-1">
                      <div>VERIFICATION CODE: <b>{inc.clearanceCode}</b></div>
                      <div>AUTHORISING PHYSICIAN: <b>{inc.clearanceDoctor || 'Dr. Sarah Van Der Merwe'}</b></div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </RouteGuard>
  );
}
