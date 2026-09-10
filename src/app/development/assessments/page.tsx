'use client';

import React, { useState } from 'react';
import { Award, Brain, Dumbbell, Target, Shield, Zap, Save, CheckCircle2, ChevronRight } from 'lucide-react';

type SkillDomain = 'Batting' | 'Bowling' | 'Fielding' | 'Wicketkeeping' | 'Physical' | 'Mental' | 'Tactical';

interface AttributeEvaluation {
  id: string;
  domain: SkillDomain;
  name: string;
  description: string;
  score: number; // 1-9 scale
  notes: string;
}

const INITIAL_ATTRIBUTES: AttributeEvaluation[] = [
  // Batting
  { id: 'bat_def', domain: 'Batting', name: 'Defensive Technique', description: 'Solid stance, head over ball, soft hands under pressure', score: 5, notes: '' },
  { id: 'bat_rot', domain: 'Batting', name: 'Strike Rotation', description: 'Gap awareness, turning dots into singles', score: 5, notes: '' },
  { id: 'bat_bnd', domain: 'Batting', name: 'Boundary Hitting', description: 'Power execution, clear intent against length', score: 5, notes: '' },
  { id: 'bat_spin', domain: 'Batting', name: 'Playing Spin', description: 'Footwork forward/back, reading drift and spin', score: 5, notes: '' },
  
  // Bowling
  { id: 'bwl_ctrl', domain: 'Bowling', name: 'Line & Length Control', description: 'Repeatability of seam placement under pressure', score: 5, notes: '' },
  { id: 'bwl_var', domain: 'Bowling', name: 'Variation Quality', description: 'Execution of slower balls, yorkers, or arm balls', score: 5, notes: '' },
  { id: 'bwl_dth', domain: 'Bowling', name: 'Death Over Execution', description: 'Composure and plan execution in overs 16-20', score: 5, notes: '' },

  // Fielding
  { id: 'fld_ctch', domain: 'Bowling', name: 'High & Slip Catching', description: 'Clean collection, hand position, boundary tracking', score: 5, notes: '' },
  { id: 'fld_gnd', domain: 'Fielding', name: 'Ground Fielding & Throw', description: 'Pick up & release speed, throw accuracy to keeper', score: 5, notes: '' },

  // Wicketkeeping
  { id: 'wkp_gloves', domain: 'Wicketkeeping', name: 'Glovework & Takes', description: 'Clean gathers standing up to spin and seam', score: 5, notes: '' },
  { id: 'wkp_stump', domain: 'Wicketkeeping', name: 'Stumping Speed', description: 'Reaction time and gather-to-bails execution', score: 5, notes: '' },

  // Physical
  { id: 'phy_spd', domain: 'Physical', name: 'Speed & Acceleration', description: 'Between-the-wickets acceleration and boundary pursuit', score: 5, notes: '' },
  { id: 'phy_end', domain: 'Physical', name: 'Workload Endurance', description: 'Performance maintenance during long spells / innings', score: 5, notes: '' },

  // Mental
  { id: 'men_cmp', domain: 'Mental', name: 'Composure under Pressure', description: 'Settles others and maintains execution when behind', score: 5, notes: '' },
  { id: 'men_res', domain: 'Mental', name: 'Resilience after Error', description: 'Pre-ball reset routine after dropping catch or dot ball', score: 5, notes: '' },

  // Tactical
  { id: 'tac_mth', domain: 'Tactical', name: 'Match Awareness & Options', description: 'Reading field placements, phase-specific risk choices', score: 5, notes: '' },
];

