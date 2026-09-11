"use client";

import React from "react";
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer 
} from "recharts";
import { D } from '@/lib/design-system';

interface PassportRadarChartProps {
  data?: any[];
}

const defaultData = [
  { subject: 'Batting Technique', A: 120, fullMark: 150 },
  { subject: 'Bowling Control', A: 98, fullMark: 150 },
  { subject: 'Fielding', A: 86, fullMark: 150 },
  { subject: 'Fitness', A: 99, fullMark: 150 },
  { subject: 'Tactics', A: 85, fullMark: 150 },
  { subject: 'Mental Game', A: 65, fullMark: 150 },
];

export const PassportRadarChart = ({ data = defaultData }: PassportRadarChartProps) => {
  return (
    <div className="w-full h-[300px] relative">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="#ffffff10" strokeWidth={1} />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: "#ffffff40", fontSize: 8, fontWeight: '900', textAnchor: 'middle' }}
          />
          <Radar
            name="Skills"
            dataKey="A"
            stroke="#22c55e"
            strokeWidth={3}
            fill="#22c55e"
            fillOpacity={0.2}
            animationDuration={1500}
            animationBegin={300}
          />
        </RadarChart>
      </ResponsiveContainer>
      
      {/* Center Label Component (Optional) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-20">
        <div className="text-[10px] font-black uppercase tracking-widest text-[#22c55e] text-center" style={{ fontFamily: D.mono }}>
          Skill Matrix
        </div>
      </div>
    </div>
  );
};
