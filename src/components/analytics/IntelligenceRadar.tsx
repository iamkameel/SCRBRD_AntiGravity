"use client";

import { D } from '@/lib/design-system';
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar as ReRadar, 
  ResponsiveContainer, 
  Tooltip 
} from 'recharts';
import { Target } from "lucide-react";

interface IntelligenceRadarProps {
  data: any[];
  title?: string;
}

export function IntelligenceRadar({ data, title = "Skill Matrix Overlap" }: IntelligenceRadarProps) {
  return (
    <div style={{ background: D.surf1, border: `1px solid ${D.border}`, borderRadius: D.xl, padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 800, textTransform: 'uppercase' }}>{title}</div>
        <Target size={16} color={D.textMuted} />
      </div>
      
      <div style={{ height: '300px', width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke={D.border} />
            <PolarAngleAxis dataKey="subject" tick={{ fill: D.textMuted, fontSize: 10 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <ReRadar name="Target" dataKey="A" stroke={D.sky} fill={D.sky} fillOpacity={0.6} />
            <ReRadar name="Current" dataKey="B" stroke={D.amber} fill={D.amber} fillOpacity={0.4} />
            <Tooltip 
              contentStyle={{ background: D.surf2, border: `1px solid ${D.border}`, borderRadius: D.md }}
              itemStyle={{ color: D.textPrimary, fontSize: '12px' }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ marginTop: '16px', fontSize: '12px', color: D.textMuted, textAlign: 'center', fontStyle: 'italic' }}>
        Comparison of current capability vs institutional benchmarks.
      </div>
    </div>
  );
}
