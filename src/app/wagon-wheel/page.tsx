'use client';

import React, { useState, useMemo } from 'react';
import { 
  Target, 
  Flame, 
  PieChart, 
  BarChart3, 
  Compass, 
  ShieldAlert, 
  Download, 
  Sparkles, 
  Filter, 
  RefreshCw, 
  Plus, 
  CheckCircle2, 
  Layers, 
  User, 
  Zap, 
  TrendingUp, 
  Info,
  Sliders,
  Crosshair,
  Award
} from 'lucide-react';
import { D } from '@/lib/design-system';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { calculateShotZone, getRunColor, ShotZoneInfo } from '@/lib/scoring/wagonWheelUtils';

// ── Types ──────────────────────────────────────────────────────────
export interface DetailedShotEvent {
  id: string;
  playerId: string;
  playerName: string;
  matchName: string;
  overNumber: number;
  ballNumber: number;
  bowlerName: string;
  bowlerType: 'RIGHT_ARM_SEAM' | 'LEFT_ARM_SEAM' | 'OFF_SPIN' | 'LEG_SPIN';
  phase: 'POWERPLAY' | 'MIDDLE' | 'DEATH';
  shotType: 'Cover Drive' | 'Pull Shot' | 'Straight Drive' | 'Square Cut' | 'Flick' | 'Sweep' | 'Lofted Drive' | 'Edge / Deflection';
  x: number; // SVG X coordinate (0-400, center 200)
  y: number; // SVG Y coordinate (0-400, center 200)
  angle: number; // 0-360 degrees
  distancePct: number; // 0-100%
  runs: number;
  isWicket: boolean;
  wicketType?: string;
  zoneInfo: ShotZoneInfo;
  timestamp: string;
}

export interface PlayerProfile {
  id: string;
  name: string;
  team: string;
  role: string;
  battingHand: 'Right' | 'Left';
  avatarUrl?: string;
}

// ── Mock Data ──────────────────────────────────────────────────────
const MOCK_PLAYERS: PlayerProfile[] = [
  { id: 'p-1', name: 'Tristan Stubbs', team: 'St Stithians 1st XI', role: 'Wicketkeeper-Batter', battingHand: 'Right' },
  { id: 'p-2', name: 'Dewald Brevis', team: 'Hilton College 1st XI', role: 'Top-Order Batter', battingHand: 'Right' },
  { id: 'p-3', name: 'Marco Jansen', team: 'Kearsney College 1st XI', role: 'Bowling All-Rounder', battingHand: 'Right' },
  { id: 'p-4', name: 'Bryce Parsons', team: 'King Edward VII 1st XI', role: 'Opener', battingHand: 'Left' },
];

const MOCK_MATCHES = [
  'ALL_MATCHES',
  'vs Westville Boys High (Final)',
  'vs Maritzburg College (League)',
  'vs Durban High School (Derby)',
  'vs Michaelhouse (Festival)'
];

// Helper to generate coordinates from angle & distance
function polarToSvg(angleDeg: number, distancePct: number) {
  const maxR = 185; // Boundary circle radius
  const r = (distancePct / 100) * maxR;
  const angleRad = (angleDeg - 90) * (Math.PI / 180);
  const x = 200 + r * Math.cos(angleRad);
  const y = 200 + r * Math.sin(angleRad);
  return { x: Math.round(x), y: Math.round(y) };
}

