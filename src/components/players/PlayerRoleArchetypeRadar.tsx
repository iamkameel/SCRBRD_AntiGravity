"use client";

import { useState } from "react";
import { D } from "@/lib/design-system";
import { Shield, Sparkles, Target, Zap, ChevronRight, Award } from "lucide-react";
import { SkillAssessment } from "@/types/schema_v4";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from "recharts";

interface PlayerRoleArchetypeRadarProps {
  playingRole?: string;
  assessments?: SkillAssessment[];
}

interface RoleFit {
  id: string;
  name: string;
  category: "Batting" | "Bowling" | "All-Rounder" | "Wicketkeeper" | "Wicketkeeping";
  fitScore: number; // 0-100
  keyWeights: { domain: string; weight: number }[];
  description: string;
}

export function PlayerRoleArchetypeRadar({ playingRole = "Opener", assessments = [] }: PlayerRoleArchetypeRadarProps) {
  // Domain average calculation (1-9 scale to 0-100)
  const getDomainScore = (domainName: string): number => {
    const domainAssessments = assessments.filter(a => a.domain?.toLowerCase() === domainName.toLowerCase());
    if (domainAssessments.length === 0) return 65; // default fallback
    const sum = domainAssessments.reduce((acc, a) => acc + ((a as any).rawScore1to9 || (a.rating ? Math.round(a.rating / 2.2) : 5)), 0);
    const avg = sum / domainAssessments.length;
    return Math.round(((avg - 1) / 8) * 100);
  };

  const domainScores = {
    Physical: getDomainScore("physical"),
    Mental: getDomainScore("mental"),
    Tactical: getDomainScore("tactical"),
    Batting: getDomainScore("batting"),
    Bowling: getDomainScore("bowling"),
    Fielding: getDomainScore("fielding"),
    Wicketkeeping: getDomainScore("wicketkeeping"),
  };

  const radarData = [
    { domain: "Physical", score: domainScores.Physical, fullMark: 100 },
    { domain: "Mental", score: domainScores.Mental, fullMark: 100 },
    { domain: "Tactical", score: domainScores.Tactical, fullMark: 100 },
    { domain: "Batting", score: domainScores.Batting, fullMark: 100 },
    { domain: "Bowling", score: domainScores.Bowling, fullMark: 100 },
    { domain: "Fielding", score: domainScores.Fielding, fullMark: 100 },
    { domain: "Keeper", score: domainScores.Wicketkeeping, fullMark: 100 },
  ];

  const roleArchetypes: RoleFit[] = [
    {
      id: "opener",
      name: "Opener",
      category: "Batting",
      fitScore: Math.round(domainScores.Batting * 0.45 + domainScores.Tactical * 0.25 + domainScores.Mental * 0.2 + domainScores.Physical * 0.1),
      keyWeights: [
        { domain: "Batting", weight: 45 },
        { domain: "Tactical", weight: 25 },
        { domain: "Mental", weight: 20 },
      ],
      description: "Disciplined against the new ball, high gap awareness and strike rotation.",
    },
    {
      id: "anchor",
      name: "Top-order Anchor",
      category: "Batting",
      fitScore: Math.round(domainScores.Batting * 0.4 + domainScores.Mental * 0.3 + domainScores.Tactical * 0.2 + domainScores.Physical * 0.1),
      keyWeights: [
        { domain: "Batting", weight: 40 },
        { domain: "Mental", weight: 30 },
        { domain: "Tactical", weight: 20 },
      ],
      description: "Controls middle overs, high innings-building endurance under pressure.",
    },
    {
      id: "finisher",
      name: "Aggressive Finisher",
      category: "Batting",
      fitScore: Math.round(domainScores.Batting * 0.5 + domainScores.Physical * 0.25 + domainScores.Mental * 0.15 + domainScores.Tactical * 0.1),
      keyWeights: [
        { domain: "Batting", weight: 50 },
        { domain: "Physical", weight: 25 },
        { domain: "Mental", weight: 15 },
      ],
      description: "High boundary execution and power hitting in death overs.",
    },
    {
      id: "allrounder",
      name: "Batting All-rounder",
      category: "All-Rounder",
      fitScore: Math.round(domainScores.Batting * 0.35 + domainScores.Bowling * 0.3 + domainScores.Fielding * 0.15 + domainScores.Tactical * 0.2),
      keyWeights: [
        { domain: "Batting", weight: 35 },
        { domain: "Bowling", weight: 30 },
        { domain: "Tactical", weight: 20 },
      ],
      description: "Balanced contributor across middle overs and bowling spells.",
    },
    {
      id: "seamer",
      name: "New-ball Seamer",
      category: "Bowling",
      fitScore: Math.round(domainScores.Bowling * 0.45 + domainScores.Physical * 0.25 + domainScores.Tactical * 0.15 + domainScores.Mental * 0.15),
      keyWeights: [
        { domain: "Bowling", weight: 45 },
        { domain: "Physical", weight: 25 },
        { domain: "Mental", weight: 15 },
      ],
      description: "Disciplined seam presentation and swing control in early overs.",
    },
    {
      id: "keeper",
      name: "Specialist Wicketkeeper",
      category: "Wicketkeeping",
      fitScore: Math.round(domainScores.Wicketkeeping * 0.45 + domainScores.Fielding * 0.2 + domainScores.Tactical * 0.2 + domainScores.Batting * 0.15),
      keyWeights: [
        { domain: "Wicketkeeping", weight: 45 },
        { domain: "Fielding", weight: 20 },
        { domain: "Tactical", weight: 20 },
      ],
      description: "Elite glove presentation, standing up takes, and team communication.",
    },
  ];

  const sortedRoles = [...roleArchetypes].sort((a, b) => b.fitScore - a.fitScore);
  const [selectedRole, setSelectedRole] = useState<RoleFit>(sortedRoles[0]);

  return (
    <div className="rounded-3xl border border-zinc-200 dark:border-white/10 bg-white/80 dark:bg-white/[0.03] backdrop-blur-xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b border-zinc-200 dark:border-white/[0.07] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Target className="h-4 w-4 text-emerald-600 dark:text-[#22c55e]" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-900 dark:text-white" style={{ fontFamily: D.mono }}>
              Role Archetype Fit Radar
            </h3>
            <p className="text-[10px] text-zinc-500 dark:text-white/40 font-medium">
              Multi-domain weighted suitability matrix
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-[#22c55e] text-[9px] font-black uppercase tracking-widest" style={{ fontFamily: D.mono }}>
          <Sparkles className="h-3 w-3" />
          Primary: {sortedRoles[0].name}
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Recharts Radar Visualization */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center">
          <div className="h-[280px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="rgba(150,150,150,0.15)" />
                <PolarAngleAxis 
                  dataKey="domain" 
                  tick={{ fill: 'currentColor', opacity: 0.7, fontSize: 10, fontFamily: D.mono, fontWeight: 800 }} 
                />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar 
                  name="Player Skill" 
                  dataKey="score" 
                  stroke="#22c55e" 
                  fill="#22c55e" 
                  fillOpacity={0.3} 
                  strokeWidth={2} 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(10,10,10,0.95)', borderColor: 'rgba(34,197,94,0.3)', borderRadius: '1rem', color: 'white' }}
                  formatter={(val: any) => [`${val}%`, 'Suitability']}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-[10px] font-mono font-bold text-zinc-400 dark:text-white/30 text-center mt-2">
            Skill domain weighting normalized to 100% capacity
          </div>
        </div>

        {/* Right: Role Ranking & Interactive Selector */}
        <div className="lg:col-span-6 space-y-3">
          <div className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-white/30" style={{ fontFamily: D.mono }}>
            Calculated Role Suitability Rankings
          </div>
          <div className="space-y-2">
            {sortedRoles.map((role, idx) => {
              const isSelected = selectedRole.id === role.id;
              const isTop = idx === 0;
              return (
                <div
                  key={role.id}
                  onClick={() => setSelectedRole(role)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? "bg-emerald-500/10 border-emerald-500/40 text-zinc-900 dark:text-white shadow-sm"
                      : "bg-zinc-50 dark:bg-white/[0.02] border-zinc-200 dark:border-white/5 hover:border-zinc-300 dark:hover:border-white/10"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black ${
                      isTop ? "bg-emerald-500 text-white dark:bg-[#22c55e] dark:text-black" : "bg-zinc-200 dark:bg-white/10 text-zinc-600 dark:text-white/50"
                    }`} style={{ fontFamily: D.mono }}>
                      #{idx + 1}
                    </div>
                    <div>
                      <div className="text-xs font-bold flex items-center gap-1.5">
                        {role.name}
                        {isTop && (
                          <span className="text-[8px] bg-emerald-500/20 text-emerald-600 dark:text-[#22c55e] font-mono font-black px-1.5 py-0.2 rounded">
                            BEST FIT
                          </span>
                        )}
                      </div>
                      <div className="text-[9px] font-mono text-zinc-400 dark:text-white/30">
                        {role.category}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-sm font-black text-emerald-600 dark:text-[#22c55e]" style={{ fontFamily: D.head }}>
                        {role.fitScore}%
                      </span>
                    </div>
                    <ChevronRight className={`h-4 w-4 text-zinc-400 transition-transform ${isSelected ? "translate-x-0.5 text-emerald-500" : ""}`} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Role Description Pill */}
          <div className="p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-[11px] text-zinc-700 dark:text-white/70">
            <span className="font-bold text-emerald-600 dark:text-[#22c55e]">{selectedRole.name}: </span>
            {selectedRole.description}
          </div>
        </div>
      </div>
    </div>
  );
}
