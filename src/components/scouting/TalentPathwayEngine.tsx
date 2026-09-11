"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { D } from '@/lib/design-system';
import { 
  Sparkles, 
  Target, 
  Award, 
  CheckCircle2, 
  UserPlus, 
  Filter, 
  Search, 
  ChevronRight, 
  ShieldAlert, 
  GraduationCap, 
  School as SchoolIcon,
  Brain,
  Star,
  Activity,
  Layers
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface PathwayProspect {
  id: string;
  name: string;
  school: string;
  ageGroup: 'U14' | 'U15' | 'U16' | 'U19 / 1st XI';
  roleArchetype: 'New-ball Seamer' | 'Opener' | 'Top-order Anchor' | 'Wrist Spinner' | 'Wicketkeeper-Batter' | 'Finisher';
  currentAbility: number; // 0-100
  projectedPotential: number; // 0-100
  pathwayStage: 'School Squad' | 'Zonal Select' | 'Provincial Invitational' | 'National Camp';
  scoutGrade: 'A+' | 'A' | 'B+' | 'B';
  nominatedForCamp: boolean;
  shortlisted: boolean;
  scoutNotes: string;
}

export const MOCK_PATHWAY_PROSPECTS: PathwayProspect[] = [
  {
    id: 'pw-1',
    name: 'Jaxon Reed',
    school: 'St Stithians College',
    ageGroup: 'U19 / 1st XI',
    roleArchetype: 'New-ball Seamer',
    currentAbility: 86,
    projectedPotential: 96,
    pathwayStage: 'Provincial Invitational',
    scoutGrade: 'A+',
    nominatedForCamp: true,
    shortlisted: true,
    scoutNotes: 'Explosive 138km/h seam presentation with late outward drift. High upside pace talent.',
  },
  {
    id: 'pw-2',
    name: 'Liam Smith',
    school: 'King Edward VII School (KES)',
    ageGroup: 'U19 / 1st XI',
    roleArchetype: 'Opener',
    currentAbility: 84,
    projectedPotential: 92,
    pathwayStage: 'Provincial Invitational',
    scoutGrade: 'A+',
    nominatedForCamp: true,
    shortlisted: true,
    scoutNotes: 'Flawless defensive technique against new ball pace. Superior gap placement under pressure.',
  },
  {
    id: 'pw-3',
    name: 'Ethan Miller',
    school: 'Hilton College',
    ageGroup: 'U15',
    roleArchetype: 'Wrist Spinner',
    currentAbility: 78,
    projectedPotential: 94,
    pathwayStage: 'Zonal Select',
    scoutGrade: 'A',
    nominatedForCamp: false,
    shortlisted: true,
    scoutNotes: 'Rare revolutions on leg-break stock ball with sharp wrong-un variation.',
  },
  {
    id: 'pw-4',
    name: 'Noah Patel',
    school: 'Jeppe High School for Boys',
    ageGroup: 'U16',
    roleArchetype: 'Wicketkeeper-Batter',
    currentAbility: 81,
    projectedPotential: 90,
    pathwayStage: 'Zonal Select',
    scoutGrade: 'A',
    nominatedForCamp: false,
    shortlisted: true,
    scoutNotes: 'Soft hands standing up to spinners; aggressive middle-order strike rotator.',
  },
  {
    id: 'pw-5',
    name: 'Tristan van Zyl',
    school: 'Paul Roos Gimnasium',
    ageGroup: 'U19 / 1st XI',
    roleArchetype: 'Top-order Anchor',
    currentAbility: 88,
    projectedPotential: 93,
    pathwayStage: 'National Camp',
    scoutGrade: 'A+',
    nominatedForCamp: true,
    shortlisted: true,
    scoutNotes: 'Averages 64.2 in school premier league. Exceptional tempo control and innings construction.',
  },
  {
    id: 'pw-6',
    name: 'Khangelani Mthembu',
    school: 'Bishops Diocesan College',
    ageGroup: 'U14',
    roleArchetype: 'Finisher',
    currentAbility: 72,
    projectedPotential: 91,
    pathwayStage: 'School Squad',
    scoutGrade: 'B+',
    nominatedForCamp: false,
    shortlisted: false,
    scoutNotes: 'Phenomenal hand-eye speed and boundary power; high ceiling long-term project.',
  },
];

export function TalentPathwayEngine() {
  const [prospects, setProspects] = useState<PathwayProspect[]>(MOCK_PATHWAY_PROSPECTS);
  const [selectedStage, setSelectedStage] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');

  const toggleNomination = (id: string) => {
    setProspects(prev => prev.map(p => p.id === id ? { ...p, nominatedForCamp: !p.nominatedForCamp } : p));
  };

  const toggleShortlist = (id: string) => {
    setProspects(prev => prev.map(p => p.id === id ? { ...p, shortlisted: !p.shortlisted } : p));
  };

  const filtered = prospects.filter(p => {
    if (selectedStage !== 'ALL' && p.pathwayStage !== selectedStage) return false;
    if (selectedRole !== 'ALL' && p.roleArchetype !== selectedRole) return false;
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase()) && !p.school.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const nominatedCount = prospects.filter(p => p.nominatedForCamp).length;

  return (
    <div className="space-y-8">
      {/* ─── PATHWAY STAGE PIPELINE HUD ─── */}
      <div className="rounded-[2.5rem] border border-white/10 bg-[#080808] p-8 md:p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.15)_0%,transparent_60%)]" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-indigo-400" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400" style={{ fontFamily: D.mono }}>
                  Institutional Selection Framework
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-white tracking-tighter mt-1" style={{ fontFamily: D.head }}>
                SELECTION PATHWAY & <span className="text-indigo-400 italic">ELITE INVITATIONAL ENGINE</span>
              </h2>
              <p className="text-xs text-white/50 max-w-2xl mt-2 font-medium">
                Separating current match performance from long-term projected potential. Manage zonal invitations, provincial selection shortlists, and national camp nominations.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-right">
                <span className="text-[9px] font-black uppercase tracking-widest text-white/40 block" style={{ fontFamily: D.mono }}>
                  Camp Nominations
                </span>
                <span className="text-2xl font-black text-indigo-400" style={{ fontFamily: D.head }}>
                  {nominatedCount} Players
                </span>
              </div>
            </div>
          </div>

          {/* 4-Tier Pathway Funnel Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-white/10">
            {[
              { stage: 'School Squad', count: prospects.filter(p => p.pathwayStage === 'School Squad').length, color: 'text-white' },
              { stage: 'Zonal Select', count: prospects.filter(p => p.pathwayStage === 'Zonal Select').length, color: 'text-sky-400' },
              { stage: 'Provincial Invitational', count: prospects.filter(p => p.pathwayStage === 'Provincial Invitational').length, color: 'text-indigo-400' },
              { stage: 'National Camp', count: prospects.filter(p => p.pathwayStage === 'National Camp').length, color: 'text-emerald-400' },
            ].map(tier => (
              <button
                key={tier.stage}
                onClick={() => setSelectedStage(selectedStage === tier.stage ? 'ALL' : tier.stage)}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  selectedStage === tier.stage
                    ? 'bg-indigo-500/20 border-indigo-500/50 shadow-lg shadow-indigo-500/10'
                    : 'bg-white/[0.02] border-white/5 hover:border-white/20'
                }`}
              >
                <span className="text-[9px] font-black uppercase tracking-widest text-white/40 block" style={{ fontFamily: D.mono }}>
                  {tier.stage}
                </span>
                <div className="flex items-center justify-between mt-2">
                  <span className={`text-2xl font-black ${tier.color}`} style={{ fontFamily: D.head }}>
                    {tier.count}
                  </span>
                  <ChevronRight className="h-4 w-4 text-white/20" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── FILTERS & PROSPECT GRID ─── */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
            <input
              type="text"
              placeholder="Search talent pool..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/50 font-medium"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/40 mr-2 shrink-0" style={{ fontFamily: D.mono }}>
              Role Filter:
            </span>
            {['ALL', 'New-ball Seamer', 'Opener', 'Top-order Anchor', 'Wrist Spinner', 'Wicketkeeper-Batter'].map(r => (
              <button
                key={r}
                onClick={() => setSelectedRole(r)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all ${
                  selectedRole === r
                    ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20'
                    : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'
                }`}
                style={{ fontFamily: D.mono }}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Prospect Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(prospect => (
            <motion.div
              key={prospect.id}
              whileHover={{ y: -4 }}
              className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/10 hover:border-indigo-500/40 transition-all space-y-5 flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Header info */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold text-white">{prospect.name}</h3>
                      <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 text-[9px] uppercase font-mono">
                        {prospect.scoutGrade} Grade
                      </Badge>
                    </div>
                    <p className="text-xs text-white/40 font-medium mt-0.5">
                      {prospect.school} · <span className="text-white/60">{prospect.ageGroup}</span>
                    </p>
                  </div>

                  <Badge className="bg-white/5 text-white/60 border-white/10 text-[9px] uppercase font-mono">
                    {prospect.roleArchetype}
                  </Badge>
                </div>

                {/* Current vs Potential Rating Bars */}
                <div className="space-y-3 p-4 rounded-2xl bg-black/40 border border-white/5">
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider mb-1" style={{ fontFamily: D.mono }}>
                      <span className="text-white/40">Current Ability</span>
                      <span className="text-white font-bold">{prospect.currentAbility}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-sky-400 rounded-full" style={{ width: `${prospect.currentAbility}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider mb-1" style={{ fontFamily: D.mono }}>
                      <span className="text-indigo-400">Projected Potential</span>
                      <span className="text-indigo-400 font-bold">{prospect.projectedPotential}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${prospect.projectedPotential}%` }} />
                    </div>
                  </div>
                </div>

                {/* Scout Qualitative Notes */}
                <p className="text-xs text-white/60 leading-relaxed italic bg-white/[0.01] p-3 rounded-xl border border-white/5">
                  &quot;{prospect.scoutNotes}&quot;
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-white/5 flex items-center justify-between gap-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toggleShortlist(prospect.id)}
                  className={`flex-1 rounded-xl text-[10px] font-black uppercase tracking-wider h-9 ${
                    prospect.shortlisted
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : 'border-white/10 text-white/50 hover:text-white'
                  }`}
                >
                  <Star className={`h-3 w-3 mr-1.5 ${prospect.shortlisted ? 'fill-amber-300 text-amber-300' : ''}`} />
                  {prospect.shortlisted ? 'Shortlisted' : 'Shortlist'}
                </Button>

                <Button
                  size="sm"
                  onClick={() => toggleNomination(prospect.id)}
                  className={`flex-1 rounded-xl text-[10px] font-black uppercase tracking-wider h-9 ${
                    prospect.nominatedForCamp
                      ? 'bg-emerald-500 text-black font-bold'
                      : 'bg-indigo-500 hover:bg-indigo-600 text-white'
                  }`}
                >
                  <Award className="h-3 w-3 mr-1.5" />
                  {prospect.nominatedForCamp ? 'Nominated' : 'Nominate Camp'}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