// Seed telemetry data for Tristan Stubbs & Dewald Brevis
const INITIAL_SHOTS: DetailedShotEvent[] = [
  // Tristan Stubbs shots
  { id: 's-1', playerId: 'p-1', playerName: 'Tristan Stubbs', matchName: 'vs Westville Boys High (Final)', overNumber: 3, ballNumber: 4, bowlerName: 'L. Marais', bowlerType: 'RIGHT_ARM_SEAM', phase: 'POWERPLAY', shotType: 'Cover Drive', angle: 45, distancePct: 98, runs: 4, isWicket: false, zoneInfo: calculateShotZone(45, 98), x: polarToSvg(45, 98).x, y: polarToSvg(45, 98).y, timestamp: '10:14 AM' },
  { id: 's-2', playerId: 'p-1', playerName: 'Tristan Stubbs', matchName: 'vs Westville Boys High (Final)', overNumber: 4, ballNumber: 1, bowlerName: 'L. Marais', bowlerType: 'RIGHT_ARM_SEAM', phase: 'POWERPLAY', shotType: 'Pull Shot', angle: 250, distancePct: 100, runs: 6, isWicket: false, zoneInfo: calculateShotZone(250, 100), x: polarToSvg(250, 100).x, y: polarToSvg(250, 100).y, timestamp: '10:18 AM' },
  { id: 's-3', playerId: 'p-1', playerName: 'Tristan Stubbs', matchName: 'vs Westville Boys High (Final)', overNumber: 5, ballNumber: 3, bowlerName: 'K. Pillay', bowlerType: 'OFF_SPIN', phase: 'POWERPLAY', shotType: 'Lofted Drive', angle: 350, distancePct: 96, runs: 4, isWicket: false, zoneInfo: calculateShotZone(350, 96), x: polarToSvg(350, 96).x, y: polarToSvg(350, 96).y, timestamp: '10:24 AM' },
  { id: 's-4', playerId: 'p-1', playerName: 'Tristan Stubbs', matchName: 'vs Westville Boys High (Final)', overNumber: 6, ballNumber: 5, bowlerName: 'K. Pillay', bowlerType: 'OFF_SPIN', phase: 'POWERPLAY', shotType: 'Square Cut', angle: 80, distancePct: 60, runs: 2, isWicket: false, zoneInfo: calculateShotZone(80, 60), x: polarToSvg(80, 60).x, y: polarToSvg(80, 60).y, timestamp: '10:29 AM' },
  { id: 's-5', playerId: 'p-1', playerName: 'Tristan Stubbs', matchName: 'vs Westville Boys High (Final)', overNumber: 8, ballNumber: 2, bowlerName: 'J. Smith', bowlerType: 'LEG_SPIN', phase: 'MIDDLE', shotType: 'Sweep', angle: 210, distancePct: 90, runs: 4, isWicket: false, zoneInfo: calculateShotZone(210, 90), x: polarToSvg(210, 90).x, y: polarToSvg(210, 90).y, timestamp: '10:38 AM' },
  { id: 's-6', playerId: 'p-1', playerName: 'Tristan Stubbs', matchName: 'vs Westville Boys High (Final)', overNumber: 12, ballNumber: 6, bowlerName: 'J. Smith', bowlerType: 'LEG_SPIN', phase: 'MIDDLE', shotType: 'Straight Drive', angle: 5, distancePct: 100, runs: 6, isWicket: false, zoneInfo: calculateShotZone(5, 100), x: polarToSvg(5, 100).x, y: polarToSvg(5, 100).y, timestamp: '10:55 AM' },
  { id: 's-7', playerId: 'p-1', playerName: 'Tristan Stubbs', matchName: 'vs Westville Boys High (Final)', overNumber: 15, ballNumber: 4, bowlerName: 'L. Marais', bowlerType: 'RIGHT_ARM_SEAM', phase: 'MIDDLE', shotType: 'Pull Shot', angle: 240, distancePct: 95, runs: 4, isWicket: false, zoneInfo: calculateShotZone(240, 95), x: polarToSvg(240, 95).x, y: polarToSvg(240, 95).y, timestamp: '11:10 AM' },
  { id: 's-8', playerId: 'p-1', playerName: 'Tristan Stubbs', matchName: 'vs Westville Boys High (Final)', overNumber: 18, ballNumber: 3, bowlerName: 'S. Naidoo', bowlerType: 'LEFT_ARM_SEAM', phase: 'DEATH', shotType: 'Edge / Deflection', angle: 140, distancePct: 88, runs: 0, isWicket: true, wicketType: 'Caught Behind', zoneInfo: calculateShotZone(140, 88), x: polarToSvg(140, 88).x, y: polarToSvg(140, 88).y, timestamp: '11:22 AM' },
  { id: 's-9', playerId: 'p-1', playerName: 'Tristan Stubbs', matchName: 'vs Maritzburg College (League)', overNumber: 2, ballNumber: 1, bowlerName: 'D. Zondi', bowlerType: 'RIGHT_ARM_SEAM', phase: 'POWERPLAY', shotType: 'Flick', angle: 280, distancePct: 70, runs: 2, isWicket: false, zoneInfo: calculateShotZone(280, 70), x: polarToSvg(280, 70).x, y: polarToSvg(280, 70).y, timestamp: '02:05 PM' },
  { id: 's-10', playerId: 'p-1', playerName: 'Tristan Stubbs', matchName: 'vs Maritzburg College (League)', overNumber: 4, ballNumber: 4, bowlerName: 'D. Zondi', bowlerType: 'RIGHT_ARM_SEAM', phase: 'POWERPLAY', shotType: 'Cover Drive', angle: 40, distancePct: 92, runs: 4, isWicket: false, zoneInfo: calculateShotZone(40, 92), x: polarToSvg(40, 92).x, y: polarToSvg(40, 92).y, timestamp: '02:15 PM' },

  // Dewald Brevis shots
  { id: 's-11', playerId: 'p-2', playerName: 'Dewald Brevis', matchName: 'vs Michaelhouse (Festival)', overNumber: 1, ballNumber: 3, bowlerName: 'R. Evans', bowlerType: 'RIGHT_ARM_SEAM', phase: 'POWERPLAY', shotType: 'Straight Drive', angle: 0, distancePct: 100, runs: 6, isWicket: false, zoneInfo: calculateShotZone(0, 100), x: polarToSvg(0, 100).x, y: polarToSvg(0, 100).y, timestamp: '09:03 AM' },
  { id: 's-12', playerId: 'p-2', playerName: 'Dewald Brevis', matchName: 'vs Michaelhouse (Festival)', overNumber: 2, ballNumber: 5, bowlerName: 'R. Evans', bowlerType: 'RIGHT_ARM_SEAM', phase: 'POWERPLAY', shotType: 'Pull Shot', angle: 255, distancePct: 100, runs: 6, isWicket: false, zoneInfo: calculateShotZone(255, 100), x: polarToSvg(255, 100).x, y: polarToSvg(255, 100).y, timestamp: '09:10 AM' },
  { id: 's-13', playerId: 'p-2', playerName: 'Dewald Brevis', matchName: 'vs Michaelhouse (Festival)', overNumber: 3, ballNumber: 2, bowlerName: 'C. Botha', bowlerType: 'OFF_SPIN', phase: 'POWERPLAY', shotType: 'Lofted Drive', angle: 330, distancePct: 97, runs: 4, isWicket: false, zoneInfo: calculateShotZone(330, 97), x: polarToSvg(330, 97).x, y: polarToSvg(330, 97).y, timestamp: '09:14 AM' },
  { id: 's-14', playerId: 'p-2', playerName: 'Dewald Brevis', matchName: 'vs Michaelhouse (Festival)', overNumber: 5, ballNumber: 6, bowlerName: 'C. Botha', bowlerType: 'OFF_SPIN', phase: 'POWERPLAY', shotType: 'Square Cut', angle: 75, distancePct: 88, runs: 4, isWicket: false, zoneInfo: calculateShotZone(75, 88), x: polarToSvg(75, 88).x, y: polarToSvg(75, 88).y, timestamp: '09:25 AM' },
  { id: 's-15', playerId: 'p-2', playerName: 'Dewald Brevis', matchName: 'vs Michaelhouse (Festival)', overNumber: 9, ballNumber: 4, bowlerName: 'M. Adams', bowlerType: 'LEG_SPIN', phase: 'MIDDLE', shotType: 'Edge / Deflection', angle: 65, distancePct: 45, runs: 0, isWicket: true, wicketType: 'Caught Slip', zoneInfo: calculateShotZone(65, 45), x: polarToSvg(65, 45).x, y: polarToSvg(65, 45).y, timestamp: '09:40 AM' },
];

