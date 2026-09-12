'use client';

import React, { useState } from 'react';
import { 
  Trophy, 
  Shield, 
  Waves, 
  Flame, 
  Activity, 
  Target, 
  Globe, 
  Zap, 
  Calendar, 
  Users, 
  AlertTriangle, 
  CheckCircle2, 
  MapPin, 
  ChevronRight, 
  Clock, 
  BarChart3, 
  Sliders,
  Layers,
  ArrowUpRight,
  UserCheck
} from 'lucide-react';
import { D } from '@/lib/design-system';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  SUPPORTED_SPORT_DISCIPLINES, 
  SportDiscipline, 
  MOCK_SWIMMING_GALA, 
  MOCK_ATHLETICS_MEET, 
  MOCK_MULTI_SPORT_PASSPORTS, 
  MOCK_FACILITY_RESERVATIONS, 
  MOCK_CHAMPIONSHIP_STANDINGS 
} from '@/lib/intelligence/multiSportEngine';
import { SwimmingGalaHubView } from '@/components/sports/SwimmingGalaHub';
import { AthleticsMeetHubView } from '@/components/sports/AthleticsMeetHub';

export default function MultiSportPlatformPage() {
  const [selectedSport, setSelectedSport] = useState<SportDiscipline>('CRICKET');
  const [activeTab, setActiveTab] = useState<'engines' | 'passports' | 'facilities' | 'championship'>('engines');
  const [selectedAthleteId, setSelectedAthleteId] = useState<string>('p-101');

  const activeAthlete = MOCK_MULTI_SPORT_PASSPORTS.find(p => p.personId === selectedAthleteId) || MOCK_MULTI_SPORT_PASSPORTS[0];

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
            <Layers className="h-12 w-12 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] italic text-emerald-400">
                UNIFIED SCHOOL SPORTS OPERATING SYSTEM
              </span>
              <Badge className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[9px] font-mono">
                8 ACTIVE SPORT ENGINES
              </Badge>
            </div>
            <h1 
              className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic leading-none" 
              style={{ fontFamily: D.head, color: D.textPrimary }}
            >
              MULTI-SPORT <span className="text-emerald-400">PLATFORM ENGINE</span>
            </h1>
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] mt-3 opacity-60 italic" style={{ color: D.textMuted }}>
              SHARED INFRASTRUCTURE LAYER • PASSPORT MATRIX • VENUE RESERVATIONS • CHAMPIONSHIP SHIELD
            </p>
          </div>

          <div className="lg:ml-auto grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl border bg-black/20 text-center" style={{ borderColor: D.border }}>
              <span className="text-[9px] font-black uppercase tracking-widest opacity-40">STUDENT ATHLETES</span>
              <div className="text-2xl font-black text-white font-mono">1,420</div>
            </div>
            <div className="p-4 rounded-2xl border bg-black/20 text-center" style={{ borderColor: D.border }}>
              <span className="text-[9px] font-black uppercase tracking-widest opacity-40">ACTIVE SQUADS</span>
              <div className="text-2xl font-black text-emerald-400 font-mono">94</div>
            </div>
          </div>
        </div>
      </div>

      {/* Sport Discipline Selector Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {SUPPORTED_SPORT_DISCIPLINES.map((sport) => {
          const isSelected = sport.id === selectedSport;
          return (
            <button
              key={sport.id}
              onClick={() => setSelectedSport(sport.id)}
              className={`p-4 rounded-2xl border text-center transition-all ${
                isSelected 
                  ? 'bg-emerald-500/20 border-emerald-400 shadow-lg shadow-emerald-500/10' 
                  : 'bg-black/20 border-white/10 hover:bg-white/5'
              }`}
            >
              <div className="text-xs font-black uppercase tracking-wider text-white mb-1">{sport.name}</div>
              <Badge 
                className="text-[8px] font-mono"
                style={{ 
                  background: isSelected ? sport.color : 'rgba(255,255,255,0.05)', 
                  color: isSelected ? 'black' : 'white' 
                }}
              >
                {sport.season}
              </Badge>
            </button>
          );
        })}
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-4 p-2 rounded-2xl border" style={{ background: D.surf1, borderColor: D.border }}>
        <button
          onClick={() => setActiveTab('engines')}
          className={`flex items-center gap-3 px-6 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
            activeTab === 'engines' ? 'text-black shadow-xl' : 'opacity-40 hover:opacity-100'
          }`}
          style={{ background: activeTab === 'engines' ? D.emerald : 'transparent', color: activeTab === 'engines' ? 'black' : D.textPrimary }}
        >
          <Trophy className="w-4 h-4" /> Sport Engine Consoles
        </button>

        <button
          onClick={() => setActiveTab('passports')}
          className={`flex items-center gap-3 px-6 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
            activeTab === 'passports' ? 'text-black shadow-xl' : 'opacity-40 hover:opacity-100'
          }`}
          style={{ background: activeTab === 'passports' ? D.amber : 'transparent', color: activeTab === 'passports' ? 'black' : D.textPrimary }}
        >
          <UserCheck className="w-4 h-4" /> Cross-Sport Passports
        </button>

        <button
          onClick={() => setActiveTab('facilities')}
          className={`flex items-center gap-3 px-6 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
            activeTab === 'facilities' ? 'text-white shadow-xl' : 'opacity-40 hover:opacity-100'
          }`}
          style={{ background: activeTab === 'facilities' ? D.indigo : 'transparent', color: activeTab === 'facilities' ? 'white' : D.textPrimary }}
        >
          <MapPin className="w-4 h-4" /> Universal Facility Grid
        </button>

        <button
          onClick={() => setActiveTab('championship')}
          className={`flex items-center gap-3 px-6 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
            activeTab === 'championship' ? 'text-black shadow-xl' : 'opacity-40 hover:opacity-100'
          }`}
          style={{ background: activeTab === 'championship' ? D.sky : 'transparent', color: activeTab === 'championship' ? 'black' : D.textPrimary }}
        >
          <Shield className="w-4 h-4" /> Championship Shield Standings
        </button>
      </div>

      {/* TAB 1: SPORT ENGINE CONSOLES */}
      {activeTab === 'engines' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          {selectedSport === 'CRICKET' && (
            <div className="p-8 rounded-[2.5rem] border space-y-6 shadow-2xl" style={{ background: D.surf1, borderColor: D.border }}>
              <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: D.border }}>
                <div>
                  <Badge className="bg-emerald-500/10 text-emerald-300 font-mono text-[9px] mb-2">FLAGSHIP ENGINE</Badge>
                  <h3 className="text-2xl font-black uppercase italic text-white" style={{ fontFamily: D.head }}>
                    CRICKET MATCH & SCORING ENGINE
                  </h3>
                </div>
                <Button 
                  onClick={() => window.location.href = '/matches'}
                  className="bg-emerald-500 text-black font-black text-xs uppercase"
                >
                  LAUNCH CRICKET SCORING HUB
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="p-6 rounded-2xl bg-black/20 border border-white/10 space-y-2">
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">EVENT LOGGING</span>
                  <p className="text-sm font-bold text-white">Ball-by-Ball Canonical Stream</p>
                </div>
                <div className="p-6 rounded-2xl bg-black/20 border border-white/10 space-y-2">
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">SPATIAL TELEMETRY</span>
                  <p className="text-sm font-bold text-white">360° Wagon Wheel & Pitch Map</p>
                </div>
                <div className="p-6 rounded-2xl bg-black/20 border border-white/10 space-y-2">
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">COMPETITION CALCULATORS</span>
                  <p className="text-sm font-bold text-white">DLS Standard & NRR Standings</p>
                </div>
                <div className="p-6 rounded-2xl bg-black/20 border border-white/10 space-y-2">
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">INTELLIGENCE</span>
                  <p className="text-sm font-bold text-white">AI Commentary & Scouting Dossiers</p>
                </div>
              </div>
            </div>
          )}

          {selectedSport === 'SWIMMING' && (
            <SwimmingGalaHubView />
          )}

          {selectedSport === 'ATHLETICS' && (
            <AthleticsMeetHubView />
          )}

          {['RUGBY', 'HOCKEY', 'NETBALL', 'SOCCER', 'BASKETBALL'].includes(selectedSport) && (
            <div className="p-8 rounded-[2.5rem] border space-y-6 shadow-2xl" style={{ background: D.surf1, borderColor: D.border }}>
              <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: D.border }}>
                <div>
                  <Badge className="bg-amber-500/10 text-amber-300 font-mono text-[9px] mb-2">FIELD / COURT ENGINE</Badge>
                  <h3 className="text-2xl font-black uppercase italic text-white" style={{ fontFamily: D.head }}>
                    {selectedSport} ENGINE CONSOLE
                  </h3>
                </div>
                <Badge className="bg-white/10 text-zinc-300 text-xs font-mono">STANDARDIZED RULESET</Badge>
              </div>

              <div className="p-8 rounded-2xl bg-black/20 border border-amber-500/30 text-center space-y-4">
                <Shield className="w-12 h-12 text-amber-400 mx-auto" />
                <h4 className="text-lg font-black uppercase text-white tracking-wide">
                  {selectedSport} LIVE MATCH ENGINE READY
                </h4>
                <p className="text-xs text-zinc-400 max-w-lg mx-auto">
                  Features real-time match timekeeper, try/goal scoring logs, penalty card tracking (Yellow / Red / Sin-bin), substitution manifests, and post-match analytical summaries.
                </p>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* TAB 2: CROSS-SPORT PASSPORTS */}
      {activeTab === 'passports' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Athlete Roster */}
          <div className="lg:col-span-1 p-8 rounded-[2.5rem] border space-y-6 shadow-2xl" style={{ background: D.surf1, borderColor: D.border }}>
            <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: D.border }}>
              <h3 className="text-xl font-black uppercase italic text-white" style={{ fontFamily: D.head }}>
                MULTI-SPORT <span style={{ color: D.amber }}>PASSPORTS</span>
              </h3>
              <Badge className="bg-amber-500/10 text-amber-300 font-mono text-[9px]">FATIGUE MONITORING</Badge>
            </div>

            <div className="space-y-4">
              {MOCK_MULTI_SPORT_PASSPORTS.map((p) => {
                const isSelected = p.personId === selectedAthleteId;
                return (
                  <div
                    key={p.personId}
                    onClick={() => setSelectedAthleteId(p.personId)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected ? 'bg-amber-500/20 border-amber-400' : 'bg-black/10 border-white/10 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-white">{p.studentName}</h4>
                      <Badge className="bg-rose-500/20 text-rose-300 text-[9px] font-mono">
                        {p.combinedWorkloadScore}% LOAD
                      </Badge>
                    </div>
                    <span className="text-xs font-mono text-zinc-400 block mt-1">
                      {p.grade} • {p.houseName} House
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Passport Detail */}
          <div className="lg:col-span-2 p-8 rounded-[2.5rem] border space-y-6 shadow-2xl" style={{ background: D.surf1, borderColor: D.border }}>
            <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: D.border }}>
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">STUDENT ATHLETE PASSPORT</span>
                <h3 className="text-2xl font-black uppercase italic text-white" style={{ fontFamily: D.head }}>
                  {activeAthlete.studentName}
                </h3>
              </div>
              <Badge className="bg-rose-500/10 text-rose-300 border border-rose-500/20 text-xs font-mono">
                {activeAthlete.workloadStatus.replace(/_/g, ' ')}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {activeAthlete.sportProfiles.map((sp) => (
                <div key={sp.discipline} className="p-6 rounded-2xl border bg-black/20 space-y-3" style={{ borderColor: D.border }}>
                  <Badge className="bg-emerald-500/20 text-emerald-300 font-mono text-[9px]">{sp.discipline}</Badge>
                  <h4 className="text-sm font-bold text-white">{sp.teamName}</h4>
                  <span className="text-xs font-mono text-amber-400 block">{sp.roleOrPosition}</span>
                  <p className="text-xs text-zinc-300">{sp.keyMetricSummary}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* TAB 3: UNIVERSAL FACILITY GRID */}
      {activeTab === 'facilities' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-8 rounded-[2.5rem] border space-y-6 shadow-2xl" style={{ background: D.surf1, borderColor: D.border }}>
          <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: D.border }}>
            <h3 className="text-2xl font-black uppercase italic text-white" style={{ fontFamily: D.head }}>
              UNIVERSAL FACILITY & GROUND <span style={{ color: D.indigo }}>RESERVATIONS</span>
            </h3>
            <Badge className="bg-indigo-500/10 text-indigo-300 font-mono text-[9px]">AUTOMATIC CONFLICT DETECTION</Badge>
          </div>

          <div className="space-y-4">
            {MOCK_FACILITY_RESERVATIONS.map((r) => (
              <div 
                key={r.reservationId} 
                className={`p-6 rounded-2xl border flex items-center justify-between ${
                  r.status === 'CONFLICT_FLAGGED' ? 'bg-rose-500/10 border-rose-500/30' : 'bg-black/20 border-white/10'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-white">{r.facilityName}</span>
                    <Badge className="bg-emerald-500/20 text-emerald-300 text-[9px] font-mono">{r.sportDiscipline}</Badge>
                  </div>
                  <p className="text-xs font-mono text-zinc-400">{r.squadName} • {r.startTime} - {r.endTime}</p>
                  <p className="text-xs text-zinc-300">{r.notes}</p>
                </div>
                <Badge className={r.status === 'CONFLICT_FLAGGED' ? 'bg-rose-500 text-white font-black' : 'bg-emerald-500/20 text-emerald-300'}>
                  {r.status}
                </Badge>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* TAB 4: CHAMPIONSHIP SHIELD */}
      {activeTab === 'championship' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-8 rounded-[2.5rem] border space-y-6 shadow-2xl" style={{ background: D.surf1, borderColor: D.border }}>
          <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: D.border }}>
            <h3 className="text-2xl font-black uppercase italic text-white" style={{ fontFamily: D.head }}>
              INTER-HOUSE & INTER-SCHOOL <span style={{ color: D.sky }}>CHAMPIONSHIP SHIELD</span>
            </h3>
            <Badge className="bg-sky-500/10 text-sky-300 font-mono text-[9px]">AGGREGATE STANDINGS</Badge>
          </div>

          <div className="space-y-4">
            {MOCK_CHAMPIONSHIP_STANDINGS.map((c) => (
              <div key={c.schoolOrHouse} className="p-6 rounded-2xl border bg-black/20 border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl flex items-center justify-center text-lg font-black text-black font-mono" style={{ background: c.color }}>
                    #{c.rank}
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">{c.schoolOrHouse}</h4>
                    <span className="text-xs font-mono text-zinc-400">
                      Cricket: {c.cricketPoints} | Swim: {c.swimmingPoints} | Ath: {c.athleticsPoints} | Rugby: {c.rugbyPoints}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-sky-400 font-mono">{c.overallScore} PTS</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
