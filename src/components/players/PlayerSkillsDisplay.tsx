"use client";

import { D } from "@/lib/scoring/theme";
import { Player as Person } from "@/lib/store";
import { Activity, Target } from "lucide-react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer
} from "recharts";

interface PlayerSkillsDisplayProps {
  player: Person;
}

// Mock skills data if not present on player object
const getSkillsData = (player: Person) => {
  // In a real app, these would come from player.skills
  // For now, we'll generate some based on role
  const isBowler = player.role === 'Bowler';
  const isBatsman = player.role === 'Batsman';
  const isAllRounder = player.role === 'All Rounder';

  return [
    { subject: 'Batting', A: isBatsman || isAllRounder ? 85 : 45, fullMark: 100 },
    { subject: 'Bowling', A: isBowler || isAllRounder ? 85 : 40, fullMark: 100 },
    { subject: 'Fielding', A: 75, fullMark: 100 },
    { subject: 'Fitness', A: 80, fullMark: 100 },
    { subject: 'Mental', A: 70, fullMark: 100 },
    { subject: 'Tactical', A: 65, fullMark: 100 },
  ];
};

export function PlayerSkillsDisplay({ player }: PlayerSkillsDisplayProps) {
  const skillsData = getSkillsData(player);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Radar Chart */}
      <div className="rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden sh-slide-up">
        <div className="p-8 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary" style={{ fontFamily: D.mono }}>
            Tactical Radar
          </h3>
          <Target className="h-4 w-4 text-white/20" />
        </div>
        <div className="p-8">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={skillsData}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 900, fontFamily: 'DM Mono, monospace' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name={player.firstName}
                  dataKey="A"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="#10b981"
                  fillOpacity={0.2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Skill Bars */}
      <div className="rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden sh-slide-up" style={{ animationDelay: '100ms' }}>
        <div className="p-8 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary" style={{ fontFamily: D.mono }}>
            Skill Matrix Breakdown
          </h3>
          <Activity className="h-4 w-4 text-white/20" />
        </div>
        <div className="p-8 space-y-6">
          {skillsData.map((skill) => (
            <div key={skill.subject} className="space-y-2">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/50" style={{ fontFamily: D.mono }}>{skill.subject}</span>
                <span className="text-sm font-bold text-white/90">{skill.A} <span className="text-[10px] text-white/30">/ 100</span></span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${
                    skill.A >= 80 ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" :
                    skill.A >= 60 ? "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" :
                    skill.A >= 40 ? "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" : 
                    "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                  }`}
                  style={{ width: `${skill.A}%` }} 
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