// Primary field sector angles definitions for heat arcs
const FIELD_SECTORS = [
  { code: 'LO', name: 'Long-Off / Straight', startAngle: 342, endAngle: 18, centerAngle: 0, color: '#6366f1' },
  { code: 'CO', name: 'Extra Cover', startAngle: 18, endAngle: 54, centerAngle: 36, color: '#0ea5e9' },
  { code: 'PT', name: 'Cover Point / Point', startAngle: 54, endAngle: 90, centerAngle: 72, color: '#06b6d4' },
  { code: 'GP', name: 'Gully / Backward Point', startAngle: 90, endAngle: 126, centerAngle: 108, color: '#3b82f6' },
  { code: 'TM', name: 'Third Man / Fly Slip', startAngle: 126, endAngle: 162, centerAngle: 144, color: '#8b5cf6' },
  { code: 'FL', name: 'Fine Leg / Behind Square', startAngle: 162, endAngle: 198, centerAngle: 180, color: '#ec4899' },
  { code: 'SL', name: 'Square Leg / Backward Square', startAngle: 198, endAngle: 234, centerAngle: 216, color: '#f43f5e' },
  { code: 'MW', name: 'Mid-Wicket / Cow Corner', startAngle: 234, endAngle: 270, centerAngle: 252, color: '#f59e0b' },
  { code: 'MO', name: 'Mid-On / Long-On', startAngle: 270, endAngle: 342, centerAngle: 306, color: '#10b981' },
];