export default function SkillAssessmentPage() {
  const [selectedPlayer, setSelectedPlayer] = useState('player-1');
  const [activeDomain, setActiveDomain] = useState<SkillDomain>('Batting');
  const [evaluations, setEvaluations] = useState<AttributeEvaluation[]>(INITIAL_ATTRIBUTES);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const players = [
    { id: 'player-1', name: 'Kameel Kalyan', role: 'Opener / Batter', team: '1st XI' },
    { id: 'player-2', name: 'Liam Botha', role: 'New-ball Seamer', team: '1st XI' },
    { id: 'player-3', name: 'Thabo Mokoena', role: 'Wicketkeeper-Batter', team: '1st XI' },
    { id: 'player-4', name: 'Ethan van Zyl', role: 'Wrist Spinner', team: 'Under 15A' },
  ];

  const domainIcons: Record<SkillDomain, React.ReactNode> = {
    Batting: <Zap className="w-4 h-4 text-amber-400" />,
    Bowling: <Target className="w-4 h-4 text-blue-400" />,
    Fielding: <Shield className="w-4 h-4 text-emerald-400" />,
    Wicketkeeping: <Award className="w-4 h-4 text-purple-400" />,
    Physical: <Dumbbell className="w-4 h-4 text-rose-400" />,
    Mental: <Brain className="w-4 h-4 text-indigo-400" />,
    Tactical: <ChevronRight className="w-4 h-4 text-cyan-400" />,
  };

  const handleScoreChange = (id: string, newScore: number) => {
    setEvaluations((prev) =>
      prev.map((attr) => (attr.id === id ? { ...attr, score: newScore } : attr))
    );
  };

  const handleNotesChange = (id: string, notes: string) => {
    setEvaluations((prev) =>
      prev.map((attr) => (attr.id === id ? { ...attr, notes } : attr))
    );
  };

  const currentDomainAttributes = evaluations.filter((a) => a.domain === activeDomain);

  // Normalised overall 0-100 skill score: ((avg_score - 1) / 8) * 100
  const avgRawScore =
    evaluations.reduce((sum, item) => sum + item.score, 0) / evaluations.length;
  const normalisedScore = Math.round(((avgRawScore - 1) / 8) * 100);

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <main className="min-h-screen bg-[#05080f] text-[#f0f4ff] font-sans p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs uppercase tracking-wider font-sans">
            <Brain className="w-4 h-4" /> Player Development Engine
          </div>
          <h1 className="text-3xl font-extrabold font-['Syne',sans-serif] text-white mt-1">1–9 Skill Matrix Assessment</h1>
          <p className="text-sm text-muted-foreground mt-1 font-sans">
            Rubric-anchored 7-domain evaluation for school cricket development.
          </p>
        </div>

        {/* Player Selector & Save */}
        <div className="flex items-center gap-3">
          <select
            value={selectedPlayer}
            onChange={(e) => setSelectedPlayer(e.target.value)}
            className="px-4 py-2.5 bg-slate-900/80 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400 font-medium font-sans"
          >
            {players.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.role})
              </option>
            ))}
          </select>

          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-lg active:scale-95 font-sans"
          >
            <Save className="w-4 h-4" /> Save Assessment
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="flex items-center gap-2 p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-sm font-semibold font-sans">
          <CheckCircle2 className="w-5 h-5" /> Skill assessment saved successfully!
        </div>
      )}

      {/* Overall Score Summary Badge */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card border border-white/10 bg-slate-900/60 backdrop-blur-xl rounded-2xl p-5 flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider font-sans">Normalised Skill Index</span>
            <div className="text-3xl font-extrabold text-amber-400 mt-1 font-sans">{normalisedScore} / 100</div>
          </div>
          <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center font-bold text-lg font-mono">
            {avgRawScore.toFixed(1)}
          </div>
        </div>

        <div className="glass-card border border-white/10 bg-slate-900/60 backdrop-blur-xl rounded-2xl p-5 flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider font-sans">Evaluated Attributes</span>
            <div className="text-3xl font-extrabold text-white mt-1 font-sans">{evaluations.length}</div>
          </div>
          <div className="text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 font-semibold font-sans">
            All Domains
          </div>
        </div>

        <div className="glass-card border border-white/10 bg-slate-900/60 backdrop-blur-xl rounded-2xl p-5 flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider font-sans">Assessor Confidence</span>
            <div className="text-xl font-bold text-emerald-400 mt-1 font-sans">High (4 raters)</div>
          </div>
          <Shield className="w-8 h-8 text-slate-500" />
        </div>
      </div>

      {/* Domain Navigation Tabs */}
      <div className="flex overflow-x-auto gap-2 border-b border-gray-800 pb-2 scrollbar-none">
        {(['Batting', 'Bowling', 'Fielding', 'Wicketkeeping', 'Physical', 'Mental', 'Tactical'] as SkillDomain[]).map((dom) => (
          <button
            key={dom}
            onClick={() => setActiveDomain(dom)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeDomain === dom
                ? 'bg-amber-500 text-gray-950 shadow-md'
                : 'bg-[#161D2F] text-gray-400 border border-gray-800 hover:text-white'
            }`}
          >
            {domainIcons[dom]}
            {dom}
          </button>
        ))}
      </div>

      {/* Attribute Evaluation Cards */}
      <div className="space-y-4">
        {currentDomainAttributes.length === 0 ? (
          <div className="glass-card border border-white/10 bg-slate-900/60 backdrop-blur-xl rounded-2xl p-8 text-center text-muted-foreground text-sm">
            No attributes defined for domain &quot;{activeDomain}&quot;. Select another domain above.
          </div>
        ) : (
          currentDomainAttributes.map((attr) => (
            <div key={attr.id} className="glass-card border border-white/10 bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-bold text-base text-white flex items-center gap-2 font-['Syne',sans-serif]">
                    {attr.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{attr.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase font-['Syne',sans-serif]">Rating:</span>
                  <span className="text-xl font-black text-amber-400 bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/20 font-['Syne',sans-serif]">
                    {attr.score} / 9
                  </span>
                </div>
              </div>

              {/* 1-9 Rubric Buttons */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] text-muted-foreground uppercase font-semibold font-['Syne',sans-serif]">
                  <span>1 — Severely underdeveloped</span>
                  <span>5 — Competent school standard</span>
                  <span>9 — Elite school trait</span>
                </div>
                <div className="grid grid-cols-9 gap-1.5">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleScoreChange(attr.id, num)}
                      className={`py-2 rounded-lg font-bold text-xs transition-all ${
                        attr.score === num
                          ? 'bg-amber-500 text-slate-950 scale-105 shadow-md font-extrabold'
                          : 'bg-slate-900/80 text-muted-foreground border border-white/10 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <input
                  type="text"
                  placeholder="Coach observations / evidence note..."
                  value={attr.notes}
                  onChange={(e) => handleNotesChange(attr.id, e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950/80 border border-white/10 rounded-lg text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
