"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  D 
} from "@/lib/design-system";
import { 
  SectionHeader 
} from "@/components/ui/SectionHeader";
import { 
  MetricCard 
} from "@/components/dashboard/MetricCard";
import { 
  Badge 
} from "@/components/ui/badge";
import { 
  Button 
} from "@/components/ui/button";
import { 
  Sliders, 
  Scale, 
  ShieldCheck, 
  AlertTriangle, 
  UserCheck, 
  CheckCircle2, 
  TrendingUp, 
  Info, 
  RefreshCw,
  Users,
  ChevronRight,
  Brain,
  Zap
} from 'lucide-react';
import { 
  MOCK_PLAYER_RATINGS, 
  MOCK_COACH_RATERS, 
  PlayerCalibrationProfile, 
  DomainCalibrationResult 
} from "@/lib/intelligence/calibrationEngine";
import { toast } from "sonner";

export function MultiRaterCalibrationView() {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('1');
  const [isCalibrating, setIsCalibrating] = useState<boolean>(false);
  const [activeDomainFilter, setActiveDomainFilter] = useState<string>('ALL');

  const currentProfile: PlayerCalibrationProfile = MOCK_PLAYER_RATINGS[selectedPlayerId] || MOCK_PLAYER_RATINGS['1'];

  const handleRunCalibration = () => {
    setIsCalibrating(true);
    setTimeout(() => {
      setIsCalibrating(false);
      toast.success(`Multi-Rater Calibration algorithm re-aligned for ${currentProfile.playerName}! Consensus confidence recalculated.`, {
        icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />
      });
    }, 900);
  };

  const domainFilterOptions = ['ALL', 'Physical', 'Mental', 'Tactical', 'Batting', 'Bowling', 'Fielding', 'Wicketkeeping'];

  const filteredDomains = currentProfile.domainResults.filter(
    (d) => activeDomainFilter === 'ALL' || d.domain === activeDomainFilter
  );

  return (
    <div className="space-y-8 pb-20">
      {/* Header & Prospect Selector */}
      <SectionHeader 
        title="Multi-Rater Coach Calibration"
        sub="Algorithmic normalization & bias removal across multi-coach assessments."
        icon={<Scale className="w-5 h-5 text-indigo-400" />}
        actions={
          <div className="flex flex-wrap items-center gap-3">
            {/* Prospect Dropdown */}
            <div className="relative">
              <select
                value={selectedPlayerId}
                onChange={(e) => setSelectedPlayerId(e.target.value)}
                className="h-11 px-4 pr-9 rounded-xl bg-white/[0.03] border border-white/10 text-white font-bold text-xs uppercase tracking-wider outline-none focus:border-indigo-500/50 appearance-none cursor-pointer"
                style={{ fontFamily: D.sans, background: D.surf1 }}
              >
                <option value="1" className="bg-slate-900 text-white">James Anderson (Fast Bowler)</option>
                <option value="2" className="bg-slate-900 text-white">Liam Smith (Opening Batter)</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                <ChevronRight className="w-4 h-4 rotate-90" />
              </div>
            </div>

            {/* Run Calibration Button */}
            <Button
              onClick={handleRunCalibration}
              disabled={isCalibrating}
              className="h-11 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-500/20"
              style={{ background: D.indigo, color: 'white' }}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isCalibrating ? 'animate-spin' : ''}`} />
              {isCalibrating ? 'RE-CALIBRATING...' : 'RE-RUN CALIBRATION'}
            </Button>
          </div>
        }
      />

      {/* Prospect Identity Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-3xl border relative overflow-hidden shadow-2xl"
        style={{ background: D.surf1, borderColor: D.border }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black italic uppercase tracking-tight text-white" style={{ fontFamily: D.head }}>
                {currentProfile.playerName}
              </h2>
              <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 uppercase text-[10px] tracking-widest font-mono">
                {currentProfile.scoutGrade} GRADE
              </Badge>
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 uppercase text-[10px] tracking-widest font-mono">
                {currentProfile.potential} POTENTIAL
              </Badge>
            </div>
            <p className="text-xs text-white/50 uppercase font-mono tracking-wider">
              {currentProfile.roleArchetype} • {currentProfile.school} • {currentProfile.age} YEARS OLD
            </p>
          </div>

          <div className="flex items-center gap-4 border-t md:border-t-0 pt-4 md:pt-0 border-white/5">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-white/40 block tracking-widest">RAW COACH AVG</span>
              <span className="text-2xl font-black font-mono text-white/80">{currentProfile.overallRawAvg} / 9.0</span>
            </div>
            <div className="h-10 w-px bg-white/10" />
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-indigo-400 block tracking-widest">CALIBRATED INDEX</span>
              <span className="text-3xl font-black font-mono text-emerald-400">{currentProfile.overallCalibratedScore}%</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Strategic Calibration Metrics HUD */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          label="CALIBRATED INDEX" 
          value={`${currentProfile.overallCalibratedScore}%`} 
          subtitle="BIAS-ADJUSTED RATING" 
          icon={ShieldCheck} 
          color={D.emerald} 
        />
        <MetricCard 
          label="CONSENSUS CONFIDENCE" 
          value={`${currentProfile.consensusConfidenceScore}%`} 
          subtitle="RATER VARIANCE LOW" 
          icon={UserCheck} 
          color={D.indigo} 
        />
        <MetricCard 
          label="ACTIVE RATERS" 
          value={`${currentProfile.totalRaters}`} 
          subtitle="COACHES & SCOUTS" 
          icon={Users} 
          color={D.sky} 
        />
        <MetricCard 
          label="FLAGGED DOMAINS" 
          value={`${currentProfile.flaggedDomainsCount}`} 
          subtitle={currentProfile.flaggedDomainsCount > 0 ? "CONSENSUS REVIEW NEEDED" : "ALL DOMAINS ALIGNED"} 
          icon={AlertTriangle} 
          color={currentProfile.flaggedDomainsCount > 0 ? D.rose : D.emerald} 
        />
      </div>

      {/* Domain Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {domainFilterOptions.map((domain) => (
          <button
            key={domain}
            onClick={() => setActiveDomainFilter(domain)}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
              activeDomainFilter === domain 
                ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25' 
                : 'bg-white/[0.03] text-white/50 hover:bg-white/[0.06] hover:text-white border border-white/5'
            }`}
            style={{ fontFamily: D.sans }}
          >
            {domain}
          </button>
        ))}
      </div>

      {/* Domain Calibration Cards */}
      <div className="space-y-6">
        <SectionHeader 
          title="7-Domain Multi-Rater Breakdown"
          sub="Comparison of raw coach inputs vs normalized calibrated ratings."
          color={D.indigo}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredDomains.map((d: DomainCalibrationResult, idx: number) => (
            <motion.div
              key={d.domain}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="p-6 rounded-3xl border relative overflow-hidden shadow-xl space-y-6"
              style={{ background: D.surf1, borderColor: d.flaggedForConsensus ? `${D.rose}60` : D.border }}
            >
              {/* Card Top */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black italic uppercase tracking-wider text-white" style={{ fontFamily: D.head }}>
                      {d.domain} DOMAIN
                    </h3>
                    {d.flaggedForConsensus && (
                      <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/30 uppercase text-[9px] tracking-widest font-mono">
                        FLAGGED FOR REVIEW
                      </Badge>
                    )}
                  </div>
                  <p className="text-[10px] text-white/40 font-mono uppercase tracking-widest mt-1">
                    VARIANCE: {d.raterVariance} • CONFIDENCE: {d.confidenceLevel}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-2xl font-black font-mono text-emerald-400">{d.calibratedScore}%</span>
                  <span className="block text-[9px] text-white/40 uppercase font-mono tracking-widest">CALIBRATED</span>
                </div>
              </div>

              {/* Rater Comparison Bars */}
              <div className="space-y-4 pt-2">
                <span className="text-[10px] font-black uppercase text-white/40 tracking-widest block">INDIVIDUAL COACH RATINGS (1-9 SCALE)</span>
                
                {MOCK_COACH_RATERS.map((rater) => {
                  const score = d.coachScores[rater.id];
                  if (score === undefined) return null;

                  const normalizedScorePercent = Math.round(((score - 1) / 8) * 100);

                  return (
                    <div key={rater.id} className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white/90">{rater.name}</span>
                          <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                            rater.biasDelta > 0 
                              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30' 
                              : rater.biasDelta < 0 
                              ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30' 
                              : 'bg-white/10 text-white/60'
                          }`}>
                            {rater.biasDelta > 0 ? `+${rater.biasDelta} Lenient` : `${rater.biasDelta} Strict`}
                          </span>
                        </div>
                        <span className="font-mono font-bold text-white">{score.toFixed(1)} / 9.0</span>
                      </div>

                      <div className="h-2 rounded-full overflow-hidden bg-white/5 relative">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${normalizedScorePercent}%` }}
                          transition={{ duration: 0.8 }}
                          className="h-full rounded-full"
                          style={{
                            background: score >= 8 ? D.emerald : score >= 6 ? D.indigo : D.amber
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Calibrated Alignment Bar */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-indigo-300 uppercase tracking-wider text-[10px]">CONSENSUS CALIBRATED OUTPUT</span>
                  <span className="font-mono font-bold text-emerald-400">{d.calibratedScore}%</span>
                </div>
                <div className="h-2.5 rounded-full overflow-hidden bg-white/10 relative">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${d.calibratedScore}%` }}
                    transition={{ duration: 1 }}
                    className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Coach Rater Bias & Reliability Matrix */}
      <div className="space-y-6">
        <SectionHeader 
          title="Coach Rater Bias & Reliability Matrix"
          sub="Historical scoring tendencies and evaluation metrics for school coaches."
          icon={<Brain className="w-5 h-5 text-indigo-400" />}
          color={D.indigo}
        />

        <div className="p-6 rounded-3xl border overflow-hidden shadow-2xl" style={{ background: D.surf1, borderColor: D.border }}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-[10px] font-black uppercase text-white/40 tracking-widest">
                  <th className="p-4">COACH / RATER</th>
                  <th className="p-4">SPECIALIST ROLE</th>
                  <th className="p-4">INSTITUTION</th>
                  <th className="p-4 text-center">BIAS PROFILE</th>
                  <th className="p-4 text-center">ASSESSMENTS</th>
                  <th className="p-4 text-right">RELIABILITY INDEX</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {MOCK_COACH_RATERS.map((rater) => (
                  <tr key={rater.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 font-bold text-white">{rater.name}</td>
                    <td className="p-4 text-white/70 font-mono">{rater.role}</td>
                    <td className="p-4 text-white/50 font-mono text-[10px]">{rater.school}</td>
                    <td className="p-4 text-center">
                      <Badge className={`font-mono text-[10px] uppercase ${
                        rater.biasDelta > 0 
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' 
                          : rater.biasDelta < 0 
                          ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' 
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      }`}>
                        {rater.biasDelta > 0 ? `+${rater.biasDelta} Lenient` : rater.biasDelta < 0 ? `${rater.biasDelta} Strict` : 'Balanced'}
                      </Badge>
                    </td>
                    <td className="p-4 text-center font-mono font-bold text-white/80">{rater.assessmentsSubmitted}</td>
                    <td className="p-4 text-right font-mono font-bold text-emerald-400">{rater.reliabilityScore}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