export default function WagonWheelPage() {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('p-1');
  const [selectedMatch, setSelectedMatch] = useState<string>('ALL_MATCHES');
  const [selectedBowlerType, setSelectedBowlerType] = useState<string>('ALL');
  const [selectedPhase, setSelectedPhase] = useState<string>('ALL');
  const [selectedRunsFilter, setSelectedRunsFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'heatmap' | 'clusters' | 'sandbox'>('heatmap');
  
  const [shotsList, setShotsList] = useState<DetailedShotEvent[]>(INITIAL_SHOTS);
  const [activeShot, setActiveShot] = useState<DetailedShotEvent | null>(null);

  // Sandbox creation state
  const [sandboxRuns, setSandboxRuns] = useState<number>(4);
  const [sandboxShotType, setSandboxShotType] = useState<DetailedShotEvent['shotType']>('Cover Drive');
  const [sandboxBowlerType, setSandboxBowlerType] = useState<DetailedShotEvent['bowlerType']>('RIGHT_ARM_SEAM');

  const activePlayer = useMemo(() => {
    return MOCK_PLAYERS.find(p => p.id === selectedPlayerId) || MOCK_PLAYERS[0];
  }, [selectedPlayerId]);

  // Filtered Shots
  const filteredShots = useMemo(() => {
    return shotsList.filter(s => {
      const matchPlayer = s.playerId === selectedPlayerId;
      const matchFixture = selectedMatch === 'ALL_MATCHES' || s.matchName === selectedMatch;
      const matchBowler = selectedBowlerType === 'ALL' || s.bowlerType === selectedBowlerType;
      const matchPhase = selectedPhase === 'ALL' || s.phase === selectedPhase;
      
      let matchRuns = true;
      if (selectedRunsFilter === 'BOUNDARIES') matchRuns = s.runs >= 4;
      if (selectedRunsFilter === 'DOTS') matchRuns = s.runs === 0 && !s.isWicket;
      if (selectedRunsFilter === 'SINGLES_TWOS') matchRuns = s.runs === 1 || s.runs === 2 || s.runs === 3;
      if (selectedRunsFilter === 'WICKETS') matchRuns = s.isWicket;

      return matchPlayer && matchFixture && matchBowler && matchPhase && matchRuns;
    });
  }, [shotsList, selectedPlayerId, selectedMatch, selectedBowlerType, selectedPhase, selectedRunsFilter]);

  // Telemetry Aggregation
  const telemetrySummary = useMemo(() => {
    const totalShots = filteredShots.length;
    const totalRuns = filteredShots.reduce((sum, s) => sum + s.runs, 0);
    const boundaries = filteredShots.filter(s => s.runs >= 4).length;
    const dotBalls = filteredShots.filter(s => s.runs === 0 && !s.isWicket).length;
    const wickets = filteredShots.filter(s => s.isWicket).length;
    const boundaryPct = totalShots > 0 ? Math.round((boundaries / totalShots) * 100) : 0;
    const dotPct = totalShots > 0 ? Math.round((dotBalls / totalShots) * 100) : 0;

    // Sector distribution
    const sectorMap: Record<string, { runs: number; shots: number; boundaries: number }> = {};
    FIELD_SECTORS.forEach(sec => {
      sectorMap[sec.code] = { runs: 0, shots: 0, boundaries: 0 };
    });

    filteredShots.forEach(s => {
      const code = s.zoneInfo.zoneCode;
      if (sectorMap[code]) {
        sectorMap[code].runs += s.runs;
        sectorMap[code].shots += 1;
        if (s.runs >= 4) sectorMap[code].boundaries += 1;
      }
    });

    // Top dominant sector
    let topSectorCode = 'LO';
    let maxSectorRuns = -1;
    Object.entries(sectorMap).forEach(([code, data]) => {
      if (data.runs > maxSectorRuns) {
        maxSectorRuns = data.runs;
        topSectorCode = code;
      }
    });

    const topSectorObj = FIELD_SECTORS.find(s => s.code === topSectorCode) || FIELD_SECTORS[0];

    return {
      totalShots,
      totalRuns,
      boundaries,
      dotBalls,
      wickets,
      boundaryPct,
      dotPct,
      sectorMap,
      topSectorObj,
      maxSectorRuns
    };
  }, [filteredShots]);

  // Handle Tapping SVG in Sandbox mode
  const handleSandboxClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (viewMode !== 'sandbox') return;

    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 400;
    const y = ((e.clientY - rect.top) / rect.height) * 400;

    const dx = x - 200;
    const dy = y - 200;
    const distPx = Math.sqrt(dx * dx + dy * dy);
    const distancePct = Math.min(100, Math.round((distPx / 185) * 100));

    let angle = Math.atan2(dx, -dy) * (180 / Math.PI);
    if (angle < 0) angle += 360;
    const roundedAngle = Math.round(angle);

    const zoneInfo = calculateShotZone(roundedAngle, distancePct);

    const created: DetailedShotEvent = {
      id: `sandbox-${Date.now()}`,
      playerId: selectedPlayerId,
      playerName: activePlayer.name,
      matchName: selectedMatch === 'ALL_MATCHES' ? 'Live Training Session' : selectedMatch,
      overNumber: Math.floor(Math.random() * 20) + 1,
      ballNumber: Math.floor(Math.random() * 6) + 1,
      bowlerName: 'Coach Simulator',
      bowlerType: sandboxBowlerType,
      phase: 'MIDDLE',
      shotType: sandboxShotType,
      x: Math.round(x),
      y: Math.round(y),
      angle: roundedAngle,
      distancePct,
      runs: sandboxRuns,
      isWicket: sandboxRuns === -1,
      wicketType: sandboxRuns === -1 ? 'Bowled' : undefined,
      zoneInfo,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setShotsList(prev => [created, ...prev]);
    setActiveShot(created);
  };

  return (
    <div className="space-y-8 pb-24 max-w-7xl mx-auto p-4 md:p-8">
      {/* Strategic Header */}
      <div 
        className="relative p-8 md:p-10 rounded-[3rem] border overflow-hidden shadow-2xl"
        style={{ background: D.surf1, borderColor: D.border }}
      >
        <div className="absolute inset-0 opacity-10" style={{ background: D.gradLive }} />
        <div className="flex flex-col lg:flex-row items-center gap-8 relative z-10">
          <div 
            className="h-20 w-20 rounded-3xl flex items-center justify-center shadow-inner" 
            style={{ background: D.surf2, border: `1px solid ${D.border}` }}
          >
            <Compass className="h-10 w-10 text-emerald-400 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] italic text-emerald-400">
                CRICKET SPATIAL INTELLIGENCE
              </span>
              <Badge className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[9px] font-mono">
                360° POLAR RADIAL SYSTEM
              </Badge>
            </div>
            <h1 
              className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic leading-none text-white" 
              style={{ fontFamily: D.head }}
            >
              WAGON WHEEL <span className="text-emerald-400">& SHOT CLUSTERING</span>
            </h1>
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] mt-3 opacity-60 italic" style={{ color: D.textMuted }}>
              POLAR DENSITY HEATMAPS • BOUNDARY VECTOR ANALYSIS • PACE VS SPIN MATCHUPS • SCOUTING TELEMETRY
            </p>
          </div>

          <div className="lg:ml-auto grid grid-cols-2 md:grid-cols-4 gap-3 w-full lg:w-auto">
            <div className="p-3.5 rounded-2xl border bg-black/20 text-center" style={{ borderColor: D.border }}>
              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 block mb-1">TOTAL RUNS</span>
              <div className="text-xl font-black text-emerald-400 font-mono">{telemetrySummary.totalRuns}</div>
            </div>
            <div className="p-3.5 rounded-2xl border bg-black/20 text-center" style={{ borderColor: D.border }}>
              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 block mb-1">BOUNDARIES</span>
              <div className="text-xl font-black text-indigo-400 font-mono">{telemetrySummary.boundaries} ({telemetrySummary.boundaryPct}%)</div>
            </div>
            <div className="p-3.5 rounded-2xl border bg-black/20 text-center" style={{ borderColor: D.border }}>
              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 block mb-1">DOT BALLS</span>
              <div className="text-xl font-black text-amber-400 font-mono">{telemetrySummary.dotBalls} ({telemetrySummary.dotPct}%)</div>
            </div>
            <div className="p-3.5 rounded-2xl border bg-black/20 text-center" style={{ borderColor: D.border }}>
              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 block mb-1">HOT ZONE</span>
              <div className="text-xs font-black text-emerald-300 font-mono truncate max-w-[90px]">
                {telemetrySummary.topSectorObj.code} ({telemetrySummary.maxSectorRuns}r)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Control & Filtering Toolbar */}
      <div className="p-6 rounded-3xl border bg-black/30 space-y-4" style={{ borderColor: D.border }}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Player Picker */}
            <div className="flex items-center gap-2 bg-black border border-white/10 px-3 py-2 rounded-xl">
              <User className="w-4 h-4 text-emerald-400" />
              <select
                value={selectedPlayerId}
                onChange={e => setSelectedPlayerId(e.target.value)}
                className="bg-transparent text-xs font-bold text-white font-mono outline-none"
              >
                {MOCK_PLAYERS.map(p => (
                  <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                    {p.name} ({p.team})
                  </option>
                ))}
              </select>
            </div>

            {/* Match Picker */}
            <select
              value={selectedMatch}
              onChange={e => setSelectedMatch(e.target.value)}
              className="bg-black border border-white/10 px-3 py-2 rounded-xl text-xs font-mono text-white"
            >
              {MOCK_MATCHES.map((m, idx) => (
                <option key={idx} value={m} className="bg-slate-900 text-white">
                  {m === 'ALL_MATCHES' ? 'All Seasons & Fixtures' : m}
                </option>
              ))}
            </select>

            {/* Bowler Type Filter */}
            <select
              value={selectedBowlerType}
              onChange={e => setSelectedBowlerType(e.target.value)}
              className="bg-black border border-white/10 px-3 py-2 rounded-xl text-xs font-mono text-white"
            >
              <option value="ALL">All Bowling Types</option>
              <option value="RIGHT_ARM_SEAM">Right-Arm Fast / Seam</option>
              <option value="LEFT_ARM_SEAM">Left-Arm Fast / Seam</option>
              <option value="OFF_SPIN">Off-Spin / Finger Spin</option>
              <option value="LEG_SPIN">Leg-Spin / Wrist Spin</option>
            </select>

            {/* Phase Filter */}
            <select
              value={selectedPhase}
              onChange={e => setSelectedPhase(e.target.value)}
              className="bg-black border border-white/10 px-3 py-2 rounded-xl text-xs font-mono text-white"
            >
              <option value="ALL">All Match Phases</option>
              <option value="POWERPLAY">Powerplay (Overs 1-6)</option>
              <option value="MIDDLE">Middle Overs (Overs 7-15)</option>
              <option value="DEATH">Death Overs (Overs 16-20)</option>
            </select>

            {/* Runs Filter */}
            <select
              value={selectedRunsFilter}
              onChange={e => setSelectedRunsFilter(e.target.value)}
              className="bg-black border border-white/10 px-3 py-2 rounded-xl text-xs font-mono text-white"
            >
              <option value="ALL">All Runs Outcomes</option>
              <option value="BOUNDARIES">Boundaries Only (4s & 6s)</option>
              <option value="DOTS">Dot Balls Only (0s)</option>
              <option value="SINGLES_TWOS">Singles & Twos</option>
              <option value="WICKETS">Dismissal Vectors Only</option>
            </select>
          </div>

          {/* View Mode Selector */}
          <div className="flex items-center gap-1.5 p-1 bg-black rounded-xl border border-white/10">
            <button
              onClick={() => setViewMode('heatmap')}
              className={`px-4 py-2 rounded-lg text-xs font-bold font-mono transition-all ${
                viewMode === 'heatmap' ? 'bg-emerald-500 text-black shadow-lg' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Polar Heatmap
            </button>
            <button
              onClick={() => setViewMode('clusters')}
              className={`px-4 py-2 rounded-lg text-xs font-bold font-mono transition-all ${
                viewMode === 'clusters' ? 'bg-indigo-500 text-white shadow-lg' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Vector Clusters
            </button>
            <button
              onClick={() => setViewMode('sandbox')}
              className={`px-4 py-2 rounded-lg text-xs font-bold font-mono transition-all ${
                viewMode === 'sandbox' ? 'bg-amber-500 text-black shadow-lg' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Live Calibration Sandbox
            </button>
          </div>
        </div>
      </div>

      {/* Main Dual Grid: Canvas + Telemetry Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Col (7 Cols): SVG Field Canvas */}
        <div className="lg:col-span-7 p-8 rounded-[2.5rem] border space-y-6 shadow-2xl flex flex-col items-center justify-center relative" style={{ background: D.surf1, borderColor: D.border }}>
          <div className="w-full flex justify-between items-center border-b pb-4" style={{ borderColor: D.border }}>
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">
                {viewMode === 'heatmap' ? 'SECTOR DENSITY & RUN HEATMAP' : viewMode === 'clusters' ? 'BALL-BY-BALL SHOT VECTOR STREAM' : 'INTERACTIVE SHOT RECORDING'}
              </span>
              <h3 className="text-xl font-black uppercase italic text-white" style={{ fontFamily: D.head }}>
                {activePlayer.name} ({activePlayer.battingHand}-Handed)
              </h3>
            </div>
            <Badge className="bg-white/5 text-zinc-300 font-mono text-[9px]">
              {filteredShots.length} SHOTS LOADED
            </Badge>
          </div>

          {/* SVG Field Canvas */}
          <div className="relative group flex justify-center items-center py-4">
            <svg
              width="420"
              height="420"
              viewBox="0 0 400 400"
              className={`rounded-3xl bg-slate-950/90 border border-white/10 shadow-2xl transition-all ${
                viewMode === 'sandbox' ? 'cursor-crosshair hover:border-amber-500/50' : 'cursor-default'
              }`}
              onClick={handleSandboxClick}
            >
              {/* Outer Boundary Circle */}
              <circle cx="200" cy="200" r="185" fill="rgba(16, 185, 129, 0.04)" stroke="rgba(16, 185, 129, 0.3)" strokeWidth="2" />
              
              {/* Inner 30-Yard Ring */}
              <circle cx="200" cy="200" r="95" fill="none" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1.5" strokeDasharray="5 5" />
              
              {/* Pitch Area */}
              <rect x="193" y="170" width="14" height="60" fill="rgba(255, 255, 255, 0.12)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" rx="2" />

              {/* Sector Radial Lines & Heat Slice Overlays (Heatmap Mode) */}
              {FIELD_SECTORS.map((sec, i) => {
                const startRad = (sec.startAngle - 90) * (Math.PI / 180);
                const endRad = (sec.endAngle - 90) * (Math.PI / 180);
                const x1 = 200 + 185 * Math.cos(startRad);
                const y1 = 200 + 185 * Math.sin(startRad);

                const sectorData = telemetrySummary.sectorMap[sec.code] || { runs: 0, shots: 0 };
                const intensity = telemetrySummary.totalRuns > 0 ? (sectorData.runs / telemetrySummary.totalRuns) : 0;
                const fillOpacity = viewMode === 'heatmap' ? Math.min(0.5, intensity * 1.5 + 0.05) : 0.03;

                // Path for sector arc slice
                const x2 = 200 + 185 * Math.cos(endRad);
                const y2 = 200 + 185 * Math.sin(endRad);
                const largeArcFlag = (sec.endAngle - sec.startAngle + 360) % 360 > 180 ? 1 : 0;
                const pathD = `M 200 200 L ${x1} ${y1} A 185 185 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

                return (
                  <g key={sec.code}>
                    {/* Heat Arc Slice */}
                    <path 
                      d={pathD} 
                      fill={sec.color} 
                      opacity={fillOpacity}
                      className="transition-all duration-300 hover:opacity-40"
                    />

                    {/* Radial Sector Boundary Line */}
                    <line x1="200" y1="200" x2={x1} y2={y1} stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1" strokeDasharray="3 3" />
                  </g>
                );
              })}

              {/* Shot Vectors Lines & Circles */}
              {filteredShots.map((shot) => {
                const color = getRunColor(shot.runs, shot.isWicket);
                const isSelected = activeShot?.id === shot.id;

                return (
                  <g 
                    key={shot.id} 
                    onClick={(e) => { e.stopPropagation(); setActiveShot(shot); }}
                    className="cursor-pointer group/shot"
                  >
                    <line
                      x1="200"
                      y1="200"
                      x2={shot.x}
                      y2={shot.y}
                      stroke={color}
                      strokeWidth={isSelected ? "3" : shot.runs >= 4 ? "2" : "1.2"}
                      opacity={isSelected ? "1" : "0.6"}
                      strokeLinecap="round"
                    />
                    <circle
                      cx={shot.x}
                      cy={shot.y}
                      r={isSelected ? "7" : shot.runs >= 4 ? "5" : "3.5"}
                      fill={color}
                      stroke="#ffffff"
                      strokeWidth={isSelected ? "2" : "1"}
                    />
                  </g>
                );
              })}

              {/* Active Shot Pulse Ring */}
              {activeShot && (
                <circle 
                  cx={activeShot.x} 
                  cy={activeShot.y} 
                  r="12" 
                  fill="none" 
                  stroke={getRunColor(activeShot.runs, activeShot.isWicket)} 
                  strokeWidth="2" 
                  className="animate-ping" 
                />
              )}

              {/* Field Zone Directional Text Overlay */}
              <g fill="rgba(255,255,255,0.4)" fontSize="9" fontFamily="sans-serif" fontWeight="700" textAnchor="middle">
                <text x="200" y="30">LONG-OFF</text>
                <text x="200" y="380">LONG-ON</text>
                <text x="32" y="204">COVER</text>
                <text x="368" y="204">MID-WICKET</text>
              </g>
            </svg>
          </div>

          {/* Mode Legend & Click Telemetry Banner */}
          <div className="w-full flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-black/40 border border-white/10 text-xs font-mono">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-500" /> Dot</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> 1-3 Runs</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> 4 Boundary</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> 6 Six</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Wicket</span>
            </div>

            {viewMode === 'sandbox' && (
              <span className="text-amber-400 font-bold flex items-center gap-1">
                <Crosshair className="w-3.5 h-3.5" /> Tap field to record test shot vector
              </span>
            )}
          </div>

          {/* Active Shot Inspection Modal/Card */}
          {activeShot && (
            <div className="w-full p-4 rounded-2xl bg-slate-950 border border-emerald-500/30 flex items-center justify-between text-xs font-mono">
              <div>
                <span className="text-emerald-400 font-bold block">{activeShot.shotType} ({activeShot.runs} Runs)</span>
                <span className="text-zinc-400">Bowler: {activeShot.bowlerName} ({activeShot.bowlerType.replace('_', ' ')}) • Over {activeShot.overNumber}.{activeShot.ballNumber}</span>
              </div>
              <div className="text-right">
                <span className="text-white font-bold block">{activeShot.zoneInfo.zoneName}</span>
                <span className="text-zinc-500">{activeShot.angle}° Angle • {activeShot.distancePct}% Distance</span>
              </div>
            </div>
          )}

          {/* Sandbox Controls Bar (Only in Sandbox Mode) */}
          {viewMode === 'sandbox' && (
            <div className="w-full p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-4">
              <span className="text-[10px] font-black text-amber-300 uppercase tracking-widest block font-mono">SANDBOX CALIBRATION CONTROLS</span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-[9px] text-zinc-400 font-mono block mb-1">Outcome Runs</label>
                  <select
                    value={sandboxRuns}
                    onChange={e => setSandboxRuns(parseInt(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-black border border-white/10 text-xs text-white font-mono"
                  >
                    <option value={0}>0 (Dot Ball)</option>
                    <option value={1}>1 Run</option>
                    <option value={2}>2 Runs</option>
                    <option value={3}>3 Runs</option>
                    <option value={4}>4 (Boundary)</option>
                    <option value={6}>6 (Six)</option>
                    <option value={-1}>Wicket Dismissal</option>
                  </select>
                </div>
                <div>
                  <label className="text-[9px] text-zinc-400 font-mono block mb-1">Shot Execution</label>
                  <select
                    value={sandboxShotType}
                    onChange={e => setSandboxShotType(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-black border border-white/10 text-xs text-white font-mono"
                  >
                    <option value="Cover Drive">Cover Drive</option>
                    <option value="Pull Shot">Pull Shot</option>
                    <option value="Straight Drive">Straight Drive</option>
                    <option value="Square Cut">Square Cut</option>
                    <option value="Flick">Flick</option>
                    <option value="Sweep">Sweep</option>
                    <option value="Lofted Drive">Lofted Drive</option>
                  </select>
                </div>
                <div>
                  <label className="text-[9px] text-zinc-400 font-mono block mb-1">Bowler Type</label>
                  <select
                    value={sandboxBowlerType}
                    onChange={e => setSandboxBowlerType(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-black border border-white/10 text-xs text-white font-mono"
                  >
                    <option value="RIGHT_ARM_SEAM">Right-Arm Fast</option>
                    <option value="LEFT_ARM_SEAM">Left-Arm Fast</option>
                    <option value="OFF_SPIN">Off-Spin</option>
                    <option value="LEG_SPIN">Leg-Spin</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Col (5 Cols): Sector Metrics & Scouting Insights */}
        <div className="lg:col-span-5 space-y-6">
          {/* Sector Breakdown Grid */}
          <div className="p-6 rounded-[2.5rem] border space-y-6 shadow-2xl" style={{ background: D.surf1, borderColor: D.border }}>
            <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: D.border }}>
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400">POLAR SECTOR DISTRIBUTION</span>
                <h4 className="text-lg font-black uppercase italic text-white" style={{ fontFamily: D.head }}>
                  SCORING ZONE BREAKDOWN
                </h4>
              </div>
              <Flame className="w-5 h-5 text-amber-400" />
            </div>

            <div className="space-y-3">
              {FIELD_SECTORS.map((sec) => {
                const data = telemetrySummary.sectorMap[sec.code] || { runs: 0, shots: 0, boundaries: 0 };
                const pct = telemetrySummary.totalRuns > 0 ? Math.round((data.runs / telemetrySummary.totalRuns) * 100) : 0;

                return (
                  <div key={sec.code} className="p-3.5 rounded-2xl bg-black/20 border border-white/5 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: sec.color }} />
                        <span className="font-bold text-white">{sec.name}</span>
                      </div>
                      <span className="font-mono font-black text-emerald-400">{data.runs} runs ({pct}%)</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-1.5 w-full rounded-full bg-black/50 overflow-hidden">
                      <div 
                        className="h-full transition-all duration-500" 
                        style={{ width: `${pct}%`, backgroundColor: sec.color }} 
                      />
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-zinc-400 font-mono">
                      <span>{data.shots} Shots Recorded</span>
                      <span>{data.boundaries} Boundaries (4s/6s)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tactical Scouting Insights Card */}
          <div className="p-6 rounded-[2.5rem] border space-y-4 shadow-2xl" style={{ background: D.surf1, borderColor: D.border }}>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono uppercase tracking-wider">
              <Sparkles className="w-4 h-4" /> Tactical Intelligence & Matchup Notes
            </div>

            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-zinc-300 leading-relaxed space-y-2">
              <p className="font-bold text-emerald-300">Strongest Scoring Arc:</p>
              <p>
                {activePlayer.name} scores <strong className="text-white">68% of boundary runs</strong> through the arc between <span className="text-emerald-400">Cover Point (72°)</span> and <span className="text-emerald-400">Long-Off (0°)</span> when facing Right-Arm Fast bowling.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-zinc-300 leading-relaxed space-y-2">
              <p className="font-bold text-rose-300">Dismissal Vector Pattern:</p>
              <p>
                High vulnerability identified on wide outside-off deliveries against Leg-Spin; 2 of 3 recent dismissals were caught at backward point off late cuts.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <Button variant="outline" className="text-xs font-mono border-white/10 gap-2">
                <Download className="w-4 h-4" /> Export Telemetry JSON
              </Button>
              <Button className="bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold gap-2">
                <Award className="w-4 h-4" /> Sync to Coach Dossier
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
