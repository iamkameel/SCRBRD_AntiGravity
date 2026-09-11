"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { D } from '@/lib/design-system';
import { 
  Users, 
  ArrowLeftRight, 
  Trophy, 
  Zap, 
  Brain, 
  Shield, 
  Target,
  ChevronRight,
  TrendingUp,
  Sparkles,
  Printer,
  Check,
  AlertCircle,
  Swords,
  Award
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  MOCK_CAREER_PROFILES, 
  PlayerCareerProfile, 
  calculateRoleSuitability, 
  generateH2HInsight 
} from '@/lib/intelligence/playerHistoryEngine';

export function PlayerComparisonCockpit() {
  const [playerAId, setPlayerAId] = useState<string>('player-1');
  const [playerBId, setPlayerBId] = useState<string>('player-2');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('Opener');

  const playerA = MOCK_CAREER_PROFILES[playerAId] || MOCK_CAREER_PROFILES['player-1'];
  const playerB = MOCK_CAREER_PROFILES[playerBId] || MOCK_CAREER_PROFILES['player-2'];

  const latestA = playerA.skillProgression[playerA.skillProgression.length - 1];
  const latestB = playerB.skillProgression[playerB.skillProgression.length - 1];

  const categories = [
    { key: 'batting', label: 'Batting' },
    { key: 'bowling', label: 'Bowling' },
    { key: 'fielding', label: 'Fielding' },
    { key: 'wicketkeeping', label: 'Keeper' },
    { key: 'physical', label: 'Physical' },
    { key: 'mental', label: 'Mental' },
    { key: 'tactical', label: 'Tactical' },
  ];

  // SVG Radar Dimensions
  const size = 340;
  const center = size / 2;
  const radius = center - 45;

  const getPoint = (score: number, index: number, total: number) => {
    const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
    const r = (score / 100) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle)
    };
  };

  const generatePath = (domains: Record<string, number>) => {
    const points = categories.map((cat, i) => getPoint(domains[cat.key] || 0, i, categories.length));
    return `M ${points[0].x} ${points[0].y} ` + 
           points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ') + 
           ' Z';
  };

  const roleSuitabilityA = calculateRoleSuitability(selectedRoleFilter, latestA.domains);
  const roleSuitabilityB = calculateRoleSuitability(selectedRoleFilter, latestB.domains);

  const coachInsightText = generateH2HInsight(playerA, playerB);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      {/* Cockpit Header & Player Roster Selectors */}
      <Card className="bg-black/60 border-white/10 backdrop-blur-2xl rounded-[2.5rem] p-8 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-lg shadow-primary/10">
              <Swords className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-black text-white tracking-tighter uppercase" style={{ fontFamily: D.syne }}>
                  HEAD-TO-HEAD <span className="text-primary italic">COMPARISON COCKPIT</span>
                </h1>
                <Badge className="bg-primary/10 text-primary border-primary/20 font-black text-[10px] px-3">
                  PRO ANALYST
                </Badge>
              </div>
              <p className="text-xs text-white/50 mt-1">
                Cross-player domain radar, multi-season statistical runways, and role suitability analytics
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs uppercase tracking-wider transition-all"
            >
              <Printer className="w-4 h-4 text-primary" />
              Export PDF Brief
            </button>
          </div>
        </div>

        {/* Dual Selector Header */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          {/* Player A Selector */}
          <div className="p-5 bg-white/[0.02] border border-white/10 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-primary uppercase tracking-widest">PLAYER A SELECTION</span>
              <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] font-black uppercase">
                {playerA.currentTeam}
              </Badge>
            </div>

            <select
              value={playerAId}
              onChange={(e) => setPlayerAId(e.target.value)}
              className="w-full bg-black/80 border border-white/20 rounded-xl px-4 py-3 text-white font-bold text-sm focus:outline-none focus:border-primary"
            >
              {Object.values(MOCK_CAREER_PROFILES).map((p) => (
                <option key={p.id} value={p.id} disabled={p.id === playerBId}>
                  {p.displayName} ({p.schoolName} - {p.primaryRole})
                </option>
              ))}
            </select>

            <div className="flex items-center justify-between text-xs pt-2">
              <span className="text-white/40">Readiness State</span>
              <span className="font-bold text-emerald-400">{playerA.readinessScore}% - {playerA.readinessStatus}</span>
            </div>
          </div>

          {/* Player B Selector */}
          <div className="p-5 bg-white/[0.02] border border-white/10 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">PLAYER B SELECTION</span>
              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[9px] font-black uppercase">
                {playerB.currentTeam}
              </Badge>
            </div>

            <select
              value={playerBId}
              onChange={(e) => setPlayerBId(e.target.value)}
              className="w-full bg-black/80 border border-white/20 rounded-xl px-4 py-3 text-white font-bold text-sm focus:outline-none focus:border-emerald-500"
            >
              {Object.values(MOCK_CAREER_PROFILES).map((p) => (
                <option key={p.id} value={p.id} disabled={p.id === playerAId}>
                  {p.displayName} ({p.schoolName} - {p.primaryRole})
                </option>
              ))}
            </select>

            <div className="flex items-center justify-between text-xs pt-2">
              <span className="text-white/40">Readiness State</span>
              <span className="font-bold text-emerald-400">{playerB.readinessScore}% - {playerB.readinessStatus}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Main Comparison Section: 7-Domain Radar & H2H Performance Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* 7-Domain SVG Radar Visualization */}
        <Card className="lg:col-span-6 bg-black/60 border-white/10 backdrop-blur-2xl rounded-[2.5rem] p-8 shadow-2xl flex flex-col items-center justify-center min-h-[480px]">
          <div className="w-full flex items-center justify-between mb-4">
            <h3 className="text-base font-black text-white uppercase tracking-tight" style={{ fontFamily: D.syne }}>
              7-DOMAIN SKILL <span className="text-primary italic">RADAR OVERLAY</span>
            </h3>
            <Badge className="bg-white/5 text-white/50 border-white/10 uppercase font-black text-[9px]">
              0–100 NORMALISED SCALE
            </Badge>
          </div>

          <div className="relative">
            <svg width={size} height={size} className="overflow-visible">
              {/* Background Concentric Circles */}
              {[0.25, 0.5, 0.75, 1].map((step) => (
                <circle 
                  key={step} cx={center} cy={center} r={radius * step}
                  className="fill-none stroke-white/10 stroke-[1px]"
                />
              ))}

              {/* Radial Spoke Lines */}
              {categories.map((_, i) => {
                const p = getPoint(100, i, categories.length);
                return (
                  <line 
                    key={i} x1={center} y1={center} x2={p.x} y2={p.y}
                    className="stroke-white/10 stroke-[1px]"
                  />
                );
              })}

              {/* Player B Path */}
              <motion.path 
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 0.45, scale: 1 }}
                d={generatePath(latestB.domains)}
                className="fill-emerald-500/25 stroke-emerald-400 stroke-[2.5px]"
              />

              {/* Player A Path */}
              <motion.path 
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 0.55, scale: 1 }}
                d={generatePath(latestA.domains)}
                className="fill-primary/25 stroke-primary stroke-[3px]"
              />

              {/* Category Labels */}
              {categories.map((cat, i) => {
                const p = getPoint(118, i, categories.length);
                return (
                  <text 
                    key={i} x={p.x} y={p.y} 
                    className="text-[10px] font-black fill-white/60 uppercase tracking-widest"
                    textAnchor="middle"
                    alignmentBaseline="middle"
                  >
                    {cat.label}
                  </text>
                );
              })}
            </svg>
          </div>

          {/* Radar Legend */}
          <div className="flex items-center gap-8 mt-8 bg-white/[0.02] border border-white/5 px-6 py-3 rounded-full">
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-full bg-primary shadow-sm shadow-primary/50" />
              <span className="text-xs font-black text-white uppercase">{playerA.displayName} ({latestA.compositeIndex})</span>
            </div>
            <div className="w-px h-4 bg-white/10" />
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
              <span className="text-xs font-black text-white uppercase">{playerB.displayName} ({latestB.compositeIndex})</span>
            </div>
          </div>
        </Card>

        {/* Head-to-Head Domain Comparison Bars */}
        <Card className="lg:col-span-6 bg-black/60 border-white/10 backdrop-blur-2xl rounded-[2.5rem] p-8 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-black text-white uppercase tracking-tight" style={{ fontFamily: D.syne }}>
                DOMAIN SCORE <span className="text-primary italic">HEAD-TO-HEAD</span>
              </h3>
              <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[9px] font-black uppercase">
                7 DOMAINS
              </Badge>
            </div>

            <div className="space-y-4">
              {categories.map((cat) => {
                const valA = latestA.domains[cat.key as keyof typeof latestA.domains] || 0;
                const valB = latestB.domains[cat.key as keyof typeof latestB.domains] || 0;
                const total = valA + valB || 1;
                const pctA = (valA / total) * 100;

                return (
                  <div key={cat.key} className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider">
                      <span className={valA > valB ? 'text-primary' : 'text-white/40'}>{valA} pts</span>
                      <span className="text-white/60">{cat.label}</span>
                      <span className={valB > valA ? 'text-emerald-400' : 'text-white/40'}>{valB} pts</span>
                    </div>

                    <div className="h-2 w-full flex gap-1 rounded-full overflow-hidden bg-white/5">
                      <div className="flex-1 bg-white/5 rounded-l-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }} animate={{ width: `${pctA}%` }}
                          className={`h-full ${valA >= valB ? 'bg-primary' : 'bg-primary/40'} float-right rounded-l-full`}
                        />
                      </div>
                      <div className="flex-1 bg-white/5 rounded-r-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }} animate={{ width: `${100 - pctA}%` }}
                          className={`h-full ${valB >= valA ? 'bg-emerald-400' : 'bg-emerald-400/40'} rounded-r-full`}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Coach Decision Insight Box */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">COACH DECISION INSIGHT</span>
            </div>
            <div className="p-4 bg-primary/10 border border-primary/20 rounded-2xl">
              <p className="text-xs text-white/80 font-medium leading-relaxed">
                {coachInsightText}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Role Suitability Comparison Section */}
      <Card className="bg-black/60 border-white/10 backdrop-blur-2xl rounded-[2.5rem] p-8 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-black text-white uppercase tracking-tight" style={{ fontFamily: D.syne }}>
              ROLE ARCHETYPE <span className="text-primary italic">SUITABILITY ANALYSIS</span>
            </h3>
            <p className="text-xs text-white/40">Weighted domain fit calculation according to SCRBRD OS Role Archetypes</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {['Opener', 'Top-order Anchor', 'Death Bowler', 'Bowling All-Rounder', 'Wicketkeeper-Batter'].map((role) => (
              <button
                key={role}
                onClick={() => setSelectedRoleFilter(role)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                  selectedRoleFilter === role
                    ? 'bg-primary text-black shadow-lg shadow-primary/20'
                    : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          {/* Player A Role Fit Card */}
          <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-black text-white uppercase">{playerA.displayName}</span>
                <p className="text-xs text-primary font-medium">{selectedRoleFilter} Fit Index</p>
              </div>
              <div className="text-right">
                <span className="text-3xl font-black text-primary" style={{ fontFamily: D.syne }}>
                  {roleSuitabilityA}
                </span>
                <span className="text-xs font-bold text-white/40 block">/ 100</span>
              </div>
            </div>

            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: `${roleSuitabilityA}%` }} />
            </div>

            <p className="text-xs text-white/50 leading-relaxed">
              {roleSuitabilityA >= 80 
                ? 'High suitability profile for this role. Demonstrates key attribute benchmarks.' 
                : 'Moderate suitability. May require targeted drill interventions.'}
            </p>
          </div>

          {/* Player B Role Fit Card */}
          <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-black text-white uppercase">{playerB.displayName}</span>
                <p className="text-xs text-emerald-400 font-medium">{selectedRoleFilter} Fit Index</p>
              </div>
              <div className="text-right">
                <span className="text-3xl font-black text-emerald-400" style={{ fontFamily: D.syne }}>
                  {roleSuitabilityB}
                </span>
                <span className="text-xs font-bold text-white/40 block">/ 100</span>
              </div>
            </div>

            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${roleSuitabilityB}%` }} />
            </div>

            <p className="text-xs text-white/50 leading-relaxed">
              {roleSuitabilityB >= 80 
                ? 'High suitability profile for this role. Demonstrates key attribute benchmarks.' 
                : 'Moderate suitability. May require targeted drill interventions.'}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
